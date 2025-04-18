const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Load env variables
dotenv.config({ path: './config/config.env' });

// Create Express app
const app = express();
const server = http.createServer(app);

// Initialize the in-memory data store
global.dataStore = {
  users: {},
  conversations: {},
  messages: {},
  appointments: {},
  reviews: {},
  prescriptions: {}
};

// Add sample data for development
const initializeData = () => {
  // Sample users
  const users = {
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
      lastSeen: new Date().toISOString()
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
      lastSeen: new Date().toISOString()
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
      lastSeen: new Date().toISOString()
    }
  };
  
  // Add users to datastore
  global.dataStore.users = users;
  
  // Sample conversations
  const conversations = {
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
  
  // Add conversations to datastore
  global.dataStore.conversations = conversations;
  
  // Sample messages
  const messages = {
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
  
  // Add messages to datastore
  global.dataStore.messages = messages;
};

// Initialize data
initializeData();

// Socket.io setup
const io = socketIo(server, {
  cors: {
    // Allow connections from all origins since frontend could be on a different port
    origin: "*",
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(express.json());

// CORS middleware - IMPORTANT FOR THE NETWORK ERROR
app.use(cors({
  // Allow connections from all origins since frontend could be on a different port
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Socket.io Authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error - no token provided'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_should_be_long_and_secure');
    socket.userId = decoded.id;
    next();
  } catch (error) {
    return next(new Error('Authentication error - invalid token'));
  }
});

// Try loading socket handler
try {
  const socketHandler = require('./utils/socket');
  socketHandler(io);
  console.log("Socket handlers initialized");
} catch (error) {
  console.error('Error loading socket handler:', error.message);
  console.log('Socket functionality will be limited');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API is running',
    timestamp: new Date().toISOString() 
  });
});

// Root API route
app.get('/api', (req, res) => {
  res.json({
    message: 'MediHelp API is running',
    endpoints: [
      '/api/auth',
      '/api/users',
      '/api/chat',
      '/api/appointments',
      '/api/reviews',
      '/api/prescriptions',
      '/api/health'
    ]
  });
});

// Routes
try {
  app.use('/api/auth', require('./routes/auth.routes'));
} catch (error) {
  console.error('Error loading auth routes:', error.message);
  // Create a basic auth route for testing
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt: ${email}, ${password}`);
    
    const user = Object.values(global.dataStore.users).find(
      u => u.email === email && u.password === password
    );
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key_should_be_long_and_secure',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
}

// Create placeholder routes
const createPlaceholderRouter = (routeName) => {
  const router = express.Router();
  
  router.get('/', (req, res) => {
    res.json({ 
      message: `${routeName} API is not fully implemented yet`,
      status: 'placeholder'
    });
  });
  
  return router;
};

// Try loading other routes, or use placeholder routes
// Chat routes
try {
  app.use('/api/chat', require('./routes/chat.routes'));
} catch (error) {
  console.warn('Chat routes not found, creating placeholder endpoint');
  app.use('/api/chat', createPlaceholderRouter('Chat'));
}

// User routes
try {
  app.use('/api/users', require('./routes/user.routes'));
} catch (error) {
  console.warn('User routes not found, creating placeholder endpoint');
  app.use('/api/users', createPlaceholderRouter('Users'));
}

// Other routes
['appointments', 'reviews', 'prescriptions'].forEach(route => {
  try {
    app.use(`/api/${route}`, require(`./routes/${route}.routes`));
  } catch (error) {
    console.warn(`${route} routes not found, creating placeholder endpoint`);
    app.use(`/api/${route}`, createPlaceholderRouter(route.charAt(0).toUpperCase() + route.slice(1)));
  }
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API is available at http://localhost:${PORT}/api`);
});

module.exports = { app, server };
