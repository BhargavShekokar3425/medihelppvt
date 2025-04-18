// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  
  // Handle specific error types
  if (err.code === 'auth/id-token-expired') {
    statusCode = 401;
    message = 'Authentication token expired';
  } else if (err.code === 'auth/id-token-revoked') {
    statusCode = 401;
    message = 'Authentication token revoked';
  } else if (err.code === 'auth/invalid-credential') {
    statusCode = 401;
    message = 'Invalid credentials';
  } else if (err.code === 'auth/user-not-found') {
    statusCode = 404;
    message = 'User not found';
  } else if (err.code === 'permission-denied') {
    statusCode = 403;
    message = 'Permission denied';
  }
  
  // Handle Firestore errors
  if (err.code && err.code.startsWith('firestore/')) {
    statusCode = 500;
    message = 'Database operation failed';
  }
  
  // Return standardized error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: err.code || 'internal_error',
      status: statusCode
    }
  });
};

module.exports = errorHandler;
