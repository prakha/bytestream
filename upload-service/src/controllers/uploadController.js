const Busboy = require('busboy');
const { Upload } = require('@aws-sdk/lib-storage');
const { v4: uuidv4 } = require('uuid');
const { s3Client, bucketName } = require('../config/s3');
const db = require('../config/db');
const redisClient = require('../config/redis');

const uploadVideo = (req, res) => {
    const busboy = Busboy({ headers: req.headers });
    const userId = req.user.userId;
    let videoTitle = '';
    let fileUploadPromise = null;

    busboy.on('field', (name, val) => {
        if (name === 'title') {
            videoTitle = val;
        }
    });

    busboy.on('file', (name, file, info) => {
        const { filename, mimeType } = info;
        const s3FileName = `${userId}/${Date.now()}-${filename}`;

        console.log(`Starting upload: ${s3FileName}`);

        const parallelUploads3 = new Upload({
            client: s3Client,
            params: {
                Bucket: bucketName,
                Key: s3FileName,
                Body: file,
                ContentType: mimeType,
            },
            queueSize: 4,
            partSize: 1024 * 1024 * 5, // 5MB
            leavePartsOnError: false,
        });

        fileUploadPromise = (async () => {
            try {
                await parallelUploads3.done();
                console.log(`Finished upload: ${s3FileName}`);
                const videoId = uuidv4();
                const s3Uri = `s3://${bucketName}/${s3FileName}`;

                // 1. Persist Metadata to DB
                await db.query(
                    'INSERT INTO videos (id, user_id, title, raw_gcs_uri, status) VALUES ($1, $2, $3, $4, $5)',
                    [videoId, userId, videoTitle || filename, s3Uri, 'PENDING']
                );

                // 2. Notify Redis
                const message = JSON.stringify({
                    videoId,
                    gcsPath: s3FileName,
                    userId
                });
                await redisClient.lPush('video_queue', message);

                return { videoId, s3Uri };
            } catch (err) {
                console.error('S3 Upload Error:', err);
                throw err;
            }
        })();
    });

    busboy.on('finish', async () => {
        if (!fileUploadPromise) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        try {
            const result = await fileUploadPromise;
            res.status(200).json({
                message: 'Upload successful',
                ...result
            });
        } catch (error) {
            res.status(500).json({ message: 'Upload failed', error: error.message });
        }
    });

    req.pipe(busboy);
};

module.exports = { uploadVideo };
