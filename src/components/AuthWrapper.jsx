import React from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useBackendContext } from '../contexts/BackendContext';

/**
 * Ultra minimal wrapper for routes that require authentication
 * Designed to prevent any DOM manipulation issues
 */
const AuthWrapper = ({ children, requiredRole = null }) => {
  const { currentUser, loading } = useBackendContext();
  
  // Simple static loading indicator with no transitions or animations
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Simple redirect for unauthenticated users
  if (!currentUser) {
    return <Navigate to="/signup" replace />;
  }
  
  // Simple redirect for unauthorized roles
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  // Return children directly - no fragments, no wrappers
  return children;
};

AuthWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string
};

export default AuthWrapper;
