const User = require('../models/User.model');
const Message = require('../models/Message.model');
const Conversation = require('../models/Conversation.model');
const Notification = require('../models/Notification.model');

// Map to store active socket connections by user ID
const activeUsers = new Map();

module.exports = function(io) {
  io.on('connection', async (socket) => {
    try {
      const userId = socket.userId; // Set by auth middleware
      console.log(`User connected: ${userId}, Socket ID: ${socket.id}`);
      
      // Store socket in active users map
      activeUsers.set(userId, socket.id);
      
      // Update user status to online
      if (global.dataStore.users[userId]) {
        global.dataStore.users[userId].status = 'online';
        global.dataStore.users[userId].lastSeen = new Date().toISOString();
      }
      
      // Broadcast user's online status to all connected clients
      io.emit('user:online', userId);
      
      // Send list of online users to the newly connected client
      socket.emit('users:online', Array.from(activeUsers.keys()));
      
      // Handle typing events
      socket.on('typing:start', ({ conversationId }) => {
        // Broadcast to all participants except sender
        socket.to(conversationId).emit('typing:start', { conversationId, userId });
      });
      
      socket.on('typing:stop', ({ conversationId }) => {
        socket.to(conversationId).emit('typing:stop', { conversationId, userId });
      });
      
      // Handle new messages
      socket.on('message:send', async ({ conversationId, message }) => {
        console.log(`New message in conversation ${conversationId} from ${userId}`);
        
        // Join the conversation room if not already joined
        socket.join(conversationId);
        
        // Broadcast to all participants in the conversation except the sender
        socket.to(conversationId).emit('message:new', { conversationId, message });
      });
      
      // Handle read receipts
      socket.on('messages:read', ({ conversationId }) => {
        socket.to(conversationId).emit('messages:read', { conversationId, userId });
      });
      
      // Join all user's conversations
      socket.on('join:conversations', ({ conversations }) => {
        if (Array.isArray(conversations)) {
          conversations.forEach(conversationId => {
            socket.join(conversationId);
            console.log(`User ${userId} joined conversation: ${conversationId}`);
          });
        }
      });
      
      // Handle disconnect
      socket.on('disconnect', async () => {
        console.log(`User disconnected: ${userId}`);
        
        // Update user status to offline
        if (global.dataStore.users[userId]) {
          global.dataStore.users[userId].status = 'offline';
          global.dataStore.users[userId].lastSeen = new Date().toISOString();
        }
        
        // Remove from active users map
        activeUsers.delete(userId);
        
        // Broadcast user's offline status
        io.emit('user:offline', userId);
      });
      
    } catch (error) {
      console.error('Socket error:', error);
    }
  });
};
