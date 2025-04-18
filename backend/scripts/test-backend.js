const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// API base URL
const API_URL = process.env.API_URL || 'http://localhost:5001/api';

// Test credentials
const testUser = {
  email: 'test@example.com',
  password: 'testpassword',
  name: 'Test User',
  userType: 'patient'
};

let authToken = null;

// Helper function for colored console output
const log = {
  info: (msg) => console.log(`\x1b[36m${msg}\x1b[0m`), // Cyan
  success: (msg) => console.log(`\x1b[32m✓ ${msg}\x1b[0m`), // Green
  error: (msg) => console.log(`\x1b[31m✗ ${msg}\x1b[0m`), // Red
  warn: (msg) => console.log(`\x1b[33m! ${msg}\x1b[0m`) // Yellow
};

// Helper function to make API requests
const api = {
  get: async (endpoint, auth = true) => {
    try {
      const headers = auth && authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const response = await axios.get(`${API_URL}${endpoint}`, { headers });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  post: async (endpoint, data, auth = true) => {
    try {
      const headers = auth && authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const response = await axios.post(`${API_URL}${endpoint}`, data, { headers });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  put: async (endpoint, data, auth = true) => {
    try {
      const headers = auth && authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const response = await axios.put(`${API_URL}${endpoint}`, data, { headers });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  delete: async (endpoint, auth = true) => {
    try {
      const headers = auth && authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const response = await axios.delete(`${API_URL}${endpoint}`, { headers });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

// Register a test user
const testRegistration = async () => {
  try {
    log.info('Testing user registration...');
    const response = await api.post('/auth/register', testUser, false);
    log.success('User registration successful');
    return response;
  } catch (error) {
    if (error.message && error.message.includes('already exists')) {
      log.warn('User already exists, continuing with login');
      return null;
    }
    log.error(`Registration failed: ${error.message || JSON.stringify(error)}`);
    throw error;
  }
};

// Login test user
const testLogin = async () => {
  try {
    log.info('Testing user login...');
    const response = await api.post('/auth/login', {
      email: testUser.email,
      password: testUser.password
    }, false);
    authToken = response.token;
    log.success('User login successful');
    return response;
  } catch (error) {
    log.error(`Login failed: ${error.message || JSON.stringify(error)}`);
    throw error;
  }
};

// Test getting user profile
const testUserProfile = async () => {
  try {
    log.info('Testing user profile retrieval...');
    const response = await api.get('/users/me');
    log.success('User profile retrieved successfully');
    return response;
  } catch (error) {
    log.error(`Profile retrieval failed: ${error.message || JSON.stringify(error)}`);
    throw error;
  }
};

// Test prescription creation
const testPrescriptionCreation = async (doctorId) => {
  try {
    log.info('Testing prescription creation...');
    const response = await api.post('/prescriptions', {
      patientId: testUser.uid,
      doctorId,
      medications: [
        {
          name: 'Test Medication',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '7 days'
        }
      ],
      diagnosis: 'Test diagnosis',
      instructions: 'Test instructions'
    });
    log.success('Prescription created successfully');
    return response;
  } catch (error) {
    log.error(`Prescription creation failed: ${error.message || JSON.stringify(error)}`);
    throw error;
  }
};

// Run all tests
const runTests = async () => {
  try {
    log.info('Starting backend functionality tests...');
    
    // Register test user
    await testRegistration();
    
    // Login
    const loginResponse = await testLogin();
    testUser.uid = loginResponse.user.uid;
    
    // Get user profile
    await testUserProfile();
    
    // Get doctors for prescription test
    log.info('Getting doctors list...');
    const doctorsResponse = await api.get('/doctors');
    const doctor = doctorsResponse.data[0];
    
    if (doctor) {
      // Test prescription creation
      await testPrescriptionCreation(doctor.id);
    } else {
      log.warn('No doctors found, skipping prescription test');
    }
    
    log.success('All tests completed successfully');
  } catch (error) {
    log.error(`Test suite failed: ${error}`);
  }
};

// Run the tests
runTests();
