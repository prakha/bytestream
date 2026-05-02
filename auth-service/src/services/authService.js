const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const SALT_ROUNDS = 10;

const register = async (email, password) => {
  const existingUser = await userModel.findUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const newUser = await userModel.createUser(email, passwordHash);
  
  return newUser;
};

const login = async (email, password) => {
  const user = await userModel.findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '24h' }
  );

  return { user: { id: user.id, email: user.email }, token };
};

const logout = async () => {
  // In a stateless JWT implementation, logout is primarily handled by the client 
  // deleting the token. Server-side, you could implement a token blacklist here 
  // if needed (e.g., using Redis).
  return { message: 'Logged out successfully. Please delete your token on the client side.' };
};

module.exports = {
  register,
  login,
  logout,
};
