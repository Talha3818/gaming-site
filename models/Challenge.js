const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  challenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
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
  isAdminCreated: {
    type: Boolean,
    default: false
  },
  playerCount: {
    type: Number,
    required: true,
    enum: [2, 4, 8, 50],
    default: 2
  },
  
  // Field for 50-player challenges
  isLargeMatch: {
    type: Boolean,
    default: function() {
      return this.playerCount === 50;
    }
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isWinner: {
      type: Boolean,
      default: false
    }
  }],
  maxParticipants: {
    type: Number,
    default: 2
  },
  challengeType: {
    type: String,
    enum: ['2-player', '4-player'],
    default: '2-player'
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

// Virtual for total pot (winner payout users see: total bets minus hidden 25% per player)
challengeSchema.virtual('totalPot').get(function() {
  if (this.playerCount === 4) {
    return Math.round(this.betAmount * 3); // 4 players * betAmount * 0.75 (after 25% fee)
  }
  return Math.round(this.betAmount * 1.5); // 2 players * betAmount * 0.75 (after 25% fee)
});

// Virtual for total cost per player
challengeSchema.virtual('totalCostPerPlayer').get(function() {
  return this.betAmount + this.matchFee;
});

// Virtual for current participant count
challengeSchema.virtual('currentParticipantCount').get(function() {
  return this.participants.length;
});

// Virtual for available slots
challengeSchema.virtual('availableSlots').get(function() {
  return this.maxParticipants - this.participants.length;
});

// Method to accept challenge (updated for multiple participants)
challengeSchema.methods.acceptChallenge = async function(userId) {
  // Check if user is already a participant
  const isAlreadyParticipant = this.participants.some(p => p.user.toString() === userId.toString());
  if (isAlreadyParticipant) {
    throw new Error('User is already a participant in this challenge');
  }

  // Check if challenge is full
  if (this.participants.length >= this.maxParticipants) {
    throw new Error('Challenge is already full');
  }

  // For admin-created challenges, validate game restrictions
  if (this.isAdminCreated && this.playerCount === 4) {
    if (!['PUBG', 'Free Fire'].includes(this.game)) {
      throw new Error('4-player challenges are only available for PUBG and Free Fire games');
    }
  }

  // Add user to participants
  this.participants.push({
    user: userId,
    joinedAt: new Date()
  });

  // If this is the first player, set them as challenger
  if (this.participants.length === 1) {
    this.challenger = userId;
  }

  // Update status based on participant count
  if (this.participants.length === this.maxParticipants) {
    this.status = 'accepted';
  }

  // For backward compatibility, keep accepter field for 2-player challenges
  if (this.playerCount === 2 && this.participants.length === 2) {
    this.accepter = userId;
  }

  return this.save();
};

// Method to start match (updated for multiple participants)
challengeSchema.methods.startMatch = function(roomCode) {
  if (this.participants.length < this.maxParticipants) {
    throw new Error('Cannot start match: not enough participants');
  }
  
  // Ensure there's a challenger (first participant becomes challenger if none exists)
  if (!this.challenger && this.participants.length > 0) {
    this.challenger = this.participants[0].user;
  }
  
  this.roomCode = roomCode;
  this.status = 'in-progress';
  this.matchTime = new Date();
  return this.save();
};

// Method to complete match and distribute winnings (updated for multiple participants)
challengeSchema.methods.completeMatch = async function(winnerIds, loserIds, winnerScreenshot) {
  if (this.status !== 'in-progress') {
    throw new Error('Match must be in progress to complete');
  }

  this.status = 'completed';
  this.completedAt = new Date();

  // Handle winner IDs (can be array for 4-player or single for 2-player)
  const winnerIdArray = Array.isArray(winnerIds) ? winnerIds : [winnerIds];
  const loserIdArray = Array.isArray(loserIds) ? loserIds : [loserIds];

  // Update participant winner status
  this.participants.forEach(participant => {
    if (winnerIdArray.includes(participant.user.toString())) {
      participant.isWinner = true;
    }
  });

  // Calculate total pot based on player count
  let totalPot;
  if (this.playerCount === 50) {
    // For 50-player challenges: 60% of total entry fees to winner
    const totalEntryFees = this.betAmount * this.participants.length;
    totalPot = Math.round(totalEntryFees * 0.6); // 60% to winner
    this.actualEntryFees = totalEntryFees;
    
    // Update match duration based on participant count
    this.matchDuration = this.calculateDynamicDuration();
  } else if (this.playerCount === 4) {
    totalPot = Math.round(this.betAmount * 3); // 4 players * betAmount * 0.75
  } else if (this.playerCount === 8) {
    totalPot = Math.round(this.betAmount * 4); // 8 players * betAmount * 0.75
  } else {
    totalPot = Math.round(this.betAmount * 1.5); // 2 players * betAmount * 0.75
  }

  // Find all users
  const User = require('./User');
  const winners = await User.find({ _id: { $in: winnerIdArray } });
  const losers = await User.find({ _id: { $in: loserIdArray } });

  if (winners.length !== winnerIdArray.length || losers.length !== loserIdArray.length) {
    throw new Error('Some users not found');
  }

  // Distribute winnings among winners
  const winningsPerWinner = Math.round(totalPot / winners.length);
  for (const winner of winners) {
    await winner.updateBalance(winningsPerWinner);
    await winner.addWin(this.betAmount);
  }

  // Update losers' stats
  for (const loser of losers) {
    await loser.addLoss();
  }

  // For backward compatibility, keep winner/loser fields for 2-player challenges
  if (this.playerCount === 2) {
    this.winner = winnerIdArray[0];
    this.loser = loserIdArray[0];
    this.winnerScreenshot = winnerScreenshot;
    
    // Ensure challenger and accepter are set for 2-player challenges
    if (!this.challenger && this.participants.length > 0) {
      this.challenger = this.participants[0].user;
    }
    if (!this.accepter && this.participants.length > 1) {
      this.accepter = this.participants[1].user;
    }
  }

  // Save the challenge
  await this.save();

  return {
    challenge: this,
    totalPot,
    winningsPerWinner,
    winnerCount: winners.length,
    loserCount: losers.length
  };
};

// Method to calculate potential prize for display purposes
challengeSchema.methods.calculatePotentialPrize = function() {
  if (this.playerCount === 50) {
    // For 50-player challenges: 60% of total entry fees
    const totalEntryFees = this.betAmount * 50; // Assuming all slots filled
    return Math.round(totalEntryFees * 0.6);
  } else if (this.playerCount === 8) {
    return Math.round(this.betAmount * 4); // 8 players * betAmount * 0.75
  } else if (this.playerCount === 4) {
    return Math.round(this.betAmount * 3); // 4 players * betAmount * 0.75
  } else {
    return Math.round(this.betAmount * 1.5); // 2 players * betAmount * 0.75
  }
};

// Method to calculate dynamic match duration for 50-player challenges
challengeSchema.methods.calculateDynamicDuration = function() {
  if (this.playerCount === 50) {
    const participantCount = this.participants ? this.participants.length : 0;
    
    // Base duration: 30 minutes
    // Add 2 minutes per participant (minimum 10, maximum 50)
    const baseDuration = 30;
    const participantBonus = Math.min(Math.max(participantCount, 10), 50) * 2;
    
    return Math.min(baseDuration + participantBonus, 120); // Cap at 2 hours
  }
  
  return this.matchDuration || 30; // Return fixed duration for other challenges
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

// Method to check if challenge is ready to start
challengeSchema.methods.isReadyToStart = function() {
  // For admin-created challenges, check if all participants have joined
  if (this.isAdminCreated) {
    return this.participants.length === this.maxParticipants && this.status === 'accepted';
  }
  
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
