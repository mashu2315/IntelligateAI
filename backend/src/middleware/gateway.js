/**
 * Gateway Middleware (Slim Orchestrator)
 * 
 * This is the core of the GaaS engine. It coordinates:
 * 1. Project identification (via x-api-key)
 * 2. Auth-as-a-Service interception (signup/login)
 * 3. Route policy matching
 * 4. End-user JWT validation
 * 5. Rate limiting
 * 6. Response caching
 * 7. Proxy forwarding (via proxyHandler)
 * 
 * Each concern is delegated to a dedicated service module.
 */

const { getRedisClient } = require('../config/redis');
const { REDIS_CACHE_TTL } = require('../config/constants');
const Project = require('../models/Project');
const Route = require('../models/Route');
const Log = require('../models/Log');

// Services
const { findMatchingRoute } = require('../services/routeMatcher');
const { handleSignup, handleLogin, validateEndUserToken } = require('../services/authService');
const { checkRateLimit } = require('../services/rateLimiter');
const { getCachedResponse } = require('../services/cacheService');

// Proxy
const proxyHandler = require('./proxyHandler');

const gatewayMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ error: 'Missing x-api-key header' });

    const redis = getRedisClient();

    // ── Step 1: Project Identification ──────────────────────────
    let project;
    const projectCacheKey = `project_apikey:${apiKey}`;
    const cachedProject = await redis.get(projectCacheKey);

    if (cachedProject) {
      project = JSON.parse(cachedProject);
    } else {
      project = await Project.findOne({ apiKey }).lean();
      if (!project) return res.status(401).json({ error: 'Invalid API Key' });
      await redis.set(projectCacheKey, JSON.stringify(project), { EX: REDIS_CACHE_TTL });
    }

    // ── Step 2: Auth-as-a-Service Interception ──────────────────
    if (project.authConfig && project.authConfig.enabled) {
      const isSignup = req.path === project.authConfig.signupEndpoint;
      const isLogin = req.path === project.authConfig.loginEndpoint;

      if (isSignup || isLogin) {
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Auth endpoints require POST method' });
        }
        if (isSignup) return await handleSignup(req, res, project);
        if (isLogin) return await handleLogin(req, res, project);
      }
    }

    // ── Step 3: Route Policy Matching ───────────────────────────
    let routes;
    const routesCacheKey = `routes_project:${project._id}`;
    const cachedRoutes = await redis.get(routesCacheKey);

    if (cachedRoutes) {
      routes = JSON.parse(cachedRoutes);
    } else {
      routes = await Route.find({ projectId: project._id }).lean();
      await redis.set(routesCacheKey, JSON.stringify(routes), { EX: REDIS_CACHE_TTL });
    }

    const matchingRoute = findMatchingRoute(req.path, req.method, routes);

    if (!matchingRoute) {
      console.log(`[Gateway] No match for ${req.method} ${req.path}. Routes:`, routes.map(r => `${r.method} ${r.path}`));
      return res.status(404).json({ error: `No matching route policy for: ${req.method} ${req.path}` });
    }

    req.project = project;
    req.matchingRoute = matchingRoute;
    req.startTime = Date.now();

    // ── Step 4: End-User JWT Validation ─────────────────────────
    if (matchingRoute.authRequired) {
      req.endUserId = validateEndUserToken(req.headers['authorization'], project._id);
    }

    // ── Step 5: Rate Limiting ───────────────────────────────────
    if (matchingRoute.rateLimit && matchingRoute.rateLimit.limit > 0) {
      const result = await checkRateLimit(
        project._id, matchingRoute._id, req.ip, matchingRoute.rateLimit
      );
      if (!result.allowed) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
      }
    }

    // ── Step 6: Response Cache Check ────────────────────────────
    if (matchingRoute.cacheEnabled && req.method === 'GET') {
      const cached = await getCachedResponse(project._id, req.method, req.originalUrl);
      if (cached) {
        if (matchingRoute.loggingEnabled) {
          Log.create({
            projectId: project._id,
            route: req.path,
            method: req.method,
            status: 200,
            latency: Date.now() - req.startTime
          }).catch(console.error);
        }
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Content-Type', 'application/json');
        return res.send(cached);
      }
    }

    // ── Step 7: Forward to Proxy ────────────────────────────────
    next();

  } catch (error) {
    console.error('[Gateway Error]', error.message);
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message || 'Internal Gateway Error' });
  }
};

// Export unified middleware: gateway logic → proxy handler
module.exports = async (req, res, next) => {
  await gatewayMiddleware(req, res, (err) => {
    if (err) return next(err);
    proxyHandler(req, res, next);
  });
};
