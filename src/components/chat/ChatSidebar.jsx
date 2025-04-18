import React, { useState } from 'react';
import { useBackendContext } from '../../contexts/BackendContext';
import './ChatSidebar.css';

const ChatSidebar = ({ 
  conversations = [],
  contacts = {}, 
  selectedConversation,
  onSelectConversation,
  onStartNewConversation,
  unreadCounts = {}
}) => {
  const { currentUser } = useBackendContext();
  const [activeTab, setActiveTab] = useState('chats');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const isToday = date.toDateString() === now.toDateString();
    
    // Within today
    if (isToday) {
      return date.toLocaleTimeString(undefined, { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
    }
    
    // Within this week (show day name)
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString(undefined, { weekday: 'short' });
    }
    
    // Older (show date)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  };

  const getParticipantName = (conversation) => {
    if (!conversation || !conversation.participants) return 'Unknown';
    
    // Find the other participant (not the current user)
    const participantId = conversation.participants.find(id => id !== currentUser.id);
    
    // Find in contacts
    for (const type in contacts) {
      const contact = contacts[type]?.find(c => c.id === participantId);
      if (contact) return contact.name;
    }
    
    // Fallback
    return conversation.participantName || 'Unknown User';
  };

  const getParticipantAvatar = (conversation) => {
    if (!conversation || !conversation.participants) return null;
    
    const participantId = conversation.participants.find(id => id !== currentUser.id);
    
    for (const type in contacts) {
      const contact = contacts[type]?.find(c => c.id === participantId);
      if (contact) return contact.avatar;
    }
    
    return null;
  };

  const getParticipantType = (conversation) => {
    if (!conversation || !conversation.participants) return 'unknown';
    
    const participantId = conversation.participants.find(id => id !== currentUser.id);
    
    for (const type in contacts) {
      if (contacts[type]?.some(c => c.id === participantId)) {
        return type;
      }
    }
    
    return conversation.participantType || 'unknown';
  };

  const getStatusIndicator = (conversation) => {
    if (!conversation || !conversation.participants) return null;
    
    const participantId = conversation.participants.find(id => id !== currentUser.id);
    let status = 'offline';
    
    for (const type in contacts) {
      const contact = contacts[type]?.find(c => c.id === participantId);
      if (contact) {
        status = contact.status || 'offline';
        break;
      }
    }
    
    return (
      <span className={`status-indicator ${status}`} 
            title={status === 'online' ? 'Online' : 'Offline'}>
      </span>
    );
  };

  // Filter conversations by search term
  const filteredConversations = conversations.filter(conversation => {
    const participantName = getParticipantName(conversation);
    const participantType = getParticipantType(conversation);
    const matchesSearch = !searchTerm || 
      participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conversation.lastMessage && conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || 
      (participantType === typeFilter) ||
      (typeFilter === 'doctors' && participantType === 'doctor') ||
      (typeFilter === 'patients' && participantType === 'patient') ||
      (typeFilter === 'pharmacies' && participantType === 'pharmacy');
    
    return matchesSearch && matchesType;
  });

  // Filter contacts by search term and type
  const filteredContacts = {
    doctors: (!typeFilter || typeFilter === 'all' || typeFilter === 'doctors') ? 
      (contacts.doctors || []).filter(
        contact => !searchTerm || contact.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) : [],
    patients: (!typeFilter || typeFilter === 'all' || typeFilter === 'patients') ? 
      (contacts.patients || []).filter(
        contact => !searchTerm || contact.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) : [],
    pharmacies: (!typeFilter || typeFilter === 'all' || typeFilter === 'pharmacies') ? 
      (contacts.pharmacies || []).filter(
        contact => !searchTerm || contact.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) : []
  };

  // Toggle filter dropdown
  const toggleTypeFilter = () => {
    setShowTypeFilter(!showTypeFilter);
  };

  // Set the filter and close dropdown
  const selectFilter = (filter) => {
    setTypeFilter(filter);
    setShowTypeFilter(false);
  };

  return (
    <div className="chat-sidebar">
      <div className="sidebar-header">
        <h3>Messages</h3>
        {currentUser && (
          <div className="user-quick-info">
            <img 
              src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`} 
              alt={currentUser.name}
              className="user-avatar"
            />
            <div className="user-status-badge"></div>
          </div>
        )}
      </div>
      
      <div className="sidebar-search">
        <div className="search-container">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Search messages or contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search" 
              onClick={() => setSearchTerm('')}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        
        <div className="filter-dropdown">
          <button className="filter-button" onClick={toggleTypeFilter}>
            <i className="fas fa-filter"></i>
            <span>{typeFilter !== 'all' ? typeFilter : 'all'}</span>
          </button>
          {showTypeFilter && (
            <div className="filter-options">
              <div className={`filter-option ${typeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => selectFilter('all')}>
                <i className="fas fa-globe"></i>
                <span>All</span>
              </div>
              <div className={`filter-option ${typeFilter === 'doctors' ? 'active' : ''}`}
                  onClick={() => selectFilter('doctors')}>
                <i className="fas fa-user-md"></i>
                <span>Doctors</span>
              </div>
              <div className={`filter-option ${typeFilter === 'patients' ? 'active' : ''}`}
                  onClick={() => selectFilter('patients')}>
                <i className="fas fa-user"></i>
                <span>Patients</span>
              </div>
              <div className={`filter-option ${typeFilter === 'pharmacies' ? 'active' : ''}`}
                  onClick={() => selectFilter('pharmacies')}>
                <i className="fas fa-prescription-bottle-alt"></i>
                <span>Pharmacies</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="sidebar-tabs">
        <button 
          className={`tab-button ${activeTab === 'chats' ? 'active' : ''}`}
          onClick={() => setActiveTab('chats')}
        >
          <i className="fas fa-comment-dots"></i>
          <span>Chats</span>
          {Object.values(unreadCounts).reduce((a, b) => a + b, 0) > 0 && (
            <span className="unread-badge">
              {Object.values(unreadCounts).reduce((a, b) => a + b, 0)}
            </span>
          )}
        </button>
        <button 
          className={`tab-button ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contacts')}
        >
          <i className="fas fa-address-book"></i>
          <span>Contacts</span>
        </button>
      </div>
      
      {activeTab === 'chats' && (
        <div className="sidebar-content">
          {filteredConversations.length === 0 ? (
            <div className="no-conversations">
              <i className="far fa-comments"></i>
              <p>No conversations found</p>
              <button 
                className="btn-start-chat"
                onClick={() => setActiveTab('contacts')}
              >
                Start a new chat
              </button>
            </div>
          ) : (
            <div className="conversations-list">
              {filteredConversations.map((conversation) => {
                const isSelected = selectedConversation?._id === conversation._id;
                const unreadCount = unreadCounts[conversation._id] || 0;
                
                return (
                  <div
                    key={conversation._id}
                    className={`conversation-item ${isSelected ? 'selected' : ''} ${unreadCount > 0 ? 'unread' : ''}`}
                    onClick={() => onSelectConversation(conversation)}
                  >
                    <div className="avatar-container">
                      <img
                        src={getParticipantAvatar(conversation) || `https://ui-avatars.com/api/?name=${encodeURIComponent(getParticipantName(conversation))}&background=random`}
                        alt={getParticipantName(conversation)}
                        className="avatar"
                      />
                      {getStatusIndicator(conversation)}
                    </div>
                    
                    <div className="conversation-info">
                      <div className="conversation-header">
                        <h4 className="name">{getParticipantName(conversation)}</h4>
                        <span className="time">{formatTime(conversation.lastMessageAt)}</span>
                      </div>
                      <div className="conversation-footer">
                        <p className="last-message">
                          {conversation.lastMessage || 'No messages yet'}
                        </p>
                        {unreadCount > 0 && (
                          <span className="unread-count">{unreadCount}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'contacts' && (
        <div className="sidebar-content">
          {/* Doctors */}
          {filteredContacts.doctors.length > 0 && (
            <div className="contacts-section">
              <h4 className="contacts-type">
                <i className="fas fa-user-md"></i>
                <span>Doctors</span>
              </h4>
              <div className="contacts-list">
                {filteredContacts.doctors.map((contact) => (
                  <div
                    key={contact.id}
                    className="contact-item"
                    onClick={() => onStartNewConversation(contact)}
                  >
                    <div className="avatar-container">
                      <img
                        src={contact.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=random`}
                        alt={contact.name}
                        className="avatar"
                      />
                      <span className={`status-indicator ${contact.status || 'offline'}`}></span>
                    </div>
                    <div className="contact-info">
                      <h4 className="name">{contact.name}</h4>
                      <p className="specialty">{contact.specialization || 'Doctor'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Patients */}
          {filteredContacts.patients.length > 0 && (
            <div className="contacts-section">
              <h4 className="contacts-type">
                <i className="fas fa-user"></i>
                <span>Patients</span>
              </h4>
              <div className="contacts-list">
                {filteredContacts.patients.map((contact) => (
                  <div
                    key={contact.id}
                    className="contact-item"
                    onClick={() => onStartNewConversation(contact)}
                  >
                    <div className="avatar-container">
                      <img
                        src={contact.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=random`}
                        alt={contact.name}
                        className="avatar"
                      />
                      <span className={`status-indicator ${contact.status || 'offline'}`}></span>
                    </div>
                    <div className="contact-info">
                      <h4 className="name">{contact.name}</h4>
                      <p className="title">Patient</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Pharmacies */}
          {filteredContacts.pharmacies.length > 0 && (
            <div className="contacts-section">
              <h4 className="contacts-type">
                <i className="fas fa-prescription-bottle-alt"></i>
                <span>Pharmacies</span>
              </h4>
              <div className="contacts-list">
                {filteredContacts.pharmacies.map((contact) => (
                  <div
                    key={contact.id}
                    className="contact-item"
                    onClick={() => onStartNewConversation(contact)}
                  >
                    <div className="avatar-container">
                      <img
                        src={contact.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=random`}
                        alt={contact.name}
                        className="avatar"
                      />
                      <span className={`status-indicator ${contact.status || 'offline'}`}></span>
                    </div>
                    <div className="contact-info">
                      <h4 className="name">{contact.name}</h4>
                      <p className="title">Pharmacy</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* No contacts found */}
          {Object.values(filteredContacts).every(list => list.length === 0) && (
            <div className="no-contacts">
              <i className="far fa-address-book"></i>
              <p>No contacts found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;
