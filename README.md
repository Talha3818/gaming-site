# Gaming Challenge Platform

A professional gaming challenge platform where users can challenge each other in popular games like Ludo King, Free Fire, and PUBG with real money betting. The platform features phone number authentication, bKash payment integration, and a comprehensive admin dashboard.

## Features

### 🎮 Gaming Features
- **Multiple Games**: Support for Ludo King, Free Fire, and PUBG
- **Challenge System**: Create and accept challenges with betting
- **Real-time Updates**: Live notifications and match status updates
- **Room Code Management**: Admin-controlled room code distribution
- **Result Verification**: Screenshot-based result submission and verification

### 💰 Payment System
- **bKash Integration**: Secure payment processing via bKash
- **Manual Credit Management**: Admin dashboard for payment approval
- **Transaction Tracking**: Complete payment history and status tracking
- **Balance Management**: Real-time balance updates

### 🔐 Authentication & Security
- **Phone Number Login**: Secure phone number-based authentication
- **OTP Verification**: 6-digit verification code system
- **JWT Tokens**: Secure session management
- **Admin Controls**: User blocking and account management

### 💬 Support System
- **Real-time Chat**: Live helpline support with admin
- **File Attachments**: Screenshot and file sharing capabilities
- **Message History**: Complete conversation tracking
- **Unread Notifications**: Real-time message notifications

### 📊 Admin Dashboard
- **User Management**: View, block, and manage users
- **Payment Processing**: Approve/reject payment requests
- **Challenge Management**: Monitor and manage challenges
- **Support System**: Handle helpline conversations
- **Analytics**: Platform statistics and insights
- **System Settings**: Manage platform configuration including bKash numbers, site settings, and payment limits

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **bcryptjs** for security
- **Multer** for file uploads

### Frontend
- **React.js** with React Router
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Socket.IO Client** for real-time features
- **React Query** for data fetching
- **React Hot Toast** for notifications

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd gaming-platform
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
npm install
```

#### Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 3. Environment Setup

Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/gaming-platform

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# bKash Number
BKASH_NUMBER=01XXXXXXXXX

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Optional: SMS Service (for production)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

### 4. Database Setup
```bash
# Start MongoDB (if not running)
mongod

# The application will automatically create the necessary collections
```

### 4. Initialize System Settings

Before starting the application, initialize the default system settings:

```bash
npm run init-settings
```

This will create default settings including:
- bKash deposit number
- Site name and support email
- Payment limits
- Maintenance mode toggle

### 5. Start the Application

#### Development Mode
```bash
# Start backend server
npm run dev

# In a new terminal, start frontend
cd client
npm start
```

#### Production Mode
```bash
# Build frontend
cd client
npm run build
cd ..

# Start production server
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/phone-login` - Send verification code
- `POST /api/auth/verify-code` - Verify code and login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Games
- `GET /api/games/available` - Get available games
- `GET /api/games/stats/:gameId` - Get game statistics
- `GET /api/games/user-stats/:gameId` - Get user game stats
- `GET /api/games/leaderboard/:gameId` - Get game leaderboard

### Challenges
- `GET /api/challenges` - Get available challenges
- `GET /api/challenges/my-challenges` - Get user's challenges
- `POST /api/challenges` - Create new challenge
- `POST /api/challenges/:id/accept` - Accept challenge
- `POST /api/challenges/:id/result` - Submit match result

### Payments
- `POST /api/payments/submit` - Submit payment request
- `GET /api/payments/my-payments` - Get payment history
- `GET /api/payments/bkash-number` - Get bKash number

### Helpline
- `GET /api/helpline/messages` - Get messages
- `POST /api/helpline/send` - Send message
- `PUT /api/helpline/mark-read` - Mark messages as read

### Admin (Protected)
- `GET /api/admin/dashboard` - Get admin dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `GET /api/admin/payments` - Get all payments
- `PUT /api/admin/payments/:id/approve` - Approve payment
- `PUT /api/admin/payments/:id/reject` - Reject payment
- `GET /api/admin/settings` - Get all system settings
- `GET /api/admin/settings/:key` - Get specific system setting
- `PUT /api/admin/settings/:key` - Update system setting
- `DELETE /api/admin/settings/:key` - Delete system setting

## Socket.IO Events

### Client to Server
- `join-user` - Join user's personal room
- `challenge-created` - New challenge created
- `challenge-accepted` - Challenge accepted
- `helpline-message` - Send helpline message
- `admin-response` - Admin response to user

### Server to Client
- `new-challenge` - New challenge notification
- `challenge-accepted` - Challenge accepted notification
- `match-update` - Match status update
- `helpline-response` - New helpline message
- `new-helpline-message` - New message for admin

## Database Schema

### User
- Phone number, username, email
- Balance, win/loss statistics
- Verification status, admin privileges

### Challenge
- Challenger, accepter, game type
- Bet amount, status, room code
- Winner, loser, screenshots
- Dispute handling

### Payment
- User, amount, transaction ID
- bKash number, screenshot
- Status, admin notes
- Processing information

### HelplineMessage
- User, message content
- Message type, attachments
- Admin responses, read status

### SystemSettings
- Key-value configuration pairs
- Editable flags and descriptions
- Update tracking and admin audit

## Deployment

### Backend Deployment
1. Set up a MongoDB database (MongoDB Atlas recommended)
2. Configure environment variables
3. Deploy to your preferred platform (Heroku, DigitalOcean, AWS, etc.)

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure environment variables for API endpoints

## Security Considerations

- All API endpoints are protected with JWT authentication
- Admin routes require additional admin privileges
- File uploads are validated and sanitized
- Rate limiting is implemented on sensitive endpoints
- CORS is configured for security
- Helmet.js provides additional security headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This is a demonstration project. For production use, ensure proper security measures, legal compliance, and regulatory requirements are met for real-money gaming platforms.
