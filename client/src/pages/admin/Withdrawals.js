import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaClock, FaEye, FaSearch, FaFilter } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Withdrawals = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve', 'reject', 'complete'
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const queryClient = useQueryClient();

  // Fetch withdrawals
  const { data: withdrawalsData, isLoading } = useQuery(
    ['admin-withdrawals', page, statusFilter],
    () => adminAPI.getWithdrawals(page, 10, statusFilter)
  );

  // Fetch withdrawal stats
  const { data: statsData } = useQuery(
    'withdrawal-stats',
    adminAPI.getWithdrawalStats
  );

  // Action mutations
  const approveMutation = useMutation(adminAPI.approveWithdrawal, {
    onSuccess: () => {
      toast.success('Withdrawal approved successfully!');
      setShowActionModal(false);
      setSelectedWithdrawal(null);
      setAdminNotes('');
      queryClient.invalidateQueries(['admin-withdrawals']);
      queryClient.invalidateQueries('withdrawal-stats');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error approving withdrawal');
    }
  });

  const rejectMutation = useMutation(adminAPI.rejectWithdrawal, {
    onSuccess: () => {
      toast.success('Withdrawal rejected successfully!');
      setShowActionModal(false);
      setSelectedWithdrawal(null);
      setAdminNotes('');
      queryClient.invalidateQueries(['admin-withdrawals']);
      queryClient.invalidateQueries('withdrawal-stats');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error rejecting withdrawal');
    }
  });

  const completeMutation = useMutation(adminAPI.completeWithdrawal, {
    onSuccess: () => {
      toast.success('Withdrawal completed successfully!');
      setShowActionModal(false);
      setSelectedWithdrawal(null);
      setAdminNotes('');
      queryClient.invalidateQueries(['admin-withdrawals']);
      queryClient.invalidateQueries('withdrawal-stats');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error completing withdrawal');
    }
  });

  const handleAction = async () => {
    if (!selectedWithdrawal) return;

    setIsProcessing(true);
    try {
      switch (actionType) {
        case 'approve':
          await approveMutation.mutateAsync({ withdrawalId: selectedWithdrawal._id, notes: adminNotes });
          break;
        case 'reject':
          await rejectMutation.mutateAsync({ withdrawalId: selectedWithdrawal._id, notes: adminNotes });
          break;
        case 'complete':
          await completeMutation.mutateAsync({ withdrawalId: selectedWithdrawal._id, notes: adminNotes });
          break;
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-400" />;
      case 'rejected':
        return <FaTimesCircle className="text-red-400" />;
      case 'approved':
        return <FaCheckCircle className="text-blue-400" />;
      default:
        return <FaClock className="text-yellow-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10';
      case 'rejected':
        return 'text-red-400 bg-red-400/10';
      case 'approved':
        return 'text-blue-400 bg-blue-400/10';
      default:
        return 'text-yellow-400 bg-yellow-400/10';
    }
  };

  const filteredWithdrawals = withdrawalsData?.withdrawals?.filter(withdrawal => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        withdrawal.user.username.toLowerCase().includes(searchLower) ||
        withdrawal.user.phoneNumber.includes(searchTerm) ||
        withdrawal.paymentNumber.includes(searchTerm)
      );
    }
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Withdrawal Management</h1>
          <p className="text-dark-300 mt-2">Manage user withdrawal requests</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-5 gap-6"
      >
        <div className="gaming-card p-6 text-center">
          <FaMoneyBillWave className="text-blue-400 text-3xl mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white">Total</h3>
          <p className="text-2xl font-bold text-blue-400">
            {statsData?.total || 0}
          </p>
        </div>
        
        <div className="gaming-card p-6 text-center">
          <FaClock className="text-yellow-400 text-3xl mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white">Pending</h3>
          <p className="text-2xl font-bold text-yellow-400">
            {statsData?.pending || 0}
          </p>
        </div>
        
        <div className="gaming-card p-6 text-center">
          <FaCheckCircle className="text-blue-400 text-3xl mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white">Approved</h3>
          <p className="text-2xl font-bold text-blue-400">
            {statsData?.approved || 0}
          </p>
        </div>
        
        <div className="gaming-card p-6 text-center">
          <FaCheckCircle className="text-green-400 text-3xl mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white">Completed</h3>
          <p className="text-2xl font-bold text-green-400">
            {statsData?.completed || 0}
          </p>
        </div>
        
        <div className="gaming-card p-6 text-center">
          <FaTimesCircle className="text-red-400 text-3xl mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white">Rejected</h3>
          <p className="text-2xl font-bold text-red-400">
            {statsData?.rejected || 0}
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="gaming-card p-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                placeholder="Search by username, phone, or payment number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-dark-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Withdrawals List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="gaming-card p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaMoneyBillWave />
          Withdrawal Requests
        </h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-dark-300">Loading withdrawals...</p>
          </div>
        ) : filteredWithdrawals.length === 0 ? (
          <div className="text-center py-8">
            <FaMoneyBillWave className="text-dark-400 text-4xl mx-auto mb-4" />
            <p className="text-dark-300">No withdrawal requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWithdrawals.map((withdrawal) => (
              <div
                key={withdrawal._id}
                className="bg-dark-700 rounded-lg p-4 border border-dark-600"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(withdrawal.status)}
                    <div>
                      <p className="text-white font-medium">৳{withdrawal.amount.toLocaleString()}</p>
                      <p className="text-dark-300 text-sm">
                        {withdrawal.user.username} ({withdrawal.user.phoneNumber})
                      </p>
                      <p className="text-dark-300 text-sm">
                        {withdrawal.paymentMethod}: {withdrawal.paymentNumber}
                      </p>
                      <p className="text-dark-400 text-xs">
                        {new Date(withdrawal.createdAt).toLocaleDateString()} at{' '}
                        {new Date(withdrawal.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                      {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                    </span>
                    
                    {withdrawal.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            setActionType('approve');
                            setShowActionModal(true);
                          }}
                          className="btn-primary text-xs px-3 py-1"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            setActionType('reject');
                            setShowActionModal(true);
                          }}
                          className="btn-outline text-xs px-3 py-1"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    
                    {withdrawal.status === 'approved' && (
                      <button
                        onClick={() => {
                          setSelectedWithdrawal(withdrawal);
                          setActionType('complete');
                          setShowActionModal(true);
                        }}
                        className="btn-secondary text-xs px-3 py-1"
                      >
                        Complete
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setSelectedWithdrawal(withdrawal);
                        setActionType('view');
                        setShowActionModal(true);
                      }}
                      className="btn-outline text-xs px-3 py-1"
                    >
                      <FaEye />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {withdrawalsData?.pagination && withdrawalsData.pagination.pages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex gap-2">
              {Array.from({ length: withdrawalsData.pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1 rounded ${
                    pageNum === page
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-600 text-dark-300 hover:text-white'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Action Modal */}
      {showActionModal && selectedWithdrawal && (
        <div className="modal-overlay" onClick={() => setShowActionModal(false)}>
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
                  {actionType === 'approve' && 'Approve Withdrawal'}
                  {actionType === 'reject' && 'Reject Withdrawal'}
                  {actionType === 'complete' && 'Complete Withdrawal'}
                  {actionType === 'view' && 'Withdrawal Details'}
                </h2>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="text-dark-300 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Withdrawal Details */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-dark-300">Amount:</span>
                  <span className="text-white font-medium">৳{selectedWithdrawal.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">User:</span>
                  <span className="text-white">{selectedWithdrawal.user.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">Phone:</span>
                  <span className="text-white">{selectedWithdrawal.user.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">Method:</span>
                  <span className="text-white">{selectedWithdrawal.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">Number:</span>
                  <span className="text-white">{selectedWithdrawal.paymentNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedWithdrawal.status)}`}>
                    {selectedWithdrawal.status.charAt(0).toUpperCase() + selectedWithdrawal.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Admin Notes */}
              {actionType !== 'view' && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this action..."
                    className="input-field w-full h-20 resize-none"
                  />
                </div>
              )}

              {/* Action Buttons */}
              {actionType !== 'view' && (
                <div className="flex gap-3 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowActionModal(false)}
                    className="btn-outline flex-1"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAction}
                    disabled={isProcessing}
                    className={`flex-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                      actionType === 'approve' ? 'btn-primary' :
                      actionType === 'reject' ? 'btn-outline' : 'btn-secondary'
                    }`}
                  >
                    {isProcessing ? 'Processing...' : 
                      actionType === 'approve' ? 'Approve' :
                      actionType === 'reject' ? 'Reject' : 'Complete'
                    }
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Withdrawals;
