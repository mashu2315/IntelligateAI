/**
 * Auth Service (Gateway Identity Provider)
 * Handles end-user signup/login for Auth-as-a-Service (Flow A).
 */

const EndUser = require('../models/EndUser');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_ENDUSER_EXPIRY } = require('../config/constants');
const ApiError = require('../utils/apiError');

/**
 * Parse JSON body from request stream (inline parser for gateway routes
 * where express.json() is intentionally not applied).
 */
const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    if (req.body && Object.keys(req.body).length > 0) return resolve();
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      try { req.body = JSON.parse(data); } catch (e) { req.body = {}; }
      resolve();
    });
    req.on('error', reject);
  });
};

/**
 * Handle end-user signup.
 */
const handleSignup = async (req, res, project) => {
  await parseBody(req);

  const { email, password, ...rest } = req.body;
  if (!email || !password) throw ApiError.badRequest('Missing email or password');

  // Validate required fields
  for (const field of project.authConfig.requiredFields || []) {
    if (field !== 'email' && field !== 'password' && !req.body[field]) {
      throw ApiError.badRequest(`Missing required field: ${field}`);
    }
  }

  const existingUser = await EndUser.findOne({ projectId: project._id, email });
  if (existingUser) throw ApiError.conflict('User already exists');

  const newUser = await EndUser.create({
    projectId: project._id,
    email,
    password,
    dynamicData: rest
  });

  const token = jwt.sign({ id: newUser._id, projectId: project._id }, JWT_SECRET, { expiresIn: JWT_ENDUSER_EXPIRY });
  return res.status(201).json({ token, user: { id: newUser._id, email, ...newUser.dynamicData } });
};

/**
 * Handle end-user login.
 */
const handleLogin = async (req, res, project) => {
  await parseBody(req);

  const { email, password } = req.body;
  if (!email || !password) throw ApiError.badRequest('Missing email or password');

  const user = await EndUser.findOne({ projectId: project._id, email });
  if (!user) throw ApiError.unauthorized('Invalid credentials');

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw ApiError.unauthorized('Invalid credentials');

  const token = jwt.sign({ id: user._id, projectId: project._id }, JWT_SECRET, { expiresIn: JWT_ENDUSER_EXPIRY });
  return res.json({ token, user: { id: user._id, email, ...user.dynamicData } });
};

/**
 * Validate an end-user JWT token for protected routes.
 * @returns {string} The decoded end-user ID.
 */
const validateEndUserToken = (authHeader, projectId) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or invalid token');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.projectId !== projectId.toString()) {
      throw ApiError.unauthorized('Token mismatch');
    }
    return decoded.id;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw ApiError.unauthorized('Token expired or invalid');
  }
};

module.exports = { handleSignup, handleLogin, validateEndUserToken };
