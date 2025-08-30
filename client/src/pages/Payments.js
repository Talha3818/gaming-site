import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCoins, FaUpload, FaHistory, FaCheckCircle, FaTimesCircle, FaClock, FaDownload, FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { paymentsAPI, withdrawalsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Payments = () => {
  const [activeTab, setActiveTab] = useState('deposits'); // 'deposits' or 'withdrawals'
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bKashNumber, setBkashNumber] = useState('');
  
  // Withdrawal form state
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [paymentNumber, setPaymentNumber] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch bKash number from system settings
  useEffect(() => {
    const fetchBkashNumber = async () => {
      try {
        const response = await paymentsAPI.getBkashNumber();
        setBkashNumber(response?.bKashNumber);
      } catch (error) {
        console.error('Error fetching bKash number:', error);
        setBkashNumber('01XXXXXXXXX'); // Fallback
      }
    };
    fetchBkashNumber();
  }, []);

  // Fetch payment history
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery(
    'my-payments',
    () => paymentsAPI.getMyPayments()
  );

  // Fetch withdrawal history
  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useQuery(
    'my-withdrawals',
    withdrawalsAPI.getMyWithdrawals
  );

  // Submit payment mutation
  const submitPaymentMutation = useMutation(paymentsAPI.submitPayment, {
    onSuccess: () => {
      toast.success('Payment request submitted successfully!');
      setShowDepositModal(false);
      resetForm();
      queryClient.invalidateQueries('my-payments');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error submitting payment request');
    }
  });

  // Submit withdrawal mutation
  const submitWithdrawalMutation = useMutation(withdrawalsAPI.requestWithdrawal, {
    onSuccess: () => {
      toast.success('Withdrawal request submitted successfully!');
      setShowWithdrawalModal(false);
      resetWithdrawalForm();
      queryClient.invalidateQueries('my-withdrawals');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error submitting withdrawal request');
    }
  });

  const resetForm = () => {
    setDepositAmount('');
    setTransactionId('');
    setSelectedFile(null);
  };

  const resetWithdrawalForm = () => {
    setWithdrawalAmount('');
    setPaymentMethod('bKash');
    setPaymentNumber('');
  };

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    
    if (!withdrawalAmount || !paymentNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = Number(withdrawalAmount);
    if (amount < 50) {
      toast.error('Minimum withdrawal amount is ৳50');
      return;
    }

    setIsWithdrawing(true);
    
    try {
      await submitWithdrawalMutation.mutateAsync({
        amount,
        paymentMethod,
        paymentNumber
      });
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!depositAmount || !transactionId || !selectedFile) {
      toast.error('Please fill in all fields and select a screenshot');
      return;
    }

    const amount = Number(depositAmount);
    if (amount < 10 || amount > 50000) {
      toast.error('Amount must be between ৳10 and ৳50,000');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('transactionId', transactionId);
      formData.append('bKashNumber', bKashNumber);
      formData.append('screenshot', selectedFile);

      await submitPaymentMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error submitting payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FaCheckCircle className="text-green-400" />;
      case 'rejected':
        return <FaTimesCircle className="text-red-400" />;
      default:
        return <FaClock className="text-yellow-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-400';
      case 'rejected':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Payments</h1>
          <p className="text-dark-300 mt-2 text-sm md:text-base">Manage your deposits, withdrawals and view history</p>
        </div>
        
        <div className="flex gap-2 md:gap-3 mt-3 md:mt-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowWithdrawalModal(true)}
            className="btn-secondary flex items-center gap-1 md:gap-2 text-sm md:text-base"
          >
            <FaMoneyBillWave />
            Withdraw Money
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDepositModal(true)}
            className="btn-primary flex items-center gap-1 md:gap-2 text-sm md:text-base"
          >
            <FaCoins />
            Deposit Money
          </motion.button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex bg-dark-700 rounded-lg p-1"
      >
        <button
          onClick={() => setActiveTab('deposits')}
          className={`flex-1 py-2 px-3 md:px-4 rounded-md text-xs md:text-sm font-medium transition-all ${
            activeTab === 'deposits'
              ? 'bg-primary-500 text-white'
              : 'text-dark-300 hover:text-white'
          }`}
        >
          <FaCoins className="inline mr-1 md:mr-2" />
          Deposits
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`flex-1 py-2 px-3 md:px-4 rounded-md text-xs md:text-sm font-medium transition-all ${
            activeTab === 'withdrawals'
              ? 'bg-primary-500 text-white'
              : 'text-dark-300 hover:text-white'
          }`}
        >
          <FaMoneyBillWave className="inline mr-1 md:mr-2" />
          Withdrawals
        </button>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6"
      >
        <div className="gaming-card p-4 md:p-6 text-center">
          <FaCoins className="text-yellow-400 text-2xl md:text-3xl mx-auto mb-2 md:mb-3" />
          <h3 className="text-lg md:text-xl font-bold text-white">Total Deposits</h3>
          <p className="text-xl md:text-2xl font-bold text-yellow-400">
            ৳{paymentsData?.payments?.reduce((sum, p) => sum + (p.status === 'approved' ? p.amount : 0), 0) || 0}
          </p>
        </div>
        
        <div className="gaming-card p-4 md:p-6 text-center">
          <FaMoneyBillWave className="text-green-400 text-2xl md:text-3xl mx-auto mb-2 md:mb-3" />
          <h3 className="text-lg md:text-xl font-bold text-white">Total Withdrawals</h3>
          <p className="text-xl md:text-2xl font-bold text-green-400">
            ৳{withdrawalsData?.withdrawals?.reduce((sum, w) => sum + (w.status === 'completed' ? w.amount : 0), 0) || 0}
          </p>
        </div>
        
        <div className="gaming-card p-4 md:p-6 text-center">
          <FaClock className="text-blue-400 text-2xl md:text-3xl mx-auto mb-2 md:mb-3" />
          <h3 className="text-lg md:text-xl font-bold text-white">Pending</h3>
          <p className="text-xl md:text-2xl font-bold text-blue-400">
            {(paymentsData?.payments?.filter(p => p.status === 'pending').length || 0) + 
             (withdrawalsData?.withdrawals?.filter(w => w.status === 'pending').length || 0)}
          </p>
        </div>
        
        <div className="gaming-card p-4 md:p-6 text-center">
          <FaCheckCircle className="text-green-400 text-2xl md:text-3xl mx-auto mb-2 md:mb-3" />
          <h3 className="text-lg md:text-xl font-bold text-white">Completed</h3>
          <p className="text-xl md:text-2xl font-bold text-green-400">
            {(paymentsData?.payments?.filter(p => p.status === 'approved').length || 0) + 
             (withdrawalsData?.withdrawals?.filter(w => w.status === 'completed').length || 0)}
          </p>
        </div>
      </motion.div>

      {/* Payment History */}
      {activeTab === 'deposits' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="gaming-card p-4 md:p-6"
        >
        <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaHistory />
          Payment History
        </h2>
        
        {paymentsLoading ? (
          <div className="text-center py-6 md:py-8">
            <div className="loading-spinner mx-auto mb-3 md:mb-4"></div>
            <p className="text-dark-300 text-sm md:text-base">Loading payment history...</p>
          </div>
        ) : paymentsData?.payments?.length === 0 ? (
          <div className="text-center py-6 md:py-8">
            <FaCoins className="text-dark-400 text-3xl md:text-4xl mx-auto mb-3 md:mb-4" />
            <p className="text-dark-300 text-sm md:text-base">No payment history found</p>
            <p className="text-dark-400 text-xs md:text-sm">Make your first deposit to get started</p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {paymentsData?.payments?.map((payment) => (
              <div
                key={payment._id}
                className="bg-dark-700 rounded-lg p-3 md:p-4 border border-dark-600"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    {getStatusIcon(payment.status)}
                    <div>
                      <p className="text-white font-medium text-sm md:text-base">৳{payment.amount.toLocaleString()}</p>
                      <p className="text-dark-300 text-xs md:text-sm">
                        Transaction ID: {payment.transactionId}
                      </p>
                      <p className="text-dark-400 text-xs">
                        {new Date(payment.createdAt).toLocaleDateString()} at{' '}
                        {new Date(payment.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)} bg-dark-600`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                    {payment.adminNotes && (
                      <p className="text-dark-300 text-xs mt-2 max-w-xs">
                        {payment.adminNotes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </motion.div>
      )}

      {/* Withdrawal History */}
      {activeTab === 'withdrawals' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="gaming-card p-4 md:p-6"
        >
          <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaMoneyBillWave />
            Withdrawal History
          </h2>
          
          {withdrawalsLoading ? (
            <div className="text-center py-6 md:py-8">
              <div className="loading-spinner mx-auto mb-3 md:mb-4"></div>
              <p className="text-dark-300 text-sm md:text-base">Loading withdrawal history...</p>
            </div>
          ) : withdrawalsData?.withdrawals?.length === 0 ? (
            <div className="text-center py-6 md:py-8">
              <FaMoneyBillWave className="text-dark-400 text-3xl md:text-4xl mx-auto mb-3 md:mb-4" />
              <p className="text-dark-300 text-sm md:text-base">No withdrawal history found</p>
              <p className="text-dark-400 text-xs md:text-sm">Make your first withdrawal request to get started</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {withdrawalsData?.withdrawals?.map((withdrawal) => (
                <div
                  key={withdrawal._id}
                  className="bg-dark-700 rounded-lg p-3 md:p-4 border border-dark-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4">
                      {getStatusIcon(withdrawal.status)}
                      <div>
                        <p className="text-white font-medium text-sm md:text-base">৳{withdrawal.amount.toLocaleString()}</p>
                        <p className="text-dark-300 text-xs md:text-sm">
                          {withdrawal.paymentMethod}: {withdrawal.paymentNumber}
                        </p>
                        <p className="text-dark-400 text-xs">
                          {new Date(withdrawal.createdAt).toLocaleDateString()} at{' '}
                          {new Date(withdrawal.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)} bg-dark-600`}>
                        {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                      </span>
                      {withdrawal.adminNotes && (
                        <p className="text-dark-300 text-xs mt-2 max-w-xs">
                          {withdrawal.adminNotes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="modal-overlay" onClick={() => setShowDepositModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-content max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold text-white">Deposit Money</h2>
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="text-dark-300 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>

              {/* bKash Information */}
              <div className="p-3 md:p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h3 className="text-blue-400 font-medium mb-2 text-sm md:text-base">Send money to this bKash number:</h3>
                <p className="text-xl md:text-2xl font-bold text-blue-400 text-center">{bKashNumber}</p>
                <p className="text-blue-300 text-xs md:text-sm text-center mt-2">
                  After sending money, please provide the transaction ID and screenshot below
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                {/* Amount */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-white mb-2">
                    Amount (৳)
                  </label>
                  <input
                    type="text"
                    value={depositAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      console.log('Input changed:', value);
                      setDepositAmount(value);
                    }}
                    placeholder="Enter amount (10-50,000)"
                    className="input-field w-full text-sm md:text-base"
                    required
                  />
                  {depositAmount && (
                    <p className="text-xs text-green-400 mt-1">
                      Entered amount: ৳{depositAmount}
                    </p>
                  )}
                  <p className="text-xs text-dark-300 mt-1">
                    Minimum: ৳10 | Maximum: ৳50,000
                  </p>
                </div>

                {/* Transaction ID */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-white mb-2">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter bKash transaction ID"
                    className="input-field w-full text-sm md:text-base"
                    required
                  />
                  <p className="text-xs text-dark-300 mt-1">
                    Enter the transaction ID from your bKash app
                  </p>
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-white mb-2">
                    Screenshot
                  </label>
                  <div className="border-2 border-dashed border-dark-600 rounded-lg p-3 md:p-4 text-center hover:border-primary-500 transition-colors">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="hidden"
                      id="screenshot-upload"
                      required
                    />
                    <label htmlFor="screenshot-upload" className="cursor-pointer">
                      {selectedFile ? (
                        <div className="space-y-2">
                          <FaUpload className="text-primary-400 text-xl md:text-2xl mx-auto" />
                          <p className="text-white font-medium text-sm md:text-base">{selectedFile.name}</p>
                          <p className="text-dark-300 text-xs md:text-sm">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <FaUpload className="text-dark-400 text-xl md:text-2xl mx-auto" />
                          <p className="text-white text-sm md:text-base">Click to upload screenshot</p>
                          <p className="text-dark-300 text-xs md:text-sm">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 md:gap-3 pt-3 md:pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDepositModal(false)}
                    className="btn-outline flex-1 text-sm md:text-base"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isSubmitting || !depositAmount || !transactionId || !selectedFile}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="modal-overlay" onClick={() => setShowWithdrawalModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-content max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold text-white">Withdraw Money</h2>
                <button
                  onClick={() => setShowWithdrawalModal(false)}
                  className="text-dark-300 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Information */}
              <div className="p-3 md:p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h3 className="text-green-400 font-medium mb-2 text-sm md:text-base">Withdrawal Information:</h3>
                <ul className="text-green-300 text-xs md:text-sm space-y-1">
                  <li>• Minimum withdrawal: ৳50</li>
                  <li>• Supported methods: bKash, Nagad</li>
                  <li>• Processing time: 24-48 hours</li>
                  <li>• You can only have one pending withdrawal at a time</li>
                </ul>
              </div>

              <form onSubmit={handleWithdrawalSubmit} className="space-y-3 md:space-y-4">
                {/* Amount */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-white mb-2">
                    Amount (৳)
                  </label>
                  <input
                    type="number"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    min="50"
                    step="10"
                    placeholder="Enter amount (min ৳50)"
                    className="input-field w-full text-sm md:text-base"
                    required
                  />
                  <p className="text-xs text-dark-300 mt-1">
                    Minimum: ৳50
                  </p>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-white mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="input-field w-full text-sm md:text-base"
                    required
                  >
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                  </select>
                </div>

                {/* Payment Number */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-white mb-2">
                    {paymentMethod} Number
                  </label>
                  <input
                    type="tel"
                    value={paymentNumber}
                    onChange={(e) => setPaymentNumber(e.target.value)}
                    placeholder={`Enter your ${paymentMethod} number`}
                    className="input-field w-full text-sm md:text-base"
                    required
                  />
                  <p className="text-xs text-dark-300 mt-1">
                    Enter your {paymentMethod} mobile number
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 md:gap-3 pt-3 md:pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowWithdrawalModal(false)}
                    className="btn-outline flex-1 text-sm md:text-base"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isWithdrawing || !withdrawalAmount || !paymentNumber}
                    className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                  >
                    {isWithdrawing ? 'Submitting...' : 'Submit Request'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Payments;
