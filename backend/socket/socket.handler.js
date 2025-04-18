const { auth } = require('../config/firebase.config');
const userService = require('../services/user.service');

// Track online users
const onlineUsers = new Map();

// Socket.io handler
const socketHandler = (io) => {
  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }
      
      // Verify Firebase token
      const decodedToken = await auth.verifyIdToken(token);
      socket.user = { id: decodedToken.uid };
      
      // Get user data
      const userData = await userService.getUserById(decodedToken.uid);
      socket.user.data = userData;
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);
    
    // Add user to online users map
    onlineUsers.set(socket.user.id, {
      socketId: socket.id,
      userType: socket.user.data.userType,
      lastSeen: new Date()
    });
    
    // Update user status in database
    userService.updateUserProfile(socket.user.id, {
      isOnline: true,
      lastSeen: new Date()
    }).catch(err => console.error('Error updating online status:', err));
    
    // Broadcast to everyone that user is online
    socket.broadcast.emit('user:online', {
      userId: socket.user.id,
      userType: socket.user.data.userType
    });
    
    // Send initial list of online users to the connected client
    const onlineUsersList = Array.from(onlineUsers.entries()).map(([userId, data]) => ({
      userId,
      userType: data.userType
    }));
    
    socket.emit('users:online', onlineUsersList);
    
    // Join rooms for all conversations user is part of
    socket.join(`user:${socket.user.id}`);
    
    // Handle joining chat rooms
    socket.on('room:join', (roomId) => {
      socket.join(roomId);
    });
    
    // Handle leaving chat rooms
    socket.on('room:leave', (roomId) => {
      socket.leave(roomId);
    });
    
    // Handle new messages
    socket.on('message:send', async (data) => {
      // Validate message data
      if (!data.conversationId || !data.text) {
        socket.emit('error', { message: 'Invalid message data' });
        return;
      }
      
      try {
        // Get participants from conversation ID
        const participants = data.conversationId.split('_');
        
        // Broadcast message to all participants
        participants.forEach(participantId => {
          if (participantId !== socket.user.id) {
            io.to(`user:${participantId}`).emit('message:received', {
              ...data,
              sender: socket.user.id,
              createdAt: new Date().toISOString()
            });
          }
        });
        
        // Acknowledge receipt
        socket.emit('message:sent', {
          messageId: data.messageId,
          status: 'sent'
        });
      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });
    
    // Handle typing indicators
    socket.on('typing:start', (conversationId) => {
      socket.to(conversationId).emit('typing:start', {
        userId: socket.user.id,
        conversationId
      });
    });
    
    socket.on('typing:stop', (conversationId) => {
      socket.to(conversationId).emit('typing:stop', {
        userId: socket.user.id,
        conversationId
      });
    });
    
    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.id}`);
      
      // Remove user from online users map
      onlineUsers.delete(socket.user.id);
      
      // Update user status in database
      userService.updateUserProfile(socket.user.id, {
        isOnline: false,
        lastSeen: new Date()
      }).catch(err => console.error('Error updating offline status:', err));
      
      // Broadcast to everyone that user is offline
      socket.broadcast.emit('user:offline', {
        userId: socket.user.id
      });
    });
  });
};

module.exports = socketHandler;
