/**
 * Routes Aggregator
 * Mounts all domain-specific sub-routers under /management.
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const projectRoutes = require('./projectRoutes');
const routeRoutes = require('./routeRoutes');
const logRoutes = require('./logRoutes');

router.use('/', authRoutes);                // POST /management/register, /management/login
router.use('/projects', projectRoutes);     // /management/projects/*
router.use('/routes', routeRoutes);         // /management/routes/*
router.use('/logs', logRoutes);             // /management/logs/*

module.exports = router;
