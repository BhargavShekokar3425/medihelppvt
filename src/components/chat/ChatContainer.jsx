import React, { useState, useEffect, useRef } from 'react';
import ChatSidebar from './ChatSidebar';
import MessagePanel from './MessagePanel';
import './ChatContainer.css';
import ChatPlaceholder from './ChatPlaceholder';
import { useBackendContext } from '../../contexts/BackendContext';
import UserProfileDrawer from './UserProfileDrawer';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';

const ChatContainer = () => {
  const { currentUser, apiService } = useBackendContext();
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState({ doctors: [], patients: [], pharmacies: [] });
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [profileDrawer, setProfileDrawer] = useState({ open: false, user: null });
  const [typing, setTyping] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [page, setPage] = useState(1);
  const [userLoading, setUserLoading] = useState(true);
  
  const messagesRef = useRef([]);
  const messagesEndRef = useRef();
  const typingTimeouts = useRef({});
  
  // Check if user is logged in
  useEffect(() => {
    if (currentUser) {
      setUserLoading(false);
      loadInitialData();
    } else {
      setUserLoading(false);
    }
  }, [currentUser]);
  
  // Load initial data (conversations and contacts)
  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchConversations(),
        fetchContacts()
      ]);
    } catch (err) {
      setError("Failed to load chat data");
      console.error("Error loading initial chat data:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await apiService.get('/chat/conversations');
      if (response && response.data) {
        setConversations(response.data);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  };
  
  // Fetch contacts
  const fetchContacts = async () => {
    try {
      const newContacts = {};
      
      // Load different contacts based on user role
      const types = ['doctors', 'patients', 'pharmacies'];
      
      for (const type of types) {
        const response = await apiService.get(`/chat/contacts/${type}`);
        if (response && response.data) {
          newContacts[type] = response.data;
        }
      }
      
      setContacts(newContacts);
    } catch (err) {
      console.error("Error fetching contacts:", err);
    }
  };
  
  // Set up socket listeners
  useEffect(() => {
    if (!currentUser) return;
    
    // Join existing conversation rooms
    if (conversations.length > 0) {
      const ids = conversations.map(conv => conv._id);
      apiService.chatService.joinConversations(ids);
    }
    
    // Listen for new messages
    apiService.chatService.on('message:new', ({ conversationId, message }) => {
      // Update messages if this is the current conversation
      if (selectedConversation && selectedConversation._id === conversationId) {
        setMessages(prev => [...prev, message]);
        messagesRef.current = [...messagesRef.current, message];
        
        // Mark as read immediately if we're viewing this conversation
        apiService.chatService.markMessagesAsRead(conversationId);
      } else {
        // Increment unread count for other conversations
        setUnreadCounts(prev => ({
          ...prev,
          [conversationId]: (prev[conversationId] || 0) + 1
        }));
      }
      
      // Update conversations list with new last message
      updateConversationOrder(conversationId, message);
    });
    
    // Listen for typing indicators
    apiService.chatService.on('typing:start', ({ conversationId, userId }) => {
      setTyping(prev => ({
        ...prev,
        [conversationId]: true
      }));
    });
    
    apiService.chatService.on('typing:stop', ({ conversationId, userId }) => {
      setTyping(prev => ({
        ...prev,
        [conversationId]: false
      }));
    });
    
    // Clean up listeners
    return () => {
      apiService.chatService.off('message:new');
      apiService.chatService.off('typing:start');
      apiService.chatService.off('typing:stop');
    };
  }, [currentUser, conversations, selectedConversation, apiService]);
  
  // Update conversation order when new message arrives
  const updateConversationOrder = (conversationId, message) => {
    setConversations(prev => {
      // Find the conversation
      const conversationIndex = prev.findIndex(c => c._id === conversationId);
      if (conversationIndex === -1) return prev;
      
      // Create a copy of the conversations array
      const updatedConversations = [...prev];
      
      // Update the conversation with the new message info
      const conversation = { ...updatedConversations[conversationIndex] };
      conversation.lastMessage = message.text;
      conversation.lastMessageAt = message.createdAt || new Date().toISOString();
      conversation.lastSenderId = message.sender;
      
      // Remove the conversation from its current position
      updatedConversations.splice(conversationIndex, 1);
      
      // Add it to the beginning (most recent)
      updatedConversations.unshift(conversation);
      
      return updatedConversations;
    });
  };
  
  // Select a conversation and load its messages
  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    
    // Find the other participant
    const otherParticipant = conversation.otherParticipants?.[0];
    if (otherParticipant) {
      setSelectedContact(otherParticipant);
    }
    
    // Reset search
    setSearchResults(null);
    setSearchQuery('');
    
    // Reset pagination
    setPage(1);
    setHasMoreMessages(true);
    
    // Clear unread count
    setUnreadCounts(prev => ({ ...prev, [conversation._id]: 0 }));
    
    // Load messages
    try {
      setLoading(true);
      const response = await apiService.get(`/chat/conversations/${conversation._id}/messages`);
      
      if (response && response.data) {
        setMessages(response.data);
        messagesRef.current = response.data;
        
        // Mark as read
        await apiService.put(`/chat/conversations/${conversation._id}/read`);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load more messages (pagination)
  const loadMoreMessages = async () => {
    if (!hasMoreMessages || !selectedConversation || loading) return;
    
    try {
      setLoading(true);
      const oldestMsgDate = messages.length > 0 ? 
        messages[0].createdAt : new Date().toISOString();
      
      const response = await apiService.get(`/chat/conversations/${selectedConversation._id}/messages`, {
        params: { 
          before: oldestMsgDate, 
          page: page + 1 
        }
      });
      
      if (response && response.data && response.data.length > 0) {
        setMessages(prev => [...response.data, ...prev]);
        messagesRef.current = [...response.data, ...messagesRef.current];
        setPage(page + 1);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send a new message
  const sendMessage = async (text, attachments = []) => {
    if (!selectedConversation || !text.trim()) return;
    
    try {
      const response = await apiService.post(`/chat/conversations/${selectedConversation._id}/messages`, {
        text,
        attachments
      });
      
      if (response && response.data) {
        // Add to local state immediately for responsiveness
        setMessages(prev => [...prev, response.data]);
        messagesRef.current = [...messagesRef.current, response.data];
        
        // Update conversation
        updateConversationOrder(selectedConversation._id, response.data);
        
        // Stop typing indicator
        apiService.chatService.emit('typing:stop', { 
          conversationId: selectedConversation._id 
        });
        
        return response.data;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Handle typing indicator
  const handleTyping = (isTyping) => {
    if (!selectedConversation) return;
    
    const conversationId = selectedConversation._id;
    
    // Clear any existing timeout
    if (typingTimeouts.current[conversationId]) {
      clearTimeout(typingTimeouts.current[conversationId]);
    }
    
    // Send the typing status
    apiService.chatService.emit(
      isTyping ? 'typing:start' : 'typing:stop', 
      { conversationId }
    );
    
    // Set a timeout to stop typing after 3 seconds of inactivity
    if (isTyping) {
      typingTimeouts.current[conversationId] = setTimeout(() => {
        apiService.chatService.emit('typing:stop', { conversationId });
      }, 3000);
    }
  };

  // Start a new conversation with a contact
  const startNewConversation = async (contact) => {
    try {
      // Check if conversation already exists
      const existing = conversations.find(c => 
        c.participants.includes(contact._id)
      );
      
      if (existing) {
        selectConversation(existing);
        return;
      }
      
      // Create new conversation
      const response = await apiService.post('/chat/conversations', {
        participantId: contact._id
      });
      
      if (response && response.data) {
        // Add to conversations list
        const newConversation = response.data;
        setConversations(prev => [newConversation, ...prev]);
        
        // Select the new conversation
        selectConversation(newConversation);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  // Search messages in the current conversation
  const searchMessages = async (query) => {
    if (!query.trim() || !selectedConversation) {
      setSearchResults(null);
      return;
    }
    
    try {
      setLoading(true);
      const response = await apiService.get(`/chat/conversations/${selectedConversation._id}/search`, {
        params: { query }
      });
      
      if (response && response.data) {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error('Error searching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show user profile drawer
  const showUserProfile = (user) => {
    setProfileDrawer({ open: true, user });
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // When messages change, scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (userLoading) {
    return (
      <div className="chat-loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <ChatSidebar 
        conversations={conversations}
        contacts={contacts}
        selectedConversation={selectedConversation}
        onSelectConversation={selectConversation}
        onStartNewConversation={startNewConversation}
        unreadCounts={unreadCounts}
      />
      
      <div className="chat-main">
        {selectedConversation ? (
          <>
            <ChatHeader 
              contact={selectedContact}
              typing={typing[selectedConversation._id]}
              onShowProfile={() => showUserProfile(selectedContact)}
              onSearch={searchMessages}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
            
            <MessagePanel 
              messages={searchResults || messages}
              currentUser={currentUser}
              contact={selectedContact}
              loading={loading}
              hasMore={hasMoreMessages}
              loadMore={loadMoreMessages}
              isSearching={!!searchResults}
              messagesEndRef={messagesEndRef}
            />
            
            <MessageInput 
              onSendMessage={sendMessage}
              onTyping={handleTyping}
            />
          </>
        ) : (
          <ChatPlaceholder />
        )}
      </div>
      
      <UserProfileDrawer
        isOpen={profileDrawer.open}
        user={profileDrawer.user}
        onClose={() => setProfileDrawer({ open: false, user: null })}
      />
    </div>
  );
};

export default ChatContainer;
