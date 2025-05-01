const express = require('express');
const { loginUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth'); // Add this import
const router = express.Router();

router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

module.exports = router;