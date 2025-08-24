const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-verificationCode');

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account is blocked' });
    }

    req.user = decoded;
    req.userData = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Admin middleware
const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    
    if (!req.userData.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(401).json({ message: 'Admin authorization failed' });
  }
};

module.exports = { auth, adminAuth };
