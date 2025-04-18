const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Example user controller functions
const userController = {
  getProfile: (req, res) => {
    const userId = req.user.id;
    const user = global.dataStore.users[userId];
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        // Omit sensitive information
      }
    });
  },
  updateProfile: (req, res) => {
    const userId = req.user.id;
    const user = global.dataStore.users[userId];
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update user data
    global.dataStore.users[userId] = {
      ...user,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: global.dataStore.users[userId]
    });
  }
};

// Public routes
router.get('/doctors', (req, res) => {
  const doctors = Object.entries(global.dataStore.users)
    .filter(([_, user]) => user.role === 'doctor')
    .map(([id, user]) => ({
      id,
      name: user.name,
      specialization: user.specialization,
      experience: user.experience,
      avatar: user.avatar
    }));
  
  res.json({
    success: true,
    data: doctors
  });
});

// Protected routes
router.use(protect);
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

module.exports = router;
