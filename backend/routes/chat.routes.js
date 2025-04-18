const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Create a basic controller with minimal functionality
const chatController = {
  getConversations: (req, res) => {
    const userId = req.user.id;
    
    // Get conversations where user is a participant
    const conversations = Object.values(global.dataStore.conversations || {})
      .filter(c => c.participants.includes(userId))
      .map(c => {
        // Get the other participant
        const otherParticipantId = c.participants.find(p => p !== userId);
        const otherParticipant = global.dataStore.users[otherParticipantId] || {};
        
        return {
          ...c,
          otherParticipants: [{
            _id: otherParticipantId,
            name: otherParticipant.name,
            avatar: otherParticipant.avatar,
            role: otherParticipant.role
          }]
        };
      });
      
    res.json({
      success: true,
      data: conversations
    });
  },
  
  getMessages: (req, res) => {
    const { conversationId } = req.params;
    
    // Get messages for the conversation
    const messages = Object.values(global.dataStore.messages || {})
      .filter(m => m.conversationId === conversationId)
      .map(m => {
        const sender = global.dataStore.users[m.sender] || {};
        
        return {
          ...m,
          sender: {
            _id: m.sender,
            name: sender.name,
            avatar: sender.avatar
          }
        };
      });
      
    res.json({
      success: true,
      data: messages
    });
  }
};

// Apply auth middleware to all chat routes
router.use(protect);

// Chat routes
router.get('/conversations', chatController.getConversations);
router.get('/conversations/:conversationId/messages', chatController.getMessages);

module.exports = router;
