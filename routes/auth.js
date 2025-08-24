const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { sendOTPEmail, sendWelcomeEmail } = require('../config/email');

const router = express.Router();

// Configure multer to store files in memory for Cloudinary upload
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});


// Generate verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification code (mock implementation - replace with actual SMS service)
const sendVerificationCode = async (phoneNumber, code) => {
  // In production, integrate with Twilio or similar SMS service
  console.log(`Verification code ${code} sent to ${phoneNumber}`);
  return true;
};

// Send password reset code (mock implementation - replace with actual SMS service)
const sendPasswordResetCode = async (phoneNumber, code) => {
  // In production, integrate with Twilio or similar SMS service
  console.log(`Password reset code ${code} sent to ${phoneNumber}`);
  return true;
};

// Sign up new user
router.post('/signup', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Email, username, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    
    // Create new user with verification code
    const user = new User({
      email,
      username,
      password,
      verificationCode,
      isVerified: false
    });

    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, verificationCode, 'verification');
      res.json({ 
        message: 'Account created successfully. Please check your email for verification code.',
        email: user.email,
        requiresVerification: true
      });
    } catch (emailError) {
      // If email fails, still create user but inform about email issue
      console.error('Email sending failed:', emailError);
      res.json({ 
        message: 'Account created but verification email failed. Please contact support.',
        email: user.email,
        requiresVerification: true,
        emailError: true
      });
    }

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login with phone and password
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or username

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/Username and password are required' });
    }

    // Find user by email or username
    const user = await User.findOne({ 
      $or: [{ email: identifier.toLowerCase() }, { username: identifier }]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account is blocked. Please contact support.' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email before logging in. Check your email for verification code.',
        requiresVerification: true,
        email: user.email
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email/username or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        username: user.username,
        balance: user.balance,
        totalWins: user.totalWins,
        totalLosses: user.totalLosses,
        totalEarnings: user.totalEarnings,
        winRate: user.winRate,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify email (for new signups)
router.post('/verify-email', async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), verificationCode });

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Check if code is expired (5 minutes)
    const codeAge = Date.now() - user.updatedAt;
    if (codeAge > 5 * 60 * 1000) {
      return res.status(400).json({ message: 'Verification code expired' });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationCode = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(email, user.username);
    } catch (welcomeEmailError) {
      console.error('Welcome email failed:', welcomeEmailError);
      // Don't fail verification if welcome email fails
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        balance: user.balance,
        totalWins: user.totalWins,
        totalLosses: user.totalLosses,
        totalEarnings: user.totalEarnings,
        winRate: user.winRate,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot password - send reset code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate reset code
    const resetCode = generateVerificationCode();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await user.save();

    // Send reset code via email
    try {
      await sendOTPEmail(email, resetCode, 'reset');
      res.json({ 
        message: 'Password reset code sent to your email',
        email: user.email
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      res.status(500).json({ message: 'Failed to send reset code. Please try again.' });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password with code
router.post('/reset-password', async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ message: 'Email, reset code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      resetPasswordCode: resetCode 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }

    // Check if code is expired
    if (user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: 'Reset code has expired' });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    user.lastLogin = new Date();

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Password reset successfully',
      token,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        username: user.username,
        balance: user.balance,
        totalWins: user.totalWins,
        totalLosses: user.totalLosses,
        totalEarnings: user.totalEarnings,
        winRate: user.winRate,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend verification code
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    await user.save();

    // Send new OTP email
    try {
      await sendOTPEmail(email, verificationCode, 'verification');
      res.json({ 
        message: 'New verification code sent to your email',
        email: user.email
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      res.status(500).json({ message: 'Failed to send verification code. Please try again.' });
    }

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-verificationCode -resetPasswordCode');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        username: user.username,
        email: user.email,
        balance: user.balance,
        totalWins: user.totalWins,
        totalLosses: user.totalLosses,
        totalEarnings: user.totalEarnings,
        winRate: user.winRate,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, email, profilePicture } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }

    if (email) user.email = email;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    res.json({
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        username: user.username,
        email: user.email,
        balance: user.balance,
        totalWins: user.totalWins,
        totalLosses: user.totalLosses,
        totalEarnings: user.totalEarnings,
        winRate: user.winRate,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload avatar and update profilePicture
router.post('/profile/avatar', auth, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Avatar file is required' });
    }
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar from Cloudinary if it exists
    if (user.profilePicture && user.profilePicture.includes('cloudinary')) {
      const oldPublicId = user.profilePicture.split('/').pop().split('.')[0];
      await deleteFromCloudinary(oldPublicId);
    }

    // Upload new avatar to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(req.file, 'avatars');
    
    user.profilePicture = cloudinaryResult.url;
    await user.save();
    
    res.json({
      message: 'Avatar updated successfully',
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
