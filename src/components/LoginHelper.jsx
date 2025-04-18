import React from 'react';
import { useBackendContext } from '../contexts/BackendContext';

const LoginHelper = () => {
  const { login } = useBackendContext();

  const handleQuickLogin = async (type) => {
    try {
      let email, password;
      
      if (type === 'patient') {
        email = 'patient@example.com';
        password = 'password123';
      } else if (type === 'doctor') {
        email = 'doctor@example.com';
        password = 'password';
      } else {
        return;
      }
      
      await login(email, password);
      window.location.href = '/profile';
    } catch (error) {
      console.error('Quick login failed:', error);
      alert(`Login failed: ${error.message}`);
    }
  };

  return (
    <div className="card mt-3 mb-3 p-3 bg-light">
      <h5>Quick Login</h5>
      <div className="d-flex gap-2">
        <button 
          onClick={() => handleQuickLogin('patient')}
          className="btn btn-sm btn-outline-primary"
        >
          Login as Patient
        </button>
        <button 
          onClick={() => handleQuickLogin('doctor')}
          className="btn btn-sm btn-outline-success"
        >
          Login as Doctor
        </button>
      </div>
      <small className="text-muted mt-2">
        Patient: patient@example.com / password123<br/>
        Doctor: doctor@example.com / password
      </small>
    </div>
  );
};

export default LoginHelper;
