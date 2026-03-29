/**
 * Cache Service
 * Redis-backed response caching for GET requests.
 */

const { getRedisClient } = require('../config/redis');

/**
 * Try to get a cached response.
 * @param {string} projectId
 * @param {string} method
 * @param {string} originalUrl
 * @returns {string|null} - Cached response body or null
 */
const getCachedResponse = async (projectId, method, originalUrl) => {
  const redis = getRedisClient();
  const key = `cache:${projectId}:${method}:${originalUrl}`;
  return await redis.get(key);
};

/**
 * Store a response in cache.
 * @param {string} projectId
 * @param {string} method
 * @param {string} originalUrl
 * @param {string} responseBody
 * @param {number} ttl - TTL in seconds
 */
const setCachedResponse = async (projectId, method, originalUrl, responseBody, ttl = 300) => {
  const redis = getRedisClient();
  const key = `cache:${projectId}:${method}:${originalUrl}`;
  await redis.set(key, responseBody, { EX: ttl });
};

module.exports = { getCachedResponse, setCachedResponse };
