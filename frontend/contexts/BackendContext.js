import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Context
const BackendContext = createContext(null);

// Get the API URL from environment or use default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Provider Component
export const BackendProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load user data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing stored user", e);
      }
    }
    setLoading(false);
    
    // Check API connection
    fetch(`${API_URL}/health`)
      .then(response => {
        if (!response.ok) {
          throw new Error('API server not responding');
        }
        return response.json();
      })
      .then(data => {
        console.log('API Health Check:', data);
      })
      .catch(err => {
        console.error('API Connection Error:', err);
        setError('Cannot connect to API server');
      });
  }, []);
  
  // Simple API service for making requests
  const apiService = {
    get: async (endpoint) => {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'API request failed' }));
        throw new Error(error.message || 'API request failed');
      }
      return response.json();
    },
    
    post: async (endpoint, data) => {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'API request failed' }));
        throw new Error(error.message || 'API request failed');
      }
      return response.json();
    },

    put: async (endpoint, data) => {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'API request failed' }));
        throw new Error(error.message || 'API request failed');
      }
      return response.json();
    },

    delete: async (endpoint) => {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'API request failed' }));
        throw new Error(error.message || 'API request failed');
      }
      return response.json();
    }
  };
  
  // Auth functions
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await apiService.post('/auth/login', { email, password });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setCurrentUser(response.user);
      return response.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    // Use direct navigation instead of useNavigate
    window.location.href = '/';
  };
  
  return (
    <BackendContext.Provider value={{
      currentUser,
      loading,
      error,
      login,
      logout,
      apiService,
      apiUrl: API_URL
    }}>
      {children}
    </BackendContext.Provider>
  );
};

// Custom Hook for using the context
export const useBackendContext = () => {
  const context = useContext(BackendContext);
  if (!context) {
    throw new Error('useBackendContext must be used within a BackendProvider');
  }
  return context;
};

export default BackendContext;
