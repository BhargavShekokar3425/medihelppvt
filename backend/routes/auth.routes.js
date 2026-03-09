const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User.model');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

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

// POST /api/auth/google — Google OAuth login/register
router.post('/google', async (req, res, next) => {
  try {
    const { credential, role } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required.' });
    }

    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ success: false, message: 'Google OAuth is not configured on the server.' });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account has no email.' });
    }

    // Check if user already exists (by googleId or email)
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Existing user — link Google account if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        if (picture && !user.profileImage) user.profileImage = picture;
        await user.save();
      }
      console.log(`Google login: ${email}`);
    } else {
      // New user — create account
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
        role: role ? role.toLowerCase() : 'patient',
        profileImage: picture || undefined,
        isVerified: true,  // Google accounts are email-verified
      });
      console.log(`Google register: ${email} (${user.role})`);
    }

    sendToken(user, 200, res);
  } catch (err) {
    console.error('Google auth error:', err.message);
    if (err.message?.includes('Token used too late') || err.message?.includes('Invalid token')) {
      return res.status(401).json({ success: false, message: 'Invalid or expired Google token.' });
    }
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
