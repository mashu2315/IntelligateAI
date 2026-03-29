const express = require('express');
const router = express.Router();
const authUser = require('../middleware/authMiddleware');
const { getLogsByProject } = require('../controllers/logController');

router.get('/:projectId', authUser, getLogsByProject);

module.exports = router;
