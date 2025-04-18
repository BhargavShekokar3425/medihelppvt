import React, { useState } from 'react';
import './ChatHeader.css';

const ChatHeader = ({ 
  contact,
  typing,
  onShowProfile,
  onSearch,
  searchQuery,
  setSearchQuery
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // Format status message based on typing indicator
  const getStatusMessage = () => {
    if (typing) {
      return 'Typing...';
    }
    
    if (contact?.status === 'online') {
      return 'Online';
    }
    
    return contact?.lastSeen || 'Offline';
  };
  
  // Handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };
  
  // Toggle search field
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery('');
      onSearch('');
    }
  };
  
  // Handle menu item click
  const handleMenuAction = (action) => {
    switch (action) {
      case 'viewProfile':
        onShowProfile();
        break;
      case 'clearChat':
        // TODO: Implement clear chat functionality
        console.log('Clear chat clicked');
        break;
      case 'blockUser':
        // TODO: Implement block user functionality
        console.log('Block user clicked');
        break;
      default:
        break;
    }
    
    setShowMenu(false);
  };

  return (
    <div className="chat-header">
      <div className="header-left" onClick={onShowProfile}>
        <div className="avatar-container">
          <img 
            src={contact?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact?.name || 'User')}&background=random`} 
            alt={contact?.name || 'Contact'}
            className="avatar"
          />
          <span className={`status-indicator ${contact?.status || 'offline'}`}></span>
        </div>
        
        <div className="contact-info">
          <h4 className="name">{contact?.name || 'Select a contact'}</h4>
          <p className="status">{getStatusMessage()}</p>
        </div>
      </div>
      
      <div className="header-actions">
        {showSearch ? (
          <div className="search-container">
            <input
              type="text"
              placeholder="Search in conversation..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
              autoFocus
            />
            <button className="search-clear" onClick={toggleSearch}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        ) : (
          <>
            <button className="header-button" onClick={toggleSearch} title="Search">
              <i className="fas fa-search"></i>
            </button>
            
            <button className="header-button" onClick={() => setShowMenu(!showMenu)} title="Menu">
              <i className="fas fa-ellipsis-v"></i>
            </button>
            
            {showMenu && (
              <div className="header-menu">
                <div 
                  className="menu-item" 
                  onClick={() => handleMenuAction('viewProfile')}
                >
                  <i className="fas fa-user"></i>
                  <span>View Profile</span>
                </div>
                <div 
                  className="menu-item" 
                  onClick={() => handleMenuAction('clearChat')}
                >
                  <i className="fas fa-trash"></i>
                  <span>Clear Chat</span>
                </div>
                <div 
                  className="menu-item danger" 
                  onClick={() => handleMenuAction('blockUser')}
                >
                  <i className="fas fa-ban"></i>
                  <span>Block User</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
