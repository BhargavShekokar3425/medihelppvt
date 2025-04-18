import React, { useState } from 'react';
import './MessageBubble.css';

const MessageBubble = ({
  message,
  isMine,
  contact,
  showAvatar = false,
  isNewGroup = true,
  isEndOfGroup = true
}) => {
  const [showActions, setShowActions] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Format time for display
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Handle different attachment types
  const renderAttachment = (attachment) => {
    const { type, url } = attachment;
    
    if (type.startsWith('image/')) {
      return (
        <div className="message-image-container">
          {!imageLoaded && (
            <div className="image-loading">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          <img
            src={url}
            alt="Attached image"
            className={`message-image ${imageLoaded ? 'loaded' : ''}`}
            onClick={() => window.open(url, '_blank')}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      );
    }
    
    if (type.startsWith('video/')) {
      return (
        <div className="message-video-container">
          <video
            src={url}
            controls
            className="message-video"
          />
        </div>
      );
    }
    
    if (type.startsWith('audio/')) {
      return (
        <div className="message-audio-container">
          <audio
            src={url}
            controls
            className="message-audio"
          />
        </div>
      );
    }
    
    // Default for other file types
    return (
      <div className="message-file">
        <i className="fas fa-file"></i>
        <span className="file-name">{attachment.name || 'File'}</span>
        <a href={url} target="_blank" rel="noopener noreferrer" className="file-download">
          <i className="fas fa-download"></i>
        </a>
      </div>
    );
  };

  // Parse message text for URLs, emojis, etc.
  const parseMessageText = (text) => {
    if (!text) return null;
    
    // Replace URLs with clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="message-link"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  // Handle message actions
  const handleMessageAction = (action) => {
    switch (action) {
      case 'reply':
        // TODO: Implement reply functionality
        console.log('Reply to message:', message);
        break;
      case 'forward':
        // TODO: Implement forward functionality
        console.log('Forward message:', message);
        break;
      case 'copy':
        navigator.clipboard.writeText(message.text);
        break;
      case 'delete':
        // TODO: Implement delete functionality
        console.log('Delete message:', message);
        break;
      default:
        break;
    }
    
    setShowActions(false);
  };

  // Get read status
  const getReadStatus = () => {
    if (!message.readBy || message.readBy.length === 0) {
      return 'sent';
    }
    
    // If the other person has read it
    if (isMine && message.readBy.some(id => id !== message.sender)) {
      return 'read';
    }
    
    return 'delivered';
  };

  // Determine bubble classes based on position in group
  const getBubbleClasses = () => {
    let classes = ['message-bubble'];
    
    if (isMine) {
      classes.push('mine');
    } else {
      classes.push('theirs');
    }
    
    if (isNewGroup) classes.push('start-of-group');
    if (isEndOfGroup) classes.push('end-of-group');
    
    // Add class for message with attachments
    if (message.attachments && message.attachments.length > 0) {
      classes.push('has-attachment');
    }
    
    return classes.join(' ');
  };

  return (
    <div 
      className={`message ${isMine ? 'mine' : 'theirs'} ${isNewGroup ? 'new-group' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {showAvatar && !isMine && (
        <div className="message-avatar">
          <img 
            src={contact?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact?.name || 'User')}`}
            alt={contact?.name || 'User'}
          />
        </div>
      )}
      
      <div className={getBubbleClasses()}>
        {message.attachments && message.attachments.length > 0 && (
          <div className="message-attachments">
            {message.attachments.map((attachment, index) => (
              <div key={index} className="attachment-wrapper">
                {renderAttachment(attachment)}
              </div>
            ))}
          </div>
        )}
        
        {message.text && (
          <div className="message-text">
            {parseMessageText(message.text)}
          </div>
        )}
        
        <div className="message-meta">
          <span className="message-time">{formatMessageTime(message.createdAt)}</span>
          
          {isMine && (
            <span className="message-status">
              {getReadStatus() === 'read' && (
                <i className="fas fa-check-double read"></i>
              )}
              {getReadStatus() === 'delivered' && (
                <i className="fas fa-check-double"></i>
              )}
              {getReadStatus() === 'sent' && (
                <i className="fas fa-check"></i>
              )}
            </span>
          )}
        </div>
        
        {showActions && (
          <div className="message-actions">
            <button onClick={() => handleMessageAction('reply')}>
              <i className="fas fa-reply"></i>
            </button>
            <button onClick={() => handleMessageAction('forward')}>
              <i className="fas fa-share"></i>
            </button>
            <button onClick={() => handleMessageAction('copy')}>
              <i className="fas fa-copy"></i>
            </button>
            {isMine && (
              <button onClick={() => handleMessageAction('delete')} className="delete">
                <i className="fas fa-trash-alt"></i>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
