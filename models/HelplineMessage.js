const mongoose = require('mongoose');

const helplineMessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'file'],
    default: 'text'
  },
  attachment: {
    type: String
  },
  attachmentPublicId: {
    type: String
  },
  isFromAdmin: {
    type: Boolean,
    default: false
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
helplineMessageSchema.index({ user: 1, createdAt: -1 });
helplineMessageSchema.index({ isFromAdmin: false, isRead: false });

// Method to mark as read
helplineMessageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

module.exports = mongoose.model('HelplineMessage', helplineMessageSchema);
