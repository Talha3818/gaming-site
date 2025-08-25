import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaGamepad, 
  FaTrophy, 
  FaWallet, 
  FaChartLine, 
  FaUsers, 
  FaClock,
  FaPlus,
  FaSearch
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { challengesAPI, gamesAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [recentChallenges, setRecentChallenges] = useState([]);
  const [gameStats, setGameStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [challengesResponse, gamesResponse] = await Promise.all([
        challengesAPI.getMyChallenges(),
        gamesAPI.getAvailableGames()
      ]);

      setRecentChallenges(challengesResponse.slice(0, 5));
      
      // Get stats for each game
      const stats = {};
      for (const game of gamesResponse) {
        try {
          const gameStats = await gamesAPI.getUserGameStats(game.id);
          stats[game.id] = gameStats;
        } catch (error) {
          console.error(`Failed to load stats for ${game.name}:`, error);
        }
      }
      setGameStats(stats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'accepted': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'accepted': return '✅';
      case 'completed': return '🏆';
      case 'cancelled': return '❌';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6 space-y-4 md:space-y-6 dashboard-mobile">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-xl md:text-3xl font-gaming font-bold gradient-text mb-2">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-dark-300 text-sm md:text-base">
          Ready to challenge players and win big?
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid mobile-grid md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
      >
        <div className="gaming-card mobile-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-xs md:text-sm">Balance</p>
              <p className="text-lg md:text-2xl font-bold text-green-400 balance-text">
                ৳{user?.balance?.toLocaleString() || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <FaWallet className="text-green-400" />
            </div>
          </div>
        </div>

        <div className="gaming-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-xs md:text-sm">Total Wins</p>
              <p className="text-lg md:text-2xl font-bold text-primary-400">
                {user?.totalWins || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <FaTrophy className="text-primary-400" />
            </div>
          </div>
        </div>

        <div className="gaming-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-xs md:text-sm">Win Rate</p>
              <p className="text-lg md:text-2xl font-bold text-secondary-400">
                {user?.winRate || 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-secondary-500/20 rounded-lg flex items-center justify-center">
              <FaChartLine className="text-secondary-400" />
            </div>
          </div>
        </div>

        <div className="gaming-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-xs md:text-sm">Total Earnings</p>
              <p className="text-lg md:text-2xl font-bold text-yellow-400">
                ৳{user?.totalEarnings?.toLocaleString() || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <FaGamepad className="text-yellow-400" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      >
        <Link to="/games" className="gaming-card hover:scale-105 transition-transform">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FaGamepad className="text-2xl text-primary-400" />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-2">Browse Games</h3>
            <p className="text-dark-400 text-xs md:text-sm">
              Find challenges in Ludo King, Free Fire, and PUBG
            </p>
          </div>
        </Link>

        <Link to="/challenges" className="gaming-card hover:scale-105 transition-transform">
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FaTrophy className="text-2xl text-secondary-400" />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-2">Join Challenges</h3>
            <p className="text-dark-400 text-xs md:text-sm">
              Accept challenges created by admins
            </p>
          </div>
        </Link>

        <Link to="/payments" className="gaming-card hover:scale-105 transition-transform">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FaWallet className="text-2xl text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Add Money</h3>
            <p className="text-dark-400 text-sm">
              Deposit money via bKash to start playing
            </p>
          </div>
        </Link>
      </motion.div>

      {/* Recent Challenges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="gaming-card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Recent Challenges</h2>
          <Link to="/challenges" className="text-primary-400 hover:text-primary-300 text-sm">
            View All
          </Link>
        </div>

        {recentChallenges.length === 0 ? (
          <div className="text-center py-8">
            <FaClock className="text-4xl text-dark-400 mx-auto mb-4" />
            <p className="text-dark-400">No challenges yet</p>
            <Link to="/challenges" className="btn-primary mt-4 inline-block">
              Create Your First Challenge
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentChallenges.map((challenge) => (
              <div
                key={challenge._id}
                className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg border border-dark-600"
              >
                <div className="flex items-center space-x-4">
                  <div className="game-icon">
                    {challenge.game === 'Ludo King' && '🎲'}
                    {challenge.game === 'Free Fire' && '🔥'}
                    {challenge.game === 'PUBG' && '🎯'}
                  </div>
                  <div>
                    <h3 className="font-semibold">{challenge.game}</h3>
                    <p className="text-sm text-dark-400">
                      ৳{challenge.betAmount} • {challenge.challenger?.username}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-semibold ${getStatusColor(challenge.status)}`}>
                    {getStatusIcon(challenge.status)} {challenge.status}
                  </span>
                  <p className="text-xs text-dark-400">
                    {new Date(challenge.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Game Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="gaming-card"
      >
        <h2 className="text-xl font-bold mb-6">Game Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(gameStats).map(([gameId, stats]) => (
            <div key={gameId} className="text-center p-4 bg-dark-700/50 rounded-lg">
              <div className="text-2xl mb-2">
                {gameId === 'ludo-king' && '🎲'}
                {gameId === 'free-fire' && '🔥'}
                {gameId === 'pubg' && '🎯'}
              </div>
              <h3 className="font-semibold mb-2">
                {gameId === 'ludo-king' ? 'Ludo King' : 
                 gameId === 'free-fire' ? 'Free Fire' : 'PUBG'}
              </h3>
              <div className="space-y-1 text-sm">
                <p className="text-dark-400">
                  Games: <span className="text-white">{stats.totalGames || 0}</span>
                </p>
                <p className="text-green-400">
                  Wins: <span className="text-white">{stats.wins || 0}</span>
                </p>
                <p className="text-red-400">
                  Losses: <span className="text-white">{stats.losses || 0}</span>
                </p>
                <p className="text-primary-400">
                  Win Rate: <span className="text-white">{stats.winRate || 0}%</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
