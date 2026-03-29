const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  path: { type: String, required: true }, // e.g. '/api/users'
  method: { type: String, enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'ALL'], default: 'ALL' },
  rateLimit: {
    limit: { type: Number, default: 100 },
    window: { type: Number, default: 60 } // in seconds
  },
  authRequired: { type: Boolean, default: false },
  cacheEnabled: { type: Boolean, default: false },
  cacheTTL: { type: Number, default: 300 }, // in seconds
  loggingEnabled: { type: Boolean, default: true }
});

module.exports = mongoose.model('Route', RouteSchema);
