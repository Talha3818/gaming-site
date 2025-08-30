import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaGamepad, FaTrophy, FaCoins, FaChartLine, FaCalendarAlt, FaUserFriends, FaMoneyBillWave, FaClock, FaHeadset, FaCog } from 'react-icons/fa';
import { useQuery } from 'react-query';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, all

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error, refetch } = useQuery(
    ['admin-dashboard', timeRange],
    () => adminAPI.getDashboard(timeRange),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      staleTime: 10000, // Consider data stale after 10 seconds
    }
  );

  // Fetch recent activities
  const { data: recentActivities } = useQuery(
    ['admin-recent-activities'],
    () => adminAPI.getRecentActivities(),
    {
      refetchInterval: 15000, // Refresh every 15 seconds
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading Dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">Error loading dashboard: {error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const data = dashboardData || {};

  const formatCurrency = (amount) => `৳${amount?.toLocaleString() || 0}`;
  const formatNumber = (num) => num?.toLocaleString() || 0;
  const formatPercentage = (num) => `${((num || 0) * 100).toFixed(1)}%`;

  const getTimeRangeLabel = (range) => {
    switch (range) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      case 'all': return 'All Time';
      default: return 'Last 7 Days';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-dark-300">Complete overview of gaming platform performance</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field bg-dark-700 border-dark-600 text-white"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          <button
            onClick={() => refetch()}
            className="btn-primary flex items-center gap-2"
          >
            <FaChartLine />
            Refresh
          </button>
        </div>
      </div>

      {/* Time Range Display */}
      <div className="text-center">
        <p className="text-lg text-white font-medium">
          Showing data for: <span className="text-primary-400">{getTimeRangeLabel(timeRange)}</span>
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="gaming-card p-6 text-center"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mx-auto mb-4">
            <FaUsers className="text-3xl text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{formatNumber(data.totalUsers)}</h3>
          <p className="text-dark-300 mb-2">Total Users</p>
          <div className="flex items-center justify-center gap-2">
            <span className={`text-sm ${data.newUsers >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {data.newUsers >= 0 ? '+' : ''}{formatNumber(data.newUsers)}
            </span>
            <span className="text-xs text-dark-400">new this period</span>
          </div>
        </motion.div>

        {/* Active Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="gaming-card p-6 text-center"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mx-auto mb-4">
            <FaUserFriends className="text-3xl text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{formatNumber(data.activeUsers)}</h3>
          <p className="text-dark-300 mb-2">Active Users</p>
          <div className="text-sm text-green-400">
            {formatPercentage(data.activeUserRate)} of total users
          </div>
        </motion.div>

        {/* Total Matches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="gaming-card p-6 text-center"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mx-auto mb-4">
            <FaGamepad className="text-3xl text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{formatNumber(data.totalMatches)}</h3>
          <p className="text-dark-300 mb-2">Total Matches</p>
          <div className="flex items-center justify-center gap-2">
            <span className={`text-sm ${data.newMatches >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {data.newMatches >= 0 ? '+' : ''}{formatNumber(data.newMatches)}
            </span>
            <span className="text-xs text-dark-400">this period</span>
          </div>
        </motion.div>

        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="gaming-card p-6 text-center"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-full mx-auto mb-4">
            <FaMoneyBillWave className="text-3xl text-yellow-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{formatCurrency(data.totalRevenue)}</h3>
          <p className="text-dark-300 mb-2">Total Revenue</p>
          <div className="flex items-center justify-center gap-2">
            <span className={`text-sm ${data.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {data.revenueGrowth >= 0 ? '+' : ''}{formatPercentage(data.revenueGrowth)}
            </span>
            <span className="text-xs text-dark-400">vs previous</span>
          </div>
        </motion.div>
      </div>

      {/* Detailed Statistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gaming Statistics */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="gaming-card p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaGamepad className="text-primary-400" />
            Gaming Statistics
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{formatNumber(data.completedMatches)}</div>
                <div className="text-sm text-dark-300">Completed Matches</div>
              </div>
              <div className="bg-dark-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{formatNumber(data.pendingMatches)}</div>
                <div className="text-sm text-dark-300">Pending Matches</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{formatNumber(data.totalChallenges)}</div>
                <div className="text-sm text-dark-300">Total Challenges</div>
              </div>
              <div className="bg-dark-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{formatNumber(data.activeChallenges)}</div>
                <div className="text-sm text-dark-300">Active Challenges</div>
              </div>
            </div>
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="text-center mb-2">
                <div className="text-lg font-bold text-white">Match Completion Rate</div>
              </div>
              <div className="w-full bg-dark-600 rounded-full h-3">
                <div
                  className="bg-primary-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(data.completedMatches / Math.max(data.totalMatches, 1)) * 100}%` }}
                ></div>
              </div>
              <div className="text-center mt-2 text-sm text-dark-300">
                {formatPercentage(data.completedMatches / Math.max(data.totalMatches, 1))} completed
              </div>
            </div>
          </div>
        </motion.div>

        {/* Financial Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="gaming-card p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaCoins className="text-yellow-400" />
            Financial Overview
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{formatCurrency(data.totalBets)}</div>
                <div className="text-sm text-dark-300">Total Bets</div>
              </div>
              <div className="bg-dark-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-400">{formatCurrency(data.totalMatchFees)}</div>
                <div className="text-sm text-dark-300">Match Fees</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{formatCurrency(data.totalPayouts)}</div>
                <div className="text-sm text-dark-300">Total Payouts</div>
              </div>
              <div className="bg-dark-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{formatCurrency(data.netProfit)}</div>
                <div className="text-sm text-dark-300">Net Profit</div>
              </div>
            </div>
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="text-center mb-2">
                <div className="text-lg font-bold text-white">Profit Margin</div>
              </div>
              <div className="w-full bg-dark-600 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((data.netProfit / Math.max(data.totalRevenue, 1)) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-center mt-2 text-sm text-dark-300">
                {formatPercentage(data.netProfit / Math.max(data.totalRevenue, 1))} margin
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Game-Specific Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="gaming-card p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaTrophy className="text-primary-400" />
          Game Performance by Type
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.gameStats?.map((game, index) => (
            <div key={game.name} className="bg-dark-700 rounded-lg p-4">
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">{game.icon}</div>
                <h4 className="text-lg font-bold text-white">{game.name}</h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-dark-300">Matches:</span>
                  <span className="text-white font-medium">{formatNumber(game.totalMatches)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">Challenges:</span>
                  <span className="text-white font-medium">{formatNumber(game.totalChallenges)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">Revenue:</span>
                  <span className="text-green-400 font-medium">{formatCurrency(game.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">Avg Bet:</span>
                  <span className="text-primary-400 font-medium">{formatCurrency(game.averageBet)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activities */}
      {recentActivities && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="gaming-card p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-primary-400" />
            Recent Activities
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-dark-700 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  activity.type === 'user' ? 'bg-blue-400' :
                  activity.type === 'match' ? 'bg-green-400' :
                  activity.type === 'payment' ? 'bg-yellow-400' :
                  'bg-purple-400'
                }`}></div>
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.description}</p>
                  <p className="text-dark-300 text-xs">{activity.timestamp}</p>
                </div>
                <div className="text-xs text-dark-400">{activity.user}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="gaming-card p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaUserFriends className="text-purple-400" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link
            to="/admin/users"
            className="bg-dark-700 hover:bg-dark-600 rounded-lg p-4 text-center transition-colors duration-200"
          >
            <FaUsers className="text-blue-400 text-2xl mx-auto mb-2" />
            <p className="text-white font-medium">Manage Users</p>
          </Link>
          
          <Link
            to="/admin/challenges"
            className="bg-dark-700 hover:bg-dark-600 rounded-lg p-4 text-center transition-colors duration-200"
          >
            <FaTrophy className="text-yellow-400 text-2xl mx-auto mb-2" />
            <p className="text-white font-medium">Manage Challenges</p>
          </Link>
          
          <Link
            to="/admin/payments"
            className="bg-dark-700 hover:bg-dark-600 rounded-lg p-4 text-center transition-colors duration-200"
          >
            <FaCoins className="text-green-400 text-2xl mx-auto mb-2" />
            <p className="text-white font-medium">Payment Requests</p>
            {data.unreadPayments > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 mt-2 inline-block">
                {data.unreadPayments} new
              </span>
            )}
          </Link>
          
          <Link
            to="/admin/withdrawals"
            className="bg-dark-700 hover:bg-dark-600 rounded-lg p-4 text-center transition-colors duration-200"
          >
            <FaMoneyBillWave className="text-purple-400 text-2xl mx-auto mb-2" />
            <p className="text-white font-medium">Withdrawal Requests</p>
            {data.pendingWithdrawals > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 mt-2 inline-block">
                {data.pendingWithdrawals} new
              </span>
            )}
          </Link>
          
          <Link
            to="/admin/helpline"
            className="bg-dark-700 hover:bg-dark-600 rounded-lg p-4 text-center transition-colors duration-200"
          >
            <FaHeadset className="text-red-400 text-2xl mx-auto mb-2" />
            <p className="text-white font-medium">Helpline</p>
          </Link>
          
          <Link
            to="/admin/settings"
            className="bg-dark-700 hover:bg-dark-600 rounded-lg p-4 text-center transition-colors duration-200"
          >
            <FaCog className="text-blue-400 text-2xl mx-auto mb-2" />
            <p className="text-white font-medium">System Settings</p>
          </Link>
        </div>
      </motion.div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Engagement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="gaming-card p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaUserFriends className="text-blue-400" />
            User Engagement
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {formatPercentage(data.activeUserRate)}
                </div>
                <div className="text-sm text-dark-300">Active Users</div>
              </div>
              <div className="bg-dark-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {formatNumber(data.totalUsers - data.activeUsers)}
                </div>
                <div className="text-sm text-dark-300">Inactive Users</div>
              </div>
            </div>
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="text-center mb-2">
                <div className="text-lg font-bold text-white">User Activity Rate</div>
              </div>
              <div className="w-full bg-dark-600 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(data.activeUsers / Math.max(data.totalUsers, 1)) * 100}%` }}
                ></div>
              </div>
              <div className="text-center mt-2 text-sm text-dark-300">
                {formatNumber(data.activeUsers)} out of {formatNumber(data.totalUsers)} users active
              </div>
            </div>
          </div>
        </motion.div>

        {/* Platform Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="gaming-card p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaChartLine className="text-purple-400" />
            Platform Performance
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{formatNumber(data.totalChallenges)}</div>
                <div className="text-sm text-dark-300">Total Challenges</div>
              </div>
              <div className="bg-dark-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{formatNumber(data.completedMatches)}</div>
                <div className="text-sm text-dark-300">Completed Matches</div>
              </div>
            </div>
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="text-center mb-2">
                <div className="text-lg font-bold text-white">Challenge Success Rate</div>
              </div>
              <div className="w-full bg-dark-600 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(data.completedMatches / Math.max(data.totalChallenges, 1)) * 100}%` }}
                ></div>
              </div>
              <div className="text-center mt-2 text-sm text-dark-300">
                {formatPercentage(data.completedMatches / Math.max(data.totalChallenges, 1))} of challenges completed
              </div>
            </div>
          </div>
        </motion.div>

        {/* Match Scheduling Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="gaming-card p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaClock className="text-blue-400" />
            Match Scheduling Overview
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-dark-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{formatNumber(data.scheduledMatches || 0)}</div>
                <div className="text-sm text-dark-300">Scheduled Matches</div>
              </div>
              <div className="bg-dark-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{formatNumber(data.upcomingMatches || 0)}</div>
                <div className="text-sm text-dark-300">Upcoming Matches</div>
              </div>
              <div className="bg-dark-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{formatNumber(data.overdueMatches || 0)}</div>
                <div className="text-sm text-dark-300">Overdue Matches</div>
              </div>
            </div>
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="text-center mb-2">
                <div className="text-lg font-bold text-white">Scheduling Efficiency</div>
              </div>
              <div className="w-full bg-dark-600 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${((data.scheduledMatches || 0) / Math.max(data.totalMatches, 1)) * 100}%` }}
                ></div>
              </div>
              <div className="text-center mt-2 text-sm text-dark-300">
                {formatPercentage((data.scheduledMatches || 0) / Math.max(data.totalMatches, 1))} of matches are scheduled
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="gaming-card p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">🟢</div>
            <div className="text-white font-medium">Platform</div>
            <div className="text-sm text-dark-300">Operational</div>
          </div>
          <div className="bg-dark-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">🟢</div>
            <div className="text-white font-medium">Database</div>
            <div className="text-sm text-dark-300">Connected</div>
          </div>
          <div className="bg-dark-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">🟢</div>
            <div className="text-white font-medium">API</div>
            <div className="text-sm text-dark-300">Active</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
