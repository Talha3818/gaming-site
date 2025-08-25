import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCog, FaSave, FaTrash, FaPlus, FaEdit, FaEye } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SystemSettings = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);
  const [newSetting, setNewSetting] = useState({ key: '', value: '', description: '' });
  const queryClient = useQueryClient();

  // Fetch system settings
  const { data: settings, isLoading, error } = useQuery(
    ['admin-system-settings'],
    adminAPI.getSystemSettings,
    {
      refetchInterval: 30000,
    }
  );

  // Update setting mutation
  const updateSettingMutation = useMutation(
    adminAPI.updateSystemSetting,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-system-settings']);
        setEditingSetting(null);
      },
    }
  );

  // Delete setting mutation
  const deleteSettingMutation = useMutation(
    adminAPI.deleteSystemSetting,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-system-settings']);
      },
    }
  );

  // Add new setting mutation
  const addSettingMutation = useMutation(
    adminAPI.updateSystemSetting,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-system-settings']);
        setShowAddModal(false);
        setNewSetting({ key: '', value: '', description: '' });
      },
    }
  );

  const handleEdit = (setting) => {
    setEditingSetting(setting);
  };

  const handleSave = async (key, data) => {
    try {
      await updateSettingMutation.mutateAsync({ key, data });
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const handleDelete = async (key) => {
    if (window.confirm('Are you sure you want to delete this setting?')) {
      try {
        await deleteSettingMutation.mutateAsync(key);
      } catch (error) {
        console.error('Error deleting setting:', error);
      }
    }
  };

  const handleAdd = async () => {
    if (!newSetting.key || !newSetting.value) {
      alert('Key and value are required');
      return;
    }
    try {
      await addSettingMutation.mutateAsync({ key: newSetting.key, data: newSetting });
    } catch (error) {
      console.error('Error adding setting:', error);
    }
  };

  const getDefaultSettings = () => [
    {
      key: 'bkash_deposit_number',
      value: '',
      description: 'bKash number for deposits',
      isEditable: true
    },
    {
      key: 'site_name',
      value: 'Gaming Challenge Platform',
      description: 'Website name',
      isEditable: true
    },
    {
      key: 'support_email',
      value: 'support@gamingplatform.com',
      description: 'Support email address',
      isEditable: true
    },
    {
      key: 'maintenance_mode',
      value: false,
      description: 'Maintenance mode (true/false)',
      isEditable: true
    }
  ];

  const initializeDefaultSettings = async () => {
    const defaultSettings = getDefaultSettings();
    for (const setting of defaultSettings) {
      const existingSetting = settings?.find(s => s.key === setting.key);
      if (!existingSetting) {
        try {
          await addSettingMutation.mutateAsync({ key: setting.key, data: setting });
        } catch (error) {
          console.error(`Error initializing ${setting.key}:`, error);
        }
      }
    }
  };

  useEffect(() => {
    if (settings && settings.length === 0) {
      initializeDefaultSettings();
    }
  }, [settings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading System Settings..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">Error loading system settings: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">System Settings</h1>
          <p className="text-dark-300">Manage platform configuration and settings</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus />
          Add Setting
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settings?.map((setting) => (
          <motion.div
            key={setting.key}
            className="bg-dark-700 border border-dark-600 rounded-lg p-6"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">{setting.key}</h3>
                <p className="text-dark-300 text-sm mb-3">{setting.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(setting)}
                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-dark-600 rounded"
                >
                  <FaEdit size={16} />
                </button>
                {setting.isEditable && (
                  <button
                    onClick={() => handleDelete(setting.key)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-dark-600 rounded"
                  >
                    <FaTrash size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {editingSetting?.key === setting.key ? (
                <div className="space-y-3">
                  {typeof setting.value === 'boolean' ? (
                    <select
                      value={editingSetting.value}
                      onChange={(e) => setEditingSetting({
                        ...editingSetting,
                        value: e.target.value === 'true'
                      })}
                      className="w-full input-field bg-dark-600 border-dark-500 text-white"
                    >
                      <option value={true}>True</option>
                      <option value={false}>False</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editingSetting.value}
                      onChange={(e) => setEditingSetting({
                        ...editingSetting,
                        value: e.target.value
                      })}
                      className="w-full input-field bg-dark-600 border-dark-500 text-white"
                      placeholder="Enter value"
                    />
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(setting.key, editingSetting)}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                      disabled={updateSettingMutation.isLoading}
                    >
                      <FaSave />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingSetting(null)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-dark-600 rounded p-3">
                    <p className="text-dark-300 text-xs mb-1">Current Value</p>
                    <p className="text-white font-mono">
                      {typeof setting.value === 'boolean' ? (
                        <span className={`px-2 py-1 rounded text-xs ${
                          setting.value ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          {setting.value ? 'True' : 'False'}
                        </span>
                      ) : (
                        setting.value || 'Not set'
                      )}
                    </p>
                  </div>
                  <div className="text-xs text-dark-400">
                    Last updated: {new Date(setting.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Setting Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            className="bg-dark-800 border border-dark-600 rounded-lg p-6 w-full max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h3 className="text-xl font-bold text-white mb-4">Add New Setting</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-dark-300 text-sm mb-2">Setting Key</label>
                <input
                  type="text"
                  value={newSetting.key}
                  onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
                  className="w-full input-field bg-dark-700 border-dark-600 text-white"
                  placeholder="e.g., bkash_deposit_number"
                />
              </div>
              <div>
                <label className="block text-dark-300 text-sm mb-2">Value</label>
                <input
                  type="text"
                  value={newSetting.value}
                  onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
                  className="w-full input-field bg-dark-700 border-dark-600 text-white"
                  placeholder="Enter value"
                />
              </div>
              <div>
                <label className="block text-dark-300 text-sm mb-2">Description</label>
                <input
                  type="text"
                  value={newSetting.description}
                  onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
                  className="w-full input-field bg-dark-700 border-dark-600 text-white"
                  placeholder="Brief description of this setting"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAdd}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={addSettingMutation.isLoading}
              >
                <FaSave />
                Add Setting
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-dark-700 border border-dark-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => {
              const bkashSetting = settings?.find(s => s.key === 'bkash_deposit_number');
              if (bkashSetting) {
                setEditingSetting(bkashSetting);
              } else {
                setNewSetting({
                  key: 'bkash_deposit_number',
                  value: '',
                  description: 'bKash number for deposits'
                });
                setShowAddModal(true);
              }
            }}
            className="p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors"
          >
            <div className="text-blue-400 text-center">
              <FaCog size={24} className="mx-auto mb-2" />
              <p className="text-sm font-medium">Manage bKash Number</p>
            </div>
          </button>
          
          <button
            onClick={() => {
              const siteNameSetting = settings?.find(s => s.key === 'site_name');
              if (siteNameSetting) {
                setEditingSetting(siteNameSetting);
              }
            }}
            className="p-4 bg-green-600/20 border border-green-500/30 rounded-lg hover:bg-green-600/30 transition-colors"
          >
            <div className="text-green-400 text-center">
              <FaEdit size={24} className="mx-auto mb-2" />
              <p className="text-sm font-medium">Edit Site Name</p>
            </div>
          </button>
          
          <button
            onClick={() => {
              const supportEmailSetting = settings?.find(s => s.key === 'support_email');
              if (supportEmailSetting) {
                setEditingSetting(supportEmailSetting);
              }
            }}
            className="p-4 bg-purple-600/20 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition-colors"
          >
            <div className="text-purple-400 text-center">
              <FaEdit size={24} className="mx-auto mb-2" />
              <p className="text-sm font-medium">Edit Support Email</p>
            </div>
          </button>
          
          <button
            onClick={() => {
              const maintenanceSetting = settings?.find(s => s.key === 'maintenance_mode');
              if (maintenanceSetting) {
                setEditingSetting(maintenanceSetting);
              }
            }}
            className="p-4 bg-orange-600/20 border border-orange-500/30 rounded-lg hover:bg-orange-600/30 transition-colors"
          >
            <div className="text-orange-400 text-center">
              <FaCog size={24} className="mx-auto mb-2" />
              <p className="text-sm font-medium">Toggle Maintenance</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
