import axios from 'axios';
import smsService from './smsService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create an axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;  // This ensures we directly get the data from the response
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error.response?.data || error);
  }
);

const apiService = {
  get: async (endpoint, options = {}) => {
    try {
      console.log(`Sending GET to ${endpoint} with options:`, options);
      
      // Fix: Ensure parameters are sent correctly
      const config = { ...options };
      if (options.params) {
        config.params = { ...options.params };
      }
      
      const response = await axiosInstance.get(endpoint, config);
      console.log(`Response from ${endpoint}:`, response);
      return response;
    } catch (error) {
      console.error(`GET ${endpoint} error:`, error);
      // Enhance error handling
      const errorMessage = error.response?.data?.message || error.message || 'API request failed';
      const enhancedError = new Error(errorMessage);
      enhancedError.status = error.response?.status;
      enhancedError.data = error.response?.data;
      throw enhancedError;
    }
  },
  
  post: async (endpoint, data = {}) => {
    try {
      console.log(`Sending POST to ${endpoint}:`, data);
      const response = await axiosInstance.post(endpoint, data);
      console.log(`Response from ${endpoint}:`, response);
      return response;
    } catch (error) {
      // Enhanced error logging and handling
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        console.error(`POST ${endpoint} error:`, {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        // The request was made but no response was received
        console.error(`POST ${endpoint} no response:`, error.request);
      } else {
        // Something happened in setting up the request
        console.error(`POST ${endpoint} error:`, error.message);
      }
      
      // Create better error object for client code
      const errorMessage = error.response?.data?.message || error.message || 'API request failed';
      const enhancedError = new Error(errorMessage);
      enhancedError.status = error.response?.status;
      enhancedError.data = error.response?.data;
      throw enhancedError;
    }
  },
  
  put: async (endpoint, data = {}) => {
    try {
      const response = await axiosInstance.put(endpoint, data);
      return response;
    } catch (error) {
      console.error(`PUT ${endpoint} error:`, error);
      throw error;
    }
  },
  
  delete: async (endpoint) => {
    try {
      const response = await axiosInstance.delete(endpoint);
      return response;
    } catch (error) {
      console.error(`DELETE ${endpoint} error:`, error);
      throw error;
    }
  },

  // Add a helper function to determine if user is doctor
  isUserDoctor: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.role === 'doctor';
  },
  
  // Add a helper function to determine if user is patient
  isUserPatient: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.role === 'patient';
  },
  
  // Get the current user's role
  getUserRole: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.role;
  },

  // Add these methods for SOS functionality
  sendSosAlert: async (userId, latitude, longitude, hospitalId = null) => {
    try {
      const response = await axiosInstance.post('/api/emergency/sos', {
        userId,
        location: { latitude, longitude, accuracy: 10 },
        hospitalId,
        emergencyType: 'medical',
        description: 'Medical emergency requiring immediate assistance'
      });
      return response.data;
    } catch (error) {
      console.error('Error sending SOS:', error);
      throw error;
    }
  },
  
  // Get SOS status
  getSosStatus: async (sosId) => {
    try {
      const response = await axiosInstance.get(`/api/emergency/${sosId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting SOS status:', error);
      throw error;
    }
  },
  
  // Update SOS status
  updateSosStatus: async (sosId, status) => {
    try {
      const response = await axiosInstance.put(`/api/emergency/${sosId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating SOS status:', error);
      throw error;
    }
  },
  
  // Get nearby hospitals
  getNearbyHospitals: async (latitude, longitude, radius = 10) => {
    try {
      const response = await axiosInstance.get('/api/emergency/hospitals', {
        params: { latitude, longitude, radius }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby hospitals:', error);
      throw error;
    }
  },

  // Add SMS sending capability to the API service
  async sendSMS(phoneNumber, message) {
    try {
      // First try to use the backend API
      const response = await this.post('/notifications/sms', {
        to: phoneNumber,
        message
      });
      return response;
    } catch (error) {
      // If backend API fails, try using our SMS service directly
      console.warn('Backend SMS API failed, using SMS service directly:', error);
      return smsService.sendSMS(phoneNumber, message);
    }
  },

  // Send bulk SMS messages
  async sendBulkSMS(phoneNumbers, message) {
    try {
      // First try to use the backend API
      const response = await this.post('/notifications/sms/bulk', {
        to: phoneNumbers,
        message
      });
      return response;
    } catch (error) {
      // If backend API fails, try using our SMS service directly
      console.warn('Backend bulk SMS API failed, using SMS service directly:', error);
      return smsService.sendBulkSMS(phoneNumbers, message);
    }
  },

  // Send SOS with enhanced backup systems
  async sendSos(userId, latitude, longitude, hospitalId) {
    try {
      const response = await this.post('/emergency/sos', {
        userId,
        latitude,
        longitude,
        hospitalId,
        timestamp: new Date().toISOString()
      });
      
      return response;
    } catch (error) {
      console.error('Error sending SOS through API:', error);
      
      // Create a fallback SOS data structure
      const sosData = {
        success: false,
        id: `local-sos-${Date.now()}`,
        message: 'SOS created locally due to server error',
        timestamp: new Date().toISOString(),
        status: 'created'
      };
      
      // Store in local storage as a backup
      try {
        const existingSOS = JSON.parse(localStorage.getItem('emergency_sos') || '[]');
        existingSOS.push({
          userId,
          latitude,
          longitude,
          hospitalId,
          ...sosData
        });
        localStorage.setItem('emergency_sos', JSON.stringify(existingSOS));
      } catch (storageError) {
        console.error('Failed to store emergency data locally:', storageError);
      }
      
      throw error;
    }
  }
};

export default apiService;
