# SMTP Email Setup Guide

This guide will help you set up Gmail SMTP for sending OTP verification emails and password reset codes.

## Prerequisites

1. A Gmail account
2. Node.js and npm installed
3. Nodemailer package (already included in dependencies)

## Step 1: Enable 2-Factor Authentication on Gmail

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security"
3. Enable "2-Step Verification" if not already enabled

## Step 2: Generate Gmail App Password

1. In the same Security section, find "App passwords"
2. Click on "App passwords"
3. Select "Mail" as the app and "Other" as the device
4. Enter a custom name (e.g., "Gaming Platform")
5. Click "Generate"
6. **Copy the 16-character app password** (this is your `GMAIL_APP_PASSWORD`)

## Step 3: Update Environment Variables

1. Copy `.env.example` to `.env` (if you haven't already)
2. Add your Gmail credentials to `.env`:

```env
# Gmail SMTP Configuration for OTP
GMAIL_EMAIL=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
```

**Important**: 
- Use your full Gmail address (e.g., `example@gmail.com`)
- Use the 16-character app password, NOT your regular Gmail password
- Never commit your `.env` file to version control

## Step 4: Test the Email Functionality

1. Start your server: `npm run dev`
2. Try creating a new account - you should receive a verification email
3. Check the server console for email sending logs
4. Verify the email contains the OTP code

## Features Implemented

### ✅ **Backend Changes**

1. **Email Service Configuration** (`config/email.js`)
   - Gmail SMTP transporter setup
   - Beautiful HTML email templates
   - OTP verification emails
   - Password reset emails
   - Welcome emails

2. **Updated Auth Routes**
   - Signup now sends verification OTP via email
   - Email verification endpoint (`/auth/verify-email`)
   - Password reset sends OTP via email
   - Resend verification functionality

3. **User Model Updates**
   - Email verification required before login
   - OTP codes expire after 5 minutes
   - Proper verification flow

### ✅ **Frontend Changes**

1. **Login Page Updates**
   - Email verification form
   - Proper error handling for unverified users
   - Resend verification functionality
   - Updated signup flow

2. **Auth Context Updates**
   - `verifyEmail` function replaces `verifyPhone`
   - Proper error handling and user state management

## Email Templates

### Verification Email
- Professional gaming-themed design
- Clear OTP display
- 5-minute expiration notice
- Support contact information

### Password Reset Email
- Same professional design
- Clear reset code display
- Security warnings

### Welcome Email
- Sent after successful verification
- Platform features overview
- Welcome message

## Security Features

1. **OTP Expiration**: Codes expire after 5 minutes
2. **Rate Limiting**: Prevents spam
3. **Secure SMTP**: Uses Gmail's secure SMTP
4. **App Passwords**: No regular password exposure
5. **Email Validation**: Proper email format validation

## Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Check your Gmail app password
   - Ensure 2FA is enabled
   - Verify email address is correct

2. **"Connection timeout"**
   - Check internet connection
   - Gmail SMTP might be blocked by firewall
   - Try different network

3. **"Email not received"**
   - Check spam folder
   - Verify email address
   - Check server logs for errors

4. **"Invalid credentials"**
   - Regenerate app password
   - Ensure no extra spaces in `.env`

### Testing Commands

Test email functionality:

```bash
# Test OTP email
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'

# Test password reset
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Production Considerations

1. **Email Service**: Consider using dedicated email services (SendGrid, Mailgun) for production
2. **Rate Limiting**: Implement proper rate limiting for email endpoints
3. **Monitoring**: Set up email delivery monitoring
4. **Backup**: Have fallback email service
5. **Logging**: Implement comprehensive email logging

## Environment Variables Reference

```env
# Required for SMTP
GMAIL_EMAIL=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password

# Optional (for production)
NODE_ENV=production
EMAIL_FROM_NAME=Gaming Platform
EMAIL_REPLY_TO=support@yourdomain.com
```

## Support

- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)

## Next Steps

After successful setup:

1. Test all email flows (signup, verification, password reset)
2. Customize email templates if needed
3. Set up email monitoring
4. Configure production email service
5. Implement email analytics
