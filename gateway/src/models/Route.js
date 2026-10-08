const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'ALL'],
    default: 'ALL'
  },
  gatewayPath: {
    type: String,
    required: true,
    trim: true
  },
  targetUrl: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });

// Ensure unique path per project
RouteSchema.index({ projectId: 1, gatewayPath: 1, method: 1 }, { unique: true });

module.exports = mongoose.model('Route', RouteSchema);
