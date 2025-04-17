const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const chatRoutes = require('./routes/chat.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const prescriptionRoutes = require('./routes/prescription.routes');
const emergencyRoutes = require('./routes/emergency.routes');
const insuranceRoutes = require('./routes/insurance.routes');
const healthRecordRoutes = require('./routes/healthRecord.routes');

// Import middlewares
const { authMiddleware, roleMiddleware } = require('./middlewares/auth.middleware');
const errorHandler = require('./middlewares/error.middleware');
const socketAuthMiddleware = require('./middlewares/socketAuth.middleware');

// Import socket handlers
const chatHandler = require('./socket/chat.handler');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);
app.use('/api/appointments', authMiddleware, appointmentRoutes);
app.use('/api/prescriptions', authMiddleware, prescriptionRoutes);
app.use('/api/emergency', authMiddleware, emergencyRoutes);
app.use('/api/insurance', authMiddleware, insuranceRoutes);
app.use('/api/health-records', authMiddleware, healthRecordRoutes);

// Socket.io middleware and handlers
io.use(socketAuthMiddleware);
chatHandler(io);

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
