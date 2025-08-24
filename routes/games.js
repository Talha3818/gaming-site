const express = require('express');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get available games
router.get('/available', auth, async (req, res) => {
  try {
    const games = [
      {
        id: 'ludo-king',
        name: 'Ludo King',
        description: 'Classic board game with modern multiplayer features',
        minBet: 10,
        maxBet: 10000,
        image: '/images/ludo-king.jpg',
        rules: [
          'Players roll dice to move their tokens',
          'First player to get all tokens home wins',
          'Screenshots required for result verification'
        ]
      },
      {
        id: 'free-fire',
        name: 'Free Fire',
        description: 'Battle royale survival game',
        minBet: 10,
        maxBet: 10000,
        image: '/images/free-fire.jpg',
        rules: [
          'Last player/team standing wins',
          'Screenshots required for result verification',
          'Custom room codes provided by admin'
        ]
      },
      {
        id: 'pubg',
        name: 'PUBG',
        description: 'PlayerUnknown\'s Battlegrounds mobile',
        minBet: 10,
        maxBet: 10000,
        image: '/images/pubg.jpg',
        rules: [
          'Last player/team standing wins',
          'Screenshots required for result verification',
          'Custom room codes provided by admin'
        ]
      }
    ];

    res.json(games);
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get game statistics
router.get('/stats/:gameId', auth, async (req, res) => {
  try {
    const { gameId } = req.params;
    const gameName = gameId === 'ludo-king' ? 'Ludo King' : 
                    gameId === 'free-fire' ? 'Free Fire' : 
                    gameId === 'pubg' ? 'PUBG' : null;

    if (!gameName) {
      return res.status(400).json({ message: 'Invalid game ID' });
    }

    const totalChallenges = await Challenge.countDocuments({ game: gameName });
    const completedChallenges = await Challenge.countDocuments({ 
      game: gameName, 
      status: 'completed' 
    });
    const pendingChallenges = await Challenge.countDocuments({ 
      game: gameName, 
      status: 'pending' 
    });

    const totalBetAmount = await Challenge.aggregate([
      { $match: { game: gameName, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$betAmount' } } }
    ]);

    const recentChallenges = await Challenge.find({ game: gameName })
      .populate('challenger', 'username')
      .populate('accepter', 'username')
      .populate('winner', 'username')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      gameName,
      totalChallenges,
      completedChallenges,
      pendingChallenges,
      totalBetAmount: totalBetAmount[0]?.total || 0,
      recentChallenges
    });
  } catch (error) {
    console.error('Get game stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's game statistics
router.get('/user-stats/:gameId', auth, async (req, res) => {
  try {
    const { gameId } = req.params;
    const gameName = gameId === 'ludo-king' ? 'Ludo King' : 
                    gameId === 'free-fire' ? 'Free Fire' : 
                    gameId === 'pubg' ? 'PUBG' : null;

    if (!gameName) {
      return res.status(400).json({ message: 'Invalid game ID' });
    }

    const userChallenges = await Challenge.find({
      game: gameName,
      $or: [
        { challenger: req.user.userId },
        { accepter: req.user.userId }
      ]
    });

    const totalGames = userChallenges.filter(c => c.status === 'completed').length;
    const wins = userChallenges.filter(c => 
      c.status === 'completed' && c.winner?.equals(req.user.userId)
    ).length;
    const losses = totalGames - wins;

    const totalEarnings = userChallenges
      .filter(c => c.status === 'completed' && c.winner?.equals(req.user.userId))
      .reduce((sum, c) => sum + c.betAmount, 0);

    const totalBets = userChallenges
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + c.betAmount, 0);

    res.json({
      gameName,
      totalGames,
      wins,
      losses,
      winRate: totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0,
      totalEarnings,
      totalBets,
      netProfit: totalEarnings - totalBets
    });
  } catch (error) {
    console.error('Get user game stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard for a game
router.get('/leaderboard/:gameId', auth, async (req, res) => {
  try {
    const { gameId } = req.params;
    const gameName = gameId === 'ludo-king' ? 'Ludo King' : 
                    gameId === 'free-fire' ? 'Free Fire' : 
                    gameId === 'pubg' ? 'PUBG' : null;

    if (!gameName) {
      return res.status(400).json({ message: 'Invalid game ID' });
    }

    const leaderboard = await Challenge.aggregate([
      {
        $match: {
          game: gameName,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$winner',
          wins: { $sum: 1 },
          totalEarnings: { $sum: '$betAmount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          username: '$user.username',
          wins: 1,
          totalEarnings: 1
        }
      },
      {
        $sort: { wins: -1, totalEarnings: -1 }
      },
      {
        $limit: 20
      }
    ]);

    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
