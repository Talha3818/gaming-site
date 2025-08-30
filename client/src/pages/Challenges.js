import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGamepad, FaClock, FaUser, FaTrophy, FaTimes, FaExpandArrowsAlt, FaUsers, FaPlus, FaSearch } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { challengesAPI } from '../services/api';
import toast from 'react-hot-toast';
import ChallengeCard from '../components/challenges/ChallengeCard';
import CreateChallengeModal from '../components/challenges/CreateChallengeModal';
import ChallengeDetail from '../components/challenges/ChallengeDetail';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { authAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Challenges = () => {
  const { user, refreshUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [gameFilter, setGameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('available'); // 'available', 'my-challenges', 'admin-challenges'

  const queryClient = useQueryClient();

  // Fetch available challenges
  const { data: challengesData, isLoading, error, refetch } = useQuery(
    ['challenges', currentPage, gameFilter, statusFilter, activeTab],
    () => {
      if (activeTab === 'my-challenges') {
        return challengesAPI.getMyChallenges(currentPage, 10, statusFilter);
      } else if (activeTab === 'admin-challenges') {
        return challengesAPI.getAdminChallenges(currentPage, 10, gameFilter);
      } else {
        return challengesAPI.getChallenges(currentPage, 10, gameFilter, statusFilter);
      }
    },
    {
      keepPreviousData: true,
    }
  );

  // Fetch user balance
  const { data: userData } = useQuery(['user'], authAPI.getMe);

  // Accept challenge mutation
  const acceptChallengeMutation = useMutation(
    (challengeId) => challengesAPI.acceptChallenge(challengeId),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['challenges']);
        queryClient.invalidateQueries(['user']);
        toast.success(data.message || 'Challenge accepted successfully!');
        
        // Show additional info for admin challenges
        if (data.isFull) {
          toast.success('Challenge is now full! The match can start.', { duration: 5000 });
        }
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error accepting challenge');
      }
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  const handleCreateChallenge = async (data) => {
    try {
      await challengesAPI.createChallenge(data);
      toast.success('Challenge created successfully!');
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create challenge');
    }
  };

  const handleAcceptChallenge = async (challengeId) => {
    try {
      await acceptChallengeMutation.mutateAsync(challengeId);
    } catch (error) {
      console.error('Error accepting challenge:', error);
    }
  };

  const handleExtendChallenge = async (challengeId, hours) => {
    try {
      await challengesAPI.extendChallenge(challengeId, hours);
      toast.success(`Challenge time extended by ${hours} hours!`);
      refetch(); // Reload to update the list
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
      refetch(); // Reload to update the list
    } catch (error) {
      console.error('Error cancelling challenge:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel challenge');
    }
  };



  const games = [
    { id: 'all', name: 'All Games', icon: '🎮' },
    { id: 'Ludo King', name: 'Ludo King', icon: '🎲' },
    { id: 'Free Fire', name: 'Free Fire', icon: '🔫' },
    { id: 'PUBG', name: 'PUBG', icon: '🎯' }
  ];

  const filteredChallenges = activeTab === 'available' 
    ? challengesData?.challenges?.filter(c => c.status === 'pending')
    : challengesData?.challenges;

  if (isLoading) {
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
    <div className="min-h-screen bg-dark-900 text-white">
      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8">
      {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 md:gap-6 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Challenges</h1>
            <p className="text-dark-300 text-sm md:text-base">
              Join exciting gaming challenges and compete for rewards
            </p>
          </div>
        </div>

      {/* Tabs */}
        <div className="md:flex space-x-1 bg-dark-800 p-1 rounded-lg mb-4 md:mb-6">
        <button
          onClick={() => setActiveTab('available')}
            className={`flex-1 py-2 px-3 md:px-4 rounded-md text-xs md:text-sm font-medium transition-colors ${
            activeTab === 'available'
                ? 'bg-primary-500 text-white'
                : 'text-dark-300 hover:text-white hover:bg-dark-700'
          }`}
        >
            Available Challenges
        </button>
        <button
          onClick={() => setActiveTab('my-challenges')}
            className={`flex-1 py-2 px-3 md:px-4 rounded-md text-xs md:text-sm font-medium transition-colors ${
            activeTab === 'my-challenges'
                ? 'bg-primary-500 text-white'
                : 'text-dark-300 hover:text-white hover:bg-dark-700'
            }`}
          >
            My Challenges
          </button>
          <button
            onClick={() => setActiveTab('admin-challenges')}
            className={`flex-1 py-2 px-3 md:px-4 rounded-md text-xs md:text-sm font-medium transition-colors ${
              activeTab === 'admin-challenges'
                ? 'bg-primary-500 text-white'
                : 'text-dark-300 hover:text-white hover:bg-dark-700'
            }`}
          >
            <span className="flex items-center gap-1 md:gap-2">
              👑 Admin Challenges
              {challengesData?.adminChallenges?.length > 0 && (
                <span className="bg-purple-500 text-white text-xs px-1 md:px-2 py-1 rounded-full">
                  {challengesData.adminChallenges.length}
                </span>
              )}
            </span>
        </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-dark-800 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-3 md:gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search challenges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-full text-sm md:text-base"
              />
            </div>
            <select
              value={gameFilter}
              onChange={(e) => setGameFilter(e.target.value)}
              className="input-field lg:w-48 text-sm md:text-base"
            >
              <option value="">All Games</option>
              <option value="Ludo King">Ludo King</option>
              <option value="Free Fire">Free Fire</option>
              <option value="PUBG">PUBG</option>
            </select>
            {activeTab !== 'admin-challenges' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field lg:w-48 text-sm md:text-base"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            )}
            <button type="submit" className="btn-primary text-sm md:text-base">
              <FaSearch /> Search
            </button>
          </form>
        </div>

        {/* Challenges List */}
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center text-red-400">
            Error loading challenges: {error.message}
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {activeTab === 'admin-challenges' && challengesData?.adminChallenges?.length > 0 && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-semibold text-purple-400 mb-2">
                  👑 Admin-Created Challenges
                </h3>
                <p className="text-purple-300 text-xs md:text-sm">
                  These are special challenges created by administrators. Join them to participate in organized matches!
                </p>
              </div>
            )}

            {challengesData?.challenges?.length === 0 ? (
              <div className="text-center py-8 md:py-12">
            <div className="text-4xl md:text-6xl mb-3 md:mb-4">🎮</div>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
                  {activeTab === 'available' && 'No challenges available'}
                  {activeTab === 'my-challenges' && 'No challenges created'}
                  {activeTab === 'admin-challenges' && 'No admin challenges available'}
            </h3>
            <p className="text-dark-300 text-sm md:text-base">
                  {activeTab === 'available' && 'Check back later for new challenges'}
                  {activeTab === 'my-challenges' && 'Create your first challenge to get started'}
                  {activeTab === 'admin-challenges' && 'No admin challenges are currently available'}
            </p>
          </div>
        ) : (
              <div className="grid gap-4">
                {challengesData?.challenges?.map((challenge) => (
            <ChallengeCard
              key={challenge._id}
              challenge={challenge}
              onAccept={handleAcceptChallenge}
              onExtend={handleExtendChallenge}
              onCancel={handleCancelChallenge}
              onViewDetails={() => {
                setSelectedChallenge(challenge);
                setShowDetailsModal(true);
              }}
              isAdminChallenge={challenge.isAdminCreated}
              userBalance={userData?.balance || 0}
            />
          ))}
              </div>
            )}

            {/* Pagination */}
            {challengesData?.totalPages > 1 && (
              <div className="flex justify-center mt-6 md:mt-8">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 md:px-4 py-2 rounded-lg bg-dark-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-700 text-sm md:text-base"
                  >
                    Previous
                  </button>
                  <span className="px-3 md:px-4 py-2 text-dark-300 text-sm md:text-base">
                    Page {currentPage} of {challengesData.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(challengesData.totalPages, currentPage + 1))}
                    disabled={currentPage === challengesData.totalPages}
                    className="px-3 md:px-4 py-2 rounded-lg bg-dark-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-700 text-sm md:text-base"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateChallengeModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateChallenge}
          userBalance={userData?.balance || 0}
        />
      )}

      {showDetailsModal && selectedChallenge && (
        <ChallengeDetail
          challenge={selectedChallenge}
          onClose={() => setShowDetailsModal(false)}
          onAccept={handleAcceptChallenge}
          userBalance={userData?.balance || 0}
        />
      )}
    </div>
  );
};

export default Challenges;
