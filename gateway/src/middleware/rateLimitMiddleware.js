const { getRedisClient } = require('../config/redis');

const rateLimitMiddleware = async (req, res, next) => {
  const config = req.project.gatewayConfig;

  if (!config.rateLimit || !config.rateLimit.enabled) {
    return next();
  }

  const redisClient = getRedisClient();
  if (!redisClient || !redisClient.isOpen) {
    console.warn('Redis client not available, skipping rate limit');
    return next();
  }

  const projectId = req.project._id.toString();
  const apiKey = req.project.apiKey;
  // Match against the full URL path without query parameters
  const fullPath = req.originalUrl.split('?')[0];
  
  // Determine limits based on specific route config or global fallback
  let windowSeconds = config.rateLimit.globalLimit?.windowSeconds || 60;
  let maxRequests = config.rateLimit.globalLimit?.maxRequests || 100;
  let ruleKey = 'global';

  const routeConfigs = config.rateLimit.routes || [];
  for (const r of routeConfigs) {
    if (fullPath.startsWith(r.pathMatch)) {
      windowSeconds = r.windowSeconds;
      maxRequests = r.maxRequests;
      ruleKey = r.pathMatch;
      // Depending on priority, we could break here (first match wins) or look for longest match. First match is simpler.
      break; 
    }
  }

  const key = `rate_limit:${projectId}:${apiKey}:${ruleKey}`;

  try {
    const current = await redisClient.incr(key);
    if (current === 1) {
      await redisClient.expire(key, windowSeconds);
    }

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));
    res.setHeader('X-RateLimit-Rule', ruleKey);

    if (current > maxRequests) {
      return res.status(429).json({ success: false, message: 'Rate limit exceeded' });
    }

    next();
  } catch (error) {
    console.error('Rate limit error:', error.message);
    next();
  }
};

module.exports = rateLimitMiddleware;
