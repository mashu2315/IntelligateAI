const mongoose = require('mongoose');

const RequestLogSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    default: null
  },
  requestId: {
    type: String,
    required: true,
    index: true
  },
  method: {
    type: String,
    required: true,
    index: true
  },
  path: {
    type: String,
    required: true
  },
  targetUrl: {
    type: String,
    required: true
  },
  statusCode: {
    type: Number,
    required: true,
    index: true
  },
  latency: {
    type: Number,
    required: true
  },
  cacheStatus: {
    type: String,
    enum: ['HIT', 'MISS', 'BYPASS'],
    default: 'BYPASS'
  },
  rateLimitStatus: {
    type: String,
    enum: ['PASS', 'BLOCKED', 'DISABLED'],
    default: 'DISABLED'
  },
  authenticationStatus: {
    type: String,
    enum: ['PASS', 'FAILED', 'DISABLED', 'SKIP'],
    default: 'DISABLED'
  },
  errorType: {
    type: String,
    default: null
  }
}, { timestamps: true });

// Add index on createdAt (timestamp) for fast analytics range queries
RequestLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('RequestLog', RequestLogSchema);
