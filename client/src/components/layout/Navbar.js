import React from 'react';
import { motion } from 'framer-motion';
import { FaCoins, FaHeadset, FaUser, FaSignOutAlt, FaBell } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useHelpline } from '../../contexts/HelplineContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useHelpline();

  const handleLogout = () => {
    logout();
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

          {/* Support Link */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <FaHeadset />
            <span>Support</span>
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
    </motion.nav>
  );
};

export default Navbar;
