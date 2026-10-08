const projectService = require('../services/projectService');

const apiKeyMiddleware = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ success: false, message: 'API key is missing' });
  }

  try {
    const project = await projectService.getProjectByApiKey(apiKey);
    
    if (!project) {
      return res.status(401).json({ success: false, message: 'Invalid API key' });
    }

    // Attach project and its config to the request for subsequent middlewares
    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error validating API key' });
  }
};

module.exports = apiKeyMiddleware;
