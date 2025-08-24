const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const makeAdmin = async (phoneNumber) => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gaming-platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find user by phone number
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      console.log('❌ User not found with phone number:', phoneNumber);
      return;
    }

    // Make user admin
    user.isAdmin = true;
    await user.save();

    console.log('✅ Successfully made user admin:');
    console.log('   Phone Number:', user.phoneNumber);
    console.log('   Username:', user.username);
    console.log('   Admin Status:', user.isAdmin);

  } catch (error) {
    console.error('❌ Error making user admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Get phone number from command line argument
const phoneNumber = process.argv[2];

if (!phoneNumber) {
  console.log('❌ Please provide a phone number');
  console.log('Usage: node scripts/makeAdmin.js <phone_number>');
  console.log('Example: node scripts/makeAdmin.js 01712345678');
  process.exit(1);
}

makeAdmin(phoneNumber);
