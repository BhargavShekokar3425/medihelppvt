import apiService from './apiService';

export const chatService = {
  // Get conversations for a user
  getConversations: async () => {
    try {
      const response = await apiService.get('/chat/conversations');
      return response.data;
    } catch (error) {
      console.error("Get conversations error:", error);
      throw error;
    }
  },
  
  // Get or create a conversation between two users
  getOrCreateConversation: async (participantId) => {
    try {
      const response = await apiService.post('/chat/conversations', {
        participantId
      });
      
      return response.data;
    } catch (error) {
      console.error("Get or create conversation error:", error);
      throw error;
    }
  },
  
  // Get messages for a conversation
  getMessages: async (conversationId) => {
    try {
      const response = await apiService.get(`/chat/conversations/${conversationId}/messages`);
      return response.data;
    } catch (error) {
      console.error("Get messages error:", error);
      throw error;
    }
  },
  
  // Send a new message
  sendMessage: async (conversationId, text, attachments = []) => {
    try {
      const response = await apiService.post(
        `/chat/conversations/${conversationId}/messages`,
        { text, attachments }
      );
      
      return response.data;
    } catch (error) {
      console.error("Send message error:", error);
      throw error;
    }
  },
  
  // Mark messages as read
  markMessagesAsRead: async (conversationId) => {
    try {
      const response = await apiService.put(`/chat/conversations/${conversationId}/read`);
      return response.data;
    } catch (error) {
      console.error("Mark messages as read error:", error);
      throw error;
    }
  },
  
  // Socket-like functionality using polling
  subscribeToMessages: (conversationId, callback) => {
    if (!conversationId) {
      console.error("No conversation ID provided");
      return () => {};
    }
    
    let lastMessageCount = 0;
    
    // Poll for new messages every 3 seconds
    const intervalId = setInterval(async () => {
      try {
        const response = await chatService.getMessages(conversationId);
        const messages = response.data || [];
        
        // Check if there are new messages
        if (messages.length > lastMessageCount) {
          // Get new messages only
          const newMessages = messages.slice(lastMessageCount);
          lastMessageCount = messages.length;
          
          // Call callback with new messages
          callback(newMessages);
        }
      } catch (error) {
        console.error("Messages polling error:", error);
      }
    }, 3000);
    
    // Return unsubscribe function
    return () => clearInterval(intervalId);
  }
};

export default chatService;
