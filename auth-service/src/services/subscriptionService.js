const subscriptionModel = require('../models/subscriptionModel');

const subscribe = async (subscriberId, creatorId) => {
  if (subscriberId === creatorId) {
    throw new Error('You cannot subscribe to yourself');
  }
  return await subscriptionModel.subscribe(subscriberId, creatorId);
};

const unsubscribe = async (subscriberId, creatorId) => {
  return await subscriptionModel.unsubscribe(subscriberId, creatorId);
};

const getStatus = async (subscriberId, creatorId) => {
  const isSubscribed = await subscriptionModel.checkSubscription(subscriberId, creatorId);
  const subscriberCount = await subscriptionModel.getSubscriberCount(creatorId);
  return { isSubscribed, subscriberCount };
};

module.exports = {
  subscribe,
  unsubscribe,
  getStatus,
};
