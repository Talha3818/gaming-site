import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCog, FaSave, FaTrash, FaPlus, FaEdit, FaEye, FaPhone } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const SystemSettings = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);
  const [newSetting, setNewSetting] = useState({ key: '', value: '', description: '' });
  const [bkashNumber, setBkashNumber] = useState('');
  const [isUpdatingBkash, setIsUpdatingBkash] = useState(false);
  const queryClient = useQueryClient();

  // Fetch system settings
  const { data: settings, isLoading, error, refetch } = useQuery(
    ['admin-system-settings'],
    adminAPI.getSystemSettings,
    {
      refetchInterval: 30000,
      onSuccess: (data) => {
        console.log('✅ System settings loaded successfully:', data);
      },
      onError: (error) => {
        console.error('❌ Error loading system settings:', error);
      }
    }
  );

  // Update setting mutation
  const updateSettingMutation = useMutation(
    ({ key, data }) => adminAPI.updateSystemSetting(key, data),
    {
      onSuccess: (data, variables) => {
        console.log('✅ Setting updated successfully:', variables.key, data);
        queryClient.invalidateQueries(['admin-system-settings']);
        setEditingSetting(null);
        toast.success(`Setting "${variables.key}" updated successfully!`);
        
        // If it's the bKash number, update the local state
        if (variables.key === 'bkash_deposit_number') {
          setBkashNumber(variables.data.value);
        }
      },
      onError: (error, variables) => {
        console.error('❌ Error updating setting:', variables.key, error);
        toast.error(`Failed to update setting "${variables.key}": ${error.response?.data?.message || 'Unknown error'}`);
      }
    }
  );

  // Delete setting mutation
  const deleteSettingMutation = useMutation(
    adminAPI.deleteSystemSetting,
    {
      onSuccess: (data, variables) => {
        console.log('✅ Setting deleted successfully:', variables);
        queryClient.invalidateQueries(['admin-system-settings']);
        toast.success(`Setting "${variables}" deleted successfully!`);
      },
      onError: (error, variables) => {
        console.error('❌ Error deleting setting:', variables, error);
        toast.error(`Failed to delete setting "${variables}": ${error.response?.data?.message || 'Unknown error'}`);
      }
    }
  );

  // Add new setting mutation
  const addSettingMutation = useMutation(
    ({ key, data }) => adminAPI.updateSystemSetting(key, data),
    {
      onSuccess: (data, variables) => {
        console.log('✅ Setting added successfully:', variables.key, data);
        queryClient.invalidateQueries(['admin-system-settings']);
        setShowAddModal(false);
        setNewSetting({ key: '', value: '', description: '' });
        toast.success(`Setting "${variables.key}" added successfully!`);
      },
      onError: (error, variables) => {
        console.error('❌ Error adding setting:', variables.key, error);
        toast.error(`Failed to add setting "${variables.key}": ${error.response?.data?.message || 'Unknown error'}`);
      }
    }
  );

  // Update bKash number specifically
  const updateBkashNumber = async () => {
    console.log('🔄 Updating bKash number:', bkashNumber);
    
    if (!bkashNumber.trim()) {
      toast.error('Please enter a valid bKash number');
      return;
    }

    // Validate bKash number format (Bangladeshi mobile number)
    const bkashRegex = /^(\+880|880|0)?1[3-9]\d{8}$/;
    if (!bkashRegex.test(bkashNumber.trim())) {
      toast.error('Please enter a valid Bangladeshi mobile number');
      return;
    }

    setIsUpdatingBkash(true);
    try {
      console.log('📤 Sending bKash update request...');
      // Send data in the format expected by the backend
      await updateSettingMutation.mutateAsync({
        key: 'bkash_deposit_number',
        data: {
          value: bkashNumber.trim(),
          description: 'bKash number for deposits'
        }
      });
      console.log('✅ bKash number updated successfully');
    } catch (error) {
      console.error('❌ Error updating bKash number:', error);
    } finally {
      setIsUpdatingBkash(false);
    }
  };

  // Initialize bKash number from settings
  useEffect(() => {
    console.log('🔍 Initializing bKash number from settings:', settings);
    if (settings) {
      const bkashSetting = settings.find(s => s.key === 'bkash_deposit_number');
      if (bkashSetting) {
        console.log('📱 Found bKash setting:', bkashSetting.value);
        setBkashNumber(bkashSetting.value || '');
      } else {
        console.log('⚠️ bKash setting not found in settings');
      }
    }
  }, [settings]);

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
      toast.error('Key and value are required');
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
          <button 
            onClick={() => refetch()} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
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

      {/* bKash Number Management - Prominent Section */}
      <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <FaPhone className="text-blue-400" size={24} />
          <h3 className="text-xl font-semibold text-blue-400">bKash Number Management</h3>
        </div>
        <p className="text-blue-300 text-sm mb-4">
          This is the bKash number that users will see when making deposits. Make sure to enter a valid Bangladeshi mobile number.
        </p>
        
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-blue-300 text-sm mb-2">bKash Number</label>
            <input
              type="text"
              value={bkashNumber}
              onChange={(e) => setBkashNumber(e.target.value)}
              placeholder="e.g., 01712345678"
              className="w-full px-4 py-2 bg-dark-700 border border-blue-500/50 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
            <p className="text-blue-300/70 text-xs mt-1">
              Format: 01XXXXXXXXX (Bangladeshi mobile number)
            </p>
          </div>
          <div className="flex items-end">
            <button
              onClick={updateBkashNumber}
              disabled={isUpdatingBkash || !bkashNumber.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <FaSave />
              {isUpdatingBkash ? 'Updating...' : 'Update bKash Number'}
            </button>
          </div>
        </div>

        {settings && (
          <div className="mt-4 p-3 bg-dark-700/50 rounded border border-blue-500/20">
            <p className="text-blue-300 text-sm">
              <strong>Current bKash Number:</strong> {bkashNumber || 'Not set'}
            </p>
            <p className="text-blue-300/70 text-xs mt-1">
              Last updated: {settings.find(s => s.key === 'bkash_deposit_number')?.updatedAt ? 
                new Date(settings.find(s => s.key === 'bkash_deposit_number').updatedAt).toLocaleString() : 
                'Never'
              }
            </p>
          </div>
        )}
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
              <FaPhone size={24} className="mx-auto mb-2" />
              <p className="text-sm font-medium">Edit bKash Number</p>
            </div>
          </button>
          
          <button
            onClick={async () => {
              try {
                const testResult = await adminAPI.testSystemSettings();
                console.log('🧪 System settings test result:', testResult);
                toast.success('System settings test completed. Check console for details.');
              } catch (error) {
                console.error('❌ System settings test failed:', error);
                toast.error('System settings test failed. Check console for details.');
              }
            }}
            className="p-4 bg-yellow-600/20 border border-yellow-500/30 rounded-lg hover:bg-yellow-600/30 transition-colors"
          >
            <div className="text-yellow-400 text-center">
              <FaCog size={24} className="mx-auto mb-2" />
              <p className="text-sm font-medium">Test Settings</p>
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
