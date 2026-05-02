const express = require('express');
const router = express.Router();
const { uploadVideo } = require('../controllers/uploadController');
const authMiddleware = require('../middleware/auth');

/**
 * @openapi
 * /v1/upload:
 *   post:
 *     summary: Upload a new video
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload successful
 *       401:
 *         description: Unauthorized
 */
router.post('/upload', authMiddleware, uploadVideo);

module.exports = router;
