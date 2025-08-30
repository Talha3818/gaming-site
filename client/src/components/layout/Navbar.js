import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCoins, FaHeadset, FaUser, FaSignOutAlt, FaBell, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useHelpline } from '../../contexts/HelplineContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useHelpline();
  const [showGameRules, setShowGameRules] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const openGameRules = () => {
    setShowGameRules(true);
  };

  const closeGameRules = () => {
    setShowGameRules(false);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 border-b border-dark-600 px-6 py-4 w-full"
    >
      <div className="flex items-center justify-between">
        {/* Left side - Balance and Support */}
        <div className="flex items-center gap-6">
          {/* Balance Display */}
          <div className="items-center gap-3 bg-dark-700 rounded-lg px-4 py-2 md:flex hidden">
            <FaCoins className="text-yellow-400" />
            <div>
              <p className="text-xs text-dark-300">Balance</p>
              <p className="text-yellow-400 font-bold text-lg">৳{user?.balance?.toLocaleString() || '0'}</p>
            </div>
          </div>

          {/* Game Rules Button */}
          <motion.button
            onClick={openGameRules}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <span>Game Rules</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </motion.button>
        </div>

        {/* Right side - User Menu */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors duration-200 md:block hidden"
          >
            <FaBell size={20} />
            {/* Add notification badge here if needed */}
          </motion.button>

          {/* User Menu */}
          <div className="relative group">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="font-medium">{user?.username || 'User'}</span>
              <FaUser className="text-dark-300" />
            </motion.button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-dark-700 border border-dark-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-white hover:bg-dark-600 transition-colors duration-200"
                >
                  <FaSignOutAlt className="text-red-400" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Rules Modal */}
      {showGameRules && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">🎮 Game Rules</h2>
              <button
                onClick={closeGameRules}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-yellow-800 mb-2">সতর্কবার্তা</h3>
                    <div className="text-sm text-yellow-700 leading-relaxed">
                      <p className="mb-3">
                        আপনি যে ম্যাচে জয়েন দিবেন আপনার ম্যাচের ওই সময় থেকে ৫ মিনিট ওয়েট করা হবে না আসতে পারলে আপনি ম্যাচ লস করবেন।
                      </p>
                      <p className="mb-3">
                        এবং যে উপস্থিত থাকবেন ৫ মিনিট পার হওয়ার পর উপরে সময়সহ স্ক্রিনশট এডমিনের কাছে জমা দিবেন।
                      </p>
                      <p className="mb-3">
                        প্রতিপক্ষ না আসলে বিরতি টাইম উইড্রো এবং এসএমএস দেওয়া থেকে বিরত থাকুন।
                      </p>
                      <p className="mb-3">
                        ম্যাচ জনিত যে কোন সমস্যা দ্রুত যোগাযোগ করুন অন্যথায় গ্রহণযোগ্য হবে না।
                      </p>
                      <p className="font-semibold">ধন্যবাদ</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Rules Section */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <h4 className="text-lg font-medium text-blue-800 mb-3">📋 Important Reminders</h4>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li>• Be ready 5 minutes before match time</li>
                  <li>• Submit screenshots with timestamp after 5 minutes</li>
                  <li>• Contact admin immediately for any match issues</li>
                  <li>• Avoid withdrawal requests during match time</li>
                  <li>• Follow fair play rules strictly</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeGameRules}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                বুঝেছি (I Understand)
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;
