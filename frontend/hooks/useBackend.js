import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { chatService } from '../services/chatService';
import apiService from '../services/apiService';

export const useBackend = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get the navigate function from react-router
  const navigate = useNavigate();
  
  // Check for user on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  // Authentication methods
  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    
    try {
      const { user, userData } = await authService.login(email, password);
      setCurrentUser({ ...user, ...userData });
      return { user, userData };
    } catch (error) {
      setError(error.message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (email, password, userType, userData) => {
    setError(null);
    setLoading(true);
    
    try {
      const user = await authService.register(email, password, userType, userData);
      setCurrentUser(user);
      return user;
    } catch (error) {
      setError(error.response?.data?.error || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    setError(null);
    
    try {
      await authService.logout();
      setCurrentUser(null);
      navigate('/');
    } catch (error) {
      setError(error.message || "Logout failed");
      throw error;
    }
  };
  
  // Chat methods
  const getConversations = async () => {
    setError(null);
    
    try {
      return await chatService.getConversations();
    } catch (error) {
      setError(error.response?.data?.error || error.message);
      throw error;
    }
  };
  
  const sendMessage = async (conversationId, text, attachments) => {
    setError(null);
    
    try {
      return await chatService.sendMessage(conversationId, text, attachments);
    } catch (error) {
      setError(error.response?.data?.error || error.message);
      throw error;
    }
  };
  
  // Generic API methods
  const apiGet = async (endpoint, params) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await apiService.get(endpoint, params);
      return response;
    } catch (error) {
      setError(error.response?.data?.error || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const apiPost = async (endpoint, data) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await apiService.post(endpoint, data);
      return response;
    } catch (error) {
      setError(error.response?.data?.error || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const apiPut = async (endpoint, data) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await apiService.put(endpoint, data);
      return response;
    } catch (error) {
      setError(error.response?.data?.error || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    currentUser,
    loading,
    error,
    // Auth methods
    login,
    register,
    logout,
    // Chat methods
    getConversations,
    sendMessage,
    getMessages: chatService.getMessages,
    subscribeToMessages: chatService.subscribeToMessages,
    markMessagesAsRead: chatService.markMessagesAsRead,
    // Generic API methods
    apiGet,
    apiPost,
    apiPut,
    // Export apiService for direct use
    apiService
  };
};

export default useBackend;
