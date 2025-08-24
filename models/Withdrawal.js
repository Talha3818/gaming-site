const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 50 // Minimum withdrawal amount
  },
  paymentMethod: {
    type: String,
    enum: ['bKash', 'Nagad'],
    required: true
  },
  paymentNumber: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
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
  processedAt: {
    type: Date
  },
  isRead: {
    type: Boolean,
    default: false
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
withdrawalSchema.index({ user: 1, status: 1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });

// Virtual for formatted amount
withdrawalSchema.virtual('formattedAmount').get(function() {
  return `৳${this.amount.toLocaleString()}`;
});

// Virtual for status color
withdrawalSchema.virtual('statusColor').get(function() {
  switch (this.status) {
    case 'pending': return 'yellow';
    case 'approved': return 'green';
    case 'rejected': return 'red';
    case 'completed': return 'blue';
    default: return 'gray';
  }
});

// Method to approve withdrawal
withdrawalSchema.methods.approve = async function(adminId, notes = '') {
  this.status = 'approved';
  this.adminNotes = notes;
  this.processedBy = adminId;
  this.processedAt = new Date();
  this.isRead = true;
  return this.save();
};

// Method to reject withdrawal
withdrawalSchema.methods.reject = async function(adminId, notes = '') {
  this.status = 'rejected';
  this.adminNotes = notes;
  this.processedBy = adminId;
  this.processedAt = new Date();
  this.isRead = true;
  
  // Refund the amount to user's balance
  const User = mongoose.model('User');
  const user = await User.findById(this.user);
  if (user) {
    await user.updateBalance(this.amount);
  }
  
  return this.save();
};

// Method to complete withdrawal
withdrawalSchema.methods.complete = async function(adminId, notes = '') {
  this.status = 'completed';
  this.adminNotes = notes || this.adminNotes;
  this.processedBy = adminId;
  this.processedAt = new Date();
  this.isRead = true;
  return this.save();
};

// Method to mark as read
withdrawalSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Method to send notification
withdrawalSchema.methods.sendNotification = function() {
  this.notificationSent = true;
  return this.save();
};

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
