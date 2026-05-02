const express = require('express');
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /v1/subscriptions/subscribe:
 *   post:
 *     summary: Subscribe to a creator
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [creatorId]
 *             properties:
 *               creatorId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subscribed successfully
 *       400:
 *         description: Invalid input or already subscribed
 *       401:
 *         description: Unauthorized
 */
router.post('/subscribe', authMiddleware, subscriptionController.subscribe);

/**
 * @openapi
 * /v1/subscriptions/unsubscribe:
 *   post:
 *     summary: Unsubscribe from a creator
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [creatorId]
 *             properties:
 *               creatorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Unsubscribed successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/unsubscribe', authMiddleware, subscriptionController.unsubscribe);

/**
 * @openapi
 * /v1/subscriptions/status/{creatorId}:
 *   get:
 *     summary: Get subscription status for a creator
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: creatorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription status retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/status/:creatorId', authMiddleware, subscriptionController.getStatus);

module.exports = router;
