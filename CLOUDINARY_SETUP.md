# Cloudinary Setup Guide

This guide will help you set up Cloudinary for image and video uploads instead of local storage.

## Prerequisites

1. A Cloudinary account (sign up at [cloudinary.com](https://cloudinary.com))
2. Node.js and npm installed

## Step 1: Get Cloudinary Credentials

1. Log in to your Cloudinary dashboard
2. Go to the "Dashboard" section
3. Copy your:
   - Cloud Name
   - API Key
   - API Secret

## Step 2: Update Environment Variables

1. Copy `.env.example` to `.env` (if you haven't already)
2. Add your Cloudinary credentials to `.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

**Note**: The `CLOUDINARY_UPLOAD_PRESET` is optional for server-side uploads but required for client-side uploads.

## Step 3: Install Dependencies

Run the following command in your project root:

```bash
npm install cloudinary
```

## Step 4: Test the Integration

1. Start your server: `npm run dev`
2. Navigate to `/test-upload` in your browser
3. Try uploading an image or video file
4. Check the console for any errors

## Step 5: Verify Uploads

1. Check your Cloudinary dashboard to see uploaded files
2. Files will be organized in folders:
   - `avatars/` - User profile pictures
   - `challenges/proofs/` - Challenge result screenshots
   - `payments/` - Payment screenshots
   - `helpline/` - Helpline attachments
   - `test/` - Test uploads

## Features Implemented

### Backend Changes
- ✅ Cloudinary configuration (`config/cloudinary.js`)
- ✅ Updated auth routes for avatar uploads
- ✅ Updated challenge routes for proof screenshots
- ✅ Updated payment routes for payment screenshots
- ✅ Updated helpline routes for attachments
- ✅ Memory storage with multer (no more local file storage)
- ✅ Automatic cleanup of old files when updating

### Frontend Changes
- ✅ Updated image/video display to use Cloudinary URLs
- ✅ Removed local path prefixes (`/uploads/...`)
- ✅ Test upload component for verification

### Model Updates
- ✅ Added `attachmentPublicId` to HelplineMessage model
- ✅ Updated Payment model screenshot structure
- ✅ Cloudinary public IDs stored for cleanup

## Benefits

1. **Scalability**: No more local storage limitations
2. **Performance**: CDN delivery for faster image loading
3. **Reliability**: Cloudinary handles file storage and delivery
4. **Cost-effective**: Free tier available for development
5. **Image Optimization**: Automatic format conversion and quality optimization
6. **Security**: Secure URLs and access control

## Troubleshooting

### Common Issues

1. **"Cloudinary config error"**
   - Check your environment variables
   - Ensure `.env` file is in the root directory
   - Restart your server after changing environment variables

2. **"Upload failed"**
   - Check file size limits (5MB for avatars, 10MB for other uploads)
   - Verify file type (images: jpg, jpeg, png, gif; videos: mp4, avi, mov, wmv)
   - Check Cloudinary dashboard for any account limitations

3. **Images not displaying**
   - Verify the Cloudinary URL is correct
   - Check browser console for CORS errors
   - Ensure the image URL is accessible

### Testing

Use the test route at `/api/test/test-upload` to verify Cloudinary is working:

```bash
curl -X POST -F "file=@test-image.jpg" http://localhost:5000/api/test/test-upload
```

## Security Considerations

1. **API Key Security**: Never expose your Cloudinary API secret in client-side code
2. **Upload Restrictions**: File types and sizes are restricted on both client and server
3. **Access Control**: Only authenticated users can upload files
4. **Cleanup**: Old files are automatically deleted when replaced

## Next Steps

After successful setup:

1. Remove the test route (`/test-upload`) from production
2. Set up Cloudinary transformations for image optimization
3. Configure backup and monitoring
4. Set up webhook notifications for upload events

## Support

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Cloudinary Support](https://support.cloudinary.com/)
