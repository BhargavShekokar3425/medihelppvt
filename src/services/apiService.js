import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create an axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Important for CORS issues
  withCredentials: false
});

// Log configuration for debugging
console.log('API Service configured with URL:', API_URL);

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Log the request for debugging
    console.log(`Making request to: ${config.method?.toUpperCase()} ${config.url}`);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful response for debugging
    console.log(`Response from ${response.config.url}:`, response.status);
    return response.data;  // This ensures we directly get the data from the response
  },
  (error) => {
    // Detailed error logging for debugging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', {
        data: error.response.data,
        status: error.response.status,
        headers: error.response.headers,
        url: error.config.url
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network error - no response received:', {
        request: error.request,
        url: error.config?.url
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request configuration error:', error.message);
    }
    
    // Handle unauthorized access (expired or invalid token)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login only if not already on login page
      if (!window.location.pathname.includes('/signup')) {
        console.log('Redirecting to login page due to 401 error');
        window.location.href = '/signup';
      }
    }
    
    // Enhanced error object
    const enhancedError = new Error(
      error.response?.data?.message || 
      error.response?.data?.error || 
      error.message || 
      'Unknown API error'
    );
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;
    
    return Promise.reject(enhancedError);
  }
);

const apiService = {
  get: async (endpoint, options = {}) => {
    try {
      return await axiosInstance.get(endpoint, options);
    } catch (error) {
      console.error(`GET ${endpoint} error:`, error);
      throw error;
    }
  },
  
  post: async (endpoint, data = {}) => {
    try {
      return await axiosInstance.post(endpoint, data);
    } catch (error) {
      console.error(`POST ${endpoint} error:`, error);
      throw error;
    }
  },
  
  put: async (endpoint, data = {}) => {
    try {
      return await axiosInstance.put(endpoint, data);
    } catch (error) {
      console.error(`PUT ${endpoint} error:`, error);
      throw error;
    }
  },
  
  delete: async (endpoint) => {
    try {
      return await axiosInstance.delete(endpoint);
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

// Test the API connectivity when this module loads
apiService.get('/health')
  .then(response => console.log('API health check successful:', response))
  .catch(err => console.warn('API health check failed:', err.message));

export default apiService;
