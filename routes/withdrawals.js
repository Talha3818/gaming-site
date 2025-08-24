const express = require('express');
const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's withdrawal history
router.get('/my-withdrawals', auth, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .populate('processedBy', 'username');

    res.json({ withdrawals });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create withdrawal request
router.post('/request', auth, async (req, res) => {
  try {
    const { amount, paymentMethod, paymentNumber } = req.body;

    // Validate input
    if (!amount || !paymentMethod || !paymentNumber) {
      return res.status(400).json({ message: 'Amount, payment method, and payment number are required' });
    }

    if (amount < 50) {
      return res.status(400).json({ message: 'Minimum withdrawal amount is ৳50' });
    }

    if (!['bKash', 'Nagad'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method. Use bKash or Nagad' });
    }

    // Validate payment number format
    const paymentNumberRegex = /^(\+880|880|0)?1[3-9]\d{8}$/;
    if (!paymentNumberRegex.test(paymentNumber)) {
      return res.status(400).json({ message: 'Invalid payment number format' });
    }

    // Check user balance
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Check if user has pending withdrawal
    const pendingWithdrawal = await Withdrawal.findOne({
      user: req.user.userId,
      status: 'pending'
    });

    if (pendingWithdrawal) {
      return res.status(400).json({ message: 'You already have a pending withdrawal request' });
    }

    // Create withdrawal request
    const withdrawal = new Withdrawal({
      user: req.user.userId,
      amount,
      paymentMethod,
      paymentNumber
    });

    await withdrawal.save();

    // Deduct amount from user balance
    await user.updateBalance(-amount);

    // Emit socket event to admin
    try {
      const io = req.app.get('io');
      io.emit('new-withdrawal-request', {
        withdrawal: {
          id: withdrawal._id,
          user: {
            id: user._id,
            username: user.username,
            phoneNumber: user.phoneNumber
          },
          amount: withdrawal.amount,
          paymentMethod: withdrawal.paymentMethod,
          paymentNumber: withdrawal.paymentNumber,
          createdAt: withdrawal.createdAt
        }
      });
    } catch (socketError) {
      console.error('Socket emission failed:', socketError);
    }

    res.json({
      message: 'Withdrawal request submitted successfully',
      withdrawal: {
        id: withdrawal._id,
        amount: withdrawal.amount,
        paymentMethod: withdrawal.paymentMethod,
        paymentNumber: withdrawal.paymentNumber,
        status: withdrawal.status,
        createdAt: withdrawal.createdAt
      }
    });

  } catch (error) {
    console.error('Create withdrawal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get withdrawal details
router.get('/:withdrawalId', auth, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findOne({
      _id: req.params.withdrawalId,
      user: req.user.userId
    }).populate('processedBy', 'username');

    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    res.json({ withdrawal });
  } catch (error) {
    console.error('Get withdrawal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel withdrawal request (only if pending)
router.delete('/:withdrawalId', auth, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findOne({
      _id: req.params.withdrawalId,
      user: req.user.userId,
      status: 'pending'
    });

    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found or cannot be cancelled' });
    }

    // Refund amount to user balance
    const user = await User.findById(req.user.userId);
    if (user) {
      await user.updateBalance(withdrawal.amount);
    }

    await withdrawal.remove();

    res.json({ message: 'Withdrawal request cancelled successfully' });

  } catch (error) {
    console.error('Cancel withdrawal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
