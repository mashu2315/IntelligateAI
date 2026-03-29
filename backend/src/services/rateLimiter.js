/**
 * Rate Limiter Service
 * Redis-backed fixed-window rate limiting.
 */

const { getRedisClient } = require('../config/redis');

/**
 * Check if a request is rate-limited.
 * @param {string} projectId
 * @param {string} routeId
 * @param {string} clientIp
 * @param {Object} rateLimit - { limit: number, window: number (seconds) }
 * @returns {Object} - { allowed: boolean, current: number, limit: number }
 */
const checkRateLimit = async (projectId, routeId, clientIp, rateLimit) => {
  if (!rateLimit || rateLimit.limit <= 0) {
    return { allowed: true, current: 0, limit: 0 };
  }

  const redis = getRedisClient();
  const key = `rl:${projectId}:${routeId}:${clientIp}`;

  const currentReqs = await redis.incr(key);

  // Set expiry on first request in the window
  if (currentReqs === 1) {
    await redis.expire(key, rateLimit.window);
  }

  return {
    allowed: currentReqs <= rateLimit.limit,
    current: currentReqs,
    limit: rateLimit.limit
  };
};

module.exports = { checkRateLimit };
