const jwt = require('jsonwebtoken');

// Get JWT secret from environment variables or use fallback
const JWT_SECRET = process.env.JWT_SECRET || 'medihelp_secret_key_for_development_only';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // Default to 7 days

/**
 * Middleware to authenticate token
 */
const authenticateToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required' });
  }
  
  try {
    // Verify token with our secret
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach user info to request object
    req.user = decoded;
    
    // Continue to next middleware
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired, please login again', expiredAt: error.expiredAt });
    }
    
    console.error('JWT verification error:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Generate a new JWT token
 */
const generateToken = (user) => {
  // Create payload with essential user info (avoid including sensitive data)
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };
  
  // Generate and return token
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Middleware to check for specific roles
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    // Must be used after authenticateToken
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Convert single role to array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    // Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }
    
    next();
  };
};

// Export middleware and helper functions
module.exports = {
  authenticateToken,
  generateToken,
  requireRole
};
