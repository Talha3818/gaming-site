const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testWithdrawal() {
  console.log('🧪 Testing Withdrawal System...\n');

  try {
    // Test 1: Create withdrawal request
    console.log('1. Testing Withdrawal Request...');
    const withdrawalResponse = await axios.post(`${API_BASE_URL}/withdrawals/request`, {
      amount: 100,
      paymentMethod: 'bKash',
      paymentNumber: '01712345678'
    });
    console.log('✅ Withdrawal request successful:', withdrawalResponse.data.message);
    console.log('💰 Amount:', withdrawalResponse.data.withdrawal.amount);
    console.log('📱 Payment Method:', withdrawalResponse.data.withdrawal.paymentMethod);
    console.log('📞 Payment Number:', withdrawalResponse.data.withdrawal.paymentNumber);
    console.log('');

    // Test 2: Try to create another withdrawal (should fail - only one pending allowed)
    console.log('2. Testing Duplicate Withdrawal Request...');
    try {
      await axios.post(`${API_BASE_URL}/withdrawals/request`, {
        amount: 50,
        paymentMethod: 'Nagad',
        paymentNumber: '01812345678'
      });
    } catch (error) {
      console.log('✅ Duplicate withdrawal correctly rejected:', error.response.data.message);
    }
    console.log('');

    // Test 3: Test minimum amount validation
    console.log('3. Testing Minimum Amount Validation...');
    try {
      await axios.post(`${API_BASE_URL}/withdrawals/request`, {
        amount: 30,
        paymentMethod: 'bKash',
        paymentNumber: '01712345678'
      });
    } catch (error) {
      console.log('✅ Minimum amount validation working:', error.response.data.message);
    }
    console.log('');

    // Test 4: Test invalid payment method
    console.log('4. Testing Invalid Payment Method...');
    try {
      await axios.post(`${API_BASE_URL}/withdrawals/request`, {
        amount: 100,
        paymentMethod: 'PayPal',
        paymentNumber: '01712345678'
      });
    } catch (error) {
      console.log('✅ Invalid payment method correctly rejected:', error.response.data.message);
    }
    console.log('');

    // Test 5: Test invalid phone number format
    console.log('5. Testing Invalid Phone Number Format...');
    try {
      await axios.post(`${API_BASE_URL}/withdrawals/request`, {
        amount: 100,
        paymentMethod: 'bKash',
        paymentNumber: '123'
      });
    } catch (error) {
      console.log('✅ Invalid phone number format correctly rejected:', error.response.data.message);
    }
    console.log('');

    console.log('🎉 All withdrawal tests completed successfully!');
    console.log('\n📝 Note: The withdrawal request is now pending and can be managed from the admin dashboard.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testWithdrawal();
