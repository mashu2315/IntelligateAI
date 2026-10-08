const express = require('express');
const router = express.Router();
const projectService = require('../services/projectService');

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await projectService.getAllProjects();
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const EndUser = require('../models/EndUser');

// Get end users for a project
router.get('/:id/users', async (req, res) => {
  try {
    const users = await EndUser.find({ projectId: req.params.id }).sort('-createdAt');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create project
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    
    const project = await projectService.createProject(name);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update project gateway config
router.put('/:id/config', async (req, res) => {
  try {
    const project = await projectService.updateProjectConfig(req.params.id, req.body);
    res.json({ success: true, data: project });
  } catch (error) {
    if (error.message === 'Project not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
