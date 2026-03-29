// Centralized configuration constants
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretgaas';
const JWT_DASHBOARD_EXPIRY = '1d';
const JWT_ENDUSER_EXPIRY = '7d';
const REDIS_CACHE_TTL = 300; // 5 minutes
const DEFAULT_RATE_WINDOW = 60; // seconds

module.exports = {
  JWT_SECRET,
  JWT_DASHBOARD_EXPIRY,
  JWT_ENDUSER_EXPIRY,
  REDIS_CACHE_TTL,
  DEFAULT_RATE_WINDOW
};
