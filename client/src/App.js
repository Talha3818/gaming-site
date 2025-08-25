import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { HelplineProvider } from './contexts/HelplineContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Games from './pages/Games';
import GameDetail from './pages/GameDetail';
import Challenges from './pages/Challenges';
import ChallengeDetail from './pages/ChallengeDetail';
import Profile from './pages/Profile';
import Payments from './pages/Payments';
import Helpline from './pages/Helpline';
import TestUpload from './components/TestUpload';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminChallenges from './pages/admin/Challenges';
import AdminPayments from './pages/admin/Payments';
import AdminWithdrawals from './pages/admin/Withdrawals';
import AdminHelpline from './pages/admin/Helpline';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Main App Content
const AppContent = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <Navbar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/:gameId" element={<GameDetail />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/challenges/:challengeId" element={<ChallengeDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/helpline" element={<Helpline />} />
            <Route path="/test-upload" element={<TestUpload />} />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminUsers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/challenges" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminChallenges />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/payments" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminPayments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/withdrawals" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminWithdrawals />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/helpline" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminHelpline />
                </ProtectedRoute>
              } 
            />
            
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <HelplineProvider>
          <AppContent />
        </HelplineProvider>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
