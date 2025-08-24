import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaSearch, FaEdit, FaBan, FaUnlock, FaCrown, FaUserSlash, FaEye, FaCoins } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceNotes, setBalanceNotes] = useState('');
  const [isAddingBalance, setIsAddingBalance] = useState(true);

  const queryClient = useQueryClient();

  // Fetch users
  const { data: usersData, isLoading, error } = useQuery(
    ['admin-users', currentPage, searchTerm],
    () => adminAPI.getUsers(currentPage, 10, searchTerm),
    {
      keepPreviousData: true,
    }
  );

  // Mutations
  const updateUserMutation = useMutation(adminAPI.updateUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('User updated successfully');
      setShowUserModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error updating user');
    }
  });

  const balanceMutation = useMutation(
    (data) => data.mode === 'add'
      ? adminAPI.addBalance(data.userId, data.amount, data.notes)
      : adminAPI.deductBalance(data.userId, data.amount, data.notes),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-users']);
        toast.success(`Balance ${isAddingBalance ? 'added' : 'deducted'} successfully`);
        setShowBalanceModal(false);
        setBalanceAmount('');
        setBalanceNotes('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error updating balance');
      }
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleUpdateUser = (userData) => {
    updateUserMutation.mutate({ userId: selectedUser._id, userData });
  };

  const handleBalanceUpdate = () => {
    if (!balanceAmount || isNaN(balanceAmount)) {
      toast.error('Please enter a valid amount');
      return;
    }

    const amount = Number(balanceAmount);
    balanceMutation.mutate({
      userId: selectedUser._id,
      amount,
      notes: balanceNotes,
      mode: isAddingBalance ? 'add' : 'deduct'
    });
  };

  const toggleUserStatus = (user) => {
    const updateData = { isBlocked: !user.isBlocked };
    updateUserMutation.mutate({ userId: user._id, userData: updateData });
  };

  const toggleAdminStatus = (user) => {
    const updateData = { isAdmin: !user.isAdmin };
    updateUserMutation.mutate({ userId: user._id, userData: updateData });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading Users..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">Error loading users: {error.message}</p>
        </div>
      </div>
    );
  }

  const { users, pagination } = usersData || { users: [], pagination: {} };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-dark-300">Manage platform users and their accounts</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{pagination.total || 0}</div>
            <div className="text-sm text-dark-300">Total Users</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
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
                placeholder="Search by username, phone number, or email..."
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

      {/* Users Table */}
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
                <th className="text-left p-3 text-white font-medium">User</th>
                <th className="text-left p-3 text-white font-medium">Contact</th>
                <th className="text-left p-3 text-white font-medium">Balance</th>
                <th className="text-left p-3 text-white font-medium">Stats</th>
                <th className="text-left p-3 text-white font-medium">Status</th>
                <th className="text-left p-3 text-white font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-dark-700 hover:bg-dark-700/50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                        <FaUsers className="text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{user.username}</div>
                        <div className="text-sm text-dark-300">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">
                      <div className="text-white">{user.phoneNumber}</div>
                      {user.email && <div className="text-dark-300">{user.email}</div>}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <FaCoins className="text-yellow-400" />
                      <span className="font-medium text-white">৳{user.balance?.toLocaleString() || 0}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">
                      <div className="text-white">
                        Wins: {user.totalWins || 0} | Losses: {user.totalLosses || 0}
                      </div>
                      <div className="text-dark-300">
                        Win Rate: {user.winRate || 0}%
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {user.isAdmin && (
                        <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full flex items-center gap-1">
                          <FaCrown />
                          Admin
                        </span>
                      )}
                      {user.isBlocked ? (
                        <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full flex items-center gap-1">
                          <FaBan />
                          Blocked
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full flex items-center gap-1">
                          <FaUnlock />
                          Active
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded"
                        title="Edit User"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowBalanceModal(true);
                        }}
                        className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded"
                        title="Manage Balance"
                      >
                        <FaCoins />
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user)}
                        className={`p-2 rounded ${
                          user.isBlocked
                            ? 'text-green-400 hover:text-green-300 hover:bg-green-400/10'
                            : 'text-red-400 hover:text-red-300 hover:bg-red-400/10'
                        }`}
                        title={user.isBlocked ? 'Unblock User' : 'Block User'}
                      >
                        {user.isBlocked ? <FaUnlock /> : <FaBan />}
                      </button>
                      <button
                        onClick={() => toggleAdminStatus(user)}
                        className={`p-2 rounded ${
                          user.isAdmin
                            ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-400/10'
                            : 'text-purple-400 hover:text-purple-300 hover:bg-purple-400/10'
                        }`}
                        title={user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                      >
                        <FaCrown />
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
              Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} users
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

      {/* Edit User Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-content max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Edit User: {selectedUser.username}</h3>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white">Username</label>
                <input
                  type="text"
                  defaultValue={selectedUser.username}
                  className="input-field w-full"
                  id="edit-username"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-white">Email</label>
                <input
                  type="email"
                  defaultValue={selectedUser.email || ''}
                  className="input-field w-full"
                  id="edit-email"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const username = document.getElementById('edit-username').value;
                    const email = document.getElementById('edit-email').value;
                    handleUpdateUser({ username, email });
                  }}
                  className="btn-primary flex-1"
                >
                  Update User
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Balance Management Modal */}
      {showBalanceModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowBalanceModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-content max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Manage Balance: {selectedUser.username}</h3>
              <p className="text-dark-300">Current Balance: ৳{selectedUser.balance?.toLocaleString() || 0}</p>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white">Operation</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsAddingBalance(true)}
                    className={`px-3 py-2 rounded text-sm ${
                      isAddingBalance
                        ? 'bg-green-600 text-white'
                        : 'bg-dark-600 text-dark-300 hover:bg-dark-500'
                    }`}
                  >
                    Add Balance
                  </button>
                  <button
                    onClick={() => setIsAddingBalance(false)}
                    className={`px-3 py-2 rounded text-sm ${
                      !isAddingBalance
                        ? 'bg-red-600 text-white'
                        : 'bg-dark-600 text-dark-300 hover:bg-dark-500'
                    }`}
                  >
                    Deduct Balance
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-white">Amount (৳)</label>
                <input
                  type="number"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  min="1"
                  step="1"
                  className="input-field w-full"
                  placeholder="Enter amount"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-white">Notes (Optional)</label>
                <textarea
                  value={balanceNotes}
                  onChange={(e) => setBalanceNotes(e.target.value)}
                  className="input-field w-full"
                  rows="3"
                  placeholder="Reason for balance change..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowBalanceModal(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBalanceUpdate}
                  className={`btn-primary flex-1 ${
                    isAddingBalance ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isAddingBalance ? 'Add Balance' : 'Deduct Balance'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
