const userService = require('../services/user.service');
const { auth } = require('../config/firebase.config');

// Controller for auth operations
const authController = {
  // Register a new user
  register: async (req, res, next) => {
    try {
      const { email, password, name, userType, ...profileData } = req.body;
      
      // Validate required fields
      if (!email || !password || !name || !userType) {
        return res.status(400).json({
          success: false,
          message: 'Missing required registration fields'
        });
      }
      
      // Create user
      const userRecord = await userService.createUser({
        email,
        password,
        name,
        userType,
        ...profileData
      });
      
      // Create custom token for immediate login
      const token = await auth.createCustomToken(userRecord.uid);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          name: userRecord.displayName,
          userType
        },
        token
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Log in an existing user
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }
      
      // We need to use Firebase client SDK for authentication
      // This would be handled differently in a real app
      // Here we'll simulate by getting the user directly
      const user = await userService.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Generate a token for the user
      const token = await auth.createCustomToken(user.uid);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          uid: user.uid,
          email: user.email,
          name: user.name,
          userType: user.userType
        },
        token
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Refresh authentication token
  refresh: async (req, res, next) => {
    try {
      // Get refresh token from request
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }
      
      // In a real app, we would verify the refresh token
      // For Firebase, this would need to be implemented differently
      
      // Generate a new token (simplified for demo)
      const decodedToken = await auth.verifyIdToken(refreshToken, true);
      const token = await auth.createCustomToken(decodedToken.uid);
      
      res.status(200).json({
        success: true,
        token
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Logout user
  logout: async (req, res, next) => {
    try {
      // In Firebase authentication, logout is typically handled client-side
      // We can revoke refresh tokens server-side though
      
      // Update user status in database
      await userService.updateUserProfile(req.user.id, {
        isOnline: false,
        lastSeen: new Date()
      });
      
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Reset password
  resetPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }
      
      await auth.generatePasswordResetLink(email);
      
      res.status(200).json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Verify email
  verifyEmail: async (req, res, next) => {
    try {
      // Check user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      await auth.generateEmailVerificationLink(req.user.email);
      
      res.status(200).json({
        success: true,
        message: 'Email verification link sent'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
