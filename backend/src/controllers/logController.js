/**
 * Log Controller
 * Fetches traffic logs for a project.
 */

const Log = require('../models/Log');
const Project = require('../models/Project');

const getLogsByProject = async (req, res) => {
  const project = await Project.findOne({ _id: req.params.projectId, ownerId: req.user.id });
  if (!project) return res.status(403).json({ error: 'Unauthorized' });

  const logs = await Log.find({ projectId: project._id }).sort({ timestamp: -1 }).limit(100);
  res.json(logs);
};

module.exports = { getLogsByProject };
