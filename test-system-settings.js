const mongoose = require('mongoose');
const SystemSettings = require('./models/SystemSettings');
require('dotenv').config();

async function testSystemSettings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gaming-platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Test 1: Check if SystemSettings collection exists
    console.log('\n🔍 Testing SystemSettings collection...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const hasSystemSettings = collections.some(col => col.name === 'systemsettings');
    console.log('SystemSettings collection exists:', hasSystemSettings);

    // Test 2: Check current settings
    console.log('\n📋 Current System Settings:');
    const currentSettings = await SystemSettings.find().sort({ key: 1 });
    if (currentSettings.length === 0) {
      console.log('❌ No system settings found');
    } else {
      currentSettings.forEach(setting => {
        console.log(`  ${setting.key}: ${setting.value} (${setting.description})`);
      });
    }

    // Test 3: Check bKash setting specifically
    console.log('\n📱 Checking bKash setting...');
    const bkashSetting = await SystemSettings.findOne({ key: 'bkash_deposit_number' });
    if (bkashSetting) {
      console.log('✅ bKash setting found:', bkashSetting.value);
      console.log('  Description:', bkashSetting.description);
      console.log('  Last updated:', bkashSetting.updatedAt);
      console.log('  Is editable:', bkashSetting.isEditable);
    } else {
      console.log('❌ bKash setting not found');
      
      // Test 4: Create bKash setting if it doesn't exist
      console.log('\n🔧 Creating bKash setting...');
      const newBkashSetting = new SystemSettings({
        key: 'bkash_deposit_number',
        value: process.env.BKASH_NUMBER || '01XXXXXXXXX',
        description: 'bKash number for deposits',
        isEditable: true
      });
      
      await newBkashSetting.save();
      console.log('✅ bKash setting created successfully');
    }

    // Test 5: Test updating bKash setting
    console.log('\n✏️ Testing bKash setting update...');
    const testNumber = '01712345678';
    const bkashSettingToUpdate = await SystemSettings.findOne({ key: 'bkash_deposit_number' });
    
    if (bkashSettingToUpdate) {
      const oldValue = bkashSettingToUpdate.value;
      bkashSettingToUpdate.value = testNumber;
      await bkashSettingToUpdate.save();
      console.log(`✅ bKash setting updated: ${oldValue} → ${testNumber}`);
      
      // Revert back to original value
      bkashSettingToUpdate.value = oldValue;
      await bkashSettingToUpdate.save();
      console.log(`✅ bKash setting reverted: ${testNumber} → ${oldValue}`);
    }

    // Test 6: Check environment variable
    console.log('\n🌍 Environment Variables:');
    console.log('BKASH_NUMBER:', process.env.BKASH_NUMBER || 'Not set');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

    console.log('\n🎉 System settings test completed successfully!');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testSystemSettings();
