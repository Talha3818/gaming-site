const express = require('express');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

const router = express.Router();

// Configure multer to store files in memory for Cloudinary upload
const resultUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all challenges
router.get('/', async (req, res) => {
  try {
    const { status, game, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { status: { $ne: 'completed' } }; // Exclude completed matches
    if (status) query.status = status;
    if (game) query.game = game;

    const challenges = await Challenge.find(query)
      .populate('challenger', 'username totalWins totalLosses')
      .populate('accepter', 'username totalWins totalLosses')
      .populate('winner', 'username')
      .populate('loser', 'username')
      .populate('roomCodeProvidedBy', 'username')
      .sort({ scheduledMatchTime: 1 }) // Sort by scheduled time
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Challenge.countDocuments(query);

    res.json({
      challenges,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ message: 'Error fetching challenges' });
  }
});

// Get user's challenges
router.get('/my-challenges', auth, async (req, res) => {
  try {
    const { status, includeCompleted = false } = req.query;
    
    let query = {
      $or: [
        { challenger: req.user.userId },
        { accepter: req.user.userId }
      ]
    };

    // Filter by status if specified
    if (status) {
      query.status = status;
    } else if (!includeCompleted) {
      // By default, exclude completed matches unless explicitly requested
      query.status = { $ne: 'completed' };
    }

    const challenges = await Challenge.find(query)
      .populate('challenger', 'username totalWins totalLosses')
      .populate('accepter', 'username totalWins totalLosses')
      .populate('winner', 'username')
      .populate('loser', 'username')
      .populate('roomCodeProvidedBy', 'username')
      .sort({ scheduledMatchTime: 1 });

    res.json(challenges);
  } catch (error) {
    console.error('Get my challenges error:', error);
    res.status(500).json({ message: 'Error fetching challenges' });
  }
});

// Create a new challenge
router.post('/', auth, async (req, res) => {
  try {
    const { game, betAmount, scheduledMatchTime, matchDuration = 30 } = req.body;

    if (!game || !betAmount || !scheduledMatchTime) {
      return res.status(400).json({ message: 'Game, bet amount, and scheduled match time are required' });
    }

    // Validate bet amount
    if (betAmount < 10 || betAmount > 10000) {
      return res.status(400).json({ message: 'Bet amount must be between ৳10 and ৳10,000' });
    }

    // Validate scheduled time (must be at least 30 minutes in the future)
    const scheduledTime = new Date(scheduledMatchTime);
    const now = new Date();
    const minTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now

    if (scheduledTime <= minTime) {
      return res.status(400).json({ 
        message: 'Match must be scheduled at least 30 minutes in the future' 
      });
    }

    // Validate match duration
    if (matchDuration < 15 || matchDuration > 120) {
      return res.status(400).json({ 
        message: 'Match duration must be between 15 and 120 minutes' 
      });
    }

    // Check user balance (challenge amount only; fee is included silently)
    const user = await User.findById(req.user.userId);
    const totalCost = betAmount;
    
    if (user.balance < totalCost) {
      return res.status(400).json({ 
        message: 'Insufficient balance for challenge' 
      });
    }

    // Create challenge with scheduling
    const challenge = new Challenge({
      challenger: req.user.userId,
      game,
      betAmount,
      scheduledMatchTime: scheduledTime,
      matchDuration,
      isScheduled: true
    });

    // Check for time conflicts
    const timeConflict = await challenge.checkTimeConflict();
    if (timeConflict.hasConflict) {
      return res.status(400).json({ 
        message: 'Time conflict detected. Please choose a different time slot.',
        conflicts: timeConflict
      });
    }

    await challenge.save();

    // Deduct balance from challenger (challenge amount only)
    await user.updateBalance(-totalCost);

    // Populate challenger info for response
    await challenge.populate('challenger', 'username totalWins totalLosses');

    res.status(201).json({
      message: 'Challenge created successfully',
      challenge
    });
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({ message: 'Error creating challenge' });
  }
});

// Accept a challenge
router.post('/:challengeId/accept', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.challengeId);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (challenge.status !== 'pending') {
      return res.status(400).json({ message: 'Challenge is no longer available' });
    }

    // Check if user is already a participant
    const isAlreadyParticipant = challenge.participants?.some(p => p.user.toString() === req.user.userId);
    if (isAlreadyParticipant) {
      return res.status(400).json({ message: 'You are already a participant in this challenge' });
    }

    // Check if challenge is full
    if (challenge.participants && challenge.participants.length >= challenge.maxParticipants) {
      return res.status(400).json({ message: 'Challenge is already full' });
    }

    // Check if user is trying to accept their own challenge (only if challenger exists)
    if (challenge.challenger && challenge.challenger.toString() === req.user.userId) {
      return res.status(400).json({ message: 'Cannot accept your own challenge' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalCost = challenge.betAmount;
    
    if (user.balance < totalCost) {
      return res.status(400).json({ 
        message: `Insufficient balance. You need ৳${totalCost}` 
      });
    }

    // Deduct challenge amount from accepter's balance
    await user.updateBalance(-totalCost);

    // Accept the challenge using the new participant system
    await challenge.acceptChallenge(req.user.userId);

    const populatedChallenge = await Challenge.findById(challenge._id)
      .populate('challenger', 'username profilePicture')
      .populate('accepter', 'username profilePicture')
      .populate('participants.user', 'username profilePicture');

    res.json(populatedChallenge);
  } catch (error) {
    console.error('Accept challenge error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Start match (admin only)
router.post('/:challengeId/start', auth, async (req, res) => {
  try {
    const { roomCode } = req.body;
    const challenge = await Challenge.findById(req.params.challengeId);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (challenge.status !== 'accepted') {
      return res.status(400).json({ message: 'Challenge must be accepted first' });
    }

    if (!roomCode) {
      return res.status(400).json({ message: 'Room code is required' });
    }

    await challenge.startMatch(roomCode);

    const populatedChallenge = await Challenge.findById(challenge._id)
      .populate('challenger', 'username profilePicture')
      .populate('accepter', 'username profilePicture');

    res.json(populatedChallenge);
  } catch (error) {
    console.error('Start match error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit match result
router.post('/:challengeId/result', auth, async (req, res) => {
  try {
    const { winnerScreenshot } = req.body;
    const challenge = await Challenge.findById(req.params.challengeId);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (challenge.status !== 'in-progress') {
      return res.status(400).json({ message: 'Match is not in progress' });
    }

    if (!winnerScreenshot) {
      return res.status(400).json({ message: 'Winner screenshot is required' });
    }

    // Verify the user is part of this challenge
    if (!challenge.challenger.equals(req.user.userId) && !challenge.accepter.equals(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized to submit result' });
    }

    // Determine winner and loser IDs using current user
    const currentUserId = req.user.userId;
    const winnerId = currentUserId;
    const loserId = challenge.challenger.equals(currentUserId) ? challenge.accepter : challenge.challenger;

    const result = await challenge.completeMatch(winnerId, loserId, winnerScreenshot);

    const populatedChallenge = await Challenge.findById(challenge._id)
      .populate('challenger', 'username profilePicture')
      .populate('accepter', 'username profilePicture')
      .populate('winner', 'username')
      .populate('loser', 'username');

    res.json(populatedChallenge);
  } catch (error) {
    console.error('Submit result error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit proof screenshot for admin review (does not auto-complete match)
router.post('/:challengeId/submit-proof', auth, resultUpload.single('proof'), async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    if (challenge.status !== 'in-progress') {
      return res.status(400).json({ message: 'Match is not in progress' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Proof screenshot is required' });
    }
    // Only participants can submit
    if (!challenge.challenger.equals(req.user.userId) && !challenge.accepter.equals(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized to submit proof' });
    }
    
    // Delete old proof from Cloudinary if it exists
    if (challenge.winnerScreenshot && challenge.winnerScreenshot.includes('cloudinary')) {
      const oldPublicId = challenge.winnerScreenshot.split('/').pop().split('.')[0];
      await deleteFromCloudinary(oldPublicId);
    }
    
    // Upload new proof to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(req.file, 'challenges/proofs');
    challenge.winnerScreenshot = cloudinaryResult.url;
    await challenge.save();
    
    res.json({ message: 'Proof submitted successfully', proof: challenge.winnerScreenshot });
  } catch (error) {
    console.error('Submit proof error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dispute match result
router.post('/:challengeId/dispute', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const challenge = await Challenge.findById(req.params.challengeId);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (challenge.status !== 'completed') {
      return res.status(400).json({ message: 'Challenge must be completed first' });
    }

    if (!reason) {
      return res.status(400).json({ message: 'Dispute reason is required' });
    }

    // Verify the user is part of this challenge
    if (!challenge.challenger.equals(req.user.userId) && !challenge.accepter.equals(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized to dispute' });
    }

    await challenge.disputeMatch(reason);

    const populatedChallenge = await Challenge.findById(challenge._id)
      .populate('challenger', 'username profilePicture')
      .populate('accepter', 'username profilePicture')
      .populate('winner', 'username')
      .populate('loser', 'username');

    res.json(populatedChallenge);
  } catch (error) {
    console.error('Dispute match error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Extend challenge time (only challenger can extend)
router.put('/:challengeId/extend', auth, async (req, res) => {
  try {
    const { hours = 24 } = req.body;
    const challenge = await Challenge.findById(req.params.challengeId);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (!challenge.challenger.equals(req.user.userId)) {
      return res.status(403).json({ message: 'Only challenger can extend time' });
    }

    if (challenge.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot extend accepted challenge' });
    }

    // Validate hours (between 1 and 72 hours)
    if (hours < 1 || hours > 72) {
      return res.status(400).json({ message: 'Hours must be between 1 and 72' });
    }

    await challenge.extendTime(hours);

    const populatedChallenge = await Challenge.findById(challenge._id)
      .populate('challenger', 'username profilePicture totalWins totalLosses');

    res.json({
      message: `Challenge time extended by ${hours} hours`,
      challenge: populatedChallenge
    });
  } catch (error) {
    console.error('Extend challenge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel challenge (only challenger can cancel)
router.delete('/:challengeId', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.challengeId);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (!challenge.challenger.equals(req.user.userId)) {
      return res.status(403).json({ message: 'Only challenger can cancel' });
    }

    if (challenge.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel accepted challenge' });
    }

    // Refund the full challenge amount
    const user = await User.findById(req.user.userId);
    const totalRefund = challenge.betAmount;
    await user.updateBalance(totalRefund);

    challenge.status = 'cancelled';
    await challenge.save();

    res.json({ message: 'Challenge cancelled successfully' });
  } catch (error) {
    console.error('Cancel challenge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
