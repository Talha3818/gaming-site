import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaGamepad, FaClock, FaUser, FaTrophy, FaUsers, FaCoins } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const ChallengeDetail = ({ challenge, onClose, onAccept, userBalance = 0 }) => {
  if (!challenge) return null;

  const hasSufficientBalance = userBalance >= challenge.betAmount;
  const canAccept = challenge.status === 'pending' && hasSufficientBalance;

  const getGameIcon = (game) => {
    switch (game) {
      case 'Ludo King': return '🎲';
      case 'Free Fire': return '🔫';
      case 'PUBG': return '🎯';
      default: return '🎮';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'accepted': return 'text-blue-400';
      case 'in-progress': return 'text-purple-400';
      case 'completed': return 'text-green-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="modal-content max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Challenge Details</h2>
            <button
              onClick={onClose}
              className="text-dark-300 hover:text-white transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {/* Challenge Info */}
          <div className="space-y-4">
            {/* Game and Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getGameIcon(challenge.game)}</span>
                <div>
                  <h3 className="text-xl font-semibold text-white">{challenge.game}</h3>
                  <p className={`text-sm font-medium ${getStatusColor(challenge.status)}`}>
                    {getStatusText(challenge.status)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-400">৳{challenge.betAmount}</div>
                <div className="text-sm text-dark-300">Bet Amount</div>
              </div>
            </div>

            {/* Challenge Type */}
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FaUsers className="text-blue-400" />
                <div>
                  <div className="text-white font-medium">{challenge.playerCount || 2}-Player Challenge</div>
                  <div className="text-sm text-dark-300">
                    {challenge.participants?.length || 0} participants
                  </div>
                </div>
              </div>
            </div>

            {/* Time and Expiry */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaClock className="text-yellow-400" />
                  <span className="text-white font-medium">Created</span>
                </div>
                <div className="text-sm text-dark-300">
                  {formatDistanceToNow(new Date(challenge.createdAt), { addSuffix: true })}
                </div>
              </div>
              <div className="bg-dark-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaClock className="text-red-400" />
                  <span className="text-white font-medium">Expires</span>
                </div>
                <div className="text-sm text-dark-300">
                  {formatDistanceToNow(new Date(challenge.expiresAt), { addSuffix: true })}
                </div>
              </div>
            </div>

            {/* Challenger Info */}
            {challenge.challenger && (
              <div className="bg-dark-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FaUser className="text-green-400" />
                  <div>
                    <div className="text-white font-medium">Challenger</div>
                    <div className="text-sm text-dark-300">{challenge.challenger.username}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {challenge.description && (
              <div className="bg-dark-700 rounded-lg p-4">
                <div className="text-white font-medium mb-2">Description</div>
                <div className="text-dark-300 text-sm">{challenge.description}</div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {canAccept ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAccept(challenge._id)}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <FaTrophy />
                Accept Challenge
              </motion.button>
            ) : !hasSufficientBalance ? (
              <div className="flex-1 text-center p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="text-red-400 text-sm">
                  Insufficient balance. You need ৳{challenge.betAmount} to join.
                </div>
              </div>
            ) : null}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="btn-outline flex-1"
            >
              Close
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChallengeDetail;
