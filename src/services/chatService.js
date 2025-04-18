import apiService from './apiService';

export const chatService = {
  // Get conversations for a user
  getConversations: async (userId) => {
    try {
      const response = await apiService.get(`/chat/conversations`);
      return response.data;
    } catch (error) {
      console.error("Get conversations error:", error);
      throw error;
    }
  },
  
  // Get or create a conversation between two users
  getOrCreateConversation: async (userId1, userId2) => {
    try {
      const response = await apiService.post(`/chat/conversations`, {
        participantId: userId2
      });
      
      return response.data;
    } catch (error) {
      console.error("Get or create conversation error:", error);
      throw error;
    }
  },
  
  // Get messages for a conversation with pagination
  getMessages: async (conversationId, pageSize = 20, lastMessageTimestamp = null) => {
    try {
      const params = { limit: pageSize };
      
      if (lastMessageTimestamp) {
        params.before = lastMessageTimestamp;
      }
      
      const response = await apiService.get(
        `/chat/conversations/${conversationId}/messages`,
        params
      );
      
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
      const response = await apiService.put(
        `/chat/conversations/${conversationId}/read`
      );
      
      return response.success;
    } catch (error) {
      console.error("Mark messages as read error:", error);
      throw error;
    }
  },
  
  // Subscribe to messages - simulated with polling
  subscribeToMessages: (conversationId, callback) => {
    if (!conversationId) {
      console.error("No conversation ID provided");
      return () => {};
    }
    
    // Poll for new messages every 3 seconds
    const intervalId = setInterval(async () => {
      try {
        const response = await apiService.get(
          `/chat/conversations/${conversationId}/messages/new`
        );
        
        if (response.data.length > 0) {
          callback(response.data);
        }
      } catch (error) {
        console.error("Messages subscription error:", error);
      }
    }, 3000);
    
    // Return unsubscribe function
    return () => clearInterval(intervalId);
  }
};

export default chatService;
