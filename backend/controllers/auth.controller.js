const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Register new user
exports.register = async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    const { email, password, name, role } = req.body;
    
    // Check if user already exists
    const existingUser = Object.values(global.dataStore.users || {})
      .find(user => user.email === email);
    
    if (existingUser) {
      console.log(`User already exists: ${email}`);
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }
    
    // Create user ID
    const userId = uuidv4();
    
    // Create user object
    const user = {
      id: userId,
      email,
      password, // In a real app, should hash this
      name,
      role: role || 'patient',
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'offline',
      lastSeen: new Date().toISOString()
    };
    
    // Store in global data store
    if (!global.dataStore.users) {
      global.dataStore.users = {};
    }
    
    global.dataStore.users[userId] = user;
    console.log(`User registered: ${email} with ID ${userId}`);
    
    // Create token
    const token = jwt.sign(
      { id: userId, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key_should_be_long_and_secure',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }
    
    // Find user by email
    const user = Object.entries(global.dataStore.users || {})
      .find(([_, userData]) => userData.email === email);
    
    if (!user) {
      console.log(`Login failed: No user with email ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    const [userId, userData] = user;
    
    // Check password (simplified - real apps should use bcrypt)
    if (userData.password !== password) {
      console.log(`Login failed: Incorrect password for ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    console.log(`Login successful: ${email} with ID ${userId}`);
    
    // Create token
    const token = jwt.sign(
      { id: userId, role: userData.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key_should_be_long_and_secure',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
    
    // Update user status
    userData.status = 'online';
    userData.lastSeen = new Date().toISOString();
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: userId,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatar: userData.avatar,
        username: userData.username,
        contact: userData.contact,
        dob: userData.dob,
        address: userData.address,
        bloodGroup: userData.bloodGroup,
        gender: userData.gender,
        allergies: userData.allergies,
        specialization: userData.specialization
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    console.log('GetMe request received from user:', req.user?.id);
    const user = req.user;
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Update user details
exports.updateDetails = async (req, res) => {
  try {
    // Fields to update
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      contact: req.body.contact,
      address: req.body.address,
      dob: req.body.dob,
      bloodGroup: req.body.bloodGroup,
      gender: req.body.gender,
      allergies: req.body.allergies
    };
    
    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update details error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current and new password'
      });
    }
    
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check current password
    const isMatch = user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    // Generate new token
    const token = user.getSignedJwtToken();
    
    res.status(200).json({
      success: true,
      token
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email'
      });
    }
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No user found with that email'
      });
    }
    
    // Generate and set reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Set expire time to 10 minutes
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password reset link sent to email',
      token: resetToken  // In a real app, you'd send this via email, not in response
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};
