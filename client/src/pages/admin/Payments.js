import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCoins, FaSearch, FaCheck, FaTimes, FaEye, FaFilter, FaDownload, FaClock, FaUser, FaMoneyBillWave } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminPayments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');

  const queryClient = useQueryClient();

  // Fetch payments
  const { data: paymentsData, isLoading, error } = useQuery(
    ['admin-payments', currentPage, statusFilter],
    () => adminAPI.getPayments(currentPage, 10, statusFilter),
    {
      keepPreviousData: true,
    }
  );

  // Mutations
  const approvePaymentMutation = useMutation(
    (data) => adminAPI.approvePayment(data.paymentId, data.notes),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-payments']);
        toast.success('Payment approved successfully');
        setShowApprovalModal(false);
        setApprovalNotes('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error approving payment');
      }
    }
  );

  const rejectPaymentMutation = useMutation(
    (data) => adminAPI.rejectPayment(data.paymentId, data.notes),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-payments']);
        toast.success('Payment rejected successfully');
        setShowRejectionModal(false);
        setRejectionNotes('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error rejecting payment');
      }
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleApprovePayment = () => {
    approvePaymentMutation.mutate({
      paymentId: selectedPayment._id,
      notes: approvalNotes
    });
  };

  const handleRejectPayment = () => {
    rejectPaymentMutation.mutate({
      paymentId: selectedPayment._id,
      notes: rejectionNotes
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'approved': return 'text-green-400 bg-green-400/10';
      case 'rejected': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const formatCurrency = (amount) => `৳${amount?.toLocaleString() || 0}`;
  const formatDate = (date) => new Date(date).toLocaleDateString();
  const formatTime = (date) => new Date(date).toLocaleTimeString();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading Payments..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">Error loading payments: {error.message}</p>
        </div>
      </div>
    );
  }

  const { payments, pagination } = paymentsData || { payments: [], pagination: {} };

  // Calculate summary statistics
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const approvedAmount = payments.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0);
  const rejectedAmount = payments.filter(p => p.status === 'rejected').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Payment Management</h1>
          <p className="text-dark-300">Review and manage payment requests from users</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{pagination.total || 0}</div>
            <div className="text-sm text-dark-300">Total Payments</div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="gaming-card p-6 text-center"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mx-auto mb-4">
            <FaMoneyBillWave className="text-3xl text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{formatCurrency(totalAmount)}</h3>
          <p className="text-dark-300">Total Amount</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="gaming-card p-6 text-center"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-full mx-auto mb-4">
            <FaClock className="text-3xl text-yellow-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{formatCurrency(pendingAmount)}</h3>
          <p className="text-dark-300">Pending Amount</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="gaming-card p-6 text-center"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mx-auto mb-4">
            <FaCheck className="text-3xl text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{formatCurrency(approvedAmount)}</h3>
          <p className="text-dark-300">Approved Amount</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="gaming-card p-6 text-center"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mx-auto mb-4">
            <FaTimes className="text-3xl text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{formatCurrency(rejectedAmount)}</h3>
          <p className="text-dark-300">Rejected Amount</p>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="gaming-card p-6"
      >
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                placeholder="Search by username, phone number, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-full pl-10"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button type="submit" className="btn-primary">
            <FaFilter className="mr-2" />
            Apply Filters
          </button>
          {(searchTerm || statusFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setCurrentPage(1);
              }}
              className="btn-outline"
            >
              Clear
            </button>
          )}
        </form>
      </motion.div>

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="gaming-card p-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left p-3 text-white font-medium">User</th>
                <th className="text-left p-3 text-white font-medium">Payment Details</th>
                <th className="text-left p-3 text-white font-medium">Amount</th>
                <th className="text-left p-3 text-white font-medium">Status</th>
                <th className="text-left p-3 text-white font-medium">Date</th>
                <th className="text-left p-3 text-white font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id} className="border-b border-dark-700 hover:bg-dark-700/50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                        <FaUser className="text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{payment.user?.username}</div>
                        <div className="text-sm text-dark-300">{payment.user?.phoneNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="text-dark-300">Transaction ID:</span>
                        <span className="text-white ml-2 font-mono">{payment.transactionId}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-dark-300">bKash Number:</span>
                        <span className="text-white ml-2">{payment.bKashNumber}</span>
                      </div>
                      {payment.screenshot && (
                        <div className="text-sm text-blue-400">
                          <FaEye className="inline mr-1" />
                          Screenshot attached
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-xl font-bold text-white">{formatCurrency(payment.amount)}</div>
                  </td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </span>
                    {payment.processedBy && (
                      <div className="text-xs text-dark-400 mt-1">
                        by Admin
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="text-sm text-dark-300">
                      {formatDate(payment.createdAt)}
                    </div>
                    <div className="text-xs text-dark-400">
                      {formatTime(payment.createdAt)}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {payment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowApprovalModal(true);
                            }}
                            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded"
                            title="Approve Payment"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowRejectionModal(true);
                            }}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded"
                            title="Reject Payment"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          // View payment details
                          console.log('View payment:', payment);
                        }}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded"
                        title="View Details"
                      >
                        <FaEye />
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
              Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} payments
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

      {/* Approval Modal */}
      {showApprovalModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowApprovalModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-content max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Approve Payment</h3>
              <p className="text-dark-300">
                Approving payment of <span className="text-white font-medium">{formatCurrency(selectedPayment.amount)}</span> from <span className="text-white font-medium">{selectedPayment.user?.username}</span>
              </p>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white">Notes (Optional)</label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="input-field w-full"
                  rows="3"
                  placeholder="Add approval notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprovePayment}
                  disabled={approvePaymentMutation.isLoading}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {approvePaymentMutation.isLoading ? 'Approving...' : 'Approve Payment'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowRejectionModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-content max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Reject Payment</h3>
              <p className="text-dark-300">
                Rejecting payment of <span className="text-white font-medium">{formatCurrency(selectedPayment.amount)}</span> from <span className="text-white font-medium">{selectedPayment.user?.username}</span>
              </p>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white">Reason for Rejection *</label>
                <textarea
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  className="input-field w-full"
                  rows="3"
                  placeholder="Please provide a reason for rejection..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRejectionModal(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectPayment}
                  disabled={!rejectionNotes.trim() || rejectPaymentMutation.isLoading}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rejectPaymentMutation.isLoading ? 'Rejecting...' : 'Reject Payment'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
