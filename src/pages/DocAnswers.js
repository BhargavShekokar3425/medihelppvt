import React, { useState, useEffect, useRef } from "react";
import { chatApi } from "../services/chatApi";

const DocAnswers = () => {
  // State variables
  const [userType, setUserType] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState({ patient: [], doctor: [], pharmacy: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const messageEndRef = useRef(null);
  
  // Add new state variables for login form
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  
  // Load user data
  const loadUserData = async () => {
    try {
      const userData = await chatApi.getCurrentUser();
      setCurrentUser(userData);
      setUserType(userData.type);
      setIsLoggedIn(true);
      
      // Connect websocket
      connectToSocket();
      
      // Load conversations and contacts
      await Promise.all([
        loadConversations(),
        loadContacts(userData.type)
      ]);
    } catch (error) {
      console.error('Error loading user data:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };
  
  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, []);  // Empty dependency array
  
  // Connect to WebSocket
  const connectToSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const socket = chatApi.connectSocket(token);
    socketRef.current = socket;
    
    // Listen for new messages
    socket.on('message:new', (newMessage) => {
      setConversations((prevConversations) => {
        const conversationId = newMessage.conversationId;
        const existingMessages = prevConversations[conversationId] || [];
        // Don't add duplicate messages
        const isDuplicate = existingMessages.some(m => m._id === newMessage._id);
        
        if (isDuplicate) {
          return prevConversations;
        }
        
        return {
          ...prevConversations,
          [conversationId]: [...existingMessages, newMessage]
        };
      });
    });

    // Listen for read receipts
    socket.on('message:read', ({ conversationId, messageId, userId }) => {
      setConversations((prevConversations) => {
        if (!prevConversations[conversationId]) return prevConversations;
        return {
          ...prevConversations,
          [conversationId]: prevConversations[conversationId].map(msg => 
            msg._id === messageId ? { ...msg, readBy: [...(msg.readBy || []), userId] } : msg
          )
        };
      });
    });

    // Listen for typing indicators
    socket.on('typing:start', ({ conversationId, userId }) => {
      setConversations((prevConversations) => {
        if (!prevConversations[conversationId]) return prevConversations;
        // Add typing indicator if it doesn't already exist
        const hasTypingIndicator = prevConversations[conversationId].some(msg => msg.isTyping && msg.userId === userId);
        if (hasTypingIndicator) return prevConversations;
        
        return {
          ...prevConversations,
          [conversationId]: [
            ...prevConversations[conversationId],
            { isTyping: true, userId, id: `typing-${userId}` }
          ]
        };
      });
    });
    
    socket.on('typing:stop', ({ conversationId, userId }) => {
      setConversations((prevConversations) => {
        if (!prevConversations[conversationId]) return prevConversations;
        return {
          ...prevConversations,
          [conversationId]: prevConversations[conversationId].filter(
            msg => !(msg.isTyping && msg.userId === userId)
          )
        };
      });
    });

    // Listen for online status
    socket.on('users:online', (onlineUserIds) => {
      // Update contacts with online status
      setContacts((prevContacts) => {
        const updatedContacts = { ...prevContacts };
        Object.keys(updatedContacts).forEach(type => {
          updatedContacts[type] = updatedContacts[type].map(contact => ({
            ...contact,
            status: onlineUserIds.includes(contact._id) ? 'online' : 'offline',
            lastSeen: onlineUserIds.includes(contact._id) ? 'Active now' : contact.lastSeen
          }));
        });
        return updatedContacts;
      });
    });

    socket.on('user:online', (userId) => {
      // Update specific user to online status
      setContacts((prevContacts) => {
        const updatedContacts = { ...prevContacts };
        Object.keys(updatedContacts).forEach(type => {
          updatedContacts[type] = updatedContacts[type].map(contact => 
            contact._id === userId 
              ? { ...contact, status: 'online', lastSeen: 'Active now' }
              : contact
          );
        });
        return updatedContacts;
      });
    });

    socket.on('user:offline', (userId) => {
      // Update specific user to offline status
      setContacts((prevContacts) => {
        const updatedContacts = { ...prevContacts };
        Object.keys(updatedContacts).forEach(type => {
          updatedContacts[type] = updatedContacts[type].map(contact => 
            contact._id === userId 
              ? { ...contact, status: 'offline', lastSeen: 'Last seen just now' }
              : contact
          );
        });
        return updatedContacts;
      });
    });

    return () => {
      if (socket) {
        socket.off('message:new');
        socket.off('message:read');
        socket.off('typing:start');
        socket.off('typing:stop');
        socket.off('users:online');
        socket.off('user:online');
        socket.off('user:offline');
      }
    };
  };

  // Load conversations
  const loadConversations = async () => {
    try {
      const conversationsData = await chatApi.getConversations();
      
      // Format conversations for our state
      const formattedConversations = {};
      for (const conv of conversationsData) {
        formattedConversations[conv._id] = await chatApi.getMessages(conv._id);
      }
      
      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations');
    }
  };

  // Load contacts
  const loadContacts = async (userType) => {
    try {
      // Load different types of contacts based on user type
      const contactTypes = {
        patient: ['doctor', 'pharmacy'],
        doctor: ['patient', 'doctor', 'pharmacy'],
        pharmacy: ['patient', 'doctor']
      };
      
      const loadedContacts = { patient: [], doctor: [], pharmacy: [] };
      for (const type of contactTypes[userType]) {
        const users = await chatApi.getUsers(type);
        loadedContacts[type] = users;
      }
      
      setContacts(loadedContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
      setError('Failed to load contacts');
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userData = await chatApi.login({
        email: loginUsername,
        password: loginPassword,
        type: userType
      });
      
      setCurrentUser(userData.user);
      setIsLoggedIn(true);
      
      // Connect websocket
      connectToSocket();
      
      // Load conversations and contacts
      await Promise.all([
        loadConversations(),
        loadContacts(userData.user.type)
      ]);
      
      setLoginUsername("");
      setLoginPassword("");
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Check your credentials.');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await chatApi.logout();
      setIsLoggedIn(false);
      setCurrentUser(null);
      setUserType("");
      setSelectedContact(null);
      setConversations({});
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Select a contact to chat with
  const selectContact = async (contact) => {
    setSelectedContact(contact);
    try {
      // Clear any previous errors
      setError(null);
      
      // Create or get the conversation with this contact
      const conversation = await chatApi.getOrCreateConversation(contact._id);
      
      // Get messages for this conversation
      const messages = await chatApi.getMessages(conversation.id);
      
      // Update state
      setConversations(prev => ({
        ...prev,
        [conversation.id]: messages
      }));
      
      // Mark messages as read
      if (messages && messages.length > 0) {
        for (const msg of messages) {
          if (msg.sender !== currentUser._id && !msg.readBy?.includes(currentUser._id)) {
            chatApi.markAsRead(msg._id);
          }
        }
      }
      
      // Store the current conversation ID for easy reference
      setCurrentConversationId(conversation.id);
    } catch (error) {
      console.error('Error selecting contact:', error);
      setError('Failed to load conversation');
    }
  };

  // Handle sending messages
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedContact || !currentConversationId) return;
    
    setMessageLoading(true);
    try {
      // Emit typing stop event
      socketRef.current?.emit('typing:stop', currentConversationId);
      
      // Send message via API
      const newMessage = await chatApi.sendMessage(currentConversationId, message);
      
      // Update local state
      setConversations(prev => {
        const existingMessages = prev[currentConversationId] || [];
        return {
          ...prev,
          [currentConversationId]: [...existingMessages, newMessage]
        };
      });
      
      // Immediately scroll to bottom after sending a message
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      
      // Clear input
      setMessage("");
    } catch (error) {
      console.error('Send message error:', error);
      setError('Failed to send message');
    } finally {
      setMessageLoading(false);
    }
  };

  // Handle typing events
  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!selectedContact) return;
    
    // Emit typing event
    try {
      const conversationId = Object.keys(conversations).find(id => {
        return conversations[id].some(msg => 
          msg.sender === selectedContact._id || 
          msg.receiver === selectedContact._id
        );
      });
      
      if (conversationId) {
        if (e.target.value) {
          socketRef.current?.emit('typing:start', conversationId);
        } else {
          socketRef.current?.emit('typing:stop', conversationId);
        }
      }
    } catch (error) {
      console.error('Typing event error:', error);
    }
  };

  // Return JSX for the component
  return (
    <div className="chat-page">
      <div className="container">
        <div className="jumbotron gradient-background p-4 p-md-5 text-white rounded bg-dark animate-slide-down" style={{ marginBottom: "32px" }}>
          <div className="col-md-8 px-0" style={{ color: "black" }}>
            <h1 className="display-4 font-italic">DocAnswers Chat</h1>
            <p className="lead my-3">
              Connect with healthcare professionals and pharmacies in real-time.
              Get your medical questions answered and manage your prescriptions efficiently.
            </p>
            {isLoggedIn && currentUser && (
              // Rest of your JSX
              <div>User is logged in</div>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading your conversations...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : !isLoggedIn ? (
          // Login form JSX
          <div>Login form</div>
        ) : (
          // Chat interface JSX
          <div>Chat interface</div>
        )}
      </div>
    </div>
  );
};

export default DocAnswers;
