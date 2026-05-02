const db = require('../config/db');

const subscribe = async (subscriberId, creatorId) => {
  const query = 'INSERT INTO subscriptions (subscriber_id, creator_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *';
  const values = [subscriberId, creatorId];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const unsubscribe = async (subscriberId, creatorId) => {
  const query = 'DELETE FROM subscriptions WHERE subscriber_id = $1 AND creator_id = $2 RETURNING *';
  const values = [subscriberId, creatorId];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const checkSubscription = async (subscriberId, creatorId) => {
  const query = 'SELECT * FROM subscriptions WHERE subscriber_id = $1 AND creator_id = $2';
  const values = [subscriberId, creatorId];
  const { rows } = await db.query(query, values);
  return rows.length > 0;
};

const getSubscriberCount = async (creatorId) => {
  const query = 'SELECT COUNT(*) FROM subscriptions WHERE creator_id = $1';
  const values = [creatorId];
  const { rows } = await db.query(query, values);
  return parseInt(rows[0].count);
};

module.exports = {
  subscribe,
  unsubscribe,
  checkSubscription,
  getSubscriberCount,
};
