const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// In-memory store for conversations
if (!global.dataStore.conversations) {
  global.dataStore.conversations = {};
}

// Helper to generate IDs
const generateId = (prefix = '') => `${prefix}${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Get all conversations for a user
exports.getConversations = (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = [];
    
    Object.entries(global.dataStore.conversations).forEach(([id, conversation]) => {
      if (conversation.participants.includes(userId)) {
        conversations.push({
          id,
          ...conversation,
          // Filter out the current user from participants
          otherParticipants: conversation.participants.filter(p => p !== userId)
        });
      }
    });
    
    res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Get a single conversation
exports.getConversation = (req, res) => {
  try {
    const conversation = global.dataStore.conversations[req.params.id];
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    // Check if user is a participant
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this conversation'
      });
    }
    
    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Create new conversation
exports.createConversation = (req, res) => {
  try {
    const { participantId } = req.body;
    
    if (!participantId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a participant ID'
      });
    }
    
    // Check if participant exists
    if (!global.dataStore.users[participantId]) {
      return res.status(404).json({
        success: false,
        error: 'Participant not found'
      });
    }
    
    // Check if conversation already exists
    let existingConversation = null;
    Object.entries(global.dataStore.conversations).forEach(([id, conversation]) => {
      if (
        conversation.type === 'individual' &&
        conversation.participants.includes(req.user.id) &&
        conversation.participants.includes(participantId)
      ) {
        existingConversation = { id, ...conversation };
      }
    });
    
    if (existingConversation) {
      return res.status(200).json({
        success: true,
        data: existingConversation
      });
    }
    
    // Create new conversation
    const conversationId = generateId('conv_');
    const newConversation = {
      participants: [req.user.id, participantId],
      type: 'individual',
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      unreadCount: {
        [req.user.id]: 0,
        [participantId]: 0
      }
    };
    
    global.dataStore.conversations[conversationId] = newConversation;
    
    res.status(201).json({
      success: true,
      data: {
        id: conversationId,
        ...newConversation
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Get messages for a conversation
exports.getMessages = (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = global.dataStore.conversations[conversationId];
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    // Check if user is a participant
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this conversation'
      });
    }
    
    res.status(200).json({
      success: true,
      data: conversation.messages || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Send a message
exports.sendMessage = (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, attachments } = req.body;
    
    if (!text && (!attachments || attachments.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide message text or attachments'
      });
    }
    
    const conversation = global.dataStore.conversations[conversationId];
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    // Check if user is a participant
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this conversation'
      });
    }
    
    // Create message
    const newMessage = {
      id: generateId('msg_'),
      sender: req.user.id,
      text,
      attachments: attachments || [],
      readBy: [req.user.id],
      createdAt: new Date().toISOString()
    };
    
    // Add message to conversation
    if (!conversation.messages) {
      conversation.messages = [];
    }
    conversation.messages.push(newMessage);
    
    // Update conversation's lastMessage and updatedAt
    conversation.lastMessage = text;
    conversation.lastMessageSender = req.user.id;
    conversation.updatedAt = new Date().toISOString();
    
    // Increment unread count for other participants
    conversation.participants.forEach(participant => {
      if (participant !== req.user.id) {
        conversation.unreadCount[participant] = (conversation.unreadCount[participant] || 0) + 1;
      }
    });
    
    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Mark conversation as read
exports.markConversationRead = (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = global.dataStore.conversations[conversationId];
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    // Check if user is a participant
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this conversation'
      });
    }
    
    // Mark messages as read
    if (conversation.messages) {
      conversation.messages.forEach(message => {
        if (!message.readBy.includes(req.user.id)) {
          message.readBy.push(req.user.id);
        }
      });
    }
    
    // Reset unread counter for this user
    conversation.unreadCount[req.user.id] = 0;
    
    res.status(200).json({
      success: true,
      data: { read: true }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};
