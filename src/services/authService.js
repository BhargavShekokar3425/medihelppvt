import apiService from './apiService';

export const authService = {
  // Register a new user
  register: async (email, password, userType, userData) => {
    try {
      const response = await apiService.post('/users/register', {
        email,
        password,
        userType,
        ...userData
      });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },
  
  // Log in an existing user
  login: async (email, password) => {
    try {
      const response = await apiService.post('/users/login', {
        email,
        password
      });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return {
        user: response.data,
        userData: response.data
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
    return new Promise((resolve) => {
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
      const response = await apiService.put(`/users/profile/${userId}`, data);
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  }
};

export default authService;
