import { useState, useEffect } from 'react';
import apiService from '../services/apiService';

export const useBackendState = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Check local storage for user data
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    const validateSession = async () => {
      setLoading(true);
      
      if (storedUser && token) {
        try {
          const userData = JSON.parse(storedUser);
          
          // Optional: Validate token by pinging an auth endpoint
          try {
            await apiService.get('/users/profile');
            console.log("Session validated for:", userData.email);
          } catch (err) {
            console.error("Invalid session, clearing stored data:", err);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setCurrentUser(null);
            setLoading(false);
            return;
          }
          
          setCurrentUser(userData);
          console.log("User loaded from local storage:", userData.email);
        } catch (e) {
          console.error("Error parsing stored user data", e);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      
      setLoading(false);
    };
    
    validateSession();
  }, []);
  
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Attempting login for:", email);
      const response = await apiService.post('/auth/login', { email, password });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setCurrentUser(response.user);
        console.log("Login successful for:", email);
      }
      
      return response.user;
    } catch (err) {
      const errorMsg = err.message || "Login failed";
      console.error("Login error:", errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, userType, userData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Attempting registration for:", email, userType);
      
      const response = await apiService.post('/auth/register', { 
        email, 
        password,
        role: userType,
        ...userData 
      });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setCurrentUser(response.user);
        console.log("Registration successful for:", email);
      }
      
      return response.user;
    } catch (err) {
      const errorMsg = err.message || "Registration failed";
      console.error("Registration error:", errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    console.log("Logging out user:", currentUser?.email);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
    // Redirect to home page without using router hooks
    window.location.href = '/';
  };
  
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!currentUser?.id) {
        throw new Error("User not authenticated");
      }
      
      const response = await apiService.put(`/users/profile/${currentUser.id}`, userData);
      
      // Update stored user data
      const updatedUser = { ...currentUser, ...response };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      console.log("Profile updated successfully for:", currentUser.email);
      return updatedUser;
    } catch (err) {
      const errorMsg = err.message || "Profile update failed";
      console.error("Profile update error:", errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    apiService
  };
};

export default useBackendState;
