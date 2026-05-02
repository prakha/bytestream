const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const authMiddleware = require('../middleware/auth');

// All routes are protected by authMiddleware
router.use(authMiddleware);

/**
 * @openapi
 * /v1/videos:
 *   get:
 *     summary: List all ready videos
 *     tags: [Watch]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of videos
 */
router.get('/my-videos', videoController.getMyVideos);
router.get('/', videoController.getVideos);
router.get('/subscribed', videoController.getSubscribedVideos);
router.get('/trending', videoController.getTrendingVideos);
router.get('/liked', videoController.getLikedVideos);
router.get('/history', videoController.getWatchHistory);
router.post('/:id/view', videoController.incrementVideoView);
router.post('/:id/like', videoController.toggleLikeVideo);
router.get('/:id/like-status', videoController.checkLikeStatus);


/**
 * @openapi
 * /v1/videos/{id}:
 *   get:
 *     summary: Get video details and stream URL
 *     tags: [Watch]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video details
 */
router.get('/:id', videoController.getVideoById);

module.exports = router;
