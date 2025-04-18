import React from 'react';
import { Link } from 'react-router-dom';
import { useBackendContext } from '../contexts/BackendContext';

const AuthStatus = () => {
  const { currentUser, logout } = useBackendContext();

  return (
    <div className="auth-status">
      {currentUser ? (
        <div className="user-info d-flex align-items-center">
          <div className="avatar-wrapper me-2">
            <img 
              src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=random&color=fff&size=32`} 
              alt="Avatar" 
              className="rounded-circle"
              style={{ width: '32px', height: '32px', objectFit: 'cover' }}
            />
          </div>
          <div className="dropdown">
            <button className="btn btn-sm dropdown-toggle text-primary" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              {currentUser.name || currentUser.email}
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
              <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
              <li><Link className="dropdown-item" to="/appointments">My Appointments</Link></li>
              {currentUser.role === 'doctor' && (
                <li><Link className="dropdown-item" to="/pres-doctor">Prescriptions</Link></li>
              )}
              {currentUser.role === 'patient' && (
                <li><Link className="dropdown-item" to="/pres-patient">My Prescriptions</Link></li>
              )}
              <li><hr className="dropdown-divider" /></li>
              <li><button className="dropdown-item text-danger" onClick={logout}>Logout</button></li>
            </ul>
          </div>
        </div>
      ) : (
        <Link to="/signup" className="btn btn-sm btn-outline-primary">
          <i className="fas fa-sign-in-alt me-1"></i> Sign in
        </Link>
      )}
    </div>
  );
};

export default AuthStatus;
