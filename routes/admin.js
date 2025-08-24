const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const Payment = require('../models/Payment');
const HelplineMessage = require('../models/HelplineMessage');
const Withdrawal = require('../models/Withdrawal');

// Apply adminAuth middleware to all routes
router.use(adminAuth);

// Get comprehensive dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    let previousStartDate;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(startDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = new Date(0);
        previousStartDate = new Date(0);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: startDate } });
    const activeUserRate = totalUsers > 0 ? activeUsers / totalUsers : 0;

    // Get challenge and match statistics
    const totalChallenges = await Challenge.countDocuments();
    const newChallenges = await Challenge.countDocuments({ createdAt: { $gte: startDate } });
    const activeChallenges = await Challenge.countDocuments({ status: { $in: ['pending', 'accepted'] } });
    
    const totalMatches = await Challenge.countDocuments({ status: { $in: ['accepted', 'in-progress', 'completed'] } });
    const newMatches = await Challenge.countDocuments({ 
      status: { $in: ['accepted', 'in-progress', 'completed'] },
      updatedAt: { $gte: startDate }
    });
    const completedMatches = await Challenge.countDocuments({ status: 'completed' });
    const pendingMatches = await Challenge.countDocuments({ status: 'pending' });

    // Get scheduling statistics
    const scheduledMatches = await Challenge.countDocuments({ 
      status: { $in: ['accepted', 'in-progress'] },
      isScheduled: true 
    });
    
    const upcomingMatches = await Challenge.countDocuments({
      status: { $in: ['accepted', 'in-progress'] },
      scheduledMatchTime: { $gte: now }
    });

    const overdueMatches = await Challenge.countDocuments({
      status: { $in: ['accepted', 'in-progress'] },
      scheduledMatchTime: { $lt: now }
    });

    // Get financial statistics
    const totalBets = await Challenge.aggregate([
      { $match: { status: { $in: ['accepted', 'in-progress', 'completed'] } } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$betAmount', 2] } } } }
    ]);
    
    const totalMatchFees = await Challenge.aggregate([
      { $match: { status: { $in: ['accepted', 'in-progress', 'completed'] } } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$matchFee', 2] } } } }
    ]);

    const totalPayouts = await Challenge.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPot' } } }
    ]);

    const totalRevenue = (totalBets[0]?.total || 0) + (totalMatchFees[0]?.total || 0);
    const netProfit = totalRevenue - (totalPayouts[0]?.total || 0);

    // Calculate revenue growth
    const previousRevenue = await Challenge.aggregate([
      { 
        $match: { 
          createdAt: { $gte: previousStartDate, $lt: startDate },
          status: { $in: ['accepted', 'in-progress', 'completed'] }
        } 
      },
      { $group: { _id: null, total: { $sum: { $add: [{ $multiply: ['$betAmount', 2] }, { $multiply: ['$matchFee', 2] }] } } } }
    ]);
    
    const revenueGrowth = previousRevenue[0]?.total > 0 
      ? (totalRevenue - previousRevenue[0].total) / previousRevenue[0].total 
      : 0;

    // Get game-specific statistics
    const gameStats = await Challenge.aggregate([
      { $match: { status: { $in: ['accepted', 'in-progress', 'completed'] } } },
      { $group: { 
        _id: '$game',
        totalMatches: { $sum: 1 },
        totalChallenges: { $sum: 1 },
        revenue: { $sum: { $add: [{ $multiply: ['$betAmount', 2] }, { $multiply: ['$matchFee', 2] }] } },
        totalBets: { $sum: { $multiply: ['$betAmount', 2] } }
      }},
      { $addFields: { 
        averageBet: { $divide: ['$totalBets', '$totalMatches'] },
        icon: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', 'Ludo King'] }, then: '🎲' },
              { case: { $eq: ['$_id', 'Free Fire'] }, then: '🔫' },
              { case: { $eq: ['$_id', 'PUBG'] }, then: '🎯' }
            ],
            default: '🎮'
          }
        }
      }},
      { $project: { 
        name: '$_id',
        totalMatches: 1,
        totalChallenges: 1,
        revenue: 1,
        averageBet: 1,
        icon: 1
      }}
    ]);

    res.json({
      totalUsers,
      newUsers,
      activeUsers,
      activeUserRate,
      totalChallenges,
      newChallenges,
      activeChallenges,
      totalMatches,
      newMatches,
      completedMatches,
      pendingMatches,
      scheduledMatches,
      upcomingMatches,
      overdueMatches,
      totalBets: totalBets[0]?.total || 0,
      totalMatchFees: totalMatchFees[0]?.total || 0,
      totalPayouts: totalPayouts[0]?.total || 0,
      totalRevenue,
      netProfit,
      revenueGrowth,
      gameStats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// Get recent activities
router.get('/recent-activities', async (req, res) => {
  try {
    const activities = [];

    // Recent user registrations
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username createdAt');
    
    recentUsers.forEach(user => {
      activities.push({
        type: 'user',
        description: `New user registered: ${user.username}`,
        timestamp: user.createdAt.toLocaleString(),
        user: user.username
      });
    });

    // Recent challenges
    const recentChallenges = await Challenge.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('challenger', 'username')
      .select('game betAmount status challenger createdAt');
    
    recentChallenges.forEach(challenge => {
      activities.push({
        type: 'match',
        description: `New ${challenge.game} challenge: ৳${challenge.betAmount} by ${challenge.challenger.username}`,
        timestamp: challenge.createdAt.toLocaleString(),
        user: challenge.challenger.username
      });
    });

    // Recent payments
    const recentPayments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'username')
      .select('amount status user createdAt');
    
    recentPayments.forEach(payment => {
      activities.push({
        type: 'payment',
        description: `Payment ${payment.status}: ৳${payment.amount} by ${payment.user.username}`,
        timestamp: payment.createdAt.toLocaleString(),
        user: payment.user.username
      });
    });

    // Recent completed matches
    const recentMatches = await Challenge.find({ status: 'completed' })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('challenger accepter', 'username')
      .select('game betAmount challenger accepter updatedAt');
    
    recentMatches.forEach(match => {
      activities.push({
        type: 'match',
        description: `${match.game} match completed: ৳${match.betAmount} between ${match.challenger.username} and ${match.accepter.username}`,
        timestamp: match.updatedAt.toLocaleString(),
        user: `${match.challenger.username} vs ${match.accepter.username}`
      });
    });

    // Sort activities by timestamp and return top 20
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(activities.slice(0, 20));
  } catch (error) {
    console.error('Recent activities error:', error);
    res.status(500).json({ message: 'Error fetching recent activities' });
  }
});

// Get users with pagination and search
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .select('-verificationCode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Update user
router.put('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated
    delete updateData.verificationCode;
    delete updateData.password;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-verificationCode');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Get all payment requests with pagination and filtering
router.get('/payments', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { 'user.username': { $regex: search, $options: 'i' } },
        { 'user.phoneNumber': { $regex: search, $options: 'i' } }
      ];
    }

    const payments = await Payment.find(query)
      .populate('user', 'username phoneNumber')
      .populate('processedBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    // Get unread count for notifications
    const unreadCount = await Payment.countDocuments({ isRead: false, status: 'pending' });

    res.json({
      payments,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

// Get payment details
router.get('/payments/:paymentId', adminAuth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('user', 'username phoneNumber email')
      .populate('processedBy', 'username');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Mark as read if it was unread
    if (!payment.isRead) {
      payment.isRead = true;
      await payment.save();
    }

    res.json(payment);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Error fetching payment' });
  }
});

// Approve payment request
router.post('/payments/:paymentId/approve', adminAuth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { notes } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Payment is not pending' });
    }

    // Approve payment and add to user balance
    await payment.approve(req.user.userId, notes);

    // Emit socket event for real-time updates
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(payment.user.toString()).emit('payment-update', {
          type: 'approved',
          payment: await payment.populate('user', 'username phoneNumber')
        });
      }
    } catch (socketError) {
      console.log('Socket notification failed:', socketError);
    }

    res.json({
      message: 'Payment approved successfully',
      payment: await payment.populate('user', 'username phoneNumber')
    });
  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({ message: 'Error approving payment' });
  }
});

// Reject payment request
router.post('/payments/:paymentId/reject', adminAuth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { notes } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Payment is not pending' });
    }

    // Reject payment
    await payment.reject(req.user.userId, notes);

    // Emit socket event for real-time updates
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(payment.user.toString()).emit('payment-update', {
          type: 'rejected',
          payment: await payment.populate('user', 'username phoneNumber')
        });
      }
    } catch (socketError) {
      console.log('Socket notification failed:', socketError);
    }

    res.json({
      message: 'Payment rejected successfully',
      payment: await payment.populate('user', 'username phoneNumber')
    });
  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({ message: 'Error rejecting payment' });
  }
});

// Mark payment as read
router.post('/payments/:paymentId/read', adminAuth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    await payment.markAsRead();
    res.json({ message: 'Payment marked as read' });
  } catch (error) {
    console.error('Mark payment as read error:', error);
    res.status(500).json({ message: 'Error marking payment as read' });
  }
});

// Get payment statistics
router.get('/payments/stats/overview', adminAuth, async (req, res) => {
  try {
    const totalPayments = await Payment.countDocuments();
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const approvedPayments = await Payment.countDocuments({ status: 'approved' });
    const rejectedPayments = await Payment.countDocuments({ status: 'rejected' });
    const unreadPayments = await Payment.countDocuments({ isRead: false, status: 'pending' });

    const totalAmount = await Payment.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const todayPayments = await Payment.countDocuments({
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });

    res.json({
      totalPayments,
      pendingPayments,
      approvedPayments,
      rejectedPayments,
      unreadPayments,
      totalAmount: totalAmount[0]?.total || 0,
      todayPayments
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ message: 'Error fetching payment statistics' });
  }
});

// Get challenges with pagination and filtering
router.get('/challenges', async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) {
      query.status = status;
    }

    const challenges = await Challenge.find(query)
      .populate('challenger', 'username')
      .populate('accepter', 'username')
      .sort({ createdAt: -1 })
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

// Start match (send room code)
router.post('/challenges/:challengeId/start-match', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { roomCode } = req.body;

    if (!roomCode) {
      return res.status(400).json({ message: 'Room code is required' });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (challenge.status !== 'accepted') {
      return res.status(400).json({ message: 'Challenge must be accepted to start match' });
    }

    challenge.status = 'in-progress';
    challenge.roomCode = roomCode;
    challenge.adminRoomCode = roomCode;
    challenge.roomCodeProvidedAt = new Date();
    challenge.roomCodeProvidedBy = req.user.userId;
    challenge.matchTime = new Date();
    await challenge.save();

    res.json({ message: 'Match started successfully', challenge });
  } catch (error) {
    console.error('Start match error:', error);
    res.status(500).json({ message: 'Error starting match' });
  }
});

// Provide room code for challenge
router.post('/challenges/:challengeId/provide-room-code', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { roomCode } = req.body;

    if (!roomCode) {
      return res.status(400).json({ message: 'Room code is required' });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (challenge.status !== 'accepted') {
      return res.status(400).json({ message: 'Challenge must be accepted to provide room code' });
    }

    challenge.adminRoomCode = roomCode;
    challenge.roomCodeProvidedAt = new Date();
    challenge.roomCodeProvidedBy = req.user.userId;
    await challenge.save();

    res.json({ message: 'Room code provided successfully', challenge });
  } catch (error) {
    console.error('Provide room code error:', error);
    res.status(500).json({ message: 'Error providing room code' });
  }
});

// Update room code for challenge
router.put('/challenges/:challengeId/room-code', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { roomCode } = req.body;

    if (!roomCode) {
      return res.status(400).json({ message: 'Room code is required' });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    challenge.adminRoomCode = roomCode;
    challenge.roomCodeProvidedAt = new Date();
    challenge.roomCodeProvidedBy = req.user.userId;
    await challenge.save();

    res.json({ message: 'Room code updated successfully', challenge });
  } catch (error) {
    console.error('Update room code error:', error);
    res.status(500).json({ message: 'Error updating room code' });
  }
});

// Resolve dispute and select winner
router.post('/challenges/:challengeId/resolve-dispute', adminAuth, async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { winnerId, adminNotes } = req.body;

    if (!winnerId) {
      return res.status(400).json({ message: 'Winner ID is required' });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (challenge.status !== 'in-progress') {
      return res.status(400).json({ message: 'Challenge must be in progress to resolve' });
    }

    // Determine loser ID safely (winnerId may be a string)
    const winnerIdStr = String(winnerId);
    const challengerIdStr = String(challenge.challenger);
    const accepterIdStr = String(challenge.accepter);

    if (!accepterIdStr) {
      return res.status(400).json({ message: 'Challenge does not have an accepter yet' });
    }

    const loserId = winnerIdStr === challengerIdStr ? challenge.accepter : challenge.challenger;

    // Complete the match with automatic payout
    const result = await challenge.completeMatch(winnerId, loserId, 'Admin resolved');

    // Add admin notes if provided
    if (adminNotes) {
      challenge.adminNotes = adminNotes;
      await challenge.save();
    }

    // Emit socket event for real-time updates
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(challenge.challenger.toString()).emit('match-update', {
          type: 'completed',
          challenge: result.challenge
        });
        
        io.to(challenge.accepter.toString()).emit('match-update', {
          type: 'completed',
          challenge: result.challenge
        });
      }
    } catch (socketError) {
      console.log('Socket notification failed:', socketError);
    }

    res.json({
      message: 'Dispute resolved successfully',
      challenge: result.challenge,
      totalPot: result.totalPot,
      winnerBalance: result.winnerBalance,
      loserBalance: result.loserBalance
    });
  } catch (error) {
    console.error('Resolve dispute error:', error);
    res.status(500).json({ message: 'Error resolving dispute' });
  }
});

// Get helpline conversations
router.get('/helpline/conversations', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get unique users who have sent messages
    const conversations = await HelplineMessage.aggregate([
      { $group: { _id: '$user', lastMessage: { $last: '$$ROOT' } } },
      { $sort: { 'lastMessage.createdAt': -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          userId: '$_id',
          username: '$userInfo.username',
          lastMessage: '$lastMessage',
          unreadCount: 1
        }
      }
    ]);

    const total = await HelplineMessage.distinct('user').length;

    res.json({
      conversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
});

// Get user messages
router.get('/helpline/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await HelplineMessage.find({ user: userId })
      .sort({ createdAt: 1 })
      .populate('user', 'username')
      .populate('adminId', 'username');

    res.json(messages);
  } catch (error) {
    console.error('Get user messages error:', error);
    res.status(500).json({ message: 'Error fetching user messages' });
  }
});

// Respond to user
router.post('/helpline/respond', async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const helplineMessage = new HelplineMessage({
      user: userId,
      message,
      isFromAdmin: true,
      adminId: req.user.userId
    });

    await helplineMessage.save();

    res.json({ message: 'Response sent successfully', helplineMessage });
  } catch (error) {
    console.error('Send response error:', error);
    res.status(500).json({ message: 'Error sending response' });
  }
});

// Get unread count
router.get('/helpline/unread-count', async (req, res) => {
  try {
    const count = await HelplineMessage.countDocuments({ 
      isFromAdmin: false, 
      isRead: false 
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Error fetching unread count' });
  }
});

// Add balance to user
router.post('/users/:userId/balance', async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add balance
    await user.updateBalance(amount);

    // Log the balance change
    console.log(`Admin ${req.user.userId} added ৳${amount} to user ${userId} (${user.username}). Notes: ${notes || 'None'}`);

    res.json({ 
      message: 'Balance added successfully', 
      newBalance: user.balance,
      user: {
        id: user._id,
        username: user.username,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('Add balance error:', error);
    res.status(500).json({ message: 'Error adding balance' });
  }
});

// Deduct balance from user
router.post('/users/:userId/balance/deduct', async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance to deduct' });
    }

    // Deduct balance
    await user.updateBalance(-amount);

    // Log the balance change
    console.log(`Admin ${req.user.userId} deducted ৳${amount} from user ${userId} (${user.username}). Notes: ${notes || 'None'}`);

    res.json({ 
      message: 'Balance deducted successfully', 
      newBalance: user.balance,
      user: {
        id: user._id,
        username: user.username,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('Deduct balance error:', error);
    res.status(500).json({ message: 'Error deducting balance' });
  }
});

// Get user statistics
router.get('/users/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-verificationCode');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's challenges
    const challenges = await Challenge.find({
      $or: [{ challenger: userId }, { accepter: userId }]
    }).populate('challenger accepter', 'username');

    // Get user's payments
    const payments = await Payment.find({ user: userId });

    // Calculate additional stats
    const totalChallenges = challenges.length;
    const completedChallenges = challenges.filter(c => c.status === 'completed').length;
    const pendingChallenges = challenges.filter(c => c.status === 'pending').length;
    const totalBetAmount = challenges.reduce((sum, c) => sum + c.betAmount, 0);
    const totalMatchFees = challenges.reduce((sum, c) => sum + c.matchFee, 0);

    const stats = {
      user,
      challenges: {
        total: totalChallenges,
        completed: completedChallenges,
        pending: pendingChallenges,
        successRate: totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0
      },
      financial: {
        totalBetAmount,
        totalMatchFees,
        totalSpent: totalBetAmount + totalMatchFees,
        currentBalance: user.balance
      },
      payments: {
        total: payments.length,
        approved: payments.filter(p => p.status === 'approved').length,
        pending: payments.filter(p => p.status === 'pending').length,
        rejected: payments.filter(p => p.status === 'rejected').length
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Error fetching user statistics' });
  }
});

// Get platform statistics
router.get('/platform/stats', async (req, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // User growth
    const totalUsers = await User.countDocuments();
    const newUsers24h = await User.countDocuments({ createdAt: { $gte: last24h } });
    const newUsers7d = await User.countDocuments({ createdAt: { $gte: last7d } });
    const newUsers30d = await User.countDocuments({ createdAt: { $gte: last30d } });

    // Challenge activity
    const totalChallenges = await Challenge.countDocuments();
    const challenges24h = await Challenge.countDocuments({ createdAt: { $gte: last24h } });
    const challenges7d = await Challenge.countDocuments({ createdAt: { $gte: last7d } });
    const challenges30d = await Challenge.countDocuments({ createdAt: { $gte: last30d } });

    // Financial metrics
    const totalRevenue = await Challenge.aggregate([
      { $match: { status: { $in: ['accepted', 'in-progress', 'completed'] } } },
      { $group: { _id: null, total: { $sum: { $add: [{ $multiply: ['$betAmount', 2] }, { $multiply: ['$matchFee', 2] }] } } } }
    ]);

    const revenue24h = await Challenge.aggregate([
      { 
        $match: { 
          createdAt: { $gte: last24h },
          status: { $in: ['accepted', 'in-progress', 'completed'] }
        } 
      },
      { $group: { _id: null, total: { $sum: { $add: [{ $multiply: ['$betAmount', 2] }, { $multiply: ['$matchFee', 2] }] } } } }
    ]);

    const stats = {
      users: {
        total: totalUsers,
        growth: {
          '24h': newUsers24h,
          '7d': newUsers7d,
          '30d': newUsers30d
        }
      },
      challenges: {
        total: totalChallenges,
        activity: {
          '24h': challenges24h,
          '7d': challenges7d,
          '30d': challenges30d
        }
      },
      financial: {
        totalRevenue: totalRevenue[0]?.total || 0,
        revenue24h: revenue24h[0]?.total || 0
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: now
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({ message: 'Error fetching platform statistics' });
  }
});

// ===== WITHDRAWAL MANAGEMENT =====

// Get all withdrawal requests
router.get('/withdrawals', async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) {
      query.status = status;
    }

    const withdrawals = await Withdrawal.find(query)
      .populate('user', 'username phoneNumber')
      .populate('processedBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Withdrawal.countDocuments(query);

    res.json({
      withdrawals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ message: 'Error fetching withdrawals' });
  }
});

// Get specific withdrawal
router.get('/withdrawals/:withdrawalId', async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.withdrawalId)
      .populate('user', 'username phoneNumber balance')
      .populate('processedBy', 'username');

    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    res.json({ withdrawal });
  } catch (error) {
    console.error('Get withdrawal error:', error);
    res.status(500).json({ message: 'Error fetching withdrawal' });
  }
});

// Approve withdrawal request
router.post('/withdrawals/:withdrawalId/approve', async (req, res) => {
  try {
    const { notes = '' } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal is not pending' });
    }

    await withdrawal.approve(req.user.userId, notes);

    // Emit socket event to user
    try {
      const io = req.app.get('io');
      io.to(`user-${withdrawal.user}`).emit('withdrawal-updated', {
        withdrawalId: withdrawal._id,
        status: 'approved',
        message: 'Your withdrawal request has been approved'
      });
    } catch (socketError) {
      console.error('Socket emission failed:', socketError);
    }

    res.json({ 
      message: 'Withdrawal approved successfully',
      withdrawal: {
        id: withdrawal._id,
        status: withdrawal.status,
        processedAt: withdrawal.processedAt
      }
    });
  } catch (error) {
    console.error('Approve withdrawal error:', error);
    res.status(500).json({ message: 'Error approving withdrawal' });
  }
});

// Reject withdrawal request
router.post('/withdrawals/:withdrawalId/reject', async (req, res) => {
  try {
    const { notes = '' } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal is not pending' });
    }

    await withdrawal.reject(req.user.userId, notes);

    // Emit socket event to user
    try {
      const io = req.app.get('io');
      io.to(`user-${withdrawal.user}`).emit('withdrawal-updated', {
        withdrawalId: withdrawal._id,
        status: 'rejected',
        message: 'Your withdrawal request has been rejected'
      });
    } catch (socketError) {
      console.error('Socket emission failed:', socketError);
    }

    res.json({ 
      message: 'Withdrawal rejected successfully',
      withdrawal: {
        id: withdrawal._id,
        status: withdrawal.status,
        processedAt: withdrawal.processedAt
      }
    });
  } catch (error) {
    console.error('Reject withdrawal error:', error);
    res.status(500).json({ message: 'Error rejecting withdrawal' });
  }
});

// Complete withdrawal (mark as paid)
router.post('/withdrawals/:withdrawalId/complete', async (req, res) => {
  try {
    const { notes = '' } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'approved') {
      return res.status(400).json({ message: 'Withdrawal must be approved first' });
    }

    await withdrawal.complete(req.user.userId, notes);

    // Emit socket event to user
    try {
      const io = req.app.get('io');
      io.to(`user-${withdrawal.user}`).emit('withdrawal-updated', {
        withdrawalId: withdrawal._id,
        status: 'completed',
        message: 'Your withdrawal has been completed'
      });
    } catch (socketError) {
      console.error('Socket emission failed:', socketError);
    }

    res.json({ 
      message: 'Withdrawal completed successfully',
      withdrawal: {
        id: withdrawal._id,
        status: withdrawal.status,
        processedAt: withdrawal.processedAt
      }
    });
  } catch (error) {
    console.error('Complete withdrawal error:', error);
    res.status(500).json({ message: 'Error completing withdrawal' });
  }
});

// Mark withdrawal as read
router.post('/withdrawals/:withdrawalId/read', async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    await withdrawal.markAsRead();

    res.json({ message: 'Withdrawal marked as read' });
  } catch (error) {
    console.error('Mark withdrawal as read error:', error);
    res.status(500).json({ message: 'Error marking withdrawal as read' });
  }
});

// Get withdrawal statistics
router.get('/withdrawals/stats/overview', async (req, res) => {
  try {
    const totalWithdrawals = await Withdrawal.countDocuments();
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
    const approvedWithdrawals = await Withdrawal.countDocuments({ status: 'approved' });
    const completedWithdrawals = await Withdrawal.countDocuments({ status: 'completed' });
    const rejectedWithdrawals = await Withdrawal.countDocuments({ status: 'rejected' });

    const totalAmount = await Withdrawal.aggregate([
      { $match: { status: { $in: ['approved', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const pendingAmount = await Withdrawal.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const stats = {
      total: totalWithdrawals,
      pending: pendingWithdrawals,
      approved: approvedWithdrawals,
      completed: completedWithdrawals,
      rejected: rejectedWithdrawals,
      totalAmount: totalAmount[0]?.total || 0,
      pendingAmount: pendingAmount[0]?.total || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Get withdrawal stats error:', error);
    res.status(500).json({ message: 'Error fetching withdrawal statistics' });
  }
});

module.exports = router;
