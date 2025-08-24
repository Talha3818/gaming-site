import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaComments, FaSearch, FaReply, FaEye, FaFilter, FaUser, FaClock, FaMessage, FaCheck } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminHelpline = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [conversationMessages, setConversationMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const queryClient = useQueryClient();

  // Fetch conversations
  const { data: conversationsData, isLoading, error } = useQuery(
    ['admin-helpline-conversations', currentPage],
    () => adminAPI.getConversations(currentPage, 10),
    {
      keepPreviousData: true,
    }
  );

  // Fetch unread count
  const { data: unreadData } = useQuery(
    ['admin-helpline-unread'],
    adminAPI.getUnreadCount,
    {
      refetchInterval: 10000, // Refresh every 10 seconds
    }
  );

  // Mutations
  const sendResponseMutation = useMutation(
    (data) => adminAPI.respondToUser(data.userId, data.message),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-helpline-conversations']);
        queryClient.invalidateQueries(['admin-helpline-unread']);
        toast.success('Response sent successfully');
        setShowResponseModal(false);
        setResponseMessage('');
        // Refresh conversation messages
        if (selectedConversation) {
          loadConversationMessages(selectedConversation.userId);
        }
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error sending response');
      }
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleSendResponse = () => {
    if (!responseMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    sendResponseMutation.mutate({
      userId: selectedConversation.userId,
      message: responseMessage.trim()
    });
  };

  const loadConversationMessages = async (userId) => {
    setIsLoadingMessages(true);
    try {
      const messages = await adminAPI.getUserMessages(userId);
      setConversationMessages(messages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Error loading conversation messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const openConversation = (conversation) => {
    setSelectedConversation(conversation);
    loadConversationMessages(conversation.userId);
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();
  const formatTime = (date) => new Date(date).toLocaleTimeString();
  const formatRelativeTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return formatDate(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading Helpline..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">Error loading helpline: {error.message}</p>
        </div>
      </div>
    );
  }

  const { conversations, pagination } = conversationsData || { conversations: [], pagination: {} };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Helpline Management</h1>
          <p className="text-dark-300">Manage user support requests and conversations</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{pagination.total || 0}</div>
            <div className="text-sm text-dark-300">Total Conversations</div>
          </div>
          {unreadData && (
            <div className="text-right">
              <div className="text-2xl font-bold text-red-400">{unreadData.unreadCount || 0}</div>
              <div className="text-sm text-dark-300">Unread Messages</div>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gaming-card p-6"
      >
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-full pl-10"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="btn-outline"
            >
              Clear
            </button>
          )}
        </form>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="gaming-card p-6">
            <h3 className="text-lg font-bold text-white mb-4">Conversations</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation.userId}
                  onClick={() => openConversation(conversation)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedConversation?.userId === conversation.userId
                      ? 'bg-primary-500/20 border border-primary-500/30'
                      : 'bg-dark-700 hover:bg-dark-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                      <FaUser className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">
                        {conversation.username}
                      </div>
                      <div className="text-sm text-dark-300 truncate">
                        {conversation.lastMessage?.message}
                      </div>
                      <div className="text-xs text-dark-400">
                        {formatRelativeTime(conversation.lastMessage?.createdAt)}
                      </div>
                    </div>
                    {conversation.lastMessage && !conversation.lastMessage.isFromAdmin && (
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-dark-600">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn-outline px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-dark-300">
                  Page {currentPage} of {pagination.pages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  className="btn-outline px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Conversation Messages */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          {selectedConversation ? (
            <div className="gaming-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">
                  Conversation with {selectedConversation.username}
                </h3>
                <button
                  onClick={() => setShowResponseModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <FaReply />
                  Respond
                </button>
              </div>

              {/* Messages */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="md" text="Loading messages..." />
                  </div>
                ) : conversationMessages.length > 0 ? (
                  conversationMessages.map((message, index) => (
                    <div
                      key={message._id || index}
                      className={`flex ${message.isFromAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                          message.isFromAdmin
                            ? 'bg-primary-500 text-white'
                            : 'bg-dark-700 text-white'
                        }`}
                      >
                        <div className="text-sm">{message.message}</div>
                        <div className={`text-xs mt-1 ${
                          message.isFromAdmin ? 'text-primary-200' : 'text-dark-300'
                        }`}>
                          {formatTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-dark-300">
                    No messages in this conversation yet.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="gaming-card p-6">
              <div className="text-center py-12">
                <FaComments className="text-6xl text-dark-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Select a Conversation</h3>
                <p className="text-dark-300">
                  Choose a conversation from the list to view messages and respond to users.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedConversation && (
        <div className="modal-overlay" onClick={() => setShowResponseModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-content max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Send Response</h3>
              <p className="text-dark-300">
                Responding to <span className="text-white font-medium">{selectedConversation.username}</span>
              </p>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white">Message</label>
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  className="input-field w-full"
                  rows="4"
                  placeholder="Type your response..."
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendResponse}
                  disabled={!responseMessage.trim() || sendResponseMutation.isLoading}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendResponseMutation.isLoading ? 'Sending...' : 'Send Response'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminHelpline;
