import React from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useBackendContext } from '../contexts/BackendContext';

/**
 * Minimal wrapper for routes that require authentication
 * Designed to avoid DOM manipulation issues
 */
const AuthWrapper = ({ children, requiredRole = null }) => {
  const { currentUser, loading } = useBackendContext();
  
  if (loading) {
    // Use the most basic loading indicator possible
    return <p>Loading...</p>;
  }
  
  if (!currentUser) {
    // Simple redirection without state
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  // Return children directly without any wrapper
  // This avoids additional DOM nodes that might cause issues
  return children;
};

AuthWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string
};

export default AuthWrapper;