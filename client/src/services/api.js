import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors (avoid aggressive logout on transient 401s)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    // Only force logout on explicit auth endpoints; otherwise surface error
    if (status === 401 && error.config?.url?.includes('/auth')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Auth API
export const authAPI = {
  // Sign up new user
  signup: (userData) => 
    api.post('/auth/signup', userData),
  
  // Login with email or username and password
  login: (identifier, password) => 
    api.post('/auth/login', { identifier, password }),
  
  // Verify email with OTP
  verifyEmail: (email, verificationCode) => 
    api.post('/auth/verify-email', { email, verificationCode }),
  
  // Forgot password - send reset code to email
  forgotPassword: (email) => 
    api.post('/auth/forgot-password', { email }),
  
  // Reset password with code via email
  resetPassword: (email, resetCode, newPassword) => 
    api.post('/auth/reset-password', { email, resetCode, newPassword }),
  
  resendVerification: (email) => 
    api.post('/auth/resend-verification', { email }),
  
  // Get current user
  getCurrentUser: () => 
    api.get('/auth/me'),
  
  // Update profile
  updateProfile: (profileData) => 
    api.put('/auth/profile', profileData),
  // Upload avatar
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/auth/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Change password
  changePassword: (currentPassword, newPassword) => 
    api.put('/auth/change-password', { currentPassword, newPassword }),
};

// Games API
export const gamesAPI = {
  getAvailableGames: () => 
    api.get('/games/available'),
  
  getGameStats: (gameId) => 
    api.get(`/games/stats/${gameId}`),
  
  getUserGameStats: (gameId) => 
    api.get(`/games/user-stats/${gameId}`),
  
  getLeaderboard: (gameId) => 
    api.get(`/games/leaderboard/${gameId}`),
};

// Challenges API
export const challengesAPI = {
  getChallenges: (page = 1, limit = 10, game = '', status = '') => 
    api.get('/challenges', { params: { page, limit, game, status } }),
  
  getMyChallenges: (page = 1, limit = 10, status = '') => 
    api.get('/challenges/my-challenges', { params: { page, limit, status } }),
  
  getAdminChallenges: (page = 1, limit = 10, game = '') => 
    api.get('/challenges/admin-challenges', { params: { page, limit, game } }),
  
  getChallenge: (challengeId) => 
    api.get(`/challenges/${challengeId}`),
  
  createChallenge: (challengeData) => 
    api.post('/challenges', challengeData),
  
  acceptChallenge: (challengeId) => 
    api.post(`/challenges/${challengeId}/accept`),
  
  submitResult: (challengeId, resultData) => 
    api.post(`/challenges/${challengeId}/result`, resultData),
  
  extendChallenge: (challengeId, hours = 24) => 
    api.post(`/challenges/${challengeId}/extend`, { hours }),
  
  cancelChallenge: (challengeId) => 
    api.post(`/challenges/${challengeId}/cancel`),
  
  startMatch: (challengeId, roomCode) => 
    api.post(`/challenges/${challengeId}/start`, { roomCode }),
  
  disputeMatch: (challengeId, reason) => 
    api.post(`/challenges/${challengeId}/dispute`, { reason })
};

// Payment API
export const paymentsAPI = {
  // Get bKash number for deposits
  getBkashNumber: () => api.get('/payments/bkash-number'),
  
  // Submit payment request with screenshot
  submitPayment: (formData) => api.post('/payments/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Get user's payment history
  getMyPayments: (params = {}) => api.get('/payments/my-payments', { params }),
  
  // Get specific payment details
  getPayment: (paymentId) => api.get(`/payments/${paymentId}`),
  
  // Download payment screenshot
  downloadScreenshot: (paymentId) => api.get(`/payments/${paymentId}/screenshot`, {
    responseType: 'blob'
  })
};

// Withdrawal API
export const withdrawalsAPI = {
  // Get user's withdrawal history
  getMyWithdrawals: () => api.get('/withdrawals/my-withdrawals'),
  
  // Create withdrawal request
  requestWithdrawal: (withdrawalData) => api.post('/withdrawals/request', withdrawalData),
  
  // Get withdrawal details
  getWithdrawal: (withdrawalId) => api.get(`/withdrawals/${withdrawalId}`),
  
  // Cancel withdrawal request
  cancelWithdrawal: (withdrawalId) => api.delete(`/withdrawals/${withdrawalId}`)
};

// Helpline API
export const helplineAPI = {
  getMessages: () => 
    api.get('/helpline/messages'),
  
  sendMessage: (message, messageType = 'text', attachment = null) => 
    api.post('/helpline/send', { message, messageType, attachment }),
  sendWithAttachment: (message, file, messageType) => {
    const formData = new FormData();
    formData.append('message', message);
    if (messageType) formData.append('messageType', messageType);
    formData.append('attachment', file);
    return api.post('/helpline/send-with-attachment', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  markAsRead: () => 
    api.put('/helpline/mark-read'),
  // clearAll removed to preserve history
};

// Admin API
export const adminAPI = {
  // Dashboard
  getDashboard: (timeRange = '7d') => api.get(`/admin/dashboard?timeRange=${timeRange}`),
  getRecentActivities: () => api.get('/admin/recent-activities'),
  
  // Users
  getUsers: (page = 1, limit = 10, search = '') => 
    api.get(`/admin/users?page=${page}&limit=${limit}&search=${search}`),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  blockUser: (userId) => api.put(`/admin/users/${userId}`, { isBlocked: true }),
  unblockUser: (userId) => api.put(`/admin/users/${userId}`, { isBlocked: false }),
  
  // Payment Management
  getPayments: (page = 1, limit = 10, filters = {}) => 
    api.get('/admin/payments', { params: { page, limit, ...filters } }),
  
  getPayment: (paymentId) => 
    api.get(`/admin/payments/${paymentId}`),
  
  approvePayment: (paymentId, notes = '') => 
    api.post(`/admin/payments/${paymentId}/approve`, { notes }),
  
  rejectPayment: (paymentId, notes = '') => 
    api.post(`/admin/payments/${paymentId}/reject`, { notes }),
  
  markPaymentAsRead: (paymentId) => 
    api.post(`/admin/payments/${paymentId}/read`),
  
  getPaymentStats: () => 
    api.get('/admin/payments/stats/overview'),
  
  // System Settings
  getSystemSettings: () => api.get('/admin/settings'),
  getSystemSetting: (key) => api.get(`/admin/settings/${key}`),
  updateSystemSetting: (key, data) => api.put(`/admin/settings/${key}`, data),
  deleteSystemSetting: (key) => api.delete(`/admin/settings/${key}`),
  testSystemSettings: () => api.get('/admin/settings-test'),
  
  // Challenges
  getChallenges: (page = 1, limit = 10, status = '') => 
    api.get(`/admin/challenges?page=${page}&limit=${limit}&status=${status}`),
  startMatch: (challengeId, roomCode) => 
    api.post(`/admin/challenges/${challengeId}/start-match`, { roomCode }),
  provideRoomCode: (challengeId, roomCode) => 
    api.post(`/admin/challenges/${challengeId}/provide-room-code`, { roomCode }),
  updateRoomCode: (challengeId, roomCode) => 
    api.put(`/admin/challenges/${challengeId}/room-code`, { roomCode }),
  resolveDispute: (challengeId, winnerId, adminNotes = '') => 
    api.post(`/admin/challenges/${challengeId}/resolve-dispute`, { winnerId, adminNotes }),
  
  // Helpline
  getConversations: (page = 1, limit = 10) => 
    api.get(`/admin/helpline/conversations?page=${page}&limit=${limit}`),
  getUserMessages: (userId) => api.get(`/admin/helpline/user/${userId}`),
  respondToUser: (userId, message) => 
    api.post(`/admin/helpline/respond`, { userId, message }),
  getUnreadCount: () => api.get('/admin/helpline/unread-count'),
  
  // Statistics
  getGameStats: (gameId) => api.get(`/admin/games/${gameId}/stats`),
  getUserStats: (userId) => api.get(`/admin/users/${userId}/stats`),
  getPlatformStats: () => api.get('/admin/platform/stats'),
  
  // Manual Operations
  addBalance: (userId, amount, notes = '') => 
    api.post(`/admin/users/${userId}/balance`, { amount, notes }),
  deductBalance: (userId, amount, notes = '') => 
    api.post(`/admin/users/${userId}/balance/deduct`, { amount, notes }),
  createChallenge: (challengeData) => 
    api.post('/admin/challenges', challengeData),
  
  // Withdrawal Management
  getWithdrawals: (page = 1, limit = 10, status = '') => 
    api.get(`/admin/withdrawals?page=${page}&limit=${limit}&status=${status}`),
  getWithdrawal: (withdrawalId) => 
    api.get(`/admin/withdrawals/${withdrawalId}`),
  approveWithdrawal: (arg1, notes = '') => {
    const { withdrawalId, notes: n } = typeof arg1 === 'object' && arg1 !== null 
      ? arg1 
      : { withdrawalId: arg1, notes };
    return api.post(`/admin/withdrawals/${withdrawalId}/approve`, { notes: n || '' });
  },
  rejectWithdrawal: (arg1, notes = '') => {
    const { withdrawalId, notes: n } = typeof arg1 === 'object' && arg1 !== null 
      ? arg1 
      : { withdrawalId: arg1, notes };
    return api.post(`/admin/withdrawals/${withdrawalId}/reject`, { notes: n || '' });
  },
  completeWithdrawal: (arg1, notes = '') => {
    const { withdrawalId, notes: n } = typeof arg1 === 'object' && arg1 !== null 
      ? arg1 
      : { withdrawalId: arg1, notes };
    return api.post(`/admin/withdrawals/${withdrawalId}/complete`, { notes: n || '' });
  },
  markWithdrawalAsRead: (withdrawalId) => 
    api.post(`/admin/withdrawals/${withdrawalId}/read`),
  getWithdrawalStats: () => 
    api.get('/admin/withdrawals/stats/overview'),
  
  // System
  getSystemInfo: () => api.get('/admin/system/info'),
  getLogs: (page = 1, limit = 50, level = '') => 
    api.get(`/admin/system/logs?page=${page}&limit=${limit}&level=${level}`),
  clearLogs: () => api.delete('/admin/system/logs'),
  
  // Backup & Export
  exportData: (type, format = 'json') => 
    api.get(`/admin/export/${type}?format=${format}`),
  createBackup: () => api.post('/admin/backup'),
  getBackups: () => api.get('/admin/backups'),
  restoreBackup: (backupId) => api.post(`/admin/backups/${backupId}/restore`),
  
  // Notifications
  sendNotification: (userId, title, message, type = 'info') => 
    api.post('/admin/notifications/send', { userId, title, message, type }),
  sendBroadcast: (title, message, type = 'info', filters = {}) => 
    api.post('/admin/notifications/broadcast', { title, message, type, filters }),
  getNotificationHistory: (page = 1, limit = 20) => 
    api.get(`/admin/notifications/history?page=${page}&limit=${limit}`)
};

// File upload helper
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.url;
};

export default api;
