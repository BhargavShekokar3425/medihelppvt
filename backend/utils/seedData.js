/**
 * Use this script to seed initial data into the in-memory store
 */

// Sample data to initialize the system with
const defaultUsers = {
  'd1': {
    id: 'd1',
    email: 'doctor@example.com',
    password: 'password',
    name: 'Dr. Neha Sharma',
    role: 'doctor',
    username: 'drneha',
    specialization: 'Cardiology',
    experience: '10 years',
    avatar: '/assets/femme.jpeg',
    status: 'offline',
    lastSeen: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  'p1': {
    id: 'p1',
    email: 'patient@example.com',
    password: 'password123',
    name: 'Test Patient',
    role: 'patient',
    username: 'testpatient',
    dob: '1990-01-01',
    address: '123 Test St, Test City',
    contact: '555-123-4567',
    bloodGroup: 'O+',
    gender: 'Male',
    allergies: 'Penicillin, peanuts',
    status: 'offline',
    lastSeen: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  'ph1': {
    id: 'ph1',
    email: 'pharmacy@example.com',
    password: 'password',
    name: 'MediPulse Pharmacy',
    role: 'pharmacy',
    username: 'medipulse',
    address: '456 Med St, Medicine City',
    contact: '555-987-6543',
    status: 'offline',
    lastSeen: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

// Create sample conversations
const defaultConversations = {
  'conv1': {
    _id: 'conv1',
    participants: ['p1', 'd1'],
    type: 'individual',
    createdBy: 'd1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastMessage: 'I recommend coming in for a check-up as soon as possible. When are you available?',
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    lastSenderId: 'd1',
    unreadCounts: {
      'p1': 1,
      'd1': 0
    }
  },
  'conv2': {
    _id: 'conv2',
    participants: ['p1', 'ph1'],
    type: 'individual',
    createdBy: 'p1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastMessage: 'Thank you! I\'ll pick it up tomorrow.',
    lastMessageAt: new Date(Date.now() - 172740000).toISOString(),
    lastSenderId: 'p1',
    unreadCounts: {
      'p1': 0,
      'ph1': 0
    }
  }
};

// Create sample messages
const defaultMessages = {
  'm1': {
    _id: 'm1',
    conversationId: 'conv1',
    sender: 'd1',
    text: 'Hello! How can I help you today?',
    attachments: [],
    readBy: ['d1', 'p1'],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  'm2': {
    _id: 'm2',
    conversationId: 'conv1',
    sender: 'p1',
    text: 'I\'ve been experiencing headaches for the past week.',
    attachments: [],
    readBy: ['p1', 'd1'],
    createdAt: new Date(Date.now() - 3540000).toISOString(),
    updatedAt: new Date(Date.now() - 3540000).toISOString()
  },
  'm3': {
    _id: 'm3',
    conversationId: 'conv1',
    sender: 'd1',
    text: 'I recommend coming in for a check-up as soon as possible. When are you available?',
    attachments: [],
    readBy: ['d1'],
    createdAt: new Date(Date.now() - 3480000).toISOString(),
    updatedAt: new Date(Date.now() - 3480000).toISOString()
  },
  'm4': {
    _id: 'm4',
    conversationId: 'conv2',
    sender: 'ph1',
    text: 'Your prescription is ready for pickup.',
    attachments: [],
    readBy: ['ph1', 'p1'],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString()
  },
  'm5': {
    _id: 'm5',
    conversationId: 'conv2',
    sender: 'p1',
    text: 'Thank you! I\'ll pick it up tomorrow.',
    attachments: [],
    readBy: ['p1', 'ph1'],
    createdAt: new Date(Date.now() - 172740000).toISOString(),
    updatedAt: new Date(Date.now() - 172740000).toISOString()
  }
};

// Function to populate the global data store
function seedData() {
  // Initialize the data store if not already present
  if (!global.dataStore) {
    global.dataStore = {};
  }
  
  // Add users
  global.dataStore.users = defaultUsers;
  
  // Add conversations
  global.dataStore.conversations = defaultConversations;
  
  // Add messages
  global.dataStore.messages = defaultMessages;
  
  console.log('Data store seeded with sample data');
}

// Export the function to be used in server.js or other modules
module.exports = seedData;
