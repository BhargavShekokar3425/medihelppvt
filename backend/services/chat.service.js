const dbService = require('./database.service');

const chatService = {
  // Create or retrieve a conversation between users
  getOrCreateConversation: async (participants) => {
    try {
      // Sort participants to ensure consistent conversation IDs
      const sortedParticipants = [...participants].sort();
      const conversationId = sortedParticipants.join('_');
      
      // Check if conversation exists
      const existingConversation = await dbService.getDocument('conversations', conversationId);
      
      if (existingConversation) {
        return existingConversation;
      }
      
      // Get user info for all participants
      const participantsInfo = {};
      
      for (const userId of participants) {
        const user = await dbService.getDocument('users', userId);
        if (user) {
          participantsInfo[userId] = {
            name: user.name,
            avatar: user.photoURL || null,
            userType: user.userType
          };
        }
      }
      
      // Create new conversation
      const newConversation = await dbService.addDocument('conversations', {
        participants: sortedParticipants,
        participantsInfo,
        lastMessage: null,
        lastMessageTime: null,
        unreadCount: Object.fromEntries(
          sortedParticipants.map(userId => [userId, 0])
        )
      }, conversationId);
      
      return newConversation;
    } catch (error) {
      console.error('Error creating/getting conversation:', error);
      throw error;
    }
  },
  
  // Send a message in a conversation
  sendMessage: async (conversationId, senderId, messageData) => {
    try {
      // Get conversation to validate
      const conversation = await dbService.getDocument('conversations', conversationId);
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      if (!conversation.participants.includes(senderId)) {
        throw new Error('User not in conversation');
      }
      
      // Create message
      const message = await dbService.addDocument(`conversations/${conversationId}/messages`, {
        sender: senderId,
        text: messageData.text,
        attachments: messageData.attachments || [],
        readBy: [senderId],
      });
      
      // Update conversation with last message info
      const otherParticipants = conversation.participants.filter(
        p => p !== senderId
      );
      
      // Increment unread count for other participants
      const updateData = {
        lastMessage: messageData.text,
        lastMessageTime: message.createdAt,
        lastMessageSenderId: senderId
      };
      
      // Update unread counts for other participants
      for (const participant of otherParticipants) {
        updateData[`unreadCount.${participant}`] = dbService.fieldValues.increment(1);
      }
      
      await dbService.updateDocument('conversations', conversationId, updateData);
      
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
  
  // Get messages for a conversation
  getMessages: async (conversationId, options = {}) => {
    try {
      const { limit = 50, lastTimestamp = null } = options;
      
      let query = {
        orderBy: { field: 'createdAt', direction: 'desc' },
        limit
      };
      
      if (lastTimestamp) {
        query.filters = [
          { field: 'createdAt', operator: '<', value: lastTimestamp }
        ];
      }
      
      return await dbService.queryDocuments(
        `conversations/${conversationId}/messages`, 
        query
      );
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  },
  
  // Mark message as read
  markMessageAsRead: async (conversationId, messageId, userId) => {
    try {
      await dbService.updateDocument(
        `conversations/${conversationId}/messages`,
        messageId,
        {
          readBy: dbService.fieldValues.arrayUnion(userId)
        }
      );
      
      // Reset unread count for this user
      await dbService.updateDocument(
        'conversations',
        conversationId,
        {
          [`unreadCount.${userId}`]: 0
        }
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  },
  
  // Get all conversations for a user
  getConversations: async (userId) => {
    try {
      return await dbService.queryDocuments('conversations', {
        filters: [
          { field: 'participants', operator: 'array-contains', value: userId }
        ],
        orderBy: { field: 'lastMessageTime', direction: 'desc' }
      });
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }
};

module.exports = chatService;
