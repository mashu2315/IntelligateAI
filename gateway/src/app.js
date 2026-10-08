const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const proxyRoutes = require('./routes/proxy.routes');
const projectRoutes = require('./routes/project.routes');
const routeRoutes = require('./routes/route.routes');
const logRoutes = require('./routes/log.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const clientAuthRoutes = require('./routes/clientAuth.routes');

const app = express();

// Middleware
app.use(cors({
  exposedHeaders: [
    'X-Cache', 
    'X-Cache-TTL-Config', 
    'X-RateLimit-Limit', 
    'X-RateLimit-Remaining', 
    'X-RateLimit-Rule', 
    'X-Response-Time', 
    'X-Request-ID', 
    'X-Gateway'
  ]
}));
app.use(express.json());

// Routes
app.use('/', healthRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/client-auth', clientAuthRoutes);

// The dynamic proxy router catches all other /api/* traffic
app.use('/api', proxyRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

module.exports = app;
