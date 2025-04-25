/**
 * API Client
 * 
 * This service handles communication between frontend and backend using a standardized
 * approach that follows REST architecture principles.
 * 
 * Features:
 * - Automatic token management
 * - Standardized error handling
 * - Request/response logging
 * - Base URL configuration
 */

import axios from 'axios';

// Configure base URL from environment or use default
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios client instance with default configuration
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for authentication and logging
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Add authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request details in development environment
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, 
        config.params ? `params: ${JSON.stringify(config.params)}` : '',
        config.data ? `data: ${JSON.stringify(config.data)}` : '');
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development environment
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    // Check if response contains data property, which is common in many API structures
    if (response.data && typeof response.data === 'object') {
      // Return the data directly if it exists, otherwise return the whole response
      return response.data.data || response.data;
    }
    
    // Return the whole response as fallback
    return response;
  },
  (error) => {
    // Handle API errors
    const errorResponse = {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      originalError: error
    };
    
    console.error('API Error Response:', errorResponse);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear stored credentials
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        console.log('Authentication error: Redirecting to login');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(errorResponse);
  }
);

/**
 * API Service 
 * 
 * Provides an interface for making REST API calls with standardized 
 * methods for each HTTP verb.
 */
const apiService = {
  /**
   * Make a GET request
   * @param {string} endpoint - The API endpoint to call
   * @param {Object} options - Request options (params, headers, etc)
   * @returns {Promise<any>} - The response data
   */
  get: async (endpoint, options = {}) => {
    try {
      return await apiClient.get(endpoint, options);
    } catch (error) {
      // The error is already processed by the interceptor
      throw error;
    }
  },
  
  /**
   * Make a POST request
   * @param {string} endpoint - The API endpoint to call
   * @param {Object} data - The data to send
   * @param {Object} options - Additional request options
   * @returns {Promise<any>} - The response data
   */
  post: async (endpoint, data = {}, options = {}) => {
    try {
      return await apiClient.post(endpoint, data, options);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Make a PUT request
   * @param {string} endpoint - The API endpoint to call
   * @param {Object} data - The data to send
   * @param {Object} options - Additional request options
   * @returns {Promise<any>} - The response data
   */
  put: async (endpoint, data = {}, options = {}) => {
    try {
      return await apiClient.put(endpoint, data, options);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Make a DELETE request
   * @param {string} endpoint - The API endpoint to call
   * @param {Object} options - Request options
   * @returns {Promise<any>} - The response data
   */
  delete: async (endpoint, options = {}) => {
    try {
      return await apiClient.delete(endpoint, options);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Upload a file using multipart/form-data
   * @param {string} endpoint - The API endpoint to call
   * @param {FormData} formData - The FormData object containing files
   * @param {Object} options - Additional request options
   * @returns {Promise<any>} - The response data
   */
  uploadFile: async (endpoint, formData, options = {}) => {
    try {
      const uploadOptions = {
        ...options,
        headers: {
          ...options.headers,
          'Content-Type': 'multipart/form-data'
        }
      };
      
      return await apiClient.post(endpoint, formData, uploadOptions);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Check authentication status with backend
   * @returns {Promise<boolean>} - True if authenticated
   */
  checkAuth: async () => {
    try {
      await apiClient.get('/auth/check');
      return true;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Helper to determine if a user has a specific role
   * @param {string} role - The role to check
   * @returns {boolean} - True if the user has the role
   */
  hasRole: (role) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.role === role;
  },
  
  /**
   * Helper to get the current user's role
   * @returns {string|null} - The user's role or null if not logged in
   */
  getUserRole: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.role || null;
  }
};

export default apiService;
