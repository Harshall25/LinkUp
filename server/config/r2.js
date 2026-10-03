const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    // Newer SDKs sign a CRC32 of an empty body into presigned PUT URLs, which
    // R2 then rejects once the browser uploads the real file.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
});

const bucket = () => process.env.R2_BUCKET_NAME;

const uploadToR2 = (body, key, contentType) =>
    s3Client.send(new PutObjectCommand({ Bucket: bucket(), Key: key, Body: body, ContentType: contentType }));

const getUploadUrl = (key, contentType, expiresIn = 600) =>
    getSignedUrl(s3Client, new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: contentType }), { expiresIn });

const getDownloadUrl = (key, expiresIn) =>
    getSignedUrl(s3Client, new GetObjectCommand({ Bucket: bucket(), Key: key }), { expiresIn });

const deleteFromR2 = (key) =>
    s3Client.send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));

module.exports = {
    uploadToR2,
    getUploadUrl,
    getDownloadUrl,
    deleteFromR2
};
