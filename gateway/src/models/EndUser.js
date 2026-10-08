const mongoose = require('mongoose');

const EndUserSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  identityKey: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'user'
  },
  customData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Ensure identityKey is unique per project
EndUserSchema.index({ projectId: 1, identityKey: 1 }, { unique: true });

module.exports = mongoose.model('EndUser', EndUserSchema);
