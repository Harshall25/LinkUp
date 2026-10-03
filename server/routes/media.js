const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const { z } = require('zod');
const mediaRouter = express.Router();
const { mediaLimiter } = require('../middlewares/rateLimiter');
const { userAuth } = require('../middlewares/userAuth');
const { uploadToR2, getUploadUrl, getDownloadUrl } = require('../config/r2');
const { KEY_PATTERN, toMediaUrl } = require('../utils/media');
const { zodMessage } = require('../utils/validation');

const MAX_BYTES = 50 * 1024 * 1024;
const MEDIA_TYPE = /^(image|video)\/[\w.+-]+$/;

const EXTENSIONS = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/ogg': 'ogv',
    'video/quicktime': 'mov',
};

// The client decides image vs video from the extension, so derive it from
// the MIME type rather than trusting the original filename.
function newObjectKey(contentType, originalName = '') {
    const fallback = originalName.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5);
    const ext = EXTENSIONS[contentType] || fallback || 'bin';
    return `media/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
}

const uploadUrlSchema = z.object({
    contentType: z.string().regex(MEDIA_TYPE, 'Only images and videos can be uploaded'),
    size: z.number().int().positive().max(MAX_BYTES, 'Files must be 50 MB or smaller'),
});

// Preferred path: the browser PUTs straight to R2, so large videos never pass
// through the serverless function (Vercel caps request bodies at 4.5 MB).
mediaRouter.post('/upload-url', mediaLimiter, userAuth, async (req, res) => {
    const parsed = uploadUrlSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: zodMessage(parsed.error) });
    }
    try {
        const { contentType } = parsed.data;
        const key = newObjectKey(contentType);
        const uploadUrl = await getUploadUrl(key, contentType);
        res.status(200).json({ uploadUrl, url: toMediaUrl(key), key });
    } catch (error) {
        console.error('Presign failed:', error);
        res.status(500).json({ error: 'Could not prepare the upload' });
    }
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_BYTES },
    fileFilter: (req, file, cb) => {
        if (MEDIA_TYPE.test(file.mimetype)) cb(null, true);
        else cb(new Error('Only images and videos can be uploaded'), false);
    }
});

// Fallback for when the bucket's CORS policy blocks direct browser uploads.
mediaRouter.post('/upload', mediaLimiter, userAuth, (req, res) => {
    upload.single('media')(req, res, async (err) => {
        if (err) {
            const tooLarge = err.code === 'LIMIT_FILE_SIZE';
            return res.status(tooLarge ? 413 : 400).json({
                error: tooLarge ? 'Files must be 50 MB or smaller' : err.message
            });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        try {
            const key = newObjectKey(req.file.mimetype, req.file.originalname);
            await uploadToR2(req.file.buffer, key, req.file.mimetype);
            res.status(200).json({ url: toMediaUrl(key), key });
        } catch (error) {
            console.error('Upload failed:', error);
            res.status(500).json({ error: 'Upload failed' });
        }
    });
});

const DOWNLOAD_URL_TTL = 24 * 60 * 60;
const REDIRECT_CACHE_TTL = 60 * 60;

// Redirect to a short-lived signed R2 URL instead of streaming through the
// function: R2 serves Range requests (needed for video seeking and Safari
// playback) and there is no 4.5 MB response cap.
mediaRouter.get(/^\/file\/(.+)$/, async (req, res) => {
    const key = req.params[0];
    if (!KEY_PATTERN.test(key)) {
        return res.status(404).json({ error: 'File not found' });
    }
    try {
        const url = await getDownloadUrl(key, DOWNLOAD_URL_TTL);
        res.set('Cache-Control', `public, max-age=${REDIRECT_CACHE_TTL}, s-maxage=${REDIRECT_CACHE_TTL}`);
        res.redirect(302, url);
    } catch (error) {
        console.error('Signing download URL failed:', error);
        res.status(500).json({ error: 'Could not load file' });
    }
});

module.exports = {
    mediaRouter
};
