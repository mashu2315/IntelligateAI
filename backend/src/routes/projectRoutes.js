const express = require('express');
const router = express.Router();
const authUser = require('../middleware/authMiddleware');
const { getProjects, createProject, getProjectById, updateAuthConfig } = require('../controllers/projectController');

router.get('/', authUser, getProjects);
router.post('/', authUser, createProject);
router.get('/:projectId', authUser, getProjectById);
router.put('/:projectId/auth', authUser, updateAuthConfig);

module.exports = router;
