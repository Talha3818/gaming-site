const mongoose = require('mongoose');
const SystemSettings = require('../models/SystemSettings');
require('dotenv').config();

const defaultSettings = [
  {
    key: 'bkash_deposit_number',
    value: process.env.BKASH_NUMBER || '01XXXXXXXXX',
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
  },
  {
    key: 'max_deposit_amount',
    value: 50000,
    description: 'Maximum deposit amount allowed',
    isEditable: true
  },
  {
    key: 'min_deposit_amount',
    value: 10,
    description: 'Minimum deposit amount required',
    isEditable: true
  },
  {
    key: 'max_withdrawal_amount',
    value: 100000,
    description: 'Maximum withdrawal amount allowed',
    isEditable: true
  },
  {
    key: 'min_withdrawal_amount',
    value: 50,
    description: 'Minimum withdrawal amount required',
    isEditable: true
  }
];

async function initializeSystemSettings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Initialize each setting
    for (const setting of defaultSettings) {
      try {
        const existingSetting = await SystemSettings.findOne({ key: setting.key });
        
        if (existingSetting) {
          console.log(`Setting ${setting.key} already exists, skipping...`);
        } else {
          const newSetting = new SystemSettings(setting);
          await newSetting.save();
          console.log(`✅ Created setting: ${setting.key} = ${setting.value}`);
        }
      } catch (error) {
        console.error(`❌ Error creating setting ${setting.key}:`, error.message);
      }
    }

    console.log('\n🎉 System settings initialization completed!');
    
    // Display current settings
    console.log('\n📋 Current System Settings:');
    const allSettings = await SystemSettings.find().sort({ key: 1 });
    allSettings.forEach(setting => {
      console.log(`  ${setting.key}: ${setting.value} (${setting.description})`);
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the initialization
initializeSystemSettings();
