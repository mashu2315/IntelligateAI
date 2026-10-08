const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { getRedisClient } = require('../config/redis');
const RequestLog = require('../models/RequestLog');

/**
 * Log the gateway request asynchronously to MongoDB
 */
const logRequestAsync = (req, targetUrl, status, latency) => {
  const projectId = req.project ? req.project._id : null;
  const routeId = req.routeId || null;
  const requestId = req.requestId;
  
  // Auth checks
  const authEnabled = req.project?.gatewayConfig?.authentication?.enabled;
  const authzEnabled = req.project?.gatewayConfig?.authorization?.enabled;
  const authStatus = authEnabled ? (req.user ? 'PASS' : 'FAILED') : 'DISABLED';
  
  // Rate Limit check
  const rlEnabled = req.project?.gatewayConfig?.rateLimit?.enabled;
  const rlStatus = rlEnabled ? (status === 429 ? 'BLOCKED' : 'PASS') : 'DISABLED';
  
  // Cache check
  const cacheStatus = req.cacheHit ? 'HIT' : (req.shouldCache ? 'MISS' : 'BYPASS');

  let errorType = null;
  if (status === 502) errorType = 'BACKEND_UNAVAILABLE';
  if (status === 504) errorType = 'BACKEND_TIMEOUT';
  if (status === 500) errorType = 'GATEWAY_ERROR';

  console.log(`[Gateway] ${requestId.substring(0,8)} | ${req.method} ${req.originalUrl} | ${status} | ${latency}ms`);

  if (!projectId) return; // Cannot log without a project

  // Fire and forget - do not await
  RequestLog.create({
    projectId,
    routeId,
    requestId,
    method: req.method,
    path: req.originalUrl,
    targetUrl: targetUrl || 'UNKNOWN',
    statusCode: status,
    latency,
    cacheStatus,
    rateLimitStatus: rlStatus,
    authenticationStatus: authStatus,
    errorType
  }).catch(err => console.error('Failed to save RequestLog:', err.message));
};

/**
 * Handle proxying the request to the backend service
 */
const gatewayHandler = async (req, res) => {
  // Generate or use existing Request ID
  req.requestId = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  res.setHeader('X-Gateway', 'IntelliGate AI');

  const targetUrl = req.targetUrl;

  // If cache hit, response was already sent by cacheMiddleware
  if (req.cacheHit) {
    res.setHeader('X-Cache', 'HIT');
    logRequestAsync(req, 'CACHE', 200, 0);
    return;
  }
  res.setHeader('X-Cache', 'MISS');

  const startTime = Date.now();

  try {
    const headersToForward = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'X-Request-ID': req.requestId // Forward to backend
    };

    if (req.user && req.user.sub) {
      headersToForward['x-user-id'] = req.user.sub;
    }

    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      params: req.query,
      headers: headersToForward,
      timeout: 10000,
    });

    const latency = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${latency}ms`);
    
    // Save to cache if enabled
    if (req.shouldCache && req.cacheKey) {
      const redisClient = getRedisClient();
      if (redisClient && redisClient.isOpen) {
        try {
          await redisClient.setEx(req.cacheKey, req.cacheTtl, JSON.stringify(response.data));
        } catch (cacheErr) {
          console.error('Error saving to cache:', cacheErr.message);
        }
      }
    }

    logRequestAsync(req, targetUrl, response.status, latency);
    res.status(response.status).json(response.data);

  } catch (error) {
    const latency = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${latency}ms`);
    
    if (error.response) {
      logRequestAsync(req, targetUrl, error.response.status, latency);
      res.status(error.response.status).json(error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      logRequestAsync(req, targetUrl, 502, latency);
      res.status(502).json({ success: false, message: 'Backend service is unavailable' });
    } else if (error.code === 'ECONNABORTED') {
      logRequestAsync(req, targetUrl, 504, latency);
      res.status(504).json({ success: false, message: 'Backend service timed out' });
    } else {
      logRequestAsync(req, targetUrl, 500, latency);
      res.status(500).json({ success: false, message: 'Gateway error while forwarding request' });
    }
  }
};

module.exports = gatewayHandler;
