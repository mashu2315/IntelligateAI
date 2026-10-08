const express = require('express');
const router = express.Router();
const Route = require('../models/Route');
const Project = require('../models/Project');

// Get all routes for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const routes = await Route.find({ projectId: req.params.projectId });
    res.json({ success: true, data: routes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a new route
router.post('/', async (req, res) => {
  try {
    const { projectId, method, gatewayPath, targetUrl } = req.body;
    
    // Ensure project exists
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const route = new Route({ projectId, method, gatewayPath, targetUrl });
    await route.save();
    
    res.status(201).json({ success: true, data: route });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Route already exists for this path and method' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a route
router.delete('/:id', async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    res.json({ success: true, data: route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
