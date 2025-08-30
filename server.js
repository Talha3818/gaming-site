const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/database');
require('dotenv').config();
const fs = require('fs'); // Added for file existence check

// Connect to database
connectDB();

const app = express();

// Trust proxy for rate limiting behind load balancers/proxies
app.set('trust proxy', 1);
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(compression());
app.use(cors({ origin: ['https://www.gamingdreamer.com', 'http://localhost:3000'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Handle challenge notifications
  socket.on('challenge-created', (data) => {
    io.emit('new-challenge', data);
  });

  // Handle challenge acceptance
  socket.on('challenge-accepted', (data) => {
    io.emit('challenge-accepted', data);
  });

  // Handle admin challenge notifications
  socket.on('new-admin-challenge', (data) => {
    io.emit('new-admin-challenge', data);
  });

  // Handle helpline messages
  socket.on('helpline-message', (data) => {
    io.to('admin-room').emit('new-helpline-message', data);
    io.to(`user-${data.userId}`).emit('helpline-response', data);
  });

  // Handle admin responses
  socket.on('admin-response', (data) => {
    io.to(`user-${data.userId}`).emit('helpline-response', data);
  });

  // Handle match updates
  socket.on('match-update', (data) => {
    io.to(`user-${data.player1Id}`).emit('match-update', data);
    io.to(`user-${data.player2Id}`).emit('match-update', data);
  });

  // Handle withdrawal updates
  socket.on('withdrawal-update', (data) => {
    io.to(`user-${data.userId}`).emit('withdrawal-update', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io instance available to routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/games', require('./routes/games'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/withdrawals', require('./routes/withdrawals'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/helpline', require('./routes/helpline'));
app.use('/api/test', require('./routes/test-upload'));

// Serve React app only if public directory exists
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
} else {
  // API-only mode - serve a simple message for root path
  app.get('/', (req, res) => {
    res.json({
      message: 'Gaming Site API Server',
      status: 'running',
      endpoints: {
        auth: '/api/auth',
        games: '/api/games',
        challenges: '/api/challenges',
        payments: '/api/payments',
        admin: '/api/admin',
        helpline: '/api/helpline'
      }
    });
  });
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
