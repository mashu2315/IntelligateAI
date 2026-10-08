const { getRedisClient } = require('../config/redis');

const cacheMiddleware = async (req, res, next) => {
  const config = req.project.gatewayConfig;

  if (!config.cache || !config.cache.enabled) {
    req.shouldCache = false;
    return next();
  }

  // Match against the full URL path without query parameters
  const fullPath = req.originalUrl.split('?')[0];
  
  let ttlSeconds = config.cache.globalTtlSeconds || 60;
  let allowedMethods = ['GET'];
  let routeMatched = false;

  const routeConfigs = config.cache.routes || [];
  console.log(`[Cache Debug] fullPath: '${fullPath}', routeConfigs:`, routeConfigs.map(r => r.pathMatch));
  
  if (routeConfigs.length > 0) {
    // If route configs exist, only cache if there is a match
    let match = null;
    for (const r of routeConfigs) {
      if (fullPath.startsWith(r.pathMatch)) {
        match = r;
        break;
      }
    }
    
    if (match) {
      console.log(`[Cache Debug] Matched route config:`, match);
      routeMatched = true;
      ttlSeconds = match.ttlSeconds;
      allowedMethods = match.methods && match.methods.length > 0 ? match.methods : ['GET'];
    } else {
      console.log(`[Cache Debug] No match found. Bypassing cache.`);
      req.shouldCache = false;
      return next();
    }
  } else {
    routeMatched = true; // No route restrictions, cache everything using global TTL
  }

  if (!allowedMethods.includes(req.method)) {
    console.log(`[Cache Debug] Method ${req.method} not allowed. Bypassing cache.`);
    req.shouldCache = false;
    return next();
  }

  const redisClient = getRedisClient();
  if (!redisClient || !redisClient.isOpen) {
    req.shouldCache = false;
    console.warn('Redis client not available, skipping cache lookup');
    return next();
  }

  const projectId = req.project._id.toString();
  const cacheKey = `cache:${projectId}:${req.method}:${req.originalUrl}`;

  try {
    const cachedData = await redisClient.get(cacheKey);
    
    if (cachedData) {
      req.cacheHit = true;
      res.setHeader('X-Cache-TTL-Config', ttlSeconds);
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(JSON.parse(cachedData));
    }
    
    req.shouldCache = true;
    req.cacheKey = cacheKey;
    req.cacheTtl = ttlSeconds;
    next();
  } catch (error) {
    console.error('Cache lookup error:', error.message);
    req.shouldCache = false;
    next();
  }
};

module.exports = cacheMiddleware;
