import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGamepad, FaClock, FaUser, FaTrophy, FaExpandArrowsAlt, FaTimes, FaCheck, FaCopy, FaCheckCircle } from 'react-icons/fa';
import { challengesAPI } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const ChallengeCard = ({ challenge, currentUser, onAccept, onExtend, onCancel }) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendHours, setExtendHours] = useState(24);
  const [isExpired, setIsExpired] = useState(false);
  const [copied, setCopied] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [submittingProof, setSubmittingProof] = useState(false);

  const isChallenger = challenge.challenger._id === currentUser?.id;
  const isAccepter = challenge.accepter && challenge.accepter._id === currentUser?.id;
  const canAccept = !isChallenger && challenge.status === 'pending' && !isExpired;
  const canExtend = isChallenger && challenge.status === 'pending';
  const canCancel = isChallenger && challenge.status === 'pending';
  const canSeeRoomCode = (isChallenger || isAccepter) && challenge.status === 'in-progress' && challenge.adminRoomCode;

  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date();
      const expiresAt = new Date(challenge.expiresAt);
      const timeDiff = expiresAt - now;
      
      if (timeDiff <= 0) {
        setIsExpired(true);
        setTimeRemaining('Expired');
      } else {
        setIsExpired(false);
        setTimeRemaining(formatDistanceToNow(expiresAt, { addSuffix: true }));
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [challenge.expiresAt]);

  // Show notification when room code becomes available
  useEffect(() => {
    if (canSeeRoomCode && challenge.adminRoomCode && !copied) {
      toast.success(`Room code available for your ${challenge.game} match!`, {
        duration: 5000,
        icon: '🎮',
      });
    }
  }, [challenge.adminRoomCode, canSeeRoomCode, challenge.game, copied]);

  const handleExtend = () => {
    onExtend(challenge._id, extendHours);
    setShowExtendModal(false);
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(challenge.adminRoomCode);
      setCopied(true);
      toast.success('Room code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = challenge.adminRoomCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success('Room code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className="gaming-card p-6 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getGameIcon(challenge.game)}</div>
            <div>
              <h3 className="font-bold text-white">{challenge.game}</h3>
              <p className={`text-sm font-medium ${getStatusColor(challenge.status)}`}>
                {getStatusText(challenge.status)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-400">৳{challenge.betAmount}</div>
            <div className="text-sm text-dark-300">Challenge Amount</div>
          </div>
        </div>

        {/* Challenger Info */}
        <div className="flex items-center gap-3 p-3 bg-dark-700 rounded-lg">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
            <FaUser className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">{challenge.challenger.username}</p>
            <p className="text-sm text-dark-300">
              Wins: {challenge.challenger.totalWins} | Losses: {challenge.challenger.totalLosses}
            </p>
          </div>
        </div>

          {/* Time Remaining */}
          <div className="flex items-center gap-2 p-3 bg-dark-700 rounded-lg">
            <FaClock className="text-yellow-400" />
            <div className="flex-1">
              <p className="text-sm text-dark-300">Match Time</p>
              <p className="font-medium text-yellow-400">
                {new Date(challenge.scheduledMatchTime).toLocaleDateString()} at {new Date(challenge.scheduledMatchTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
              <p className="text-xs text-dark-400">
                Duration: {challenge.matchDuration} minutes
              </p>
            </div>
          </div>

          {/* Challenge Expiration */}
          <div className="flex items-center gap-2 p-3 bg-dark-700 rounded-lg">
            <FaClock className="text-orange-400" />
            <div className="flex-1">
              <p className="text-sm text-dark-300">Challenge Expires</p>
              <p className={`font-medium ${isExpired ? 'text-red-400' : 'text-orange-400'}`}>
                {timeRemaining}
              </p>
            </div>
          </div>

         {/* Winning Prize */}
         <div className="flex items-center gap-2 p-3 bg-dark-700 rounded-lg">
           <FaTrophy className="text-green-400" />
           <div className="flex-1">
             <p className="text-sm text-dark-300">Winning Prize</p>
             <p className="font-medium text-green-400">
               ৳{Math.round(challenge.betAmount * 1.5)}
             </p>
           </div>
         </div>

          {/* Room Code Section */}
          {canSeeRoomCode && (
            <div className="flex items-center gap-2 p-3 bg-primary-500/20 border border-primary-500/30 rounded-lg">
              <FaGamepad className="text-primary-400" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm text-dark-300">Room Code</p>
                  {challenge.roomCodeProvidedBy && (
                    <span className="px-2 py-1 bg-primary-500/30 text-primary-400 text-xs rounded-full">
                      Admin Provided
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-primary-400 text-lg">
                    {challenge.adminRoomCode}
                  </span>
                  <button
                    onClick={copyRoomCode}
                    className={`p-2 rounded-lg transition-all ${
                      copied 
                        ? 'bg-green-500 text-white' 
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                    }`}
                    title={copied ? 'Copied!' : 'Copy room code'}
                  >
                    {copied ? <FaCheckCircle /> : <FaCopy />}
                  </button>
                </div>
                <p className="text-xs text-primary-300 mt-1">
                  Click the copy button to automatically copy the room code
                </p>
                {challenge.roomCodeProvidedAt && (
                  <p className="text-xs text-primary-400 mt-1">
                    Provided: {new Date(challenge.roomCodeProvidedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Proof Upload for Winner Screenshot */}
          {canSeeRoomCode && (
            <div className="p-3 bg-dark-700 rounded-lg border border-dark-600">
              <p className="text-sm text-dark-300 mb-2">Share winner screenshot for admin review</p>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  className="text-sm"
                />
                <button
                  disabled={!proofFile || submittingProof}
                  onClick={async () => {
                    if (!proofFile) return;
                    setSubmittingProof(true);
                    try {
                      await challengesAPI.submitProof(challenge._id, proofFile);
                      toast.success('Screenshot submitted for admin review');
                      setProofFile(null);
                    } catch (e) {
                      toast.error(e?.message || 'Failed to submit screenshot');
                    } finally {
                      setSubmittingProof(false);
                    }
                  }}
                  className="btn-outline text-xs px-3 py-1"
                >
                  {submittingProof ? 'Submitting...' : 'Submit Screenshot'}
                </button>
              </div>
              <p className="text-xs text-dark-400 mt-1">Only images are allowed.</p>
            </div>
          )}

          {/* Actions */}
        <div className="flex gap-2">
          {canAccept && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAccept(challenge._id)}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <FaCheck />
              Accept Challenge
            </motion.button>
          )}

          {canExtend && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExtendModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <FaExpandArrowsAlt />
              Extend Time
            </motion.button>
          )}

          {canCancel && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCancel(challenge._id)}
              className="btn-outline flex items-center gap-2"
            >
              <FaTimes />
              Cancel
            </motion.button>
          )}
        </div>

        {/* Warning for expired challenges */}
        {isExpired && challenge.status === 'pending' && (
          <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm text-center">
              This challenge has expired. {isChallenger ? 'You can extend the time or cancel it.' : 'It is no longer available for acceptance.'}
            </p>
          </div>
        )}
      </motion.div>

      {/* Extend Time Modal */}
      {showExtendModal && (
        <div className="modal-overlay" onClick={() => setShowExtendModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Extend Challenge Time</h3>
              <p className="text-dark-300">
                How many hours would you like to extend this challenge by?
              </p>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white">
                  Extension Hours
                </label>
                <select
                  value={extendHours}
                  onChange={(e) => setExtendHours(Number(e.target.value))}
                  className="input-field w-full"
                >
                  <option value={1}>1 hour</option>
                  <option value={6}>6 hours</option>
                  <option value={12}>12 hours</option>
                  <option value={24}>24 hours</option>
                  <option value={48}>48 hours</option>
                  <option value={72}>72 hours</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowExtendModal(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExtend}
                  className="btn-primary flex-1"
                >
                  Extend Challenge
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ChallengeCard;
