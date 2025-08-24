import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGamepad, FaClock, FaUser, FaTrophy, FaPlus, FaTimes, FaExpandArrowsAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { challengesAPI } from '../services/api';
import toast from 'react-hot-toast';
import CreateChallengeModal from '../components/challenges/CreateChallengeModal';
import ChallengeCard from '../components/challenges/ChallengeCard';

const Challenges = () => {
  const { user, refreshUser } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'my-challenges'
  const [selectedGame, setSelectedGame] = useState('all');

  useEffect(() => {
    loadChallenges();
  }, [selectedGame]);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const [challengesData, myChallengesData] = await Promise.all([
        challengesAPI.getChallenges({ game: selectedGame !== 'all' ? selectedGame : undefined }),
        challengesAPI.getMyChallenges()
      ]);
      
      setChallenges(Array.isArray(challengesData?.challenges) ? challengesData.challenges : []);
      setMyChallenges(Array.isArray(myChallengesData) ? myChallengesData : []);
    } catch (error) {
      console.error('Error loading challenges:', error);
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptChallenge = async (challengeId) => {
    try {
      await challengesAPI.acceptChallenge(challengeId);
      toast.success('Challenge accepted successfully!');
      await refreshUser();
      loadChallenges(); // Reload to update the list
    } catch (error) {
      console.error('Error accepting challenge:', error);
      toast.error(error.response?.data?.message || 'Failed to accept challenge');
    }
  };

  const handleExtendChallenge = async (challengeId, hours) => {
    try {
      await challengesAPI.extendChallenge(challengeId, hours);
      toast.success(`Challenge time extended by ${hours} hours!`);
      loadChallenges(); // Reload to update the list
    } catch (error) {
      console.error('Error extending challenge:', error);
      toast.error(error.response?.data?.message || 'Failed to extend challenge');
    }
  };

  const handleCancelChallenge = async (challengeId) => {
    try {
      await challengesAPI.cancelChallenge(challengeId);
      toast.success('Challenge cancelled successfully!');
      await refreshUser();
      loadChallenges(); // Reload to update the list
    } catch (error) {
      console.error('Error cancelling challenge:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel challenge');
    }
  };

  const handleCreateChallenge = async (game, betAmount, scheduledDateTime, matchDuration) => {
    try {
      await challengesAPI.createChallenge({
        game,
        betAmount,
        scheduledMatchTime: scheduledDateTime,
        matchDuration
      });
      
      toast.success('Challenge created successfully!');
      setShowCreateModal(false);
      await refreshUser();
      loadChallenges(); // Reload to update the list
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.error(error.response?.data?.message || 'Error creating challenge');
    }
  };

  const games = [
    { id: 'all', name: 'All Games', icon: '🎮' },
    { id: 'Ludo King', name: 'Ludo King', icon: '🎲' },
    { id: 'Free Fire', name: 'Free Fire', icon: '🔫' },
    { id: 'PUBG', name: 'PUBG', icon: '🎯' }
  ];

  const filteredChallenges = activeTab === 'available' 
    ? challenges.filter(c => c.status === 'pending')
    : myChallenges;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Challenges</h1>
          <p className="text-dark-300">Accept challenges or create your own to compete with other players</p>
          <p className="text-xs text-dark-400 mt-1">Challenge fee applies. Winning prize shown excludes platform fee.</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus />
          Create Challenge
        </motion.button>
      </motion.div>

      {/* Game Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-2"
      >
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => setSelectedGame(game.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedGame === game.id
                ? 'bg-primary-500 text-white shadow-lg'
                : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'
            }`}
          >
            <span className="mr-2">{game.icon}</span>
            {game.name}
          </button>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex border-b border-dark-600"
      >
        <button
          onClick={() => setActiveTab('available')}
          className={`px-6 py-3 font-medium transition-all duration-200 ${
            activeTab === 'available'
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-dark-300 hover:text-white'
          }`}
        >
          Available Challenges ({challenges.filter(c => c.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('my-challenges')}
          className={`px-6 py-3 font-medium transition-all duration-200 ${
            activeTab === 'my-challenges'
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-dark-300 hover:text-white'
          }`}
        >
          My Challenges ({myChallenges.length})
        </button>
      </motion.div>

      {/* Challenges Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredChallenges.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {activeTab === 'available' ? 'No challenges available' : 'No challenges yet'}
            </h3>
            <p className="text-dark-300">
              {activeTab === 'available' 
                ? 'Be the first to create a challenge!' 
                : 'Create your first challenge to get started!'
              }
            </p>
          </div>
        ) : (
          filteredChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge._id}
              challenge={challenge}
              currentUser={user}
              onAccept={handleAcceptChallenge}
              onExtend={handleExtendChallenge}
              onCancel={handleCancelChallenge}
            />
          ))
        )}
      </motion.div>

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <CreateChallengeModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateChallenge}
          userBalance={user?.balance || 0}
        />
      )}
    </div>
  );
};

export default Challenges;
