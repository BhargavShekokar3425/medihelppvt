import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';

const BackendContext = createContext();

export const BackendProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load user on initial mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          // Verify token is valid by making an auth check to API
          const userData = await apiService.validateToken();
          if (userData) {
            setCurrentUser(userData);
          } else {
            // Invalid token, logout
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        }
      } catch (err) {
        console.error('Auth error:', err);
        setError('Authentication error. Please log in again.');
        // Clean up invalid auth
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);
  
  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.login(email, password);
      
      if (response.success) {
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        setCurrentUser(response.user);
        return response;
      } else {
        setError(response.message || 'Login failed');
        return response;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Signup function
  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.signup(userData);
      
      if (response.success) {
        // Auto login after signup
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        setCurrentUser(response.user);
        return response;
      } else {
        setError(response.message || 'Signup failed');
        return response;
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to sign up');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      // Call logout API
      await apiService.logout();
    } catch (err) {
      console.error('Logout error:', err);
      // Continue with local logout even if server logout fails
    } finally {
      // Local logout
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setCurrentUser(null);
      setLoading(false);
    }
  };
  
  const contextValue = {
    currentUser,
    loading,
    error,
    login,
    signup,
    logout,
    setError,
    apiService
  };
  
  return (
    <BackendContext.Provider value={contextValue}>
      {children}
    </BackendContext.Provider>
  );
};

export const useBackendContext = () => {
  const context = useContext(BackendContext);
  if (!context) {
    throw new Error('useBackendContext must be used within a BackendProvider');
  }
  return context;
};

export default BackendContext;
