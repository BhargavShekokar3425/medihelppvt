const { v4: uuidv4 } = require('uuid');

// Get all conversations for a user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all conversations where the user is a participant
    const conversations = Object.values(global.dataStore.conversations || {})
      .filter(conv => conv.participants && conv.participants.includes(userId))
      .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
    
    // Get the other participant details for each conversation
    const populatedConversations = conversations.map(conversation => {
      // Find the other participant IDs
      const otherParticipantIds = conversation.participants.filter(id => id !== userId);
      
      // Get user details for those IDs
      const otherParticipants = otherParticipantIds.map(id => {
        const user = global.dataStore.users[id];
        if (!user) return null;
        
        return {
          _id: id,
          name: user.name,
          avatar: user.avatar,
          status: user.status || 'offline',
          lastSeen: user.lastSeen,
          role: user.role
        };
      }).filter(Boolean); // Remove null entries
      
      // Get unread count for current user
      const unreadCount = conversation.unreadCounts?.[userId] || 0;
      
      return {
        ...conversation,
        otherParticipants,
        unreadCount
      };
    });
    
    res.status(200).json({
      success: true,
      data: populatedConversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Get a single conversation
exports.getConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const conversation = global.dataStore.conversations[id];
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    // Check if user is a participant
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this conversation'
      });
    }
    
    // Get other participants' details
    const otherParticipantIds = conversation.participants.filter(p => p !== userId);
    
    const otherParticipants = otherParticipantIds.map(id => {
      const user = global.dataStore.users[id];
      if (!user) return null;
      
      return {
        _id: id,
        name: user.name,
        avatar: user.avatar,
        status: user.status || 'offline',
        lastSeen: user.lastSeen,
        role: user.role
      };
    }).filter(Boolean);
    
    res.status(200).json({
      success: true,
      data: {
        ...conversation,
        otherParticipants
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Create new conversation
exports.createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { participantId } = req.body;
    
    if (!participantId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a participant ID'
      });
    }
    
    // Verify participant exists
    const participant = global.dataStore.users[participantId];
    if (!participant) {
      return res.status(404).json({
        success: false,
        error: 'Participant not found'
      });
    }
    
    // Check if conversation already exists
    const existingConversation = Object.values(global.dataStore.conversations || {})
      .find(c => 
        c.type === 'individual' && 
        c.participants.includes(userId) && 
        c.participants.includes(participantId)
      );
    
    if (existingConversation) {
      return res.status(200).json({
        success: true,
        data: existingConversation
      });
    }
    
    // Create new conversation
    const conversationId = uuidv4();
    const newConversation = {
      _id: conversationId,
      participants: [userId, participantId],
      type: 'individual',
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      unreadCounts: {
        [userId]: 0,
        [participantId]: 0
      }
    };
    
    // Store in global data store
    if (!global.dataStore.conversations) {
      global.dataStore.conversations = {};
    }
    
    global.dataStore.conversations[conversationId] = newConversation;
    
    res.status(201).json({
      success: true,
      data: newConversation
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Get messages for a conversation
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { before, limit = 50, page = 1 } = req.query;
    
    // Find the conversation and verify user is a participant
    const conversation = global.dataStore.conversations[conversationId];
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this conversation'
      });
    }
    
    // Get all messages for this conversation
    let messages = Object.values(global.dataStore.messages || {})
      .filter(msg => msg.conversationId === conversationId);
    
    // Filter by 'before' date if provided
    if (before) {
      const beforeDate = new Date(before);
      messages = messages.filter(msg => new Date(msg.createdAt) < beforeDate);
    }
    
    // Sort by date
    messages = messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // Paginate
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedMessages = messages.slice(startIndex, endIndex);
    
    // Add sender info
    const populatedMessages = paginatedMessages.map(message => {
      const sender = global.dataStore.users[message.sender];
      
      return {
        ...message,
        sender: {
          _id: message.sender,
          name: sender?.name,
          avatar: sender?.avatar
        }
      };
    });
    
    res.status(200).json({
      success: true,
      data: populatedMessages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { text, attachments } = req.body;
    
    if (!text && (!attachments || attachments.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide message text or attachments'
      });
    }
    
    // Find conversation and verify user is a participant
    const conversation = global.dataStore.conversations[conversationId];
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this conversation'
      });
    }
    
    // Create message
    const messageId = uuidv4();
    const newMessage = {
      _id: messageId,
      conversationId,
      sender: userId,
      text,
      attachments: attachments || [],
      readBy: [userId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Store in global data store
    if (!global.dataStore.messages) {
      global.dataStore.messages = {};
    }
    
    global.dataStore.messages[messageId] = newMessage;
    
    // Populate sender info for response
    const sender = global.dataStore.users[userId];
    const populatedMessage = {
      ...newMessage,
      sender: {
        _id: userId,
        name: sender?.name,
        avatar: sender?.avatar
      }
    };
    
    // Update conversation with last message info
    const otherParticipants = conversation.participants.filter(p => p !== userId);
    
    // Update unread counts for other participants
    otherParticipants.forEach(participantId => {
      const currentCount = conversation.unreadCounts[participantId] || 0;
      conversation.unreadCounts[participantId] = currentCount + 1;
    });
    
    conversation.lastMessage = text;
    conversation.lastMessageAt = newMessage.createdAt;
    conversation.lastSenderId = userId;
    conversation.updatedAt = newMessage.createdAt;
    
    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Mark messages as read
exports.markConversationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    
    // Find conversation and verify user is a participant
    const conversation = global.dataStore.conversations[conversationId];
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this conversation'
      });
    }
    
    // Mark all messages as read for this user
    Object.values(global.dataStore.messages || {})
      .filter(msg => 
        msg.conversationId === conversationId && 
        !msg.readBy.includes(userId)
      )
      .forEach(msg => {
        msg.readBy.push(userId);
      });
    
    // Reset unread count for this user
    conversation.unreadCounts[userId] = 0;
    
    res.status(200).json({
      success: true,
      data: { read: true }
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Get contacts (potential chat participants)
exports.getContacts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.params;
    
    // Get all users except current user
    let contacts = Object.entries(global.dataStore.users)
      .filter(([id, _]) => id !== userId)
      .map(([id, user]) => ({
        _id: id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        status: user.status || 'offline',
        lastSeen: user.lastSeen,
        specialization: user.specialization
      }));
    
    // Filter by type if specified
    if (type) {
      const roleType = type === 'doctors' ? 'doctor' : 
                     type === 'patients' ? 'patient' : 
                     type === 'pharmacies' ? 'pharmacy' : type;
      
      contacts = contacts.filter(contact => contact.role === roleType);
    }
    
    // Group contacts by role
    const groupedContacts = {
      doctors: contacts.filter(user => user.role === 'doctor'),
      patients: contacts.filter(user => user.role === 'patient'),
      pharmacies: contacts.filter(user => user.role === 'pharmacy')
    };
    
    if (type) {
      res.status(200).json({
        success: true,
        data: groupedContacts[type] || []
      });
    } else {
      res.status(200).json({
        success: true,
        data: groupedContacts
      });
    }
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Search messages in a conversation
exports.searchMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    // Verify user is a participant in the conversation
    const conversation = global.dataStore.conversations[conversationId];
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this conversation'
      });
    }
    
    // Search messages by text content
    const searchRegex = new RegExp(query, 'i');
    const messages = Object.values(global.dataStore.messages || {})
      .filter(msg => 
        msg.conversationId === conversationId &&
        msg.text && 
        searchRegex.test(msg.text)
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Add sender info
    const populatedMessages = messages.map(message => {
      const sender = global.dataStore.users[message.sender];
      
      return {
        ...message,
        sender: {
          _id: message.sender,
          name: sender?.name,
          avatar: sender?.avatar
        }
      };
    });
    
    res.status(200).json({
      success: true,
      data: populatedMessages
    });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};
