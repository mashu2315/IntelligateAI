const authorizationMiddleware = (req, res, next) => {
  const config = req.project.gatewayConfig;

  if (!config.authorization || !config.authorization.enabled) {
    return next();
  }

  if (!req.user) {
    return res.status(401).json({ success: false, message: 'User not authenticated for authorization check' });
  }

  const allowedRoles = config.authorization.allowedRoles || [];
  const customFields = config.authorization.customFields || ['role'];

  // If no specific roles required, allow access
  if (allowedRoles.length === 0) {
    return next();
  }

  // Check if user has any of the allowed roles across the custom fields mapped
  let hasRole = false;
  for (const field of customFields) {
    const userRoleOrRoles = req.user[field];
    if (userRoleOrRoles) {
      if (Array.isArray(userRoleOrRoles)) {
        if (userRoleOrRoles.some(r => allowedRoles.includes(r))) {
          hasRole = true;
          break;
        }
      } else {
        if (allowedRoles.includes(userRoleOrRoles)) {
          hasRole = true;
          break;
        }
      }
    }
  }

  if (!hasRole) {
    return res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges' });
  }

  next();
};

module.exports = authorizationMiddleware;
