import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useBackendContext } from '../contexts/BackendContext';
import PropTypes from 'prop-types';

// Component that requires authentication to access
const AuthWrapper = ({ children, requiredRole }) => {
  const { currentUser, loading } = useBackendContext();
  const location = useLocation();
  
  // Show loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '40vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="ms-3">Checking authentication...</p>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/signup" state={{ from: location }} replace />;
  }
  
  // Check for specific role if required
  if (requiredRole && currentUser.role !== requiredRole.toLowerCase()) {
    return (
      <div className="alert alert-danger">
        <h4 className="alert-heading">Access Denied</h4>
        <p>You need to be a {requiredRole} to access this page.</p>
      </div>
    );
  }
  
  // User is authenticated, render children
  return children;
};
AuthWrapper.propTypes = {
  children: PropTypes.node,
  requiredRole: PropTypes.string.isRequired,
};

export default AuthWrapper;
