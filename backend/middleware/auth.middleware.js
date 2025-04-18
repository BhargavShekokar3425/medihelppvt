const { auth } = require('../config/firebase.config');

// Middleware to verify Firebase authentication token
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: Missing or invalid authentication token' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decodedToken = await auth.verifyIdToken(token);
    
    // Add user info to request object
    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'patient' // Default to patient if role not specified
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: Token expired' 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: Invalid authentication token' 
    });
  }
};

// Middleware to check user roles
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: User not authenticated' 
      });
    }
    
    // If roles is a single string, convert to array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden: Insufficient permissions for this action' 
      });
    }
    
    next();
  };
};

module.exports = { authMiddleware, roleMiddleware };
