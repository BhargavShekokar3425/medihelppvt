import React, { useState, useEffect, useRef, useCallback } from "react";
import { useBackendContext } from "../contexts/BackendContext";
import { chatApi } from "../services/chatApi";

// Color scheme
const COLORS = {
  primary: '#5aa3e7',
  primaryDark: '#4285F4',
  danger: '#d73434',
  success: '#10B981',
  readBlue: '#34B7F1',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
  white: '#FFFFFF',
};

// Inline styles following DoctorDashboard pattern
const styles = {
  pageContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  container: {
    display: 'flex',
    height: 'calc(100vh - 200px)',
    minHeight: '500px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    backgroundColor: COLORS.white,
  },
  // Sidebar styles
  sidebar: {
    width: '340px',
    backgroundColor: COLORS.white,
    borderRight: `1px solid ${COLORS.gray200}`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sidebarHeader: {
    padding: '20px',
    borderBottom: `1px solid ${COLORS.gray200}`,
    backgroundColor: COLORS.white,
  },
  sidebarTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: COLORS.gray900,
    margin: '0 0 16px 0',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    border: `1px solid ${COLORS.gray300}`,
    borderRadius: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  tabsContainer: {
    display: 'flex',
    padding: '12px 20px',
    gap: '8px',
    borderBottom: `1px solid ${COLORS.gray200}`,
  },
  tab: {
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s',
    backgroundColor: COLORS.gray100,
    color: COLORS.gray700,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
  },
  conversationsList: {
    flex: 1,
    overflowY: 'auto',
  },
  conversationItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 20px',
    cursor: 'pointer',
    borderBottom: `1px solid ${COLORS.gray100}`,
    transition: 'background-color 0.15s',
  },
  conversationItemHover: {
    backgroundColor: COLORS.gray100,
  },
  conversationItemActive: {
    backgroundColor: '#EBF5FF',
    borderLeft: `3px solid ${COLORS.primary}`,
    paddingLeft: '17px',
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '600',
    marginRight: '14px',
    position: 'relative',
    flexShrink: 0,
  },
  avatarImage: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: '2px',
    right: '2px',
    width: '12px',
    height: '12px',
    backgroundColor: COLORS.success,
    borderRadius: '50%',
    border: `2px solid ${COLORS.white}`,
  },
  conversationInfo: {
    flex: 1,
    minWidth: 0,
  },
  conversationName: {
    fontSize: '15px',
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: '4px',
  },
  conversationRole: {
    fontSize: '12px',
    color: COLORS.gray500,
    textTransform: 'capitalize',
  },
  lastMessage: {
    fontSize: '13px',
    color: COLORS.gray500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: '2px',
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    borderRadius: '12px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: '600',
    marginLeft: '8px',
    flexShrink: 0,
  },
  conversationMeta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginLeft: '10px',
  },
  conversationTime: {
    fontSize: '11px',
    color: COLORS.gray400,
    marginBottom: '6px',
  },
  // Main chat area
  chatMain: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#F8FAFC',
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: COLORS.white,
    borderBottom: `1px solid ${COLORS.gray200}`,
  },
  chatHeaderInfo: {
    marginLeft: '14px',
    flex: 1,
  },
  chatHeaderName: {
    fontSize: '17px',
    fontWeight: '600',
    color: COLORS.gray900,
  },
  chatHeaderStatus: {
    fontSize: '13px',
    color: COLORS.success,
  },
  chatHeaderStatusOffline: {
    fontSize: '13px',
    color: COLORS.gray500,
  },
  // Messages area
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
  },
  loadMoreButton: {
    display: 'block',
    margin: '0 auto 20px',
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: `1px solid ${COLORS.gray300}`,
    borderRadius: '20px',
    color: COLORS.gray500,
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  messageRow: {
    display: 'flex',
    marginBottom: '8px',
    alignItems: 'flex-end',
  },
  messageRowOwn: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '65%',
    padding: '12px 16px',
    borderRadius: '18px',
    fontSize: '14px',
    lineHeight: '1.45',
    position: 'relative',
    wordBreak: 'break-word',
  },
  messageBubbleOwn: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    borderBottomRightRadius: '6px',
  },
  messageBubbleOther: {
    backgroundColor: COLORS.white,
    color: COLORS.gray900,
    borderBottomLeftRadius: '6px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
  },
  messageTime: {
    fontSize: '11px',
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '4px',
    opacity: 0.8,
  },
  messageTimeOther: {
    color: COLORS.gray400,
    opacity: 1,
  },
  checkmark: {
    fontSize: '14px',
    marginLeft: '2px',
  },
  // Typing indicator
  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    padding: '12px 16px',
    backgroundColor: COLORS.white,
    borderRadius: '18px',
    maxWidth: 'fit-content',
    marginBottom: '12px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
  },
  typingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: COLORS.gray400,
  },
  // Input area
  inputArea: {
    padding: '16px 24px',
    backgroundColor: COLORS.white,
    borderTop: `1px solid ${COLORS.gray200}`,
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  messageInput: {
    flex: 1,
    padding: '14px 20px',
    border: `1px solid ${COLORS.gray300}`,
    borderRadius: '24px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    resize: 'none',
    minHeight: '48px',
    maxHeight: '120px',
    lineHeight: '1.4',
  },
  sendButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray300,
    cursor: 'not-allowed',
  },
  // Empty state
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.gray500,
    padding: '40px',
  },
  emptyStateIcon: {
    fontSize: '80px',
    marginBottom: '20px',
    opacity: 0.4,
  },
  emptyStateTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: '8px',
  },
  emptyStateText: {
    fontSize: '14px',
    color: COLORS.gray500,
  },
  // Loading
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    color: COLORS.gray500,
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: `3px solid ${COLORS.gray200}`,
    borderTopColor: COLORS.primary,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  // Date separator
  dateSeparator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '20px 0',
  },
  dateSeparatorText: {
    backgroundColor: COLORS.gray200,
    color: COLORS.gray500,
    padding: '6px 14px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
};

// CSS keyframes for animations (injected into document)
const injectStyles = () => {
  if (document.getElementById('chat-animations')) return;
  const style = document.createElement('style');
  style.id = 'chat-animations';
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-5px); }
    }
    .typing-dot-1 { animation: bounce 1.4s infinite ease-in-out; }
    .typing-dot-2 { animation: bounce 1.4s infinite ease-in-out 0.2s; }
    .typing-dot-3 { animation: bounce 1.4s infinite ease-in-out 0.4s; }
  `;
  document.head.appendChild(style);
};

// Helper to format time
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Helper to format date
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

// Helper to check if dates are different days
const isDifferentDay = (timestamp1, timestamp2) => {
  if (!timestamp1 || !timestamp2) return true;
  const date1 = new Date(timestamp1).toDateString();
  const date2 = new Date(timestamp2).toDateString();
  return date1 !== date2;
};

const DocAnswers = () => {
  const { currentUser, loading: authLoading } = useBackendContext();
  const isLoggedIn = !!currentUser;

  // State
  const [conversationsList, setConversationsList] = useState([]);
  const [contacts, setContacts] = useState({ patient: [], doctor: [] });
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('conversations');
  const [hoveredConversation, setHoveredConversation] = useState(null);

  // Refs
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Inject CSS animations
  useEffect(() => {
    injectStyles();
  }, []);

  // Connect to WebSocket
  const connectToSocket = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = chatApi.connectSocket(token);
    socketRef.current = socket;

    // Listen for new messages
    socket.on('message:new', (newMessage) => {
      setMessages((prev) => {
        const isDuplicate = prev.some((m) => m._id === newMessage._id);
        if (isDuplicate) return prev;
        return [...prev, newMessage];
      });

      // Update conversation list
      setConversationsList((prev) =>
        prev.map((conv) =>
          conv._id === newMessage.conversationId
            ? {
                ...conv,
                lastMessage: { body: newMessage.body, createdAt: newMessage.timestamp },
                updatedAt: newMessage.timestamp,
                unreadCount: activeConversation?._id === conv._id ? 0 : (conv.unreadCount || 0) + 1,
              }
            : conv
        )
      );

      // Scroll to bottom if viewing this conversation
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    // Listen for delivery confirmations
    socket.on('messages:delivered', ({ conversationId, deliveredTo }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.conversationId === conversationId && !msg.deliveredTo?.includes(deliveredTo)
            ? { ...msg, deliveredTo: [...(msg.deliveredTo || []), deliveredTo] }
            : msg
        )
      );
    });

    socket.on('message:delivered', ({ messageIds, deliveredTo }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          messageIds?.includes(msg._id) && !msg.deliveredTo?.includes(deliveredTo)
            ? { ...msg, deliveredTo: [...(msg.deliveredTo || []), deliveredTo] }
            : msg
        )
      );
    });

    // Listen for read receipts
    socket.on('messages:read', ({ conversationId, readBy }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.conversationId === conversationId && !msg.readBy?.includes(readBy)
            ? { ...msg, readBy: [...(msg.readBy || []), readBy] }
            : msg
        )
      );
    });

    socket.on('message:read', ({ messageIds, readBy }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          messageIds?.includes(msg._id) && !msg.readBy?.includes(readBy)
            ? { ...msg, readBy: [...(msg.readBy || []), readBy] }
            : msg
        )
      );
    });

    // Listen for typing indicators
    socket.on('typing:start', ({ conversationId, userId }) => {
      setTypingUsers((prev) => ({ ...prev, [conversationId]: userId }));
    });

    socket.on('typing:stop', ({ conversationId }) => {
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[conversationId];
        return updated;
      });
    });

    // Listen for online status
    socket.on('users:online', (onlineUserIds) => {
      setOnlineUsers(onlineUserIds);
    });

    socket.on('user:online', (userId) => {
      setOnlineUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
    });

    socket.on('user:offline', (userId) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    return () => {
      socket.off('message:new');
      socket.off('messages:delivered');
      socket.off('message:delivered');
      socket.off('messages:read');
      socket.off('message:read');
      socket.off('typing:start');
      socket.off('typing:stop');
      socket.off('users:online');
      socket.off('user:online');
      socket.off('user:offline');
    };
  }, [activeConversation]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const data = await chatApi.getConversations();
      setConversationsList(data);
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  }, []);

  // Load contacts
  const loadContacts = useCallback(async (userRole) => {
    try {
      const contactTypes = {
        patient: ['doctor'],
        doctor: ['patient', 'doctor'],
        pharmacy: ['patient', 'doctor'],
      };

      const types = contactTypes[userRole] || ['doctor'];
      const loadedContacts = { patient: [], doctor: [] };

      for (const type of types) {
        const users = await chatApi.getUsers(type);
        // Filter out self
        loadedContacts[type] = users.filter((u) => u._id !== currentUser?._id && u.id !== currentUser?._id);
      }

      setContacts(loadedContacts);
    } catch (err) {
      console.error('Error loading contacts:', err);
    }
  }, [currentUser]);

  // Initialize
  useEffect(() => {
    if (!isLoggedIn || !currentUser) {
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        setLoading(true);
        connectToSocket();
        await Promise.all([loadConversations(), loadContacts(currentUser.role || 'patient')]);
      } catch (err) {
        console.error('Init error:', err);
        setError('Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isLoggedIn, currentUser, connectToSocket, loadConversations, loadContacts]);

  // Load messages when conversation changes
  const loadMessages = useCallback(async (conversationId) => {
    try {
      const data = await chatApi.getMessages(conversationId, { limit: 50 });
      setMessages(data.messages || []);
      setHasMoreMessages(data.hasMore || false);

      // Mark as read
      await chatApi.markConversationAsRead(conversationId);

      // Update unread count in list
      setConversationsList((prev) =>
        prev.map((conv) => (conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv))
      );

      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  }, []);

  // Select conversation
  const handleSelectConversation = useCallback(
    async (conversation) => {
      setActiveConversation(conversation);
      socketRef.current?.emit('conversation:join', conversation._id);
      await loadMessages(conversation._id);
    },
    [loadMessages]
  );

  // Start new conversation with contact
  const handleSelectContact = useCallback(
    async (contact) => {
      try {
        const conv = await chatApi.getOrCreateConversation(contact._id || contact.id);
        const newConv = {
          ...conv,
          unreadCount: 0,
        };

        // Add to list if not exists
        setConversationsList((prev) => {
          const exists = prev.some((c) => c._id === newConv._id);
          if (exists) return prev;
          return [newConv, ...prev];
        });

        setActiveConversation(newConv);
        setActiveTab('conversations');
        socketRef.current?.emit('conversation:join', newConv._id);
        await loadMessages(newConv._id);
      } catch (err) {
        console.error('Error creating conversation:', err);
        setError('Could not start conversation');
      }
    },
    [loadMessages]
  );

  // Load more messages (pagination)
  const loadMoreMessages = async () => {
    if (!activeConversation || loadingMore || !hasMoreMessages) return;

    setLoadingMore(true);
    try {
      const oldestMessage = messages[0];
      const data = await chatApi.getMessages(activeConversation._id, {
        limit: 50,
        before: oldestMessage?.timestamp,
      });
      setMessages((prev) => [...(data.messages || []), ...prev]);
      setHasMoreMessages(data.hasMore || false);
    } catch (err) {
      console.error('Error loading more messages:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Send message
  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!message.trim() || !activeConversation || sending) return;

    setSending(true);
    try {
      // Stop typing indicator
      socketRef.current?.emit('typing:stop', activeConversation._id);

      const newMessage = await chatApi.sendMessage(activeConversation._id, message.trim());

      setMessages((prev) => {
        const isDuplicate = prev.some((m) => m._id === newMessage._id);
        if (isDuplicate) return prev;
        return [...prev, newMessage];
      });

      // Update conversation list
      setConversationsList((prev) =>
        prev.map((conv) =>
          conv._id === activeConversation._id
            ? {
                ...conv,
                lastMessage: { body: newMessage.body, createdAt: newMessage.timestamp },
                updatedAt: newMessage.timestamp,
              }
            : conv
        )
      );

      setMessage('');

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Send message error:', err);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Handle typing
  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (!activeConversation) return;

    // Emit typing start
    if (e.target.value) {
      socketRef.current?.emit('typing:start', activeConversation._id);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of no input
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('typing:stop', activeConversation._id);
      }, 2000);
    } else {
      socketRef.current?.emit('typing:stop', activeConversation._id);
    }
  };

  // Get message status for checkmarks
  const getMessageStatus = (msg, recipientId) => {
    if (!recipientId) return 'sent';
    const isRead = msg.readBy?.includes(recipientId);
    const isDelivered = msg.deliveredTo?.includes(recipientId);
    if (isRead) return 'read';
    if (isDelivered) return 'delivered';
    return 'sent';
  };

  // Render checkmarks
  const renderCheckmarks = (status) => {
    if (status === 'read') {
      return <span style={{ ...styles.checkmark, color: COLORS.readBlue }}>✓✓</span>;
    }
    if (status === 'delivered') {
      return <span style={{ ...styles.checkmark, color: 'rgba(255,255,255,0.7)' }}>✓✓</span>;
    }
    return <span style={{ ...styles.checkmark, color: 'rgba(255,255,255,0.6)' }}>✓</span>;
  };

  // Get other participant from conversation
  const getOtherParticipant = (conversation) => {
    if (!conversation?.participants) return null;
    const myId = currentUser?._id || currentUser?.id;
    return conversation.participants.find((p) => (p._id || p.id) !== myId);
  };

  // Filter conversations/contacts by search
  const filteredConversations = conversationsList.filter((conv) => {
    const other = getOtherParticipant(conv);
    return other?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredContacts = Object.entries(contacts).flatMap(([type, list]) =>
    list
      .filter((c) => c.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      .map((c) => ({ ...c, contactType: type }))
  );

  if (loading || authLoading) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p style={{ marginTop: '16px' }}>Loading your conversations...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.emptyState}>
          <div style={styles.emptyStateIcon}>🔒</div>
          <h3 style={styles.emptyStateTitle}>Sign in required</h3>
          <p style={styles.emptyStateText}>Please log in to use the chat feature.</p>
        </div>
      </div>
    );
  }

  const activeOther = activeConversation ? getOtherParticipant(activeConversation) : null;
  const isOtherOnline = activeOther && onlineUsers.includes(activeOther._id || activeOther.id);
  const isOtherTyping = activeConversation && typingUsers[activeConversation._id];

  return (
    <div style={styles.pageContainer}>
      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
          <button onClick={() => setError(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>
            ×
          </button>
        </div>
      )}

      <div style={styles.container}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h2 style={styles.sidebarTitle}>Messages</h2>
            <input
              type="text"
              placeholder="Search..."
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <div style={styles.tabsContainer}>
            <button
              style={{ ...styles.tab, ...(activeTab === 'conversations' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('conversations')}
            >
              Chats ({conversationsList.length})
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'contacts' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('contacts')}
            >
              Contacts
            </button>
          </div>

          {/* Conversations/Contacts List */}
          <div style={styles.conversationsList}>
            {activeTab === 'conversations' ? (
              filteredConversations.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: COLORS.gray500 }}>
                  <p>No conversations yet</p>
                  <p style={{ fontSize: '13px' }}>Switch to Contacts to start chatting</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const other = getOtherParticipant(conv);
                  const isOnline = other && onlineUsers.includes(other._id || other.id);
                  const isActive = activeConversation?._id === conv._id;
                  const isHovered = hoveredConversation === conv._id;

                  return (
                    <div
                      key={conv._id}
                      style={{
                        ...styles.conversationItem,
                        ...(isActive ? styles.conversationItemActive : {}),
                        ...(isHovered && !isActive ? styles.conversationItemHover : {}),
                      }}
                      onClick={() => handleSelectConversation(conv)}
                      onMouseEnter={() => setHoveredConversation(conv._id)}
                      onMouseLeave={() => setHoveredConversation(null)}
                    >
                      <div style={styles.avatar}>
                        {other?.avatar ? (
                          <img src={other.avatar} alt="" style={styles.avatarImage} />
                        ) : (
                          other?.name?.charAt(0)?.toUpperCase() || '?'
                        )}
                        {isOnline && <div style={styles.onlineIndicator} />}
                      </div>
                      <div style={styles.conversationInfo}>
                        <div style={styles.conversationName}>{other?.name || 'Unknown'}</div>
                        <div style={styles.lastMessage}>
                          {conv.lastMessage?.body || 'No messages yet'}
                        </div>
                      </div>
                      <div style={styles.conversationMeta}>
                        {conv.lastMessage?.createdAt && (
                          <span style={styles.conversationTime}>
                            {formatTime(conv.lastMessage.createdAt)}
                          </span>
                        )}
                        {conv.unreadCount > 0 && (
                          <span style={styles.unreadBadge}>{conv.unreadCount}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              filteredContacts.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: COLORS.gray500 }}>
                  No contacts found
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const isOnline = onlineUsers.includes(contact._id || contact.id);

                  return (
                    <div
                      key={contact._id}
                      style={{
                        ...styles.conversationItem,
                        ...(hoveredConversation === contact._id ? styles.conversationItemHover : {}),
                      }}
                      onClick={() => handleSelectContact(contact)}
                      onMouseEnter={() => setHoveredConversation(contact._id)}
                      onMouseLeave={() => setHoveredConversation(null)}
                    >
                      <div style={styles.avatar}>
                        {contact.avatar ? (
                          <img src={contact.avatar} alt="" style={styles.avatarImage} />
                        ) : (
                          contact.name?.charAt(0)?.toUpperCase() || '?'
                        )}
                        {isOnline && <div style={styles.onlineIndicator} />}
                      </div>
                      <div style={styles.conversationInfo}>
                        <div style={styles.conversationName}>{contact.name}</div>
                        <div style={styles.conversationRole}>{contact.contactType || contact.type}</div>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div style={styles.chatMain}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div style={styles.chatHeader}>
                <div style={styles.avatar}>
                  {activeOther?.avatar ? (
                    <img src={activeOther.avatar} alt="" style={styles.avatarImage} />
                  ) : (
                    activeOther?.name?.charAt(0)?.toUpperCase() || '?'
                  )}
                  {isOtherOnline && <div style={styles.onlineIndicator} />}
                </div>
                <div style={styles.chatHeaderInfo}>
                  <div style={styles.chatHeaderName}>{activeOther?.name || 'Unknown'}</div>
                  <div style={isOtherOnline ? styles.chatHeaderStatus : styles.chatHeaderStatusOffline}>
                    {isOtherTyping ? 'typing...' : isOtherOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={styles.messagesContainer} ref={messagesContainerRef}>
                {hasMoreMessages && (
                  <button
                    style={styles.loadMoreButton}
                    onClick={loadMoreMessages}
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading...' : 'Load older messages'}
                  </button>
                )}

                {messages.map((msg, idx) => {
                  const myId = currentUser?._id || currentUser?.id;
                  const isMine = msg.sender === myId;
                  const recipientId = activeOther?._id || activeOther?.id;
                  const status = isMine ? getMessageStatus(msg, recipientId) : null;
                  const prevMsg = messages[idx - 1];
                  const showDateSeparator = isDifferentDay(prevMsg?.timestamp, msg.timestamp);

                  return (
                    <React.Fragment key={msg._id || idx}>
                      {showDateSeparator && (
                        <div style={styles.dateSeparator}>
                          <span style={styles.dateSeparatorText}>{formatDate(msg.timestamp)}</span>
                        </div>
                      )}
                      <div
                        style={{
                          ...styles.messageRow,
                          ...(isMine ? styles.messageRowOwn : styles.messageRowOther),
                        }}
                      >
                        <div
                          style={{
                            ...styles.messageBubble,
                            ...(isMine ? styles.messageBubbleOwn : styles.messageBubbleOther),
                          }}
                        >
                          <div>{msg.body}</div>
                          <div style={{ ...styles.messageTime, ...(isMine ? {} : styles.messageTimeOther) }}>
                            {formatTime(msg.timestamp)}
                            {isMine && renderCheckmarks(status)}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}

                {/* Typing indicator */}
                {isOtherTyping && (
                  <div style={styles.typingIndicator}>
                    <span className="typing-dot-1" style={styles.typingDot} />
                    <span className="typing-dot-2" style={styles.typingDot} />
                    <span className="typing-dot-3" style={styles.typingDot} />
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div style={styles.inputArea}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  style={styles.messageInput}
                  value={message}
                  onChange={handleTyping}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(e)}
                  disabled={sending}
                />
                <button
                  style={{
                    ...styles.sendButton,
                    ...(message.trim() && !sending ? {} : styles.sendButtonDisabled),
                  }}
                  onClick={sendMessage}
                  disabled={!message.trim() || sending}
                >
                  {sending ? '...' : '➤'}
                </button>
              </div>
            </>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateIcon}>💬</div>
              <h3 style={styles.emptyStateTitle}>Select a conversation</h3>
              <p style={styles.emptyStateText}>
                Choose a chat from the sidebar or start a new conversation from Contacts
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocAnswers;
