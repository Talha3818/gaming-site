import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaGamepad, FaSearch, FaEye, FaPlay, FaTrophy, FaTimes, FaClock, FaUser, FaCoins, FaFilter, FaEdit, FaInfoCircle, FaPlus } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import CreateChallengeModal from '../../components/challenges/CreateChallengeModal';

const AdminChallenges = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [gameFilter, setGameFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showStartMatchModal, setShowStartMatchModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showRoomCodeModal, setShowRoomCodeModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [winnerId, setWinnerId] = useState('');
  const [disputeNotes, setDisputeNotes] = useState('');
  const [roomCodeAction, setRoomCodeAction] = useState('provide'); // 'provide' or 'update'
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const queryClient = useQueryClient();

  // Fetch challenges
  const { data: challengesData, isLoading, error, refetch } = useQuery(
    ['admin-challenges', currentPage, statusFilter, gameFilter],
    () => adminAPI.getChallenges(currentPage, 10, statusFilter),
    {
      keepPreviousData: true,
    }
  );

  // Mutations
  const startMatchMutation = useMutation(
    (data) => adminAPI.startMatch(data.challengeId, data.roomCode),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-challenges']);
        toast.success('Match started successfully');
        setShowStartMatchModal(false);
        setRoomCode('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error starting match');
      }
    }
  );

  const resolveDisputeMutation = useMutation(
    (data) => adminAPI.resolveDispute(data.challengeId, data.winnerId, data.adminNotes),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-challenges']);
        toast.success('Dispute resolved successfully');
        setShowDisputeModal(false);
        setWinnerId(selectedChallenge?.playerCount === 4 ? [] : '');
        setDisputeNotes('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error resolving dispute');
      }
    }
  );

  const provideRoomCodeMutation = useMutation(
    (data) => adminAPI.provideRoomCode(data.challengeId, data.roomCode),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-challenges']);
        toast.success('Room code provided successfully');
        setShowRoomCodeModal(false);
        setRoomCode('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error providing room code');
      }
    }
  );

  const updateRoomCodeMutation = useMutation(
    (data) => adminAPI.updateRoomCode(data.challengeId, data.roomCode),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-challenges']);
        toast.success('Room code updated successfully');
        setShowRoomCodeModal(false);
        setRoomCode('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error updating room code');
      }
    }
  );

  const createChallengeMutation = useMutation(
    (data) => adminAPI.createChallenge(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-challenges']);
        toast.success('Challenge created successfully');
        setShowCreateModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error creating challenge');
      }
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleCreateChallenge = async (game, betAmount, scheduledDateTime, matchDuration, playerCount) => {
    try {
      const challengeData = {
        game,
        betAmount,
        scheduledMatchTime: scheduledDateTime,
        matchDuration,
        playerCount
      };
      
      await createChallengeMutation.mutateAsync(challengeData);
    } catch (error) {
      console.error('Error creating challenge:', error);
    }
  };

  const handleStartMatch = () => {
    if (!roomCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }

    startMatchMutation.mutate({
      challengeId: selectedChallenge._id,
      roomCode: roomCode.trim()
    });
  };

  const handleResolveDispute = async (challengeId, winnerId, adminNotes) => {
    try {
      const response = await resolveDisputeMutation.mutateAsync({ challengeId, winnerId, adminNotes });
      if (response?.totalPot) {
      toast.success(`Dispute resolved! Winner received ৳${response.totalPot.toLocaleString()}`);
      }
      setShowDisputeModal(false);
      setSelectedChallenge(null);
      refetch();
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast.error(error.response?.data?.message || 'Error resolving dispute');
    }
  };

  const handleRoomCodeAction = () => {
    if (!roomCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }

    if (roomCodeAction === 'provide') {
      provideRoomCodeMutation.mutate({
        challengeId: selectedChallenge._id,
        roomCode: roomCode.trim()
      });
    } else {
      updateRoomCodeMutation.mutate({
        challengeId: selectedChallenge._id,
        roomCode: roomCode.trim()
      });
    }
  };

  const openRoomCodeModal = (challenge, action) => {
    setSelectedChallenge(challenge);
    setRoomCodeAction(action);
    setRoomCode(challenge.adminRoomCode || '');
    setShowRoomCodeModal(true);
  };

  const openDisputeModal = (challenge) => {
    setSelectedChallenge(challenge);
    setWinnerId(challenge.playerCount === 4 ? [] : '');
    setDisputeNotes('');
    setShowDisputeModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'accepted': return 'text-blue-400 bg-blue-400/10';
      case 'in-progress': return 'text-purple-400 bg-purple-400/10';
      case 'completed': return 'text-green-400 bg-green-400/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
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

  const getGameIcon = (game) => {
    switch (game) {
      case 'Ludo King': return '🎲';
      case 'Free Fire': return '🔫';
      case 'PUBG': return '🎯';
      default: return '🎮';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading Challenges..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">Error loading challenges: {error.message}</p>
        </div>
      </div>
    );
  }

  const { challenges, pagination } = challengesData || { challenges: [], pagination: {} };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Challenge Management</h1>
          <p className="text-dark-300">Create and manage all gaming challenges and matches</p>
        </div>
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus />
            Create Challenge
          </motion.button>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{pagination.total || 0}</div>
            <div className="text-sm text-dark-300">Total Challenges</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gaming-card p-6"
      >
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                placeholder="Search challenges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-full pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={gameFilter}
              onChange={(e) => setGameFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Games</option>
              <option value="Ludo King">Ludo King</option>
              <option value="Free Fire">Free Fire</option>
              <option value="PUBG">PUBG</option>
            </select>
            <button type="submit" className="btn-primary">
              <FaFilter className="mr-2" />
              Apply Filters
            </button>
          </div>
          {(searchTerm || statusFilter || gameFilter) && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setGameFilter('');
                  setCurrentPage(1);
                }}
                className="btn-outline"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </form>
      </motion.div>

      {/* Challenges Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="gaming-card p-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left p-3 text-white font-medium">Game</th>
                <th className="text-left p-3 text-white font-medium">Players</th>
                <th className="text-left p-3 text-white font-medium">Challenge Amount</th>
                <th className="text-left p-3 text-white font-medium">Status</th>
                <th className="text-left p-3 text-white font-medium">Created</th>
                <th className="text-left p-3 text-white font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {challenges.map((challenge) => (
                <tr key={challenge._id} className="border-b border-dark-700 hover:bg-dark-700/50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getGameIcon(challenge.game)}</div>
                      <div>
                        <div className="font-medium text-white">{challenge.game}</div>
                        <div className="text-sm text-dark-300">
                          {challenge.adminRoomCode ? (
                            <span className="text-green-400">Room: {challenge.adminRoomCode}</span>
                          ) : challenge.roomCode ? (
                            <span className="text-yellow-400">Room: {challenge.roomCode}</span>
                          ) : (
                            'No room code'
                          )}
                        </div>
                        {challenge.roomCodeProvidedAt && (
                          <div className="text-xs text-dark-400">
                            Provided: {formatDate(challenge.roomCodeProvidedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="text-dark-300">Type:</span>
                        <span className="text-white ml-2">{challenge.playerCount || 2}-Player</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-dark-300">Challenger:</span>
                        <span className="text-white ml-2">
                          {challenge.challenger ? challenge.challenger.username : 'Waiting...'}
                        </span>
                      </div>
                      {challenge.playerCount === 2 ? (
                        <>
                          {challenge.accepter && (
                            <div className="text-sm">
                              <span className="text-dark-300">Accepter:</span>
                              <span className="text-white ml-2">{challenge.accepter.username}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="text-sm">
                            <span className="text-dark-300">Participants:</span>
                            <span className="text-white ml-2">
                              {challenge.participants?.length || 0}/{challenge.maxParticipants || 4}
                            </span>
                          </div>
                          {challenge.participants && challenge.participants.length > 0 && (
                            <div className="text-xs text-dark-400">
                              {challenge.participants.map((p, i) => (
                                <span key={p.user._id || i} className="block">
                                  {p.user.username || 'Unknown'}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                      {challenge.winner && (
                        <div className="text-sm">
                          <span className="text-green-400 font-medium">Winner: {challenge.winner.username}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      <div className="text-white font-medium">৳{challenge.betAmount?.toLocaleString()}</div>
                      <div className="text-sm text-orange-400">+৳{challenge.matchFee?.toLocaleString()} Fee</div>
                      <div className="text-sm text-green-400">Total: ৳{challenge.totalPot?.toLocaleString()}</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(challenge.status)}`}>
                      {getStatusText(challenge.status)}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="text-sm text-dark-300">
                      {new Date(challenge.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-dark-400">
                      {new Date(challenge.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {challenge.status === 'accepted' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedChallenge(challenge);
                              setShowStartMatchModal(true);
                            }}
                            disabled={!challenge.participants || challenge.participants.length === 0}
                            className={`p-2 rounded ${
                              challenge.participants && challenge.participants.length > 0
                                ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-400/10'
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            title={
                              challenge.participants && challenge.participants.length > 0
                                ? 'Start Match'
                                : 'No participants to start match'
                            }
                          >
                            <FaPlay />
                          </button>
                          {!challenge.adminRoomCode ? (
                            <button
                              onClick={() => openRoomCodeModal(challenge, 'provide')}
                              disabled={!challenge.participants || challenge.participants.length === 0}
                              className={`p-2 rounded ${
                                challenge.participants && challenge.participants.length > 0
                                  ? 'text-green-400 hover:text-green-300 hover:bg-green-400/10'
                                  : 'text-gray-400 cursor-not-allowed'
                              }`}
                              title={
                                challenge.participants && challenge.participants.length > 0
                                  ? 'Provide Room Code'
                                  : 'No participants to provide room code'
                              }
                            >
                              <FaEye />
                            </button>
                          ) : (
                            <button
                              onClick={() => openRoomCodeModal(challenge, 'update')}
                              className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded"
                              title="Update Room Code"
                            >
                              <FaEdit />
                            </button>
                          )}
                        </>
                      )}
                      {challenge.status === 'in-progress' && (
                        <button
                          onClick={() => openDisputeModal(challenge)}
                          className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded"
                          title="Resolve Dispute"
                        >
                          <FaTrophy />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedChallenge(challenge);
                          setShowDetailsModal(true);
                        }}
                        className="p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded"
                        title="Info"
                      >
                        <FaInfoCircle />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-dark-300">
              Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} challenges
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-outline px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-white">
                Page {currentPage} of {pagination.pages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className="btn-outline px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Start Match Modal */}
      {showStartMatchModal && selectedChallenge && (
        <div className="modal-overlay" onClick={() => setShowStartMatchModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-content max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Start Match</h3>
              <p className="text-dark-300">
                Starting {selectedChallenge.playerCount || 2}-player match for {selectedChallenge.game}
              </p>
              
              {selectedChallenge.participants && selectedChallenge.participants.length > 0 && (
                <div className="p-3 bg-dark-700 rounded-lg">
                  <p className="text-sm text-dark-300 mb-2">Participants:</p>
                  <div className="space-y-1">
                    {selectedChallenge.participants.map((participant, index) => (
                      <div key={participant.user._id || index} className="text-xs text-white">
                        {index + 1}. {participant.user.username || 'Unknown'}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {(!selectedChallenge.participants || selectedChallenge.participants.length === 0) && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">
                    ❌ No participants have joined this challenge yet. Cannot start match.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-sm font-medium text-white">Room Code</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="input-field w-full"
                  placeholder="Enter room code"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowStartMatchModal(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartMatch}
                  disabled={
                    !roomCode.trim() || 
                    startMatchMutation.isLoading ||
                    (!selectedChallenge.participants || selectedChallenge.participants.length === 0)
                  }
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {startMatchMutation.isLoading ? 'Starting...' : 'Start Match'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Resolve Dispute Modal */}
      {showDisputeModal && selectedChallenge && (
        <div className="modal-overlay" onClick={() => setShowDisputeModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-content max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Resolve Dispute</h3>
              <p className="text-dark-300">
                Resolving dispute for {selectedChallenge.game} match ({selectedChallenge.playerCount || 2}-player)
              </p>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white">
                  {selectedChallenge.playerCount === 4 ? 'Select Winners (Multiple)' : 'Select Winner'}
                </label>
                {selectedChallenge.playerCount === 4 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-dark-300">
                      Select all players who should be declared winners:
                    </p>
                    {selectedChallenge.participants?.map((participant) => (
                      <label key={participant.user._id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Array.isArray(winnerId) ? winnerId.includes(participant.user._id) : false}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setWinnerId(prev => Array.isArray(prev) ? [...prev, participant.user._id] : [participant.user._id]);
                            } else {
                              setWinnerId(prev => Array.isArray(prev) ? prev.filter(id => id !== participant.user._id) : []);
                            }
                          }}
                          className="rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-white">{participant.user.username}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <select
                    value={winnerId}
                    onChange={(e) => setWinnerId(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Choose winner...</option>
                    {selectedChallenge.challenger && (
                      <option value={selectedChallenge.challenger._id}>
                        {selectedChallenge.challenger.username} (Challenger)
                      </option>
                    )}
                    {selectedChallenge.accepter && (
                      <option value={selectedChallenge.accepter._id}>
                        {selectedChallenge.accepter.username} (Accepter)
                      </option>
                    )}
                    {selectedChallenge.participants && selectedChallenge.participants.length > 0 && (
                      selectedChallenge.participants.map((participant) => (
                        <option key={participant.user._id} value={participant.user._id}>
                          {participant.user.username} (Participant)
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-white">Notes (Optional)</label>
                <textarea
                  value={disputeNotes}
                  onChange={(e) => setDisputeNotes(e.target.value)}
                  className="input-field w-full"
                  rows="3"
                  placeholder="Reason for decision..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleResolveDispute(selectedChallenge._id, winnerId, disputeNotes)}
                  disabled={
                    !winnerId || 
                    (selectedChallenge.playerCount === 4 && (!Array.isArray(winnerId) || winnerId.length === 0)) ||
                    resolveDisputeMutation.isLoading
                  }
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resolveDisputeMutation.isLoading ? 'Resolving...' : 'Resolve Dispute'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Room Code Modal */}
      {showRoomCodeModal && selectedChallenge && (
        <div className="modal-overlay" onClick={() => setShowRoomCodeModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-content max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">
                {roomCodeAction === 'provide' ? 'Provide Room Code' : 'Update Room Code'}
              </h3>
              <p className="text-dark-300">
                {roomCodeAction === 'provide' 
                  ? `Providing room code for ${selectedChallenge.game} match (${selectedChallenge.playerCount || 2}-player)`
                  : `Updating room code for ${selectedChallenge.game} match`}
              </p>
              
              {selectedChallenge.participants && selectedChallenge.participants.length > 0 && (
                <div className="p-3 bg-dark-700 rounded-lg">
                  <p className="text-sm text-dark-300 mb-2">Participants:</p>
                  <div className="space-y-1">
                    {selectedChallenge.participants.map((participant, index) => (
                      <div key={participant.user._id || index} className="text-xs text-white">
                        {index + 1}. {participant.user.username || 'Unknown'}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {(!selectedChallenge.participants || selectedChallenge.participants.length === 0) && (
                <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-400">
                    ⚠️ No players have joined this challenge yet. Room code can only be provided after players join.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-sm font-medium text-white">Room Code</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="input-field w-full"
                  placeholder="Enter room code"
                  autoFocus
                />
                <p className="text-xs text-dark-300">
                  This room code will be automatically copied when players click on it.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRoomCodeModal(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoomCodeAction}
                  disabled={
                    !roomCode.trim() || 
                    (provideRoomCodeMutation.isLoading || updateRoomCodeMutation.isLoading) ||
                    (!selectedChallenge.participants || selectedChallenge.participants.length === 0)
                  }
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {provideRoomCodeMutation.isLoading || updateRoomCodeMutation.isLoading 
                    ? (roomCodeAction === 'provide' ? 'Providing...' : 'Updating...')
                    : (roomCodeAction === 'provide' ? 'Provide Room Code' : 'Update Room Code')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Challenge Details Modal */}
      {showDetailsModal && selectedChallenge && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-content max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Challenge Details</h3>
                <button onClick={() => setShowDetailsModal(false)} className="text-dark-300 hover:text-white">
                  <FaTimes />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-dark-300">Game</div>
                  <div className="text-white font-medium">{selectedChallenge.game}</div>
                  <div className="text-sm text-dark-300 mt-2">Player Count</div>
                  <div className="text-white font-medium">{selectedChallenge.playerCount || 2} Players</div>
                  <div className="text-sm text-dark-300 mt-2">Status</div>
                  <div className="text-white font-medium">{selectedChallenge.status}</div>
                  <div className="text-sm text-dark-300 mt-2">Scheduled</div>
                  <div className="text-white font-medium">{new Date(selectedChallenge.scheduledMatchTime).toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-dark-300">Challenger</div>
                  <div className="text-white font-medium">
                    {selectedChallenge.challenger ? selectedChallenge.challenger.username : 'Waiting for challenger...'}
                  </div>
                  {selectedChallenge.playerCount === 2 ? (
                    <>
                      <div className="text-sm text-dark-300 mt-2">Accepter</div>
                      <div className="text-white font-medium">{selectedChallenge.accepter?.username || '—'}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-dark-300 mt-2">Participants</div>
                      <div className="text-white font-medium">
                        {selectedChallenge.participants?.length || 0}/{selectedChallenge.maxParticipants || 4}
                      </div>
                      {selectedChallenge.participants && (
                        <div className="text-xs text-dark-300 mt-1">
                          {selectedChallenge.participants.map((p, i) => (
                            <span key={p.user._id || i} className="block">
                              {i + 1}. {p.user.username || 'Unknown'}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  {selectedChallenge.winner && (
                    <>
                      <div className="text-sm text-dark-300 mt-2">Winner</div>
                      <div className="text-white font-medium">{selectedChallenge.winner.username}</div>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-dark-300 mb-2">Submitted Screenshot</div>
                {selectedChallenge.winnerScreenshot ? (
                  <img
                    src={selectedChallenge.winnerScreenshot}
                    alt="submitted proof"
                    className="max-h-96 rounded border border-dark-600"
                  />
                ) : (
                  <div className="text-dark-300">No screenshot submitted yet.</div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <CreateChallengeModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateChallenge}
          isAdmin={true}
        />
      )}
    </div>
  );
};

export default AdminChallenges;
