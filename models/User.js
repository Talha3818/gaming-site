const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    trim: true,
    default: undefined
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    expires: 300 // 5 minutes
  },
  resetPasswordCode: {
    type: String,
    expires: 300 // 5 minutes
  },
  resetPasswordExpires: {
    type: Date
  },
  profilePicture: {
    type: String,
    default: ''
  },
  totalWins: {
    type: Number,
    default: 0
  },
  totalLosses: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ username: 1 });

// Virtual for win rate
userSchema.virtual('winRate').get(function() {
  const totalGames = this.totalWins + this.totalLosses;
  return totalGames > 0 ? ((this.totalWins / totalGames) * 100).toFixed(1) : 0;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update balance
userSchema.methods.updateBalance = function(amount) {
  this.balance += amount;
  if (this.balance < 0) this.balance = 0;
  return this.save();
};

// Method to add win
userSchema.methods.addWin = function(earnings) {
  this.totalWins += 1;
  this.totalEarnings += earnings;
  return this.save();
};

// Method to add loss
userSchema.methods.addLoss = function() {
  this.totalLosses += 1;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
