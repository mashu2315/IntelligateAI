const Project = require('../models/Project');

const createProject = async (name) => {
  const project = new Project({ name });
  return await project.save();
};

const getProjectById = async (id) => {
  return await Project.findById(id);
};

const getProjectByApiKey = async (apiKey) => {
  return await Project.findOne({ apiKey });
};

const getAllProjects = async () => {
  return await Project.find();
};

const updateProjectConfig = async (id, config) => {
  const project = await Project.findById(id);
  if (!project) throw new Error('Project not found');

  if (config.authentication) {
    project.gatewayConfig.authentication = {
      ...project.gatewayConfig.authentication,
      ...config.authentication
    };
  }
  if (config.authorization) {
    project.gatewayConfig.authorization = {
      ...project.gatewayConfig.authorization,
      ...config.authorization
    };
  }
  if (config.rateLimit) {
    project.gatewayConfig.rateLimit = {
      ...project.gatewayConfig.rateLimit,
      ...config.rateLimit
    };
  }
  if (config.cache) {
    project.gatewayConfig.cache = {
      ...project.gatewayConfig.cache,
      ...config.cache
    };
  }

  return await project.save();
};

module.exports = {
  createProject,
  getProjectById,
  getProjectByApiKey,
  getAllProjects,
  updateProjectConfig
};
