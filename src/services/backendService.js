// import axios from 'axios';

// // Get base URL from environment or use default
// const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// // Create axios instance
// const apiClient = axios.create({
//   baseURL: BASE_URL,
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// // Add request interceptor to add auth token
// apiClient.interceptors.request.use(
//   config => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   error => Promise.reject(error)
// );

// // Add response interceptor to handle common errors
// apiClient.interceptors.response.use(
//   response => response,
//   error => {
//     // Handle 401 Unauthorized - redirect to login
//     if (error.response && error.response.status === 401) {
//       localStorage.removeItem('token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// // Backend service object
// const backendService = {
//   // Auth endpoints
//   auth: {
//     // Register new user
//     register: async (userData) => {
//       const response = await apiClient.post('/auth/register', userData);
//       if (response.data.token) {
//         localStorage.setItem('token', response.data.token);
//       }
//       return response.data;
//     },
    
//     // Login user
//     login: async (email, password) => {
//       const response = await apiClient.post('/auth/login', { email, password });
//       if (response.data.token) {
//         localStorage.setItem('token', response.data.token);
//       }
//       return response.data;
//     },
    
//     // Logout user
//     logout: async () => {
//       const response = await apiClient.post('/auth/logout');
//       localStorage.removeItem('token');
//       return response.data;
//     },
    
//     // Get current user info
//     getCurrentUser: async () => {
//       const response = await apiClient.get('/auth/me');
//       return response.data;
//     }
//   },
  
//   // User endpoints
//   users: {
//     // Get user profile
//     getProfile: async (userId) => {
//       const response = await apiClient.get(`/users/${userId}`);
//       return response.data;
//     },
    
//     // Update profile
//     updateProfile: async (data) => {
//       const response = await apiClient.put('/users/profile', data);
//       return response.data;
//     },
    
//     // Get doctors
//     getDoctors: async (filters) => {
//       const response = await apiClient.get('/users/doctors', { 
//         params: filters 
//       });
//       return response.data;
//     }
//   },
  
//   // Prescription endpoints
//   prescriptions: {
//     // Get user prescriptions
//     getAll: async () => {
//       const response = await apiClient.get('/prescriptions');
//       return response.data;
//     },
    
//     // Get prescription by ID
//     getById: async (id) => {
//       const response = await apiClient.get(`/prescriptions/${id}`);
//       return response.data;
//     },
    
//     // Create prescription
//     create: async (data) => {
//       const response = await apiClient.post('/prescriptions', data);
//       return response.data;
//     },
    
//     // Upload prescription image
//     uploadImage: async (file) => {
//       // Create form data
//       const formData = new FormData();
//       formData.append('image', file);
      
//       const response = await apiClient.post('/prescriptions/upload', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       });
      
//       return response.data;
//     }
//   },
  
//   // Appointment endpoints
//   appointments: {
//     // Get user appointments
//     getAll: async () => {
//       const response = await apiClient.get('/appointments');
//       return response.data;
//     },
    
//     // Get appointment by ID
//     getById: async (id) => {
//       const response = await apiClient.get(`/appointments/${id}`);
//       return response.data;
//     },
    
//     // Create appointment
//     create: async (data) => {
//       const response = await apiClient.post('/appointments', data);
//       return response.data;
//     },
    
//     // Update appointment status
//     updateStatus: async (id, status) => {
//       const response = await apiClient.put(`/appointments/${id}/status`, { status });
//       return response.data;
//     }
//   },
  
//   // Chat endpoints
//   chat: {
//     // Get all conversations
//     getConversations: async () => {
//       const response = await apiClient.get('/chat/conversations');
//       return response.data;
//     },
    
//     // Get messages for conversation
//     getMessages: async (conversationId) => {
//       const response = await apiClient.get(`/chat/conversations/${conversationId}/messages`);
//       return response.data;
//     },
    
//     // Send message
//     sendMessage: async (conversationId, message) => {
//       const response = await apiClient.post(`/chat/conversations/${conversationId}/messages`, message);
//       return response.data;
//     }
//   },
  
//   // Reviews endpoints
//   reviews: {
//     // Get reviews for a doctor
//     getForDoctor: async (doctorId) => {
//       const response = await apiClient.get(`/reviews/doctor/${doctorId}`);
//       return response.data;
//     },
    
//     // Add a review
//     create: async (data) => {
//       const response = await apiClient.post('/reviews', data);
//       return response.data;
//     }
//   },
  
//   // Emergency endpoints
//   emergency: {
//     // Create SOS request
//     createSOS: async (data) => {
//       const response = await apiClient.post('/emergency/sos', data);
//       return response.data;
//     },
    
//     // Get SOS status
//     getStatus: async (id) => {
//       const response = await apiClient.get(`/emergency/${id}`);
//       return response.data;
//     }
//   },
  
//   // Health check endpoint
//   ping: async () => {
//     try {
//       const start = Date.now();
//       await apiClient.get('/health');
//       const end = Date.now();
//       return {
//         online: true,
//         latency: end - start
//       };
//     } catch (error) {
//       return {
//         online: false,
//         error: error.message
//       };
//     }
//   }
// };

// export default backendService;

// Placeholder service implementations that use the backend API instead of Firebase directly

import axios from 'axios';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Mock helper functions - will interact with backend instead of Firebase directly
const serverTimestamp = () => new Date().toISOString();
const arrayUnion = (...items) => items;

// Auth service that communicates with backend
const auth = {
  currentUser: null,
  
  // Sign in with email and password
  async signInWithEmailAndPassword(email, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      auth.currentUser = response.data.user;
      return { user: auth.currentUser };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },
  
  // Create a new user
  async createUserWithEmailAndPassword(email, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { email, password });
      auth.currentUser = response.data.user;
      return { user: auth.currentUser };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },
  
  // Sign out current user
  async signOut() {
    try {
      await axios.post(`${API_URL}/auth/logout`);
      auth.currentUser = null;
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
  
  // Get current auth state
  onAuthStateChanged(callback) {
    // Check token on startup
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          auth.currentUser = response.data;
          callback(auth.currentUser);
        } else {
          callback(null);
        }
      } catch (error) {
        localStorage.removeItem('token');
        callback(null);
      }
    };
    
    checkAuth();
    
    // Return unsubscribe function
    return () => {};
  }
};

// Database service that communicates with backend
const db = {
  // Get a document from a collection
  collection(collectionName) {
    return {
      // Get a document reference
      doc(id) {
        return {
          // Get document data
          async get() {
            try {
              const response = await axios.get(
                `${API_URL}/db/${collectionName}/${id}`
              );
              
              return {
                exists: true,
                data: () => response.data,
                id
              };
            } catch (error) {
              return {
                exists: false,
                data: () => ({}),
                id
              };
            }
          },
          // Update document data
          async set(data) {
            try {
              await axios.put(
                `${API_URL}/db/${collectionName}/${id}`,
                data
              );
              return true;
            } catch (error) {
              console.error(`Error setting document ${id}:`, error);
              throw error;
            }
          },
          // Update document data with merge
          async update(data) {
            try {
              await axios.patch(
                `${API_URL}/db/${collectionName}/${id}`,
                data
              );
              return true;
            } catch (error) {
              console.error(`Error updating document ${id}:`, error);
              throw error;
            }
          }
        };
      },
      // Query collection
      where() {
        return this;
      },
      // Limit results
      limit() {
        return this;
      },
      // Order results
      orderBy() {
        return this;
      },
      // Execute query
      async get() {
        try {
          const response = await axios.get(
            `${API_URL}/db/${collectionName}`
          );
          
          return {
            empty: response.data.length === 0,
            docs: response.data.map(doc => ({
              id: doc.id,
              data: () => doc,
              exists: true
            }))
          };
        } catch (error) {
          return {
            empty: true,
            docs: []
          };
        }
      },
      // Add document to collection
      async add(data) {
        try {
          const response = await axios.post(
            `${API_URL}/db/${collectionName}`,
            data
          );
          
          return {
            id: response.data.id
          };
        } catch (error) {
          console.error('Error adding document:', error);
          throw error;
        }
      }
    };
  }
};

// Storage service that communicates with backend
const storage = {
  ref(path) {
    return {
      // Upload file
      async put(file) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await axios.post(
            `${API_URL}/storage/upload?path=${path}`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          
          return {
            ref: {
              getDownloadURL: async () => response.data.url
            }
          };
        } catch (error) {
          console.error('Error uploading file:', error);
          throw error;
        }
      }
    };
  }
};

// Export services with same interface as Firebase, but backed by REST API
export { auth, db, storage, serverTimestamp, arrayUnion };

// Flag that we're using REST API backend (not Firebase)
export const usingBackendApi = true;
