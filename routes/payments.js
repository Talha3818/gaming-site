const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Payment = require('../models/Payment');
const multer = require('multer');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// Configure multer to store files in memory for Cloudinary upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get bKash number for deposits
router.get('/bkash-number', async (req, res) => {
  try {
    // Try to get from system settings first, fallback to environment variable
    let bKashNumber = process.env.BKASH_NUMBER || '01XXXXXXXXX';
    
    try {
      const SystemSettings = require('../models/SystemSettings');
      const setting = await SystemSettings.findOne({ key: 'bkash_deposit_number' });
      if (setting && setting.value) {
        bKashNumber = setting.value;
      }
    } catch (settingsError) {
      console.log('System settings not available, using environment variable');
    }
    
    res.json({ bKashNumber });
  } catch (error) {
    console.error('Get bKash number error:', error);
    res.status(500).json({ message: 'Error fetching bKash number' });
  }
});

// Submit payment request with screenshot
router.post('/submit', auth, upload.single('screenshot'), async (req, res) => {
  try {
    const { amount, transactionId, bKashNumber } = req.body;

    // Validate required fields
    if (!amount || !transactionId || !bKashNumber) {
      return res.status(400).json({ 
        message: 'Amount, transaction ID, and bKash number are required' 
      });
    }

    // Validate amount
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 10 || numAmount > 50000) {
      return res.status(400).json({ 
        message: 'Amount must be between ৳10 and ৳50,000' 
      });
    }

    // Validate transaction ID format (basic validation)
    if (transactionId.length < 5 || transactionId.length > 50) {
      return res.status(400).json({ 
        message: 'Transaction ID must be between 5 and 50 characters' 
      });
    }

    // Check if screenshot was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        message: 'Screenshot is required' 
      });
    }

    // Check if transaction ID already exists
    const existingPayment = await Payment.findOne({ transactionId });
    if (existingPayment) {
      return res.status(400).json({ 
        message: 'Transaction ID already exists' 
      });
    }

    // Upload screenshot to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(req.file, 'payments');

    // Create payment request
    const payment = new Payment({
      user: req.user.userId,
      amount: numAmount,
      transactionId,
      bKashNumber,
      screenshot: {
        url: cloudinaryResult.url,
        public_id: cloudinaryResult.public_id,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });

    await payment.save();

    // Emit socket event for admin notification
    try {
      const io = req.app.get('io');
      if (io) {
        io.to('admin').emit('new-payment-request', {
          payment: await payment.populate('user', 'username phoneNumber')
        });
      }
    } catch (socketError) {
      console.log('Socket notification failed:', socketError);
      // Continue with the response even if socket fails
    }

    res.status(201).json({
      message: 'Payment request submitted successfully',
      payment: {
        id: payment._id,
        amount: payment.amount,
        transactionId: payment.transactionId,
        status: payment.status,
        createdAt: payment.createdAt
      }
    });
  } catch (error) {
    console.error('Submit payment error:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      // Cloudinary handles cleanup internally if upload was successful
    }
    
    res.status(500).json({ message: 'Error submitting payment request' });
  }
});

// Get user's payment history
router.get('/my-payments', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { user: req.user.userId };
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my payments error:', error);
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

// Get specific payment details
router.get('/:paymentId', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('user', 'username phoneNumber')
      .populate('processedBy', 'username');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user owns this payment or is admin
    if (payment.user._id.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Error fetching payment' });
  }
});

// Download payment screenshot
router.get('/:paymentId/screenshot', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user owns this payment or is admin
    if (payment.user.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!payment.screenshot || !payment.screenshot.url) {
      return res.status(404).json({ message: 'Screenshot not found' });
    }

    res.redirect(payment.screenshot.url); // Redirect to Cloudinary URL
  } catch (error) {
    console.error('Download screenshot error:', error);
    res.status(500).json({ message: 'Error downloading screenshot' });
  }
});

module.exports = router;
