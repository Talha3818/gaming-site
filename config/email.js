const nodemailer = require('nodemailer');

// Create transporter for Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
};

// Send OTP verification email
const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  try {
    const transporter = createTransporter();
    
    let subject, htmlContent;
    
    if (purpose === 'verification') {
      subject = 'Email Verification - Gaming Platform';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: #1a1a1a; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; color: #00ff88;">🎮 Gaming Platform</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.8;">Email Verification</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Thank you for signing up! To complete your registration, please use the verification code below:
            </p>
            
            <div style="background-color: #1a1a1a; color: #00ff88; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
              <h1 style="margin: 0; font-size: 32px; letter-spacing: 5px; font-family: 'Courier New', monospace;">${otp}</h1>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This code will expire in <strong>5 minutes</strong>. If you didn't request this verification, please ignore this email.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 14px;">
                Need help? Contact our support team
              </p>
            </div>
          </div>
        </div>
      `;
    } else if (purpose === 'reset') {
      subject = 'Password Reset - Gaming Platform';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: #1a1a1a; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; color: #00ff88;">🎮 Gaming Platform</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.8;">Password Reset</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              You requested a password reset. Use the verification code below to set a new password:
            </p>
            
            <div style="background-color: #1a1a1a; color: #00ff88; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
              <h1 style="margin: 0; font-size: 32px; letter-spacing: 5px; font-family: 'Courier New', monospace;">${otp}</h1>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This code will expire in <strong>5 minutes</strong>. If you didn't request a password reset, please ignore this email.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 14px;">
                Need help? Contact our support team
              </p>
            </div>
          </div>
        </div>
      `;
    }
    
    const mailOptions = {
      from: `"Gaming Platform" <${process.env.GMAIL_EMAIL}>`,
      to: email,
      subject: subject,
      html: htmlContent
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}:`, result.messageId);
    return true;
    
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, username) => {
  try {
    const transporter = createTransporter();
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: #1a1a1a; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; color: #00ff88;">🎮 Gaming Platform</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.8;">Welcome!</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to Gaming Platform!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hi <strong>${username}</strong>! 🎉
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your account has been successfully created and verified. You're now ready to:
          </p>
          
          <ul style="color: #666; line-height: 1.8; margin-bottom: 25px;">
            <li>🎮 Challenge other players in your favorite games</li>
            <li>🏆 Compete for prizes and climb the leaderboard</li>
            <li>💰 Manage your gaming balance</li>
            <li>📱 Get support through our helpline</li>
          </ul>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 14px;">
              Happy gaming! 🎯
            </p>
          </div>
        </div>
      </div>
    `;
    
    const mailOptions = {
      from: `"Gaming Platform" <${process.env.GMAIL_EMAIL}>`,
      to: email,
      subject: 'Welcome to Gaming Platform! 🎮',
      html: htmlContent
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}:`, result.messageId);
    return true;
    
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email as it's not critical
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail
};
