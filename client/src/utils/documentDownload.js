// Utility function to download Terms and Conditions and Privacy Policy

export const downloadTermsAndConditions = () => {
  const content = `TERMS AND CONDITIONS

Gaming Dreamer - Terms of Service

Last Updated: ${new Date().toLocaleDateString()}

1. ACCEPTANCE OF TERMS

By accessing and using Gaming Dreamer ("the Website", "we", "us", or "our"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.

2. DESCRIPTION OF SERVICE

Gaming Dreamer is an online gaming platform that allows users to:
- Create and participate in gaming challenges
- Play various games including PUBG, Free Fire, and Ludo King
- Participate in multiplayer matches (2-player, 4-player, 8-player, and 50-player)
- Win prizes based on challenge outcomes
- Use helpline services for support

3. USER ACCOUNTS

3.1 Account Creation
- You must be at least 18 years old to create an account
- You must provide accurate, current, and complete information
- You are responsible for maintaining the confidentiality of your account
- You are responsible for all activities that occur under your account

3.2 Account Security
- You must notify us immediately of any unauthorized use of your account
- We reserve the right to terminate accounts that violate these terms
- Multiple accounts per person are not allowed

4. GAMING CHALLENGES

4.1 Challenge Rules
- All challenges must be fair and follow game-specific rules
- Cheating, hacking, or using unauthorized software is strictly prohibited
- Screenshots must be provided as proof of match results
- Disputes will be resolved by our admin team

4.2 Player Counts and Prizes
- 2-player challenges: 75% of total pool to winner
- 4-player challenges: 75% of total pool to winner
- 8-player challenges: 75% of total pool to winner
- 50-player challenges: 60% of total entry fees to winner

4.3 Match Duration
- 2, 4, and 8-player matches: Fixed duration as specified
- 50-player matches: Dynamic duration based on participant count

5. PAYMENTS AND BALANCE

5.1 Deposits
- Minimum deposit: ৳10
- Maximum deposit: ৳50,000
- All deposits are final and non-refundable
- Payment methods include bKash and other approved methods

5.2 Withdrawals
- Minimum withdrawal: ৳100
- Withdrawals are processed within 24-48 hours
- Admin approval required for all withdrawals
- Processing fees may apply

6. PROHIBITED ACTIVITIES

You agree not to:
- Use the service for any illegal purpose
- Attempt to gain unauthorized access to our systems
- Interfere with other users' gaming experience
- Use multiple accounts or share accounts
- Engage in any form of harassment or abuse
- Attempt to manipulate game outcomes

7. INTELLECTUAL PROPERTY

- All content on Gaming Dreamer is owned by us
- You retain ownership of your user-generated content
- You grant us license to use your content for service provision

8. PRIVACY

Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service.

9. DISCLAIMER OF WARRANTIES

THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED.

10. LIMITATION OF LIABILITY

WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.

11. TERMINATION

We may terminate or suspend your account at any time for violations of these terms.

12. CHANGES TO TERMS

We reserve the right to modify these terms at any time. Continued use constitutes acceptance of new terms.

13. GOVERNING LAW

These terms are governed by the laws of Bangladesh.

14. CONTACT INFORMATION

For questions about these terms, contact us via:
- Telegram: @Gamingdreamersupport
- WhatsApp: [Your WhatsApp Number]
- Facebook: [Your Facebook Page]
- Email: [Your Email]

15. ACKNOWLEDGMENT

By using Gaming Dreamer, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.`;

  downloadDocument(content, 'Gaming-Dreamer-Terms-and-Conditions.txt', 'text/plain');
};

export const downloadPrivacyPolicy = () => {
  const content = `PRIVACY POLICY

Gaming Dreamer - Privacy Policy

Last Updated: ${new Date().toLocaleDateString()}

1. INTRODUCTION

Gaming Dreamer ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our gaming platform.

2. INFORMATION WE COLLECT

2.1 Personal Information
- Username and email address
- Profile information and gaming preferences
- Payment information (processed securely through third-party providers)
- Communication preferences

2.2 Gaming Data
- Game statistics and performance metrics
- Challenge participation history
- Match results and screenshots
- Gaming session data

2.3 Technical Information
- IP address and device information
- Browser type and version
- Operating system
- Usage analytics and cookies

3. HOW WE USE YOUR INFORMATION

3.1 Service Provision
- To provide and maintain our gaming platform
- To process payments and manage your account
- To facilitate gaming challenges and matches
- To provide customer support and helpline services

3.2 Communication
- To send important service updates
- To notify you of challenge invitations
- To provide customer support
- To send promotional content (with your consent)

3.3 Platform Improvement
- To analyze usage patterns and improve our service
- To develop new features and games
- To ensure platform security and prevent fraud

4. INFORMATION SHARING

4.1 We Do Not Sell Your Data
- We never sell, rent, or trade your personal information
- We do not share your data with third parties for marketing purposes

4.2 Limited Sharing
We may share your information only in these circumstances:
- With your explicit consent
- To comply with legal obligations
- To protect our rights and safety
- With service providers who assist in platform operation

4.3 Public Information
- Username and gaming statistics may be visible to other users
- Challenge results and leaderboards are publicly displayed
- Screenshots submitted for verification may be reviewed by admins

5. DATA SECURITY

5.1 Security Measures
- Encryption of sensitive data
- Secure payment processing
- Regular security audits
- Access controls and authentication

5.2 Data Retention
- Account data: Retained while account is active
- Gaming data: Retained for platform functionality
- Payment data: Retained as required by law
- Inactive accounts: Deleted after 12 months of inactivity

6. COOKIES AND TRACKING

6.1 Essential Cookies
- Session management and authentication
- Platform functionality and security
- Payment processing

6.2 Analytics Cookies
- Usage statistics and platform improvement
- Performance monitoring
- User experience optimization

6.3 Cookie Management
- You can disable cookies in your browser settings
- Some features may not work without essential cookies
- Third-party cookies are used for payment processing only

7. YOUR RIGHTS

7.1 Access and Control
- View and update your personal information
- Download your data
- Delete your account
- Opt-out of marketing communications

7.2 Data Portability
- Request a copy of your data
- Transfer your data to another service
- Export your gaming statistics

8. CHILDREN'S PRIVACY

- Our service is intended for users 18 years and older
- We do not knowingly collect information from children under 18
- If we discover we have collected such information, we will delete it immediately

9. INTERNATIONAL DATA TRANSFER

- Your data is stored and processed in Bangladesh
- We comply with applicable data protection laws
- International transfers follow legal requirements

10. THIRD-PARTY SERVICES

10.1 Payment Processors
- bKash and other payment providers
- Secure transaction processing
- Payment data handled according to their privacy policies

10.2 Cloud Services
- Cloudinary for image storage
- Secure file hosting and delivery
- Data protection compliance

11. CHANGES TO THIS POLICY

- We may update this Privacy Policy periodically
- Significant changes will be notified via email
- Continued use constitutes acceptance of updated policy
- Previous versions available upon request

12. CONTACT US

For privacy-related questions or concerns:

- Telegram: @Gamingdreamersupport
- WhatsApp: [Your WhatsApp Number]
- Facebook: [Your Facebook Page]
- Email: [Your Email]

13. COMPLAINTS

If you have concerns about our privacy practices:
- Contact us directly first
- We will respond within 30 days
- You may file a complaint with relevant authorities

14. LEGAL BASIS

This Privacy Policy is based on:
- Bangladesh Data Protection Laws
- International privacy standards
- Gaming industry best practices
- User rights and expectations

15. ACKNOWLEDGMENT

By using Gaming Dreamer, you acknowledge that you have read, understood, and agree to this Privacy Policy.`;

  downloadDocument(content, 'Gaming-Dreamer-Privacy-Policy.txt', 'text/plain');
};

const downloadDocument = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
