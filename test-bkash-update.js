const mongoose = require('mongoose');
const SystemSettings = require('./models/SystemSettings');
require('dotenv').config();

async function testBkashUpdate() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gaming-platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Test 1: Check current bKash setting
    console.log('\n🔍 Checking current bKash setting...');
    let bkashSetting = await SystemSettings.findOne({ key: 'bkash_deposit_number' });
    
    if (bkashSetting) {
      console.log('📱 Current bKash setting:', bkashSetting.value);
      console.log('   Description:', bkashSetting.description);
      console.log('   Last updated:', bkashSetting.updatedAt);
    } else {
      console.log('❌ bKash setting not found, creating it...');
      bkashSetting = new SystemSettings({
        key: 'bkash_deposit_number',
        value: process.env.BKASH_NUMBER || '01XXXXXXXXX',
        description: 'bKash number for deposits',
        isEditable: true
      });
      await bkashSetting.save();
      console.log('✅ bKash setting created with value:', bkashSetting.value);
    }

    // Test 2: Update bKash setting
    console.log('\n✏️ Testing bKash setting update...');
    const testNumber = '01712345678';
    const oldValue = bkashSetting.value;
    
    bkashSetting.value = testNumber;
    await bkashSetting.save();
    console.log(`✅ bKash setting updated: ${oldValue} → ${testNumber}`);

    // Test 3: Verify the update
    const updatedSetting = await SystemSettings.findOne({ key: 'bkash_deposit_number' });
    console.log('🔍 Verification - Current value:', updatedSetting.value);

    // Test 4: Revert back to original value
    bkashSetting.value = oldValue;
    await bkashSetting.save();
    console.log(`✅ bKash setting reverted: ${testNumber} → ${oldValue}`);

    // Test 5: Check final state
    const finalSetting = await SystemSettings.findOne({ key: 'bkash_deposit_number' });
    console.log('🔍 Final state - Current value:', finalSetting.value);

    console.log('\n🎉 bKash update test completed successfully!');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testBkashUpdate();
