import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { chatService } from '../services/chatService';
import { prescriptionService } from '../services/prescriptionService';
import { reviewService } from '../services/reviewService';

export const useBackend = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Always call useNavigate unconditionally
  let navigate = useNavigate();
  
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
      setError(error.message);
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
      setError(error.message);
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
      setError(error.message);
      throw error;
    }
  };
  
  // Chat methods
  const getConversations = async (userId) => {
    setError(null);
    
    try {
      return await chatService.getConversations(userId);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };
  
  const sendMessage = async (conversationId, senderId, text, attachments) => {
    setError(null);
    
    try {
      return await chatService.sendMessage(conversationId, senderId, text, attachments);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };
  
  // Prescription methods
  const uploadPrescription = async (patientId, doctorId, prescriptionData, file) => {
    setError(null);
    setLoading(true);
    
    try {
      return await prescriptionService.uploadPrescription(patientId, doctorId, prescriptionData, file);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const getPatientPrescriptions = async (patientId) => {
    setError(null);
    setLoading(true);
    
    try {
      return await prescriptionService.getPatientPrescriptions(patientId);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const getDoctorPrescriptions = async (doctorId) => {
    setError(null);
    setLoading(true);
    
    try {
      return await prescriptionService.getDoctorPrescriptions(doctorId);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Review methods
  const addReview = async (patientId, doctorId, reviewData) => {
    setError(null);
    setLoading(true);
    
    try {
      return await reviewService.addReview(patientId, doctorId, reviewData);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const getDoctorReviews = async (doctorId) => {
    setError(null);
    setLoading(true);
    
    try {
      return await reviewService.getDoctorReviews(doctorId);
    } catch (error) {
      setError(error.message);
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
    // Prescription methods
    uploadPrescription,
    getPatientPrescriptions,
    getDoctorPrescriptions,
    getPrescription: prescriptionService.getPrescription,
    // Review methods
    addReview,
    getDoctorReviews,
    getTopRatedDoctors: reviewService.getTopRatedDoctors,
    updateReview: reviewService.updateReview
  };
};

export default useBackend;
