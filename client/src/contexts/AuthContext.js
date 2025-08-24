import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Check if user is authenticated on app load
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          if (!isMounted) return;
          setUser(response.user);
        } catch (error) {
          console.warn('Auth check failed (will keep token for retry):', error?.message || error);
          // Soft-fail: do not clear token immediately to avoid logout loops on transient errors
        }
      }
      if (isMounted) setLoading(false);
    };

    checkAuth();
    return () => { isMounted = false; };
  }, [token]);

  // Sign up new user
  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Login with phone and password
  const login = async (identifier, password) => {
    try {
      const response = await authAPI.login(identifier, password);
      const { token: newToken, user: userData } = response;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Verify email (for new signups)
  const verifyEmail = async (email, verificationCode) => {
    try {
      const response = await authAPI.verifyEmail(email, verificationCode);
      const { token: newToken, user: userData } = response;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Forgot password - send reset code
  const forgotPassword = async (email) => {
    try {
      const response = await authAPI.forgotPassword(email);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Reset password with code
  const resetPassword = async (email, resetCode, newPassword) => {
    try {
      const response = await authAPI.resetPassword(email, resetCode, newPassword);
      const { token: newToken, user: userData } = response;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Resend verification code
  const resendVerification = async (email) => {
    try {
      const response = await authAPI.resendVerification(email);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authAPI.changePassword(currentPassword, newPassword);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.user);
      return response.user;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    token,
    signup,
    login,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendVerification,
    updateProfile,
    changePassword,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
