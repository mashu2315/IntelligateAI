const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  route: { type: String, required: true }, // Request path
  method: { type: String, required: true }, // Request method
  status: { type: Number, required: true },
  latency: { type: Number, required: true }, // in milliseconds
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', LogSchema);
