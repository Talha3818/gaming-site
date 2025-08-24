const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 10,
    max: 50000
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  bKashNumber: {
    type: String,
    required: true,
    trim: true
  },
  screenshot: {
    url: String,
    public_id: String,
    originalName: String,
    mimetype: String,
    size: Number
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    trim: true
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date,
  isRead: {
    type: Boolean,
    default: false
  },
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ isRead: 1, status: 1 });

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return `৳${this.amount.toLocaleString()}`;
});

// Virtual for payment status color
paymentSchema.virtual('statusColor').get(function() {
  switch (this.status) {
    case 'approved': return 'text-green-400';
    case 'rejected': return 'text-red-400';
    default: return 'text-yellow-400';
  }
});

// Method to approve payment
paymentSchema.methods.approve = async function(adminId, notes = '') {
  this.status = 'approved';
  this.processedBy = adminId;
  this.processedAt = new Date();
  this.adminNotes = notes;
  this.isRead = true;
  
  // Add amount to user's balance
  const User = require('./User');
  const user = await User.findById(this.user);
  if (user) {
    await user.updateBalance(this.amount);
  }
  
  return this.save();
};

// Method to reject payment
paymentSchema.methods.reject = async function(adminId, notes = '') {
  this.status = 'rejected';
  this.processedBy = adminId;
  this.processedAt = new Date();
  this.adminNotes = notes;
  this.isRead = true;
  
  return this.save();
};

// Method to mark as read
paymentSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Method to send notification
paymentSchema.methods.sendNotification = function() {
  this.notificationSent = true;
  return this.save();
};

module.exports = mongoose.model('Payment', paymentSchema);
