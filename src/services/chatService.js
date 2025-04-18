import apiService from './apiService';
import { io } from 'socket.io-client';

// Set up socket connection
let socket = null;
let socketConnected = false;
const listeners = new Map();

export const chatService = {
  // Initialize socket connection
  initSocket: (token) => {
    if (socket) return;

    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    
    socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socketConnected = true;
      
      // Re-register listeners after reconnection
      listeners.forEach((callback, event) => {
        socket.on(event, callback);
      });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      socketConnected = false;
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return socket;
  },

  // Close socket connection
  closeSocket: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      socketConnected = false;
      listeners.clear();
    }
  },

  // Register event listeners and store them for potential reconnection
  on: (event, callback) => {
    if (socket) {
      socket.on(event, callback);
      listeners.set(event, callback);
    }
  },

  // Remove event listener
  off: (event) => {
    if (socket) {
      socket.off(event);
      listeners.delete(event);
    }
  },

  // Emit events to server
  emit: (event, data) => {
    if (socket && socketConnected) {
      socket.emit(event, data);
      return true;
    }
    return false;
  },

  // Get all conversations for current user
  getConversations: async () => {
    try {
      const response = await apiService.get('/chat/conversations');
      return response.data;
    } catch (error) {
      console.error("Get conversations error:", error);
      throw error;
    }
  },

  // Get or create conversation with participant
  getOrCreateConversation: async (participantId) => {
    try {
      const response = await apiService.post('/chat/conversations', { participantId });
      return response.data;
    } catch (error) {
      console.error("Get/create conversation error:", error);
      throw error;
    }
  },

  // Get messages for a conversation with pagination
  getMessages: async (conversationId, params = {}) => {
    try {
      const response = await apiService.get(`/chat/conversations/${conversationId}/messages`, {
        params
      });
      return response.data;
    } catch (error) {
      console.error("Get messages error:", error);
      throw error;
    }
  },

  // Send a message in a conversation
  sendMessage: async (conversationId, text, attachments = []) => {
    try {
      const response = await apiService.post(`/chat/conversations/${conversationId}/messages`, {
        text,
        attachments
      });
      
      // Emit via socket for real-time delivery
      if (socketConnected) {
        socket.emit('message:send', {
          conversationId,
          message: response.data
        });
      }
      
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
      
      // Emit via socket for real-time updates
      if (socketConnected) {
        socket.emit('messages:read', { conversationId });
      }
      
      return response.data;
    } catch (error) {
      console.error("Mark as read error:", error);
      throw error;
    }
  },

  // Send typing indicator
  sendTypingStatus: (conversationId, isTyping) => {
    if (socketConnected) {
      socket.emit(isTyping ? 'typing:start' : 'typing:stop', { conversationId });
      return true;
    }
    return false;
  },

  // Get user contacts (doctors, patients, pharmacies)
  getContacts: async (type = null) => {
    try {
      const endpoint = type ? `/chat/contacts/${type}` : '/chat/contacts';
      const response = await apiService.get(endpoint);
      return response.data;
    } catch (error) {
      console.error("Get contacts error:", error);
      throw error;
    }
  },
  
  // Search messages in a conversation
  searchMessages: async (conversationId, query) => {
    try {
      const response = await apiService.get(`/chat/conversations/${conversationId}/search`, {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error("Search messages error:", error);
      throw error;
    }
  },

  // Join conversations rooms via socket
  joinConversations: (conversations) => {
    if (socketConnected && Array.isArray(conversations)) {
      socket.emit('join:conversations', {
        conversations: conversations.map(conv => conv._id)
      });
    }
  }
};

export default chatService;
