const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  challenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accepter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  game: {
    type: String,
    required: true,
    enum: ['Ludo King', 'Free Fire', 'PUBG']
  },
  betAmount: {
    type: Number,
    required: true,
    min: 10,
    max: 10000
  },
  matchFee: {
    type: Number,
    default: function() {
      return Math.round(this.betAmount * 0.25); // 25% of bet amount
    }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  matchTime: {
    type: Date
  },
  roomCode: {
    type: String,
    default: ''
  },
  adminRoomCode: {
    type: String,
    default: ''
  },
  roomCodeProvidedAt: {
    type: Date
  },
  roomCodeProvidedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  loser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  winnerScreenshot: {
    type: String
  },
  loserScreenshot: {
    type: String
  },
  isDisputed: {
    type: Boolean,
    default: false
  },
  disputeReason: {
    type: String
  },
  adminDecision: {
    type: String,
    enum: ['challenger', 'accepter', 'refund']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }
  },
  scheduledMatchTime: {
    type: Date,
    required: true
  },
  matchDuration: {
    type: Number,
    default: 30, // minutes
    min: 15,
    max: 120
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
challengeSchema.index({ status: 1, game: 1 });
challengeSchema.index({ challenger: 1, status: 1 });
challengeSchema.index({ accepter: 1, status: 1 });
challengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for total pot (winner payout users see: both bets minus hidden 25% per player)
challengeSchema.virtual('totalPot').get(function() {
  return Math.round(this.betAmount * 1.5);
});

// Virtual for total cost per player
challengeSchema.virtual('totalCostPerPlayer').get(function() {
  return this.betAmount + this.matchFee;
});

// Method to accept challenge
challengeSchema.methods.acceptChallenge = function(accepterId) {
  this.accepter = accepterId;
  this.status = 'accepted';
  return this.save();
};

// Method to start match
challengeSchema.methods.startMatch = function(roomCode) {
  this.roomCode = roomCode;
  this.status = 'in-progress';
  this.matchTime = new Date();
  return this.save();
};

// Method to complete match and distribute winnings
challengeSchema.methods.completeMatch = async function(winnerId, loserId, winnerScreenshot) {
  if (this.status !== 'in-progress') {
    throw new Error('Match must be in progress to complete');
  }

  this.status = 'completed';
  this.winner = winnerId;
  this.loser = loserId;
  this.winnerScreenshot = winnerScreenshot;
  this.completedAt = new Date();

  // Calculate winner payout: both bets minus hidden 25% per player
  const totalPot = Math.round(this.betAmount * 1.5);

  // Find winner and loser users
  const Winner = require('./User');
  const winner = await Winner.findById(winnerId);
  const loser = await Winner.findById(loserId);

  if (!winner || !loser) {
    throw new Error('Winner or loser not found');
  }

  // Add winner payout to winner's account
  await winner.updateBalance(totalPot);
  
  // Update winner's stats (track earnings as bet amount)
  await winner.addWin(this.betAmount);
  
  // Update loser's stats
  await loser.addLoss();

  // Save the challenge
  await this.save();

  return {
    challenge: this,
    totalPot,
    winnerBalance: winner.balance,
    loserBalance: loser.balance
  };
};

// Method to dispute match
challengeSchema.methods.disputeMatch = function(reason) {
  this.isDisputed = true;
  this.disputeReason = reason;
  return this.save();
};

// Method to extend challenge time
challengeSchema.methods.extendTime = function(hours = 24) {
  this.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  return this.save();
};

// Method to check if challenge is expired
challengeSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Method to get time remaining in minutes
challengeSchema.methods.getTimeRemaining = function() {
  const now = new Date();
  const timeDiff = this.expiresAt - now;
  return Math.max(0, Math.floor(timeDiff / (1000 * 60)));
};

// Method to check if scheduled time conflicts with other matches
challengeSchema.methods.checkTimeConflict = async function() {
  const startTime = new Date(this.scheduledMatchTime);
  const endTime = new Date(startTime.getTime() + this.matchDuration * 60 * 1000);
  
  // Check for conflicts with challenger's other matches
  const challengerConflicts = await this.constructor.find({
    _id: { $ne: this._id },
    challenger: this.challenger,
    status: { $in: ['accepted', 'in-progress'] },
    $or: [
      {
        scheduledMatchTime: {
          $gte: startTime,
          $lt: endTime
        }
      },
      {
        scheduledMatchTime: {
          $gte: new Date(startTime.getTime() - 30 * 60 * 1000), // 30 min before
          $lte: new Date(endTime.getTime() + 30 * 60 * 1000)   // 30 min after
        }
      }
    ]
  });

  // Check for conflicts with accepter's other matches
  const accepterConflicts = await this.constructor.find({
    _id: { $ne: this._id },
    accepter: this.accepter,
    status: { $in: ['accepted', 'in-progress'] },
    $or: [
      {
        scheduledMatchTime: {
          $gte: startTime,
          $lt: endTime
        }
      },
      {
        scheduledMatchTime: {
          $gte: new Date(startTime.getTime() - 30 * 60 * 1000), // 30 min before
          $lte: new Date(endTime.getTime() + 30 * 60 * 1000)   // 30 min after
        }
      }
    ]
  });

  return {
    hasConflict: challengerConflicts.length > 0 || accepterConflicts.length > 0,
    challengerConflicts,
    accepterConflicts
  };
};

// Method to get next available time slot
challengeSchema.methods.getNextAvailableTime = async function() {
  const now = new Date();
  let suggestedTime = new Date(now.getTime() + 30 * 60 * 1000); // Start with 30 min from now
  
  // Find the next available 30-minute slot
  while (true) {
    const endTime = new Date(suggestedTime.getTime() + this.matchDuration * 60 * 1000);
    
    // Check if this time slot is available
    const conflicts = await this.constructor.find({
      _id: { $ne: this._id },
      $or: [
        { challenger: this.challenger },
        { accepter: this.accepter }
      ],
      status: { $in: ['accepted', 'in-progress'] },
      $or: [
        {
          scheduledMatchTime: {
            $gte: suggestedTime,
            $lt: endTime
          }
        },
        {
          scheduledMatchTime: {
            $gte: new Date(suggestedTime.getTime() - 30 * 60 * 1000),
            $lte: new Date(endTime.getTime() + 30 * 60 * 1000)
          }
        }
      ]
    });

    if (conflicts.length === 0) {
      break;
    }

    // Move to next 30-minute slot
    suggestedTime = new Date(suggestedTime.getTime() + 30 * 60 * 1000);
  }

  return suggestedTime;
};

// Method to check if match is ready to start
challengeSchema.methods.isReadyToStart = function() {
  const now = new Date();
  const matchStartTime = new Date(this.scheduledMatchTime);
  const timeUntilMatch = matchStartTime - now;
  
  // Match is ready if it's within 10 minutes of scheduled time
  return timeUntilMatch <= 10 * 60 * 1000 && timeUntilMatch >= -this.matchDuration * 60 * 1000;
};

// Method to get match status based on time
challengeSchema.methods.getTimeBasedStatus = function() {
  const now = new Date();
  const matchStartTime = new Date(this.scheduledMatchTime);
  const timeUntilMatch = matchStartTime - now;
  
  if (timeUntilMatch > 10 * 60 * 1000) {
    return 'scheduled'; // More than 10 minutes until match
  } else if (timeUntilMatch <= 10 * 60 * 1000 && timeUntilMatch >= -this.matchDuration * 60 * 1000) {
    return 'ready'; // Within 10 minutes of match time
  } else {
    return 'overdue'; // Match time has passed
  }
};

module.exports = mongoose.model('Challenge', challengeSchema);
