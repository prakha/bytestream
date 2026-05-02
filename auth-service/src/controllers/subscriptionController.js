const subscriptionService = require('../services/subscriptionService');

const subscribe = async (req, res) => {
  try {
    const { creatorId } = req.body;
    const subscriberId = req.user.userId;

    if (!creatorId) {
      return res.status(400).json({ error: 'Creator ID is required' });
    }

    const subscription = await subscriptionService.subscribe(subscriberId, creatorId);
    res.status(201).json({ message: 'Subscribed successfully', subscription });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const unsubscribe = async (req, res) => {
  try {
    const { creatorId } = req.body;
    const subscriberId = req.user.userId;

    if (!creatorId) {
      return res.status(400).json({ error: 'Creator ID is required' });
    }

    await subscriptionService.unsubscribe(subscriberId, creatorId);
    res.status(200).json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getStatus = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const subscriberId = req.user.userId;

    const status = await subscriptionService.getStatus(subscriberId, creatorId);
    res.status(200).json(status);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  getStatus,
};
