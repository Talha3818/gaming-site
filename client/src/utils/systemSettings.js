import { adminAPI } from '../services/api';

// Cache for system settings
let settingsCache = null;
let cacheExpiry = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get a system setting value by key
 * @param {string} key - The setting key
 * @param {*} defaultValue - Default value if setting not found
 * @returns {*} The setting value or default value
 */
export const getSystemSetting = async (key, defaultValue = null) => {
  try {
    // Check cache first
    if (settingsCache && cacheExpiry && Date.now() < cacheExpiry) {
      const setting = settingsCache.find(s => s.key === key);
      return setting ? setting.value : defaultValue;
    }

    // Fetch from API if cache expired or doesn't exist
    const response = await adminAPI.getSystemSettings();
    settingsCache = response.data;
    cacheExpiry = Date.now() + CACHE_DURATION;

    const setting = settingsCache.find(s => s.key === key);
    return setting ? setting.value : defaultValue;
  } catch (error) {
    console.error(`Error fetching system setting ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Get multiple system settings at once
 * @param {string[]} keys - Array of setting keys
 * @returns {Object} Object with key-value pairs
 */
export const getMultipleSystemSettings = async (keys) => {
  try {
    // Check cache first
    if (settingsCache && cacheExpiry && Date.now() < cacheExpiry) {
      const result = {};
      keys.forEach(key => {
        const setting = settingsCache.find(s => s.key === key);
        result[key] = setting ? setting.value : null;
      });
      return result;
    }

    // Fetch from API if cache expired or doesn't exist
    const response = await adminAPI.getSystemSettings();
    settingsCache = response.data;
    cacheExpiry = Date.now() + CACHE_DURATION;

    const result = {};
    keys.forEach(key => {
      const setting = settingsCache.find(s => s.key === key);
      result[key] = setting ? setting.value : null;
    });
    return result;
  } catch (error) {
    console.error('Error fetching multiple system settings:', error);
    return keys.reduce((acc, key) => ({ ...acc, [key]: null }), {});
  }
};

/**
 * Clear the settings cache (useful after updates)
 */
export const clearSettingsCache = () => {
  settingsCache = null;
  cacheExpiry = null;
};

/**
 * Get commonly used settings
 */
export const getCommonSettings = async () => {
  const keys = [
    'bkash_deposit_number',
    'site_name',
    'support_email',
    'maintenance_mode'
  ];
  
  return await getMultipleSystemSettings(keys);
};

/**
 * Check if maintenance mode is enabled
 */
export const isMaintenanceMode = async () => {
  return await getSystemSetting('maintenance_mode', false);
};

/**
 * Get the bKash deposit number
 */
export const getBkashDepositNumber = async () => {
  return await getSystemSetting('bkash_deposit_number', '');
};

/**
 * Get the site name
 */
export const getSiteName = async () => {
  return await getSystemSetting('site_name', 'Gaming Challenge Platform');
};

/**
 * Get the support email
 */
export const getSupportEmail = async () => {
  return await getSystemSetting('support_email', 'support@gamingplatform.com');
};
