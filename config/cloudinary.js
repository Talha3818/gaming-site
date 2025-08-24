const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload file to Cloudinary
const uploadToCloudinary = async (file, folder = 'gaming-platform') => {
  try {
    // Convert buffer to base64 if file is a buffer
    let fileData = file;
    if (file.buffer) {
      fileData = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }

    const result = await cloudinary.uploader.upload(fileData, {
      folder: folder,
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mov', 'wmv'],
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

// Helper function to delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    // Don't throw error for delete failures as they're not critical
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary
};
