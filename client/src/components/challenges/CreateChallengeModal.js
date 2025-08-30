import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaGamepad, FaCoins, FaClock, FaCalendarAlt } from 'react-icons/fa';

const CreateChallengeModal = ({ onClose, onSubmit, userBalance, isAdmin = false }) => {
  const [game, setGame] = useState('Ludo King');
  const [betAmount, setBetAmount] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [matchDuration, setMatchDuration] = useState(30);
  const [playerCount, setPlayerCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  


  const games = [
    { id: 'Ludo King', name: 'Ludo King', icon: '🎲', description: 'Classic board game challenge', supports4Player: false, supports8Player: false, supports50Player: false, category: 'board-game' },
    { id: 'Free Fire', name: 'Free Fire', icon: '🔫', description: 'Battle royale shooting game', supports4Player: true, supports8Player: true, supports50Player: true, category: 'battle-royale' },
    { id: 'PUBG', name: 'PUBG', icon: '🎯', description: 'PlayerUnknown\'s Battlegrounds', supports4Player: true, supports8Player: true, supports50Player: true, category: 'battle-royale' }
  ];

  // Update player count when game changes
  useEffect(() => {
    const selectedGame = games.find(g => g.id === game);
    if (selectedGame && !selectedGame.supports4Player && playerCount === 4) {
      setPlayerCount(2);
    }
    if (selectedGame && !selectedGame.supports8Player && playerCount === 8) {
      setPlayerCount(2);
    }
    if (selectedGame && !selectedGame.supports50Player && playerCount === 50) {
      setPlayerCount(2);
    }
    // Clear validation errors when game changes
    setValidationErrors(prev => ({ ...prev, game: null }));
  }, [game, playerCount]);

  // Generate available time slots (30-minute intervals)
  useEffect(() => {
    if (scheduledDate) {
      const slots = [];
      const selectedDate = new Date(scheduledDate);
      const now = new Date();
      
      // Start from 30 minutes from now if today, or from 8 AM if future date
      let startTime = new Date(selectedDate);
      if (selectedDate.toDateString() === now.toDateString()) {
        startTime = new Date(now.getTime() + 30 * 60 * 1000);
      } else {
        startTime.setHours(8, 0, 0, 0);
      }
      
      // End time at 10 PM
      const endTime = new Date(selectedDate);
      endTime.setHours(22, 0, 0, 0);
      
      while (startTime <= endTime) {
        slots.push(startTime.toTimeString().slice(0, 5));
        startTime = new Date(startTime.getTime() + 30 * 60 * 1000);
      }
      
      setAvailableSlots(slots);
      
      // Set first available time if none selected
      if (!scheduledTime && slots.length > 0) {
        setScheduledTime(slots[0]);
      }
    }
  }, [scheduledDate]);

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!game) errors.game = 'Please select a game';
    if (!betAmount) errors.betAmount = 'Please enter bet amount';
    if (!scheduledDate) errors.scheduledDate = 'Please select a date';
    if (!scheduledTime) errors.scheduledTime = 'Please select a time';
    
    if (betAmount) {
      const amount = Number(betAmount);
      if (amount < 10 || amount > 10000) {
        errors.betAmount = 'Bet amount must be between ৳10 and ৳10,000';
      }
    }
    
    if (playerCount === 4 && !['PUBG', 'Free Fire'].includes(game)) {
      errors.game = '4-player challenges are only available for PUBG and Free Fire games';
    }
    
    if (playerCount === 8 && !['PUBG', 'Free Fire'].includes(game)) {
      errors.game = '8-player challenges are only available for PUBG and Free Fire games';
    }
    
    if (playerCount === 50 && !['PUBG', 'Free Fire'].includes(game)) {
      errors.game = '50-player challenges are only available for PUBG and Free Fire games';
    }
    
    if (scheduledDate && scheduledTime) {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      const now = new Date();
      const minTime = new Date(now.getTime() + 30 * 60 * 1000);
      
      if (scheduledDateTime <= minTime) {
        errors.scheduledTime = 'Match must be scheduled at least 30 minutes in the future';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const amount = Number(betAmount);
    const totalCost = amount; // Allow using full balance; fee handled internally
    if (!isAdmin && totalCost > userBalance) {
      alert('Insufficient balance. You need ৳' + (totalCost - userBalance) + ' more.');
      return;
    }

    // Combine date and time
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    
    setLoading(true);
    try {
      await onSubmit(
        game, 
        amount, 
        scheduledDateTime, 
        matchDuration, 
        playerCount
      );
    } catch (error) {
      console.error('Error creating challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedGame = games.find(g => g.id === game);
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 7 days from now

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="modal-content max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {isAdmin ? 'Create New Challenge' : 'Create Challenge'}
            </h2>
            <button
              onClick={onClose}
              className="text-dark-300 hover:text-white transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Balance Info - Only show for non-admin users */}
          {!isAdmin && (
            <div className="p-4 bg-dark-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaCoins className="text-yellow-400" />
                <span className="text-sm text-dark-300">Your Balance</span>
              </div>
              <div className="text-2xl font-bold text-white">৳{userBalance.toLocaleString()}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Game Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                Select Game
              </label>
              <div className="grid grid-cols-1 gap-3">
                {games.map((gameOption) => (
                  <button
                    key={gameOption.id}
                    type="button"
                    onClick={() => setGame(gameOption.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      game === gameOption.id
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-600 bg-dark-700 hover:border-dark-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{gameOption.icon}</div>
                      <div>
                        <div className="font-medium text-white">{gameOption.name}</div>
                        <div className="text-sm text-dark-300">{gameOption.description}</div>
                        {gameOption.supports4Player && (
                          <div className="text-xs text-green-400 mt-1">✓ Supports 4-player challenges</div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {validationErrors.game && (
                <div className="text-sm text-red-400">{validationErrors.game}</div>
              )}
            </div>

            {/* Player Count Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                Player Count
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlayerCount(2)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                    playerCount === 2
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-dark-600 bg-dark-700 hover:border-dark-500'
                  }`}
                >
                  <div className="text-2xl mb-2">👥</div>
                  <div className="font-medium text-white">2 Players</div>
                  <div className="text-sm text-dark-300">All Games</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerCount(4)}
                  disabled={!selectedGame?.supports4Player}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                    playerCount === 4
                      ? 'border-primary-500 bg-primary-500/10'
                      : selectedGame?.supports4Player
                      ? 'border-dark-600 bg-dark-700 hover:border-dark-500'
                      : 'border-dark-600 bg-dark-800 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="text-2xl mb-2">👥👥</div>
                  <div className="font-medium text-white">4 Players</div>
                  <div className="text-sm text-dark-300">PUBG & Free Fire Only</div>
                </button>
              </div>
              
              {/* 8-Player and 50-Player options for PUBG and Free Fire */}
              {selectedGame?.supports8Player && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPlayerCount(8)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                      playerCount === 8
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-600 bg-dark-700 hover:border-dark-500'
                    }`}
                  >
                    <div className="text-2xl mb-2">👥👥👥👥</div>
                    <div className="font-medium text-white">8 Players</div>
                    <div className="text-sm text-dark-300">4v4 Team Match</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayerCount(50)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                      playerCount === 50
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-600 bg-dark-700 hover:border-dark-500'
                    }`}
                  >
                    <div className="text-2xl mb-2">🏆</div>
                    <div className="font-medium text-white">50 Players</div>
                    <div className="text-sm text-dark-300">Battle Royale</div>
                  </button>
                </div>
              )}
              
              {!selectedGame?.supports4Player && playerCount === 4 && (
                <div className="text-sm text-yellow-400">
                  ⚠️ 4-player challenges are only available for PUBG and Free Fire games
                </div>
              )}
              {validationErrors.game && (
                <div className="text-sm text-red-400">{validationErrors.game}</div>
              )}
              
            </div>

            {/* Challenge Amount */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                Challenge Amount (৳)
              </label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                min="10"
                max="10000"
                step="10"
                placeholder="Enter challenge amount (10-10000)"
                className="input-field w-full"
                required
              />
              <div className="text-sm text-dark-300">
                Minimum: ৳10 | Maximum: ৳10,000
              </div>
              
              {/* Prize Display for 50-player challenges */}
              {playerCount === 50 && betAmount && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="text-sm text-green-400 font-medium">🏆 Potential Prize</div>
                  <div className="text-lg text-white font-bold">
                    ৳{Math.round(Number(betAmount) * 50 * 0.6).toLocaleString()}
                  </div>
                  <div className="text-xs text-green-300">
                    60% of total entry fees (৳{Number(betAmount) * 50} if all 50 slots filled)
                  </div>
                </div>
              )}
              
              {validationErrors.betAmount && (
                <div className="text-sm text-red-400">{validationErrors.betAmount}</div>
              )}
              {!isAdmin && betAmount && Number(betAmount) > userBalance && (
                <div className="text-sm text-red-400">
                  Insufficient balance. You need ৳{Number(betAmount) - userBalance} more.
                </div>
              )}
              
            </div>

            {/* Match Scheduling */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white flex items-center gap-2">
                <FaCalendarAlt className="text-primary-400" />
                Schedule Match
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-dark-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={today}
                    max={maxDate}
                    className="input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-dark-300 mb-1">Time</label>
                  <select
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="input-field w-full"
                    required
                  >
                    <option value="">Select time</option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Match Duration */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white flex items-center gap-2">
                  <FaClock className="text-primary-400" />
                  Match Duration
                </label>
                
                {playerCount === 50 ? (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="text-sm text-blue-400 font-medium">⏱️ Dynamic Duration</div>
                    <div className="text-sm text-blue-300">
                      Match duration will be automatically calculated based on the number of players who accept the challenge.
                    </div>
                  </div>
                ) : (
                  <select
                    value={matchDuration}
                    onChange={(e) => setMatchDuration(Number(e.target.value))}
                    className="input-field w-full"
                    required
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                )}
              </div>
              
              <div className="text-xs text-dark-300">
                ⚠️ Minimum 30-minute gap required between matches
              </div>
              {validationErrors.scheduledTime && (
                <div className="text-sm text-red-400">{validationErrors.scheduledTime}</div>
              )}
            </div>

            {/* Challenge Preview */}
            {game && betAmount && scheduledDate && scheduledTime && (
              <div className="p-4 bg-dark-700 rounded-lg border border-dark-600">
                <h4 className="font-medium text-white mb-2">Challenge Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dark-300">Game:</span>
                    <span className="text-white">{selectedGame?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-300">Player Count:</span>
                    <span className="text-white">{playerCount} Players</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-300">Challenge Amount:</span>
                    <span className="text-primary-400 font-medium">৳{betAmount}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-dark-300">Winning Prize:</span>
                    <span className="text-green-400 font-medium">
                      ৳{playerCount === 50 ? 
                         Math.round(Number(betAmount) * 50 * 0.6) : 
                         playerCount === 8 ? 
                         Math.round(Number(betAmount) * 4) :
                         playerCount === 4 ? 
                         Math.round(Number(betAmount) * 3) : 
                         Math.round(Number(betAmount) * 1.5)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-300">Scheduled:</span>
                    <span className="text-yellow-400">
                      {scheduledDate} at {scheduledTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-300">Duration:</span>
                    <span className="text-blue-400">{matchDuration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-300">Expires:</span>
                    <span className="text-yellow-400">24 hours</span>
                  </div>
                  <div className="text-sm text-dark-300">
                    Match Fee: ৳{playerCount === 4 ? Math.round(Number(betAmount) * 3) : 
                                   playerCount === 8 ? Math.round(Number(betAmount) * 4) :
                                   playerCount === 50 ? Math.round(Number(betAmount) * 5) :
                                   Math.round(Number(betAmount) * 1.5)}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="btn-outline flex-1"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading || !game || !betAmount || !scheduledDate || !scheduledTime || Number(betAmount) > userBalance}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Challenge'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateChallengeModal;
