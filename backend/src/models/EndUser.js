const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const EndUserSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  dynamicData: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});

// Ensure email is unique PER PROJECT, not globally
EndUserSchema.index({ projectId: 1, email: 1 }, { unique: true });

EndUserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

EndUserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('EndUser', EndUserSchema);
