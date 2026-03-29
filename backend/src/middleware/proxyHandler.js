/**
 * Proxy Handler
 * Configures http-proxy-middleware for forwarding requests to target backends.
 */

const { createProxyMiddleware } = require('http-proxy-middleware');
const Log = require('../models/Log');
const { setCachedResponse } = require('../services/cacheService');

const proxyHandler = createProxyMiddleware({
  router: (req) => {
    return req.project.targetBaseUrl;
  },
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req, res) => {
      // Inject authenticated end-user ID into the forwarded request
      if (req.endUserId) {
        proxyReq.setHeader('x-user-id', req.endUserId);
      }
    },
    proxyRes: (proxyRes, req, res) => {
      const route = req.matchingRoute;
      const project = req.project;

      let responseBody = '';

      proxyRes.on('data', (chunk) => {
        responseBody += chunk;
      });

      proxyRes.on('end', () => {
        const latency = Date.now() - req.startTime;
        const status = proxyRes.statusCode;

        // Logging
        if (route && route.loggingEnabled) {
          Log.create({
            projectId: project._id,
            route: req.path,
            method: req.method,
            status,
            latency
          }).catch(err => console.error('Failed to save log', err));
        }

        // Cache Response (only on 200 GET)
        if (route && route.cacheEnabled && req.method === 'GET' && status >= 200 && status < 300) {
          setCachedResponse(
            project._id, req.method, req.originalUrl,
            responseBody, route.cacheTTL || 300
          ).catch(console.error);
        }
      });
    },
    error: (err, req, res) => {
      console.error('[Proxy Error]', err.message);
      res.status(502).json({ error: 'Bad Gateway', details: err.message });
    }
  }
});

module.exports = proxyHandler;
