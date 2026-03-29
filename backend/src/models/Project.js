const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  apiKey: { type: String, required: true, unique: true },
  targetBaseUrl: { type: String, required: true },
  authConfig: {
    enabled: { type: Boolean, default: false },
    loginEndpoint: { type: String, default: '/auth/login' },
    signupEndpoint: { type: String, default: '/auth/signup' },
    requiredFields: [{ type: String }] // e.g. ['email', 'password', 'name']
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);
