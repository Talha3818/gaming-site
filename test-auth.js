const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test 1: Sign up a new user
    console.log('1. Testing Sign Up...');
    const signupResponse = await axios.post(`${API_BASE_URL}/auth/signup`, {
      phoneNumber: '1234567890',
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com'
    });
    console.log('✅ Sign up successful:', signupResponse.data.message);
    console.log('📱 Phone number:', signupResponse.data.phoneNumber);
    console.log('🆕 Is new user:', signupResponse.data.isNewUser);
    console.log('');

    // Test 2: Try to sign up with same phone number (should fail)
    console.log('2. Testing Duplicate Phone Number...');
    try {
      await axios.post(`${API_BASE_URL}/auth/signup`, {
        phoneNumber: '1234567890',
        username: 'testuser2',
        password: 'password123',
        email: 'test2@example.com'
      });
    } catch (error) {
      console.log('✅ Duplicate phone number correctly rejected:', error.response.data.message);
    }
    console.log('');

    // Test 3: Try to sign up with same username (should fail)
    console.log('3. Testing Duplicate Username...');
    try {
      await axios.post(`${API_BASE_URL}/auth/signup`, {
        phoneNumber: '0987654321',
        username: 'testuser',
        password: 'password123',
        email: 'test3@example.com'
      });
    } catch (error) {
      console.log('✅ Duplicate username correctly rejected:', error.response.data.message);
    }
    console.log('');

    // Test 4: Try to login without verification (should fail)
    console.log('4. Testing Login Without Verification...');
    try {
      await axios.post(`${API_BASE_URL}/auth/login`, {
        phoneNumber: '1234567890',
        password: 'password123'
      });
    } catch (error) {
      console.log('✅ Login without verification correctly rejected:', error.response.data.message);
      console.log('🔍 Needs verification:', error.response.data.needsVerification);
    }
    console.log('');

    // Test 5: Forgot password
    console.log('5. Testing Forgot Password...');
    const forgotResponse = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
      phoneNumber: '1234567890'
    });
    console.log('✅ Forgot password successful:', forgotResponse.data.message);
    console.log('');

    // Test 6: Reset password (this will fail because we don't have the actual reset code)
    console.log('6. Testing Reset Password with Invalid Code...');
    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        phoneNumber: '1234567890',
        resetCode: '000000',
        newPassword: 'newpassword123'
      });
    } catch (error) {
      console.log('✅ Invalid reset code correctly rejected:', error.response.data.message);
    }
    console.log('');

    console.log('🎉 All authentication tests completed successfully!');
    console.log('\n📝 Note: Verification and reset codes are logged to the server console.');
    console.log('📝 To complete the full flow, check the server logs for the actual codes.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuth();
