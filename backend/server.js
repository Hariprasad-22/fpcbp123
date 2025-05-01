const cors=require('cors')
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const path = require('path');
const applicationRoutes = require('./routes/applicationRoutes');
const { protect, admin } = require('./middleware/auth');

dotenv.config();
const app = express();

// Add this before mongoose.connect to debug
console.log('Connection String:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('Connection Error:', err));
app.use(cors({
  origin: 'http://localhost:8080',
  methods:['POST','GET','PUT','DELETE'],
  allowedHeaders:['Content-Type','Authorization'],
  credentials :true
}));
// Middleware
app.use(express.json());
// Routes
 app.use('/api/auth', authRoutes);
app.use('/api/applications', protect, applicationRoutes);

// Error handling (after routes)
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation Error',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
  
    res.status(500).json({ 
      message: process.env.NODE_ENV === 'production' 
        ? 'Server error' 
        : err.message 
    });
  });

// Add this after other middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

// Error handling (after routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  res.status(500).json({ 
    message: process.env.NODE_ENV === 'production' 
      ? 'Server error' 
      : err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));