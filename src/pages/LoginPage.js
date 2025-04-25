import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBackendContext } from '../contexts/BackendContext';
import LoginDebug from '../components/LoginDebug';

/**
 * LoginPage Component
 * 
 * Handles user authentication using the BackendContext
 */
const LoginPage = () => {
  // State for form fields and status
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  // Get backend context and navigation
  const { login, currentUser } = useBackendContext();
  const navigate = useNavigate();
  
  // If user is already logged in, redirect to home page
  React.useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setLoginError('Email and password are required');
      return;
    }
    
    setIsLoading(true);
    setLoginError('');
    
    try {
      // Call login method from BackendContext
      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-6">
        <div className="card shadow">
          <div className="card-body p-5">
            <h2 className="text-center mb-4">Login</h2>
            
            {loginError && (
              <div className="alert alert-danger" role="alert">
                {loginError}
                <button 
                  type="button" 
                  className="btn btn-sm btn-link text-danger float-end"
                  onClick={() => setShowDebug(true)}
                >
                  Debug
                </button>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div className="d-grid gap-2">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : 'Login'}
                </button>
              </div>
            </form>
            
            <hr className="my-4" />
            
            <div className="text-center">
              <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
              <p className="mt-3">
                <button 
                  className="btn btn-sm btn-outline-secondary" 
                  onClick={() => setShowDebug(true)}
                >
                  Login Debug
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {showDebug && <LoginDebug onClose={() => setShowDebug(false)} />}
    </div>
  );
};

export default LoginPage;
