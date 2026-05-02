const { S3Client } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3Client = new S3Client({
    region: 'us-east-1', // MinIO doesn't strictly need this but SDK requires it
    endpoint: process.env.MINIO_ENDPOINT || 'http://storage:9000',
    credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    },
    forcePathStyle: true,
});

const bucketName = process.env.MINIO_RAW_BUCKET || 'raw-videos';

module.exports = { s3Client, bucketName };
