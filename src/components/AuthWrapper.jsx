import React from 'react';
import { Navigate } from 'react-router-dom';
import { useBackendContext } from '../contexts/BackendContext';

const AuthWrapper = ({ children, requiredRole = null }) => {
  const { currentUser, loading } = useBackendContext();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/signup" replace />;
  }

  // If a specific role is required, check if the user has that role
  if (requiredRole && currentUser.role !== requiredRole) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Access Denied</h4>
        <p>You don't have permission to access this page. This page requires {requiredRole} privileges.</p>
        <hr />
        <p className="mb-0">Please contact support if you believe this is an error.</p>
      </div>
    );
  }

  return children;
};

export default AuthWrapper;
