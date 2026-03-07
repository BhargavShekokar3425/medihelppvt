const path = require('path');
const dotenv = require('dotenv');

// Load env vars BEFORE anything else
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Route files
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const emergencyRoutes = require('./routes/emergency.routes');
const reviewRoutes = require('./routes/review.routes');
const prescriptionRoutes = require('./routes/prescription.routes');
const notificationRoutes = require('./routes/notification.routes');
const forumRoutes = require('./routes/forum.routes');
const chatRoutes = require('./routes/chat.routes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// --------------- Socket.io Setup ---------------
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5001',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Track online users: userId -> Set of socket ids
const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication error'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.userId;
  console.log(`Socket connected: ${userId}`);

  // Join user's private room
  socket.join(`user:${userId}`);

  // Track online status
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socket.id);

  // Broadcast online users
  io.emit('users:online', [...onlineUsers.keys()]);

  // Handle typing
  socket.on('typing:start', (conversationId) => {
    socket.to(`conv:${conversationId}`).emit('typing:start', { conversationId, userId });
  });
  socket.on('typing:stop', (conversationId) => {
    socket.to(`conv:${conversationId}`).emit('typing:stop', { conversationId, userId });
  });

  // Join conversation room for real-time updates
  socket.on('conversation:join', (conversationId) => {
    socket.join(`conv:${conversationId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${userId}`);
    const sockets = onlineUsers.get(userId);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        onlineUsers.delete(userId);
        io.emit('user:offline', userId);
      }
    }
    io.emit('users:online', [...onlineUsers.keys()]);
  });
});

// Attach io to app for use in routes
app.set('io', io);

// --------------- Middleware ---------------
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5001',
  credentials: true,
}));
app.use(express.json());

// Serve uploaded files (profile photos etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --------------- API Routes ---------------
app.get('/api', (_req, res) => res.json({ status: 'ok', message: 'MediHelp API is running.' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/chat', chatRoutes);

// --------------- Error Handler ---------------
app.use(errorHandler);

// --------------- Start Server ---------------
const start = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`\n  MediHelp API running on http://localhost:${PORT}`);
      console.log(`  Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5001'}`);
      console.log(`  Socket.io  : Enabled\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
