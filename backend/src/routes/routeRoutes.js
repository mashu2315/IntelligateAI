const express = require('express');
const router = express.Router();
const authUser = require('../middleware/authMiddleware');
const { createRoute, deleteRoute } = require('../controllers/routeController');

router.post('/', authUser, createRoute);
router.delete('/:routeId', authUser, deleteRoute);

module.exports = router;
