/**
 * Chat API Service - Uses real backend HTTP + Socket.io
 */
import { io } from 'socket.io-client';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// Helper to get auth header
const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper for fetch with error handling
const apiFetch = async (endpoint, options = {}) => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

// Chat API Service
export const chatApi = {
  // Connect to socket server
  connectSocket: (token) => {
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    return socket;
  },

  // Disconnect from socket server
  disconnectSocket: (socket) => {
    if (socket) socket.disconnect();
  },

  // Auth endpoints (use the main auth service, but we include getCurrentUser for chat page)
  getCurrentUser: async () => {
    return apiFetch('/auth/me');
  },

  // User endpoints (for contacts list)
  getUsers: async (type) => {
    return apiFetch(`/chat/users/${type}`);
  },

  // Conversation endpoints
  getConversations: async () => {
    return apiFetch('/chat/conversations');
  },

  getOrCreateConversation: async (userId) => {
    return apiFetch('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  // Message endpoints
  getMessages: async (conversationId) => {
    return apiFetch(`/chat/conversations/${conversationId}/messages`);
  },

  sendMessage: async (conversationId, body) => {
    return apiFetch(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  },

  markAsRead: async (messageId) => {
    return apiFetch(`/chat/messages/${messageId}/read`, { method: 'PUT' });
  },
};

export default chatApi;
