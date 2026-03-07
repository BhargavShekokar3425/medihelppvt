const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

// Helper to create and send token
const sendToken = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
  res.status(statusCode).json({ token, user });
};

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, role, gender, ...rest } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Normalize enum values to lowercase
    const userData = {
      email,
      password,
      name,
      role: role ? role.toLowerCase() : 'patient',
      ...rest,
    };
    if (gender) userData.gender = gender.toLowerCase();

    const user = await User.create(userData);
    console.log(`User registered: ${email} (${user.role})`);
    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    console.log(`User logged in: ${email}`);
    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me - get current user
const { protect } = require('../middleware/auth');
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
