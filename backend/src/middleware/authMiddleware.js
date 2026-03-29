/**
 * Auth Middleware
 * Verifies JWT tokens for Dashboard (management) API requests.
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');

const authUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authUser;
