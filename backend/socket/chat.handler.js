const User = require('../models/User.model');
const Conversation = require('../models/Conversation.model');

module.exports = (io) => {
  // Store online users
  const onlineUsers = new Map();
  
  io.on('connection', (socket) => {
    const userId = socket.user.id;
    
    // Add user to online users
    onlineUsers.set(userId, socket.id);
    
    // Update user last seen
    User.findByIdAndUpdate(userId, { lastSeen: Date.now() }).catch(err => {
      console.error('Error updating user last seen:', err);
    });
    
    // Broadcast to all connected clients that user is online
    socket.broadcast.emit('user:online', userId);
    
    // Send list of online users to newly connected client
    socket.emit('users:online', Array.from(onlineUsers.keys()));
    
    // Join socket rooms for all conversations user is part of
    Conversation.find({ participants: userId })
      .then(conversations => {
        conversations.forEach(conversation => {
          socket.join(conversation._id.toString());
        });
      })
      .catch(err => {
        console.error('Error joining conversation rooms:', err);
      });
    
    // Handle typing events
    socket.on('typing:start', (conversationId) => {
      socket.to(conversationId).emit('typing:start', {
        conversationId,
        userId
      });
    });
    
    socket.on('typing:stop', (conversationId) => {
      socket.to(conversationId).emit('typing:stop', {
        conversationId,
        userId
      });
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      // Remove user from online users
      onlineUsers.delete(userId);
      
      // Update user last seen
      User.findByIdAndUpdate(userId, { lastSeen: Date.now() }).catch(err => {
        console.error('Error updating user last seen:', err);
      });
      
      // Broadcast to all connected clients that user is offline
      socket.broadcast.emit('user:offline', userId);
    });
  });
};
