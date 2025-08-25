import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaHeadset, FaTelegramPlane, FaWhatsapp, FaFacebookMessenger, FaGlobe } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const { signup, login, verifyEmail, forgotPassword, resetPassword, resendVerification } = useAuth();
  
  // Form states
  const [activeTab, setActiveTab] = useState('login'); // login, signup, forgot-password, reset-password, verify-email
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    identifier: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    verificationCode: '',
    resetCode: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await signup({
        email: formData.email,
        username: formData.username,
        password: formData.password
      });
      
      if (response?.requiresVerification) {
        toast.success('Account created! Please check your email for verification code.');
        setActiveTab('verify-email');
        // Set the email in form data for verification
        setFormData(prev => ({ ...prev, email: response.email || formData.email }));
      } else {
        toast.success('Account created! You can now log in.');
        setActiveTab('login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      await login(formData.identifier, formData.password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      if (error?.requiresVerification) {
        toast.error('Please verify your email first');
        setActiveTab('verify-email');
        setFormData(prev => ({ ...prev, email: error.email }));
      } else {
        toast.error(error?.message || error.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.verificationCode) {
      toast.error('Please enter both email and verification code');
      return;
    }
    
    setLoading(true);
    try {
      await verifyEmail(formData.email, formData.verificationCode);
      toast.success('Email verified successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      await forgotPassword(formData.email);
      toast.success('Reset code sent to your email!');
      setActiveTab('reset-password');
    } catch (error) {
      toast.error(error.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(formData.email, formData.resetCode, formData.newPassword);
      toast.success('Password reset successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      toast.error('Please enter your email first');
      return;
    }
    
    try {
      await resendVerification(formData.email);
      toast.success('Verification code resent!');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to resend code');
    }
  };

  const renderLoginForm = () => (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleLogin}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email or Username
        </label>
        <input
          type="text"
          name="identifier"
          value={formData.identifier}
          onChange={handleInputChange}
          className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your email or username"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your password"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <div className="text-center space-y-2">
        <button
          type="button"
          onClick={() => setActiveTab('forgot-password')}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Forgot Password?
        </button>
        <div className="text-gray-600 text-sm">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Sign up
          </button>
        </div>
      </div>
    </motion.form>
  );

  const renderSignupForm = () => (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSignup}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your email"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Username
        </label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Choose a username"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your email"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Create a password (min 6 characters)"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Confirm your password"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>

      <div className="text-center">
        <div className="text-gray-600 text-sm">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Login
          </button>
        </div>
      </div>
    </motion.form>
  );

  const renderVerifyEmailForm = () => (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleVerifyEmail}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Email Verification
        </h3>
        <p className="text-gray-600 text-sm">
          Please check your email for the verification code and enter it below
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your email"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Verification Code
        </label>
        <input
          type="text"
          name="verificationCode"
          value={formData.verificationCode}
          onChange={handleInputChange}
          className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
          placeholder="Enter 6-digit code"
          maxLength="6"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
      >
        {loading ? 'Verifying...' : 'Verify'}
      </button>

      <div className="text-center space-y-2">
        <button
          type="button"
          onClick={handleResendVerification}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Didn't receive the code? Resend
        </button>
        <div>
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Back to Login
          </button>
        </div>
      </div>
    </motion.form>
  );

  const renderForgotPasswordForm = () => (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleForgotPassword}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Forgot Password
        </h3>
        <p className="text-gray-600 text-sm">
          Enter your email to receive a reset code
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your email"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-200 disabled:opacity-50"
      >
        {loading ? 'Sending Code...' : 'Send Reset Code'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setActiveTab('login')}
          className="text-gray-600 hover:text-gray-800 text-sm"
        >
          Back to Login
        </button>
      </div>
    </motion.form>
  );

  const renderResetPasswordForm = () => (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleResetPassword}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Reset Password
        </h3>
        <p className="text-gray-600 text-sm">
          Enter the reset code sent to {formData.email}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reset Code
        </label>
        <input
          type="text"
          name="resetCode"
          value={formData.resetCode}
          onChange={handleInputChange}
          className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
          placeholder="Enter 6-digit code"
          maxLength="6"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          New Password
        </label>
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleInputChange}
          className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter new password (min 6 characters)"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm New Password
        </label>
        <input
          type="password"
          name="confirmNewPassword"
          value={formData.confirmNewPassword}
          onChange={handleInputChange}
          className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Confirm new password"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
      >
        {loading ? 'Resetting Password...' : 'Reset Password'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setActiveTab('forgot-password')}
          className="text-gray-600 hover:text-gray-800 text-sm"
        >
          Back to Forgot Password
        </button>
      </div>
    </motion.form>
  );

  const renderForm = () => {
    switch (activeTab) {
      case 'signup':
        return renderSignupForm();
      case 'verify-email':
        return renderVerifyEmailForm();
      case 'forgot-password':
        return renderForgotPasswordForm();
      case 'reset-password':
        return renderResetPasswordForm();
      default:
        return renderLoginForm();
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Background wallpaper with game themes */}
      <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
        <img src="/images/games/ludo-king.png" alt="Ludo King" className="hidden md:block absolute -left-10 top-10 w-60 rotate-[-12deg]" />
        <img src="/images/games/free-fire.png" alt="Free Fire" className="hidden lg:block absolute right-0 top-1/4 w-80 rotate-[10deg]" />
        <img src="/images/games/pubg.png" alt="PUBG" className="hidden lg:block absolute left-1/3 bottom-0 w-96 rotate-[-6deg]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      </div>
      <div className="max-w-5xl w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <span className="text-3xl font-bold text-white">G</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Gaming Dreamer</h1>
          <p className="text-blue-200">Make your dream, show your gaming skills</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Tab Navigation */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            {activeTab !== 'verify-email' && activeTab !== 'forgot-password' && activeTab !== 'reset-password' && (
              <>
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'login'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'signup'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sign Up
                </button>
              </>
            )}
            {activeTab === 'verify-email' && (
              <button
                className="flex-1 py-2 px-4 rounded-md text-sm font-medium bg-white text-blue-600 shadow-sm"
              >
                Email Verification
              </button>
            )}
            {activeTab === 'forgot-password' && (
              <button
                className="flex-1 py-2 px-4 rounded-md text-sm font-medium bg-white text-blue-600 shadow-sm"
              >
                Forgot Password
              </button>
            )}
            {activeTab === 'reset-password' && (
              <button
                className="flex-1 py-2 px-4 rounded-md text-sm font-medium bg-white text-blue-600 shadow-sm"
              >
                Reset Password
              </button>
            )}
          </div>

          {/* Form */}
          {renderForm()}
          </div>

          {/* Helpline Panel */}
          <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <FaHeadset className="text-blue-300 text-2xl" />
              <h2 className="text-xl font-bold">Helpline & Support</h2>
            </div>
            <p className="text-blue-100 mb-6">
              Having trouble logging in? Reach us via any of the following channels.
            </p>
            <div className="grid grid-cols-1 gap-3">
              <a href="https://t.me/your_telegram" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition">
                <FaTelegramPlane className="text-blue-300" />
                <span>Telegram</span>
              </a>
              <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition">
                <FaWhatsapp className="text-green-300" />
                <span>WhatsApp</span>
              </a>
              <a href="https://m.me/your_facebook_page" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition">
                <FaFacebookMessenger className="text-blue-400" />
                <span>Facebook Messenger</span>
              </a>
              <a href="https://yourwebsite.example" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition">
                <FaGlobe className="text-yellow-300" />
                <span>Website</span>
              </a>
            </div>
            <p className="text-xs text-blue-200 mt-6">
              Tip: Once logged in, you can also use the in-site Helpline chat from your dashboard.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-blue-200 text-sm">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
