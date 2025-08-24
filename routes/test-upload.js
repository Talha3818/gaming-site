const express = require('express');
const multer = require('multer');
const { uploadToCloudinary } = require('../config/cloudinary');

const router = express.Router();

// Test route for Cloudinary upload
const testUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/test-upload', testUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file, 'test');
    
    res.json({
      message: 'Upload successful',
      result
    });
  } catch (error) {
    console.error('Test upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

module.exports = router;
