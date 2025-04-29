// Simple in-memory data store for the application
// In a production app, this would be replaced with a proper database

const fs = require('fs').promises;
const path = require('path');

// Storage path for persistence
const DATA_DIR = path.join(__dirname, '../../data');

// In-memory storage
const store = {
  users: [],
  doctors: [],
  appointments: [],
  prescriptions: [],
  emergencyRequests: [],
  hospitals: [],
  reviews: [],
  
  // Helper functions
  findUserById: (id) => {
    return store.users.find(user => user.id === id);
  },
  
  findUserByEmail: (email) => {
    return store.users.find(user => user.email === email);
  },
  
  createUser: (userData) => {
    const id = `user_${Date.now()}`;
    const newUser = { id, ...userData };
    store.users.push(newUser);
    saveCollection('users', store.users);
    return newUser;
  },
  
  updateUser: (id, userData) => {
    const index = store.users.findIndex(user => user.id === id);
    if (index !== -1) {
      store.users[index] = { ...store.users[index], ...userData };
      saveCollection('users', store.users);
      return store.users[index];
    }
    return null;
  },
  
  // Emergency request management
  createEmergencyRequest: (requestData) => {
    const id = `sos_${Date.now()}`;
    const newRequest = { id, ...requestData, createdAt: new Date().toISOString() };
    store.emergencyRequests.push(newRequest);
    saveCollection('emergencyRequests', store.emergencyRequests);
    return newRequest;
  },
  
  updateEmergencyRequest: (id, updateData) => {
    const index = store.emergencyRequests.findIndex(req => req.id === id);
    if (index !== -1) {
      store.emergencyRequests[index] = { 
        ...store.emergencyRequests[index], 
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      saveCollection('emergencyRequests', store.emergencyRequests);
      return store.emergencyRequests[index];
    }
    return null;
  },
  
  getEmergencyRequestById: (id) => {
    return store.emergencyRequests.find(req => req.id === id);
  },
  
  // Hospital management
  getHospitalById: (id) => {
    return store.hospitals.find(h => h.id === id);
  }
};

// Persistence helpers
async function loadCollection(collection) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const data = await fs.readFile(path.join(DATA_DIR, `${collection}.json`), 'utf8');
    store[collection] = JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet or can't be read - use empty array
    store[collection] = store[collection] || [];
  }
}

async function saveCollection(collection, data) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      path.join(DATA_DIR, `${collection}.json`), 
      JSON.stringify(data, null, 2),
      'utf8'
    );
  } catch (error) {
    console.error(`Error saving ${collection}:`, error);
  }
}

// Initialize store from saved data
async function initializeStore() {
  const collections = ['users', 'doctors', 'appointments', 'prescriptions', 'emergencyRequests', 'hospitals', 'reviews'];
  
  for (const collection of collections) {
    await loadCollection(collection);
  }
  
  console.log('Data store initialized');
}

// Initialize on module load
initializeStore();

module.exports = store;
