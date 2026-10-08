const express = require('express');
const router = express.Router();
const Route = require('../models/Route');

// Middlewares
const apiKeyMiddleware = require('../middleware/apiKeyMiddleware');
const authenticationMiddleware = require('../middleware/authenticationMiddleware');
const authorizationMiddleware = require('../middleware/authorizationMiddleware');
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');
const cacheMiddleware = require('../middleware/cacheMiddleware');

// Final handler
const gatewayHandler = require('../gateway/gatewayHandler');

// Dynamic Route Resolver Middleware
const dynamicRouteResolver = async (req, res, next) => {
  if (!req.project) return res.status(401).json({ success: false, message: 'Project context missing' });
  
  const path = req.originalUrl.replace('/api', '');
  const method = req.method;

  try {
    // 1. Try to find a dynamic route exactly matching or matching prefix
    // For simplicity in this sprint, we'll fetch all active routes for the project 
    // and see if the incoming path starts with the gatewayPath.
    const routes = await Route.find({ projectId: req.project._id, status: 'Active' });
    
    let matchedRoute = null;
    for (const route of routes) {
      if ((route.method === 'ALL' || route.method === method) && path.startsWith(route.gatewayPath)) {
        // Find the most specific match (longest prefix)
        if (!matchedRoute || route.gatewayPath.length > matchedRoute.gatewayPath.length) {
          matchedRoute = route;
        }
      }
    }

    if (matchedRoute) {
      // e.g. gatewayPath = /inventory, incoming = /inventory/123
      // Remainder = /123
      const remainder = path.substring(matchedRoute.gatewayPath.length);
      req.targetUrl = `${matchedRoute.targetUrl}${remainder}`;
      req.routeId = matchedRoute._id;
      return next();
    }

    // 2. Not found
    res.status(404).json({ success: false, message: 'API Gateway Route not found for this project' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Routing error' });
  }
};

const pipeline = [
  apiKeyMiddleware,
  dynamicRouteResolver,
  authenticationMiddleware,
  authorizationMiddleware,
  rateLimitMiddleware,
  cacheMiddleware
];

// Catch-all for API traffic
router.all('/*', pipeline, gatewayHandler);

module.exports = router;
