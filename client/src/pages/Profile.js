import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaPaperPlane, FaCamera } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const Profile = () => {
  const { user, updateProfile, refreshUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-4">Profile</h1>
        <p className="text-dark-300">Manage your account and view your statistics</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="gaming-card p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="relative w-20 h-20">
                    {user?.profilePicture ? (
          <img src={user.profilePicture} alt="avatar" className="w-20 h-20 rounded-full object-cover border border-dark-600" />
        ) : (
          <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center">
            <FaUser className="text-white text-2xl" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-dark-800 border border-dark-600 rounded-full p-2 cursor-pointer" title="Upload avatar">
              <FaCamera className="text-white text-sm" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  try {
                    await authAPI.uploadAvatar(file);
                    await refreshUser();
                  } finally {
                    setUploading(false);
                    e.target.value = '';
                  }
                }}
              />
            </label>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{user?.username}</h2>
            <p className="text-dark-300">{user?.phoneNumber}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-dark-700 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary-400">৳{user?.balance?.toLocaleString() || 0}</div>
            <div className="text-sm text-dark-300">Balance</div>
          </div>
          
          <div className="p-4 bg-dark-700 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400">{user?.totalWins || 0}</div>
            <div className="text-sm text-dark-300">Total Wins</div>
          </div>
          
          <div className="p-4 bg-dark-700 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-400">{user?.totalLosses || 0}</div>
            <div className="text-sm text-dark-300">Total Losses</div>
          </div>
          
          <div className="p-4 bg-dark-700 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-400">{user?.winRate || 0}%</div>
            <div className="text-sm text-dark-300">Win Rate</div>
          </div>
        </div>
      </motion.div>

      {/* Edit Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="gaming-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Edit Profile</h2>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            try {
              await updateProfile({ username: username.trim(), email: email.trim() });
            } catch (err) {
              // handled by interceptor UI
            } finally {
              setSaving(false);
            }
          }}
        >
          <div>
            <label className="block text-sm text-dark-300 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field w-full"
              minLength={3}
              maxLength={20}
              required
            />
            <p className="text-xs text-dark-400 mt-1">Usernames are unique across the platform.</p>
          </div>
          <div>
            <label className="block text-sm text-dark-300 mb-1">Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full"
              placeholder="you@example.com"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving || uploading}>
              <FaPaperPlane /> Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
