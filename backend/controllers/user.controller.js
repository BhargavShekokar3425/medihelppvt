const crypto = require('crypto');
const User = require('../models/User.model');
const store = require('../data/store');

// Simple password hashing (replace with bcrypt in production)
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Generate token (simple implementation, use JWT in production)
const generateToken = (userId) => {
  return `${userId}_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
};

// Register new user
exports.register = (req, res) => {
  try {
    const { name, email, password, userType } = req.body;
    
    // Check if user already exists
    const userExists = Object.values(global.dataStore.users).some(user => user.email === email);
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }
    
    // Hash password
    const hashedPassword = hashPassword(password);
    
    // Create new user ID
    const userId = `user_${Date.now()}`;
    
    // Create new user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      type: userType || 'patient',
      createdAt: new Date().toISOString()
    };
    
    // Add user to storage
    global.dataStore.users[userId] = newUser;
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      data: {
        ...userWithoutPassword,
        id: userId
      },
      token: generateToken(userId)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Login user
exports.login = (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    let userId;
    let user = null;
    
    Object.entries(global.dataStore.users).forEach(([id, userData]) => {
      if (userData.email === email) {
        userId = id;
        user = userData;
      }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Check password
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      data: {
        ...userWithoutPassword,
        id: userId
      },
      token: generateToken(userId)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Get user profile
exports.getUserProfile = (req, res) => {
  const user = store.findUserById(req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Remove password before sending
  const { password: _, ...userWithoutPassword } = user;
  
  res.json(userWithoutPassword);
};

exports.updateUserProfile = (req, res) => {
  const { password, role, ...updateData } = req.body;
  
  // Prevent changing password or role through this endpoint
  const updatedUser = store.updateUser(req.user.id, updateData);
  
  if (!updatedUser) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Remove password before sending
  const { password: _, ...userWithoutPassword } = updatedUser;
  
  res.json(userWithoutPassword);
};

// Update user profile
exports.updateProfile = (req, res) => {
  try {
    if (!global.dataStore.users[req.params.id]) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Don't allow updating password through this endpoint
    const { password, ...updateData } = req.body;
    
    global.dataStore.users[req.params.id] = {
      ...global.dataStore.users[req.params.id],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    const { password: _, ...userWithoutPassword } = global.dataStore.users[req.params.id];
    
    res.status(200).json({
      success: true,
      data: {
        ...userWithoutPassword,
        id: req.params.id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};
