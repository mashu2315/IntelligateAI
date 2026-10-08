const jwt = require('jsonwebtoken');

const authenticationMiddleware = (req, res, next) => {
  const config = req.project.gatewayConfig;

  if (!config.authentication || !config.authentication.enabled) {
    return next(); // Auth disabled for this project
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const secret = config.authentication.jwtSecret || process.env.JWT_SECRET || 'supersecretkey';

  try {
    const decoded = jwt.verify(token, secret);
    
    // Check required dynamic fields
    const customFields = config.authentication.customFields || [];
    const missingFields = customFields.filter(field => field.isRequired && !decoded[field.name]);
    
    if (missingFields.length > 0) {
      const missingNames = missingFields.map(f => f.name).join(', ');
      return res.status(403).json({ success: false, message: `Token missing required fields: ${missingNames}` });
    }

    req.user = decoded; // Attach payload to request for later middlewares
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = authenticationMiddleware;
