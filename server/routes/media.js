const express = require('express');
const mediaRouter = express.Router();
const { mediaLimiter } = require('../middlewares/rateLimiter');
const multer = require('multer');
const { userAuth } = require('../middlewares/userAuth');
const { uploadToR2, deleteFromR2 } = require('../config/r2');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow images and videos
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image and video files are allowed'), false);
        }
    }
});

// Upload single media file to R2
mediaRouter.post('/upload', mediaLimiter, userAuth, upload.single('media'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Generate unique filename
        const fileExtension = req.file.originalname.split('.').pop();
        const fileName = `media/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

        // Upload to R2
        const publicUrl = await uploadToR2(req.file.buffer, fileName, req.file.mimetype);

        res.status(200).json({
            message: 'Media uploaded successfully',
            url: publicUrl,
            fileName: fileName
        });
    } catch (error) {
        res.status(500).json({
            error: 'Upload failed',
            message: error.message
        });
    }
});

// Delete media from R2
mediaRouter.delete('/delete/:fileName', userAuth, async (req, res) => {
    try {
        const { fileName } = req.params;

        await deleteFromR2(fileName);

        res.status(200).json({
            message: 'Media deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Deletion failed',
            message: error.message
        });
    }
});

// Serve media files - handle all paths after /file/
mediaRouter.get(/^\/file\/(.+)/, async (req, res) => {
    try {
        // Get the full path from the regex capture group
        const fileName = req.params[0];
        const { GetObjectCommand } = require('@aws-sdk/client-s3');
        const { s3Client } = require('../config/r2');

        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
        });

        const response = await s3Client.send(command);
        
        // Set appropriate headers
        res.setHeader('Content-Type', response.ContentType || 'application/octet-stream');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        // Convert stream to buffer and send
        const chunks = [];
        for await (const chunk of response.Body) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        res.send(buffer);
    } catch (error) {
        console.error('Error serving file:', error);
        res.status(404).json({
            error: 'File not found',
            message: error.message
        });
    }
});

module.exports = {
    mediaRouter
};