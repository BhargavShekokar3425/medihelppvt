import axios from 'axios';

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
  }
};

export default apiService;
