/**
 * Auth Controller
 * Handles Dashboard user registration and login.
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_DASHBOARD_EXPIRY } = require('../config/constants');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: 'User already exists' });

    const user = await User.create({ name, email, password });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_DASHBOARD_EXPIRY });
    res.json({ token, user: { id: user._id, name, email } });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_DASHBOARD_EXPIRY });
    res.json({ token, user: { id: user._id, name: user.name, email } });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login };
