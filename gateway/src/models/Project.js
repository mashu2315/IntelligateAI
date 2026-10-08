const mongoose = require('mongoose');
const crypto = require('crypto');

const GatewayConfigSchema = new mongoose.Schema({
  authentication: {
    enabled: { type: Boolean, default: false },
    type: { type: String, default: 'JWT' },
    jwtSecret: { type: String, default: () => crypto.randomBytes(32).toString('hex') },
    customFields: [{
      name: { type: String, required: true },
      isRequired: { type: Boolean, default: false },
      dataType: { type: String, enum: ['string', 'number', 'boolean'], default: 'string' },
      isPrimary: { type: Boolean, default: false }
    }]
  },
  authorization: {
    enabled: { type: Boolean, default: false },
    type: { type: String, default: 'ROLE' },
    customFields: { type: [String], default: [] },
    allowedRoles: { type: [String], default: [] }
  },
  rateLimit: {
    enabled: { type: Boolean, default: false },
    globalLimit: {
      windowSeconds: { type: Number, default: 60 },
      maxRequests: { type: Number, default: 100 }
    },
    routes: [{
      pathMatch: { type: String, required: true },
      windowSeconds: { type: Number, required: true },
      maxRequests: { type: Number, required: true }
    }]
  },
  cache: {
    enabled: { type: Boolean, default: false },
    globalTtlSeconds: { type: Number, default: 60 },
    routes: [{
      pathMatch: { type: String, required: true },
      ttlSeconds: { type: Number, required: true },
      methods: { type: [String], default: ['GET'] }
    }]
  }
}, { _id: false });

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  apiKey: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomBytes(32).toString('hex')
  },
  gatewayConfig: {
    type: GatewayConfigSchema,
    default: () => ({})
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
