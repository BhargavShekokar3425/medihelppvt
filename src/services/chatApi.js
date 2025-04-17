// Mock API base URL - in a real app, this would point to your backend server
const API_BASE_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

/**
 * This is a mock implementation of the Chat API Service.
 * It simulates API responses for demonstration without requiring real backend connectivity.
 */

// Mock user data
const mockUsers = {
  patient: [
    { _id: 'p1', name: 'Anisha Gupta', type: 'patient', avatar: '/assets/patient1.png', status: 'online', lastSeen: 'Active now' },
    { _id: 'p2', name: 'Rahul Singh', type: 'patient', avatar: '/assets/patient2.png', status: 'online', lastSeen: 'Active now' },
    { _id: 'p3', name: 'Priya Sharma', type: 'patient', avatar: '/assets/patient3.png', status: 'offline', lastSeen: '2 hours ago' },
  ],
  doctor: [
    { _id: 'd1', name: 'Dr. Neha Sharma', type: 'doctor', avatar: '/assets/doc1.png', status: 'online', lastSeen: 'Active now', specialization: 'Cardiologist' },
    { _id: 'd2', name: 'Dr. Shikha Chibber', type: 'doctor', avatar: '/assets/doc2.png', status: 'offline', lastSeen: '30 minutes ago', specialization: 'Neurologist' },
    { _id: 'd3', name: 'Dr. Mohan Singh', type: 'doctor', avatar: '/assets/doc3.png', status: 'online', lastSeen: 'Active now', specialization: 'Pediatrician' },
  ],
  pharmacy: [
    { _id: 'ph1', name: 'MediPulse Pharmacy', type: 'pharmacy', avatar: '/assets/pharmacy1.png', status: 'online', lastSeen: 'Active now' },
    { _id: 'ph2', name: 'IIT-J Medical Store', type: 'pharmacy', avatar: '/assets/pharmacy2.png', status: 'online', lastSeen: 'Active now' },
  ]
};

// Mock conversations
const mockConversations = [
  { _id: 'conv1', participants: ['p1', 'd1'], updatedAt: new Date().toISOString() },
  { _id: 'conv2', participants: ['p1', 'd2'], updatedAt: new Date(Date.now() - 86400000).toISOString() },
  { _id: 'conv3', participants: ['p1', 'ph1'], updatedAt: new Date(Date.now() - 172800000).toISOString() },
];

// Mock messages
const mockMessages = {
  conv1: [
    { _id: 'm1', conversationId: 'conv1', sender: 'd1', receiver: 'p1', text: 'Hello! How can I help you today?', timestamp: new Date(Date.now() - 3600000).toISOString(), readBy: ['d1'] },
    { _id: 'm2', conversationId: 'conv1', sender: 'p1', receiver: 'd1', text: "I've been experiencing headaches for the past week.", timestamp: new Date(Date.now() - 3540000).toISOString(), readBy: ['p1', 'd1'] },
    { _id: 'm3', conversationId: 'conv1', sender: 'd1', receiver: 'p1', text: "I see. How severe are these headaches on a scale of 1-10?", timestamp: new Date(Date.now() - 3480000).toISOString(), readBy: ['d1'] },
  ],
  conv2: [
    { _id: 'm4', conversationId: 'conv2', sender: 'd2', receiver: 'p1', text: 'Have you taken your prescribed medications?', timestamp: new Date(Date.now() - 86400000).toISOString(), readBy: ['d2', 'p1'] },
    { _id: 'm5', conversationId: 'conv2', sender: 'p1', receiver: 'd2', text: "Yes, but I'm still experiencing some side effects.", timestamp: new Date(Date.now() - 86340000).toISOString(), readBy: ['p1', 'd2'] },
  ],
  conv3: [
    { _id: 'm6', conversationId: 'conv3', sender: 'ph1', receiver: 'p1', text: 'Your prescription is ready for pickup.', timestamp: new Date(Date.now() - 172800000).toISOString(), readBy: ['ph1', 'p1'] },
    { _id: 'm7', conversationId: 'conv3', sender: 'p1', receiver: 'ph1', text: "Thank you! I'll pick it up tomorrow.", timestamp: new Date(Date.now() - 172740000).toISOString(), readBy: ['p1', 'ph1'] },
  ],
};

// Mock user data for current user
const mockCurrentUser = {
  _id: 'p1',
  name: 'Anisha Gupta',
  email: 'anisha@example.com',
  type: 'patient',
  avatar: '/assets/patient1.png',
  age: 28,
  gender: 'Female',
  bloodGroup: 'B+',
  medicalHistory: ['Asthma', 'Allergies'],
  contactNumber: '9876543210',
  address: '123 IIT Campus, Jodhpur',
  emergencyContact: '9876543211 (Rahul Gupta - Husband)',
};

// Custom mock socket implementation (no need for socket.io-client)
class MockSocket {
  constructor() {
    this.eventHandlers = {};
    this.connected = true;
    
    // Simulate occasional message arrival
    this.messageInterval = setInterval(() => {
      if (Math.random() > 0.9 && this.eventHandlers['message:new']) {
        const newMessage = {
          _id: `m${Date.now()}`,
          conversationId: 'conv1',
          sender: 'd1',
          receiver: 'p1',
          text: 'Is there anything else I can help you with?',
          timestamp: new Date().toISOString(),
          readBy: ['d1']
        };
        
        this.eventHandlers['message:new'].forEach(handler => handler(newMessage));
      }
    }, 30000);
  }
  
  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
    return this;
  }
  
  off(event, handler) {
    if (this.eventHandlers[event]) {
      if (handler) {
        this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
      } else {
        delete this.eventHandlers[event];
      }
    }
    return this;
  }
  
  emit(event, ...args) {
    console.log(`Socket emitted event: ${event}`, args);
    
    // Simulate responses to specific events
    if (event === 'typing:start') {
      setTimeout(() => {
        if (this.eventHandlers['typing:stop']) {
          this.eventHandlers['typing:stop'].forEach(handler => handler({
            conversationId: args[0],
            userId: 'd1'
          }));
        }
      }, 5000);
    }
    
    return this;
  }
  
  disconnect() {
    this.connected = false;
    clearInterval(this.messageInterval);
    console.log('Socket disconnected');
  }
}

// Simulate a delay for async operations
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Chat API Service
export const chatApi = {
  // Connect to socket server - returns our mock socket
  connectSocket: (token) => {
    console.log('Connecting to socket with token:', token);
    return new MockSocket();
  },
  
  // Disconnect from socket server
  disconnectSocket: () => {
    console.log('Socket disconnected');
  },
  
  // Auth endpoints
  login: async (credentials) => {
    console.log('Login attempt:', credentials);
    await delay(1000); // Simulate network delay
    
    // In a real app, this would validate credentials with your backend
    if (credentials.type && credentials.email) {
      localStorage.setItem('token', 'mock-jwt-token');
      return {
        token: 'mock-jwt-token',
        user: mockCurrentUser
      };
    } else {
      throw new Error('Invalid credentials');
    }
  },
  
  logout: async () => {
    await delay(500);
    localStorage.removeItem('token');
    return { success: true };
  },
  
  // User endpoints
  getCurrentUser: async () => {
    await delay(800);
    return mockCurrentUser;
  },
  
  getUsers: async (type) => {
    await delay(1000);
    return mockUsers[type] || [];
  },
  
  // Conversation endpoints
  getConversations: async () => {
    await delay(1200);
    return mockConversations;
  },
  
  getOrCreateConversation: async (userId) => {
    await delay(800);
    const existingConv = mockConversations.find(conv => 
      conv.participants.includes('p1') && conv.participants.includes(userId)
    );
    
    if (existingConv) {
      return existingConv;
    }
    
    // Create a new conversation
    const newConv = {
      _id: `conv${Date.now()}`,
      participants: ['p1', userId],
      updatedAt: new Date().toISOString()
    };
    
    mockConversations.push(newConv);
    return newConv;
  },
  
  // Message endpoints
  getMessages: async (conversationId) => {
    await delay(1000);
    return mockMessages[conversationId] || [];
  },
  
  sendMessage: async (conversationId, text) => {
    await delay(800);
    
    const newMessage = {
      _id: `m${Date.now()}`,
      conversationId,
      sender: 'p1',
      text,
      timestamp: new Date().toISOString(),
      readBy: ['p1']
    };
    
    if (!mockMessages[conversationId]) {
      mockMessages[conversationId] = [];
    }
    
    mockMessages[conversationId].push(newMessage);
    return newMessage;
  },
  
  markAsRead: async (messageId) => {
    await delay(500);
    
    // Find and update the message's readBy field
    Object.keys(mockMessages).forEach(convId => {
      mockMessages[convId] = mockMessages[convId].map(msg => {
        if (msg._id === messageId && !msg.readBy.includes('p1')) {
          return { ...msg, readBy: [...msg.readBy, 'p1'] };
        }
        return msg;
      });
    });
    
    return { success: true };
  }
};

export default chatApi;
