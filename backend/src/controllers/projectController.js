/**
 * Project Controller
 * CRUD operations for Projects including Auth Config updates.
 */

const Project = require('../models/Project');
const Route = require('../models/Route');
const Log = require('../models/Log');
const { v4: uuidv4 } = require('uuid');
const { getRedisClient } = require('../config/redis');

const getProjects = async (req, res) => {
  const projects = await Project.find({ ownerId: req.user.id });
  res.json(projects);
};

const createProject = async (req, res) => {
  const { name, targetBaseUrl } = req.body;
  const apiKey = 'gk_' + uuidv4().replace(/-/g, '');
  const project = await Project.create({ name, targetBaseUrl, apiKey, ownerId: req.user.id });
  res.json(project);
};

const getProjectById = async (req, res) => {
  const project = await Project.findOne({ _id: req.params.projectId, ownerId: req.user.id });
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const routes = await Route.find({ projectId: project._id });
  const totalRequests = await Log.countDocuments({ projectId: project._id });

  res.json({ project, routes, stats: { totalRequests } });
};

const updateAuthConfig = async (req, res) => {
  const { enabled, loginEndpoint, signupEndpoint, requiredFields } = req.body;
  const project = await Project.findOneAndUpdate(
    { _id: req.params.projectId, ownerId: req.user.id },
    { authConfig: { enabled, loginEndpoint, signupEndpoint, requiredFields } },
    { new: true }
  );

  if (!project) return res.status(404).json({ error: 'Project not found' });

  // Invalidate cache
  await getRedisClient().del(`project_apikey:${project.apiKey}`);
  res.json(project);
};

module.exports = { getProjects, createProject, getProjectById, updateAuthConfig };
