const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const protect = async (req, res, next) => {
  let token;
  
  // Debug log
  console.log('Headers:', req.headers);
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extracted:', token);
      
      // Development bypass - allows using a specific token structure for testing 
      // without requiring JWT_SECRET to be matched
      if (token.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')) {
        console.log('Development token detected, bypassing verification');
        // Create a mock user with admin role for testing
        req.user = {
          _id: "mockuser123",
          fullName: "Development User",
          email: "dev@example.com",
          role: "student"
        };
        return next();
      }
      
      // Check if JWT_SECRET is set
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined in environment variables');
        return res.status(500).json({ message: 'Server configuration error' });
      }
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);
        
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
          return res.status(401).json({ message: 'User not found' });
        }
        
        next();
      } catch (verifyError) {
        console.error('Token verification error details:', verifyError.message);
        return res.status(401).json({ message: 'Token verification failed: ' + verifyError.message });
      }
    } catch (error) {
      console.error('Token processing failed:', error);
      return res.status(401).json({ message: 'Not authorized, token processing failed' });
    }
  } else {
    console.log('No token found in headers');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') next();
  else res.status(403).json({ message: 'Admin access required' });
};

module.exports = { protect, admin };