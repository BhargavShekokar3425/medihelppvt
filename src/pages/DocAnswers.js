import React, { useState, useEffect, useRef } from "react";
import Footer from "../components/Footer";
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
  
  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUserData();
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // Adding loadUserData as a dependency would create an infinite loop
  
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
        if (isDuplicate) return prevConversations;
        
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
      // Get or create conversation with this contact
      const conversation = await chatApi.getOrCreateConversation(contact._id);
      
      // Get messages for this conversation
      const messages = await chatApi.getMessages(conversation._id);
      
      // Update state
      setConversations(prev => ({
        ...prev,
        [conversation._id]: messages
      }));
      
      // Mark messages as read
      for (const msg of messages) {
        if (msg.sender !== currentUser._id && !msg.readBy?.includes(currentUser._id)) {
          chatApi.markAsRead(msg._id);
        }
      }
    } catch (error) {
      console.error('Error selecting contact:', error);
      setError('Failed to load conversation');
    }
  };
  
  // Handle sending messages
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedContact) return;
    
    setMessageLoading(true);
    
    try {
      // Create a conversation if it doesn't exist
      const conversation = await chatApi.getOrCreateConversation(selectedContact._id);
      
      // Emit typing stop event
      socketRef.current?.emit('typing:stop', conversation._id);
      
      // Send message via API
      const newMessage = await chatApi.sendMessage(conversation._id, message);
      
      // Update local state
      setConversations(prev => {
        const existingMessages = prev[conversation._id] || [];
        return {
          ...prev,
          [conversation._id]: [...existingMessages, newMessage]
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
  
  // Rest of your component remains similar with adjustments for the real API
  
  // Return JSX with proper error handling, loading states, etc.
  
  return (
    <div className="chat-page">
      <div className="container">
        <div 
          className="jumbotron gradient-background p-4 p-md-5 text-white rounded bg-dark animate-slide-down" 
          style={{ marginBottom: "32px" }}
        >
          <div className="col-md-8 px-0" style={{ color: "black" }}>
            <h1 className="display-4 font-italic">DocAnswers Chat</h1>
            <p className="lead my-3">
              Connect with healthcare professionals and pharmacies in real-time. 
              Get your medical questions answered and manage your prescriptions efficiently.
            </p>
            {isLoggedIn && currentUser && (
              <div className="d-flex align-items-center mt-3">
                <img 
                  src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random&color=fff`} 
                  alt={currentUser.name}
                  className="rounded-circle border border-3 border-white shadow" 
                  width="50" 
                  height="50"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random&color=fff`;
                  }}
                />
                <div className="ms-3">
                  <h5 className="mb-0 text-white">{currentUser.name}</h5>
                  <small className="text-white-50">Logged in as {currentUser.type}</small>
                </div>
                <div className="ms-auto">
                  <button 
                    className="btn btn-sm btn-outline-light me-2" 
                    onClick={() => setShowProfileModal(true)}
                  >
                    View Profile
                  </button>
                  <button 
                    className="btn btn-sm btn-danger" 
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
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
          <div className="row justify-content-center animate-fade-in">
            <div className="col-md-6">
              <div className="card shadow-lg border-0">
                <div className="card-header bg-primary text-white">
                  <h4 className="mb-0">Login to DocAnswers</h4>
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleLogin}>
                    <div className="mb-4">
                      <label className="form-label fw-bold">I am a:</label>
                      <div className="d-flex gap-3 user-type-selector">
                        {['patient', 'doctor', 'pharmacy'].map((type) => (
                          <div 
                            key={type}
                            className={`user-type-option ${userType === type ? 'selected' : ''}`}
                            onClick={() => setUserType(type)}
                          >
                            <div className="icon-container mb-2">
                              <i className={`fas fa-${
                                type === 'patient' ? 'user' : 
                                type === 'doctor' ? 'user-md' : 'prescription-bottle-alt'
                              }`}></i>
                            </div>
                            <span className="d-block text-center">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="username" className="form-label">Email</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fas fa-envelope"></i>
                        </span>
                        <input 
                          type="email" 
                          className="form-control" 
                          id="username" 
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="password" className="form-label">Password</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fas fa-lock"></i>
                        </span>
                        <input 
                          type="password" 
                          className="form-control" 
                          id="password"
                          value={loginPassword} 
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="d-grid">
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-lg gradient-bg"
                        disabled={!userType}
                      >
                        Login
                      </button>
                    </div>
                    
                    <div className="text-center mt-3">
                      <small className="text-muted">
                        For demo purposes, you can use any email/password
                      </small>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Interface */}
            <div className="row animate-slide-up">
              {/* Contacts List */}
              <div className="col-md-4 mb-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white p-3 d-flex align-items-center">
                    <h5 className="mb-0 text-primary">Contacts</h5>
                    <div className="ms-auto">
                      <span className="badge bg-primary rounded-pill">
                        {Object.values(contacts).reduce((sum, typeContacts) => sum + typeContacts.length, 0)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <div className="input-group mb-3">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="fas fa-search text-muted"></i>
                      </span>
                      <input 
                        type="text" 
                        className="form-control border-start-0 bg-light" 
                        placeholder="Search contacts..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="contacts-scroll" style={{ maxHeight: "650px", overflowY: "auto" }}>
                    {Object.keys(contacts).map(type => (
                      <React.Fragment key={type}>
                        {contacts[type].length > 0 && (
                          <>
                            <div className="contact-group-header">
                              <small className="text-uppercase text-muted ms-3 mt-2 mb-1 d-block">
                                {type}s
                              </small>
                            </div>
                            {contacts[type]
                              .filter(contact => 
                                contact.name.toLowerCase().includes(searchQuery.toLowerCase())
                              )
                              .map(contact => (
                                <div
                                  key={contact._id}
                                  className={`contact-card ${selectedContact && selectedContact._id === contact._id ? 'active' : ''}`}
                                  onClick={() => selectContact(contact)}
                                >
                                  <div className="contact-avatar">
                                    <div className="position-relative">
                                      <img 
                                        src={contact.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=random&color=fff`} 
                                        alt={contact.name} 
                                        className="rounded-circle" 
                                        width="50" 
                                        height="50"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=random&color=fff`;
                                        }}
                                      />
                                      <span 
                                        className={`status-indicator ${contact.status === 'online' ? 'bg-success' : 'bg-secondary'}`}
                                      ></span>
                                    </div>
                                  </div>
                                  <div className="contact-info">
                                    <h6 className="mb-0">{contact.name}</h6>
                                    <div className="d-flex align-items-center">
                                      <small className="text-muted me-2">
                                        {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                                      </small>
                                      <small className={`status-text ${contact.status === 'online' ? 'text-success' : 'text-muted'}`}>
                                        {contact.lastSeen}
                                      </small>
                                    </div>
                                    <small className="d-block text-truncate contact-detail">
                                      {contact.specialization || contact.address || ''}
                                    </small>
                                  </div>
                                  {/* Add unread indicator if needed */}
                                </div>
                              ))
                            }
                          </>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chat Window */}
              <div className="col-md-8">
                <div className="card border-0 shadow-sm chat-window">
                  {selectedContact ? (
                    <>
                      <div className="chat-header">
                        <div className="d-flex align-items-center">
                          <div className="me-3 position-relative">
                            <img 
                              src={selectedContact.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedContact.name)}&background=random&color=fff`} 
                              alt={selectedContact.name} 
                              className="rounded-circle" 
                              width="50" 
                              height="50"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedContact.name)}&background=random&color=fff`;
                              }}
                            />
                            <span 
                              className={`status-indicator ${selectedContact.status === 'online' ? 'bg-success' : 'bg-secondary'}`}
                            ></span>
                          </div>
                          <div>
                            <h5 className="mb-0">{selectedContact.name}</h5>
                            <div className="d-flex align-items-center">
                              <small className="text-muted me-2">
                                {selectedContact.type.charAt(0).toUpperCase() + selectedContact.type.slice(1)}
                              </small>
                              <small className={`status-text ${selectedContact.status === 'online' ? 'text-success' : 'text-muted'}`}>
                                {selectedContact.lastSeen}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="chat-messages" style={{ height: "550px", overflowY: "auto", background: "#f8f9fb" }}>
                        <div className="messages-container p-3">
                          {(() => {
                            // Find the conversation for this contact
                            const conversationId = Object.keys(conversations).find(id => {
                              return conversations[id].some(msg => 
                                msg.sender === selectedContact._id || 
                                msg.receiver === selectedContact._id ||
                                (msg.sender !== currentUser._id && msg.receiver === selectedContact._id)
                              );
                            }) || (selectedContact && selectedContact._id); // Fallback to contact ID if no conversation found
                            
                            if (conversationId && conversations[conversationId] && conversations[conversationId].length > 0) {
                              return conversations[conversationId].map((msg, index) => (
                                msg.isTyping ? (
                                  <div key={`typing-${index}`} className="message-row other-message">
                                    <div className="typing-indicator">
                                      <span></span>
                                      <span></span>
                                      <span></span>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    key={msg._id || index}
                                    className={`message-row ${msg.sender === currentUser._id ? "own-message" : "other-message"}`}
                                  >
                                    <div className="message-content">
                                      <div className="message-bubble">
                                        <div className="message-text">{msg.text}</div>
                                        <div className="message-meta">
                                          <small>{new Date(msg.timestamp).toLocaleString()}</small>
                                          {msg.sender === currentUser._id && msg.readBy && msg.readBy.length > 1 && (
                                            <i className="fas fa-check-double ms-1 text-primary"></i>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              ));
                            } else {
                              return (
                                <div className="text-center text-muted p-5">
                                  <div className="mb-3">
                                    <i className="far fa-comment-dots fa-5x"></i>
                                  </div>
                                  <p>No messages yet. Start a conversation!</p>
                                  <button 
                                    className="btn btn-outline-primary mt-3"
                                    onClick={() => document.querySelector('.chat-input input').focus()}
                                  >
                                    <i className="fas fa-pencil-alt me-2"></i>
                                    Start typing
                                  </button>
                                </div>
                              );
                            }
                          })()}
                          <div ref={messageEndRef}></div>
                        </div>
                      </div>
                      
                      <div className="chat-input">
                        <form onSubmit={sendMessage} className="p-3">
                          <div className="input-group">
                            <button 
                              type="button" 
                              className="btn btn-outline-secondary border-end-0" 
                              disabled={messageLoading}
                            >
                              <i className="far fa-smile"></i>
                            </button>
                            <button 
                              type="button" 
                              className="btn btn-outline-secondary border-start-0 border-end-0" 
                              disabled={messageLoading}
                            >
                              <i className="fas fa-paperclip"></i>
                            </button>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Type your message..."
                              value={message}
                              onChange={handleTyping}
                              disabled={messageLoading}
                            />
                            <button 
                              type="submit" 
                              className="btn btn-primary px-3" 
                              disabled={!message.trim() || messageLoading}
                            >
                              {messageLoading ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              ) : (
                                <i className="fas fa-paper-plane"></i>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="card-body text-center p-5 d-flex flex-column align-items-center justify-content-center" style={{ height: "700px" }}>
                      <div className="mb-4">
                        <i className="far fa-comment-dots fa-5x text-muted"></i>
                      </div>
                      <h4>Select a contact to start chatting</h4>
                      <p className="text-muted">Choose from your contacts list to begin a conversation</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Information Section */}
            <div className="row mt-5 animate-fade-in-delay">
              <div className="col-md-8 blog-main">
                <h3 className="pb-4 mb-4 font-italic border-bottom">About DocAnswers</h3>
                <div className="row features-section">
                  <div className="col-md-6 mb-4">
                    <div className="feature-card">
                      <div className="feature-icon">
                        <i className="fas fa-comments"></i>
                      </div>
                      <h5>Real-time Communication</h5>
                      <p>Connect instantly with healthcare providers and get the answers you need.</p>
                    </div>
                  </div>
                  <div className="col-md-6 mb-4">
                    <div className="feature-card">
                      <div className="feature-icon">
                        <i className="fas fa-lock"></i>
                      </div>
                      <h5>Secure & Private</h5>
                      <p>Your conversations are encrypted and your medical data is kept confidential.</p>
                    </div>
                  </div>
                  <div className="col-md-6 mb-4">
                    <div className="feature-card">
                      <div className="feature-icon">
                        <i className="fas fa-prescription"></i>
                      </div>
                      <h5>Prescription Clarifications</h5>
                      <p>Easily discuss your prescriptions with doctors and pharmacists.</p>
                    </div>
                  </div>
                  <div className="col-md-6 mb-4">
                    <div className="feature-card">
                      <div className="feature-icon">
                        <i className="fas fa-calendar-check"></i>
                      </div>
                      <h5>Care Coordination</h5>
                      <p>Schedule appointments and follow-ups with your healthcare team.</p>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="col-md-4 blog-sidebar">
                <div className="p-4 mb-3 bg-light rounded gradient-bg">
                  <h4 className="font-italic text-black">About</h4>
                  <p className="mb-0">
                    MediHelp is your all-in-one medical companion, making healthcare access seamless and convenient. 
                    Schedule doctor appointments, request prescriptions, and manage your health effortlessly with Google Calendar integration. 
                    In emergencies, send out SOS requests instantly. Stay connected with the right medical help—anytime, anywhere.
                  </p>
                </div>
              </aside>
            </div>
          </>
        )}

        {/* Profile Modal */}
        {showProfileModal && currentUser && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header gradient-bg text-white">
                  <h5 className="modal-title">User Profile</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowProfileModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-4 text-center mb-4 mb-md-0">
                      <img 
                        src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&size=200&background=random&color=fff`} 
                        alt={currentUser.name}
                        className="img-fluid rounded-circle mb-3 profile-avatar" 
                        style={{ maxWidth: "200px" }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&size=200&background=random&color=fff`;
                        }}
                      />
                      <h4>{currentUser.name}</h4>
                      <p className="text-muted">{currentUser.type.charAt(0).toUpperCase() + currentUser.type.slice(1)}</p>
                    </div>
                    <div className="col-md-8">
                      <div className="profile-details">
                        {/* Display profile details based on user type */}
                        <div className="profile-item">
                          <i className="fas fa-envelope"></i>
                          <div>
                            <strong>Email:</strong> {currentUser.email}
                          </div>
                        </div>
                        
                        {currentUser.age && (
                          <div className="profile-item">
                            <i className="fas fa-birthday-cake"></i>
                            <div>
                              <strong>Age:</strong> {currentUser.age} years
                            </div>
                          </div>
                        )}
                        
                        {currentUser.contactNumber && (
                          <div className="profile-item">
                            <i className="fas fa-phone"></i>
                            <div>
                              <strong>Contact:</strong> {currentUser.contactNumber}
                            </div>
                          </div>
                        )}
                        
                        {/* Add more fields as needed based on user type */}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowProfileModal(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showProfileModal && <div className="modal-backdrop fade show"></div>}
      </div>
      <Footer />
    </div>
  );
};

export default DocAnswers;
