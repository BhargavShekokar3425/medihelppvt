import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const authService = {
  // Register a new user
  register: async (email, password, userType, userData) => {
    try {
      const response = await axios.post(`${API_URL}/users/register`, {
        email,
        password,
        userType,
        ...userData
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      
      return response.data.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },
  
  // Log in an existing user
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        email,
        password
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      
      return {
        user: response.data.data,
        userData: response.data.data
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  
  // Log out the current user
  logout: async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },
  
  // Get current user
  getCurrentUser: () => {
    return new Promise((resolve, reject) => {
      const user = localStorage.getItem('user');
      if (user) {
        resolve(JSON.parse(user));
      } else {
        resolve(null);
      }
    });
  },
  
  // Update user profile
  updateUserProfile: async (userId, data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/users/profile/${userId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data.data));
      
      return response.data.data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  }
};

export default authService;
