import React, { useState } from 'react';
import axios from 'axios';

/**
 * Debug component for login issues
 * This component provides a direct login attempt bypassing regular services
 */
const LoginDebug = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiUrl, setApiUrl] = useState(process.env.REACT_APP_API_URL || 'http://localhost:5000/api');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Make direct request to login endpoint
      console.log(`Attempting direct login to ${apiUrl}/auth/login`);
      const resp = await axios.post(`${apiUrl}/auth/login`, { email, password });
      setResponse(resp.data);
      
      // Check all possible response structures
      let token = null;
      let user = null;
      
      // Case 1: Direct properties
      if (resp.data?.token) {
        token = resp.data.token;
        user = resp.data.user;
      }
      // Case 2: Inside 'data' property
      else if (resp.data?.data?.token) {
        token = resp.data.data.token;
        user = resp.data.data.user;
      }
      // Case 3: Inside 'success' property structure
      else if (resp.data?.success && resp.data?.data) {
        token = resp.data.data.token;
        user = resp.data.data.user;
      }
      
      if (token) {
        localStorage.setItem('token', token);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          window.location.reload(); // Force reload to refresh the app state
        }
        alert('Login successful! Token and user data stored.');
      } else {
        alert('Response received but no token found in standard location.');
      }
    } catch (err) {
      console.error("Login debug error:", err);
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-warning">
            <h5 className="modal-title">Login Debug Tool</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p className="mb-3">This tool makes a direct API call to diagnose login issues.</p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">API URL</label>
                <input 
                  type="text"
                  className="form-control"
                  value={apiUrl}
                  onChange={e => setApiUrl(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input 
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input 
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Testing...' : 'Test Login'}
              </button>
            </form>
            
            {response && (
              <div className="mt-4">
                <h6>API Response:</h6>
                <pre className="bg-light p-3 rounded" style={{ maxHeight: '300px', overflow: 'auto' }}>
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}
            
            {error && (
              <div className="mt-4">
                <h6>Error:</h6>
                <pre className="bg-light p-3 text-danger rounded" style={{ maxHeight: '300px', overflow: 'auto' }}>
                  {typeof error === 'object' ? JSON.stringify(error, null, 2) : error}
                </pre>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginDebug;
