const db = require('../config/db');

const createUser = async (email, passwordHash) => {
  const query = 'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at';
  const values = [email, passwordHash];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const values = [email];
  const { rows } = await db.query(query, values);
  return rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
};
