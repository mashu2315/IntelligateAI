/**
 * Route Controller
 * CRUD operations for Route Policy configurations.
 */

const Route = require('../models/Route');
const Project = require('../models/Project');
const { getRedisClient } = require('../config/redis');

const createRoute = async (req, res) => {
  const { projectId, path, method, rateLimit, authRequired, cacheEnabled, cacheTTL, loggingEnabled } = req.body;

  // Verify ownership
  const project = await Project.findOne({ _id: projectId, ownerId: req.user.id });
  if (!project) return res.status(403).json({ error: 'Project not owned by user' });

  const routeConfig = await Route.create({
    projectId, path, method, rateLimit, authRequired, cacheEnabled, cacheTTL, loggingEnabled
  });

  // Invalidate redis cache for this project's routes
  await getRedisClient().del(`routes_project:${projectId}`);
  res.json(routeConfig);
};

const deleteRoute = async (req, res) => {
  const route = await Route.findById(req.params.routeId);
  if (!route) return res.status(404).json({ error: 'Route not found' });

  const project = await Project.findOne({ _id: route.projectId, ownerId: req.user.id });
  if (!project) return res.status(403).json({ error: 'Unauthorized' });

  await route.deleteOne();
  await getRedisClient().del(`routes_project:${project._id}`);
  res.json({ message: 'Route deleted' });
};

module.exports = { createRoute, deleteRoute };
