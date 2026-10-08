const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Project = require('../models/Project');
const EndUser = require('../models/EndUser');

// Middleware to extract and validate Project from API Key
const validateProjectApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ success: false, message: 'Missing x-api-key header' });

  try {
    const project = await Project.findOne({ apiKey });
    if (!project) return res.status(401).json({ success: false, message: 'Invalid API Key' });
    req.project = project;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

router.use(validateProjectApiKey);

const getPrimaryKeyField = (project) => {
  const customFields = project.gatewayConfig?.authentication?.customFields || [];
  return customFields.find(f => f.isPrimary);
};

router.post('/register', async (req, res) => {
  try {
    const { password, role, ...customData } = req.body;
    
    if (!password) return res.status(400).json({ success: false, message: 'password is required' });

    const customFieldsConfig = req.project.gatewayConfig?.authentication?.customFields || [];
    const primaryField = getPrimaryKeyField(req.project);

    if (!primaryField) {
      return res.status(500).json({ success: false, message: 'Auth Service improperly configured: No primary key defined for this project.' });
    }

    const identityKeyValue = customData[primaryField.name];
    if (!identityKeyValue) {
      return res.status(400).json({ success: false, message: `Missing primary key field: ${primaryField.name}` });
    }

    // Validate all custom data constraints
    for (const field of customFieldsConfig) {
      const value = req.body[field.name];
      
      if (field.isRequired && (value === undefined || value === null || value === '')) {
        return res.status(400).json({ success: false, message: `Missing required field: ${field.name}` });
      }

      if (value !== undefined && value !== null && value !== '') {
        const typeOfValue = typeof value;
        if (typeOfValue !== field.dataType) {
          if (field.dataType === 'number' && !isNaN(Number(value))) {
            if (field.name !== 'password') customData[field.name] = Number(value);
          } else if (field.dataType === 'boolean' && (value === 'true' || value === 'false')) {
            if (field.name !== 'password') customData[field.name] = value === 'true';
          } else {
            return res.status(400).json({ success: false, message: `Invalid type for field ${field.name}. Expected ${field.dataType}` });
          }
        }
      }
    }

    // Ensure uniqueness using the mapped identityKey
    const identityKeyStr = identityKeyValue.toString().toLowerCase();
    const existingUser = await EndUser.findOne({ projectId: req.project._id, identityKey: identityKeyStr });
    if (existingUser) return res.status(400).json({ success: false, message: 'User with this primary key already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new EndUser({
      projectId: req.project._id,
      identityKey: identityKeyStr,
      passwordHash,
      role: role || 'user',
      customData
    });

    await user.save();

    const secret = req.project.gatewayConfig?.authentication?.jwtSecret;
    if (!secret) return res.status(500).json({ success: false, message: 'Auth not properly configured for this project' });

    const payload = {
      sub: user._id.toString(),
      projectId: req.project._id.toString(),
      [primaryField.name]: user.identityKey,
      role: user.role
    };

    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user._id, [primaryField.name]: user.identityKey, role: user.role, customData }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { password, ...bodyData } = req.body;
    if (!password) return res.status(400).json({ success: false, message: 'password is required' });

    const primaryField = getPrimaryKeyField(req.project);
    if (!primaryField) {
      return res.status(500).json({ success: false, message: 'Auth Service improperly configured: No primary key defined.' });
    }

    const identityKeyValue = bodyData[primaryField.name];
    if (!identityKeyValue) {
      return res.status(400).json({ success: false, message: `Missing primary key field: ${primaryField.name}` });
    }

    const identityKeyStr = identityKeyValue.toString().toLowerCase();
    const user = await EndUser.findOne({ projectId: req.project._id, identityKey: identityKeyStr });
    
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const secret = req.project.gatewayConfig?.authentication?.jwtSecret;
    if (!secret) return res.status(500).json({ success: false, message: 'Auth not properly configured for this project' });

    const payload = {
      sub: user._id.toString(),
      projectId: req.project._id.toString(),
      [primaryField.name]: user.identityKey,
      role: user.role
    };

    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        token,
        user: { id: user._id, [primaryField.name]: user.identityKey, role: user.role, customData: user.customData }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
