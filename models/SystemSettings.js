const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  isEditable: {
    type: Boolean,
    default: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient queries
systemSettingsSchema.index({ key: 1 });

// Pre-save middleware to ensure only admins can update
systemSettingsSchema.pre('save', function(next) {
  // This will be enforced at the route level
  next();
});

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
