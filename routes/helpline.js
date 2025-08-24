const express = require('express');
const HelplineMessage = require('../models/HelplineMessage');
const multer = require('multer');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer to store files in memory for Cloudinary upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowed = ['image/', 'video/'];
    if (allowed.some(prefix => file.mimetype.startsWith(prefix))) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// Get user's helpline messages
router.get('/messages', auth, async (req, res) => {
  try {
    const messages = await HelplineMessage.find({ user: req.user.userId })
      .populate('adminId', 'username')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Get helpline messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message to helpline (supports text-only with attachment optional)
router.post('/send', auth, async (req, res) => {
  try {
    const { message, messageType = 'text', attachment } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const helplineMessage = new HelplineMessage({
      user: req.user.userId,
      message,
      messageType,
      attachment
    });

    await helplineMessage.save();

    const populatedMessage = await HelplineMessage.findById(helplineMessage._id)
      .populate('user', 'username phoneNumber');

    res.json(populatedMessage);
  } catch (error) {
    console.error('Send helpline message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload attachment then send message
router.post('/send-with-attachment', auth, upload.single('attachment'), async (req, res) => {
  try {
    const { message, messageType } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Attachment is required' });
    }
    
    // Upload attachment to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(req.file, 'helpline');
    
    const hlMessage = new HelplineMessage({
      user: req.user.userId,
      message,
      messageType: messageType || (req.file.mimetype.startsWith('image/') ? 'image' : 'video'),
      attachment: cloudinaryResult.url,
      attachmentPublicId: cloudinaryResult.public_id
    });
    
    await hlMessage.save();
    const populated = await HelplineMessage.findById(hlMessage._id)
      .populate('user', 'username phoneNumber');
    res.json(populated);
  } catch (error) {
    console.error('Send with attachment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.put('/mark-read', auth, async (req, res) => {
  try {
    await HelplineMessage.updateMany(
      { user: req.user.userId, isFromAdmin: true, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// (Disabled) Delete all messages for current user – not used to preserve history

// Admin: Get all helpline conversations
router.get('/admin/conversations', adminAuth, async (req, res) => {
  try {
    const conversations = await HelplineMessage.aggregate([
      {
        $group: {
          _id: '$user',
          lastMessage: { $last: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$isFromAdmin', false] }, { $eq: ['$isRead', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userId: '$_id',
          username: '$user.username',
          phoneNumber: '$user.phoneNumber',
          lastMessage: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get messages for a specific user
router.get('/admin/user/:userId', adminAuth, async (req, res) => {
  try {
    const messages = await HelplineMessage.find({ user: req.params.userId })
      .populate('user', 'username phoneNumber')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await HelplineMessage.updateMany(
      { user: req.params.userId, isFromAdmin: false, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json(messages);
  } catch (error) {
    console.error('Get user messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Send response to user
router.post('/admin/respond', adminAuth, async (req, res) => {
  try {
    const { userId, message, messageType = 'text', attachment } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ message: 'User ID and message are required' });
    }

    const helplineMessage = new HelplineMessage({
      user: userId,
      message,
      messageType,
      attachment,
      isFromAdmin: true,
      adminId: req.user.userId
    });

    await helplineMessage.save();

    const populatedMessage = await HelplineMessage.findById(helplineMessage._id)
      .populate('user', 'username phoneNumber')
      .populate('adminId', 'username');

    res.json(populatedMessage);
  } catch (error) {
    console.error('Admin respond error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get unread message count
router.get('/admin/unread-count', adminAuth, async (req, res) => {
  try {
    const unreadCount = await HelplineMessage.countDocuments({
      isFromAdmin: false,
      isRead: false
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
