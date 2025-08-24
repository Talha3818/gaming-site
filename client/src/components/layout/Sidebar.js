import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHome, 
  FaGamepad, 
  FaTrophy, 
  FaUser, 
  FaCreditCard, 
  FaHeadset,
  FaCog,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const { user } = useAuth();

  const navigationItems = [
    { to: '/dashboard', icon: FaHome, label: 'Dashboard', color: 'text-blue-400' },
    { to: '/games', icon: FaGamepad, label: 'Games', color: 'text-green-400' },
    { to: '/challenges', icon: FaTrophy, label: 'Challenges', color: 'text-yellow-400' },
    { to: '/profile', icon: FaUser, label: 'Profile', color: 'text-purple-400' },
    { to: '/payments', icon: FaCreditCard, label: 'Payments', color: 'text-orange-400' },
    { to: '/helpline', icon: FaHeadset, label: 'Helpline', color: 'text-red-400' }
  ];

  const adminItems = [
    { to: '/admin/dashboard', icon: FaCog, label: 'Admin Dashboard', color: 'text-indigo-400' },
    { to: '/admin/users', icon: FaUser, label: 'Manage Users', color: 'text-pink-400' },
    { to: '/admin/challenges', icon: FaTrophy, label: 'Manage Challenges', color: 'text-yellow-400' },
    { to: '/admin/payments', icon: FaCreditCard, label: 'Manage Payments', color: 'text-orange-400' },
    { to: '/admin/helpline', icon: FaHeadset, label: 'Manage Helpline', color: 'text-red-400' }
  ];

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={onToggle}
        className={`fixed top-4 left-4 z-50 p-2 rounded-full bg-dark-800 border border-dark-600 text-white hover:bg-dark-700 transition-colors duration-200 ${
          isCollapsed ? 'left-4' : 'left-64'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={false}
        animate={{ left: isCollapsed ? '1rem' : '16rem' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {isCollapsed ? <FaChevronRight size={16} /> : <FaChevronLeft size={16} />}
      </motion.button>

      {/* Sidebar */}
      <motion.div
        className={`fixed left-0 top-0 h-full bg-dark-800 border-r border-dark-600 z-40 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
        initial={false}
        animate={{ width: isCollapsed ? '4rem' : '16rem' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-4 border-b border-dark-600">
            <AnimatePresence mode="wait">
              {!isCollapsed ? (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">G</span>
                  </div>
                  <span className="text-xl font-bold text-white">Gaming Site</span>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">G</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-dark-600">
            <AnimatePresence mode="wait">
              {!isCollapsed ? (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{user?.username || 'User'}</p>
                      <p className="text-dark-300 text-sm truncate">{user?.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-3">
                    <p className="text-dark-300 text-xs">Balance</p>
                    <p className="text-yellow-400 font-bold text-lg">৳{user?.balance?.toLocaleString() || '0'}</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
                    </div>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-2 text-center">
                    <p className="text-yellow-400 font-bold text-sm">৳{user?.balance?.toLocaleString() || '0'}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-primary-500 text-white'
                        : 'text-dark-300 hover:bg-dark-700 hover:text-white'
                    }`
                  }
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              ))}
            </div>

            {/* Admin Section */}
            {user?.isAdmin && (
              <div className="pt-6 border-t border-dark-600">
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.h3
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3 px-3"
                    >
                      Admin Panel
                    </motion.h3>
                  )}
                </AnimatePresence>
                
                <div className="space-y-1">
                  {adminItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                          isActive
                            ? 'bg-indigo-500 text-white'
                            : 'text-dark-300 hover:bg-dark-700 hover:text-white'
                        }`
                      }
                    >
                      <item.icon size={20} className="flex-shrink-0" />
                      <AnimatePresence mode="wait">
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="font-medium"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
          </nav>
        </div>
      </motion.div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default Sidebar;
