import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing token on mount
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentUser(response.data.data);
        } catch (error) {
          console.error('Error validating token:', error);
          // Token invalid or expired
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    
    validateToken();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      // Store token
      localStorage.setItem('token', response.data.token);
      
      // Set user data
      setCurrentUser(response.data.user);
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw new Error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };
  
  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/auth/updatedetails`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(response.data.data);
      return response.data.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Profile update failed');
      throw new Error(error.response?.data?.message || 'Profile update failed');
    } finally {
      setLoading(false);
    }
  };
  
  // Update password
  const updatePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/auth/updatepassword`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Password update failed');
      throw new Error(error.response?.data?.message || 'Password update failed');
    } finally {
      setLoading(false);
    }
  };

  // Upload avatar
  const uploadAvatar = async (file) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await axios.post(
        `${API_URL}/users/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Update current user with new avatar URL
      setCurrentUser(prev => ({
        ...prev,
        avatar: response.data.data
      }));
      
      return response.data.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Avatar upload failed');
      throw new Error(error.response?.data?.message || 'Avatar upload failed');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    uploadAvatar,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
