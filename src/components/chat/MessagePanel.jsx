import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import './MessagePanel.css';

const MessagePanel = ({
  messages = [],
  currentUser,
  contact,
  loading,
  hasMore,
  loadMore,
  isSearching,
  messagesEndRef
}) => {
  const observer = useRef(null);
  const firstMessageRef = useRef(null);

  // Group messages by date
  const groupMessagesByDate = (msgs) => {
    const groups = {};
    
    msgs.forEach(message => {
      const date = new Date(message.createdAt);
      const dateStr = date.toLocaleDateString();
      
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      
      groups[dateStr].push(message);
    });
    
    return groups;
  };

  // Format date for display
  const formatDateHeading = (dateStr) => {
    const messageDate = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    // Clean up previous observer
    if (observer.current) {
      observer.current.disconnect();
    }
    
    // Skip if no more messages or already loading
    if (!hasMore || loading || !firstMessageRef.current) return;
    
    // Set up new observer
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMore();
      }
    }, options);
    
    observer.current.observe(firstMessageRef.current);
    
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasMore, loading, messages]);

  // Get message groups
  const messageGroups = groupMessagesByDate(messages);
  const messageDates = Object.keys(messageGroups).sort();

  return (
    <div className="message-panel">
      {loading && messages.length === 0 ? (
        <div className="loading-messages">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading messages...</span>
          </div>
          <p>Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="no-messages">
          <div className="no-messages-content">
            <i className="far fa-comment-dots"></i>
            <h3>No messages yet</h3>
            <p>Send a message to start the conversation</p>
          </div>
        </div>
      ) : (
        <>
          {isSearching && (
            <div className="search-results-banner">
              <div className="search-results-info">
                <i className="fas fa-search"></i>
                <span>{messages.length} search results</span>
              </div>
            </div>
          )}
          
          {loading && hasMore && (
            <div className="loading-more">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading more...</span>
              </div>
            </div>
          )}
          
          <div className="messages-container">
            {messageDates.map((dateStr, dateIndex) => (
              <div key={dateStr} className="message-date-group">
                <div className="date-separator">
                  <span>{formatDateHeading(dateStr)}</span>
                </div>
                
                {messageGroups[dateStr].map((message, msgIndex) => {
                  const isFirstMessage = dateIndex === 0 && msgIndex === 0;
                  const isMine = message.sender === currentUser?.id;
                  const prevMessage = msgIndex > 0 ? messageGroups[dateStr][msgIndex - 1] : null;
                  const nextMessage = msgIndex < messageGroups[dateStr].length - 1 
                    ? messageGroups[dateStr][msgIndex + 1] 
                    : null;
                  
                  // Check if this message starts a new group (by same sender)
                  const isNewGroup = !prevMessage || prevMessage.sender !== message.sender;
                  
                  // Check if this message ends a group
                  const isEndOfGroup = !nextMessage || nextMessage.sender !== message.sender;
                  
                  return (
                    <div 
                      key={message._id}
                      ref={isFirstMessage ? firstMessageRef : null}
                      className={`message-wrapper ${isMine ? 'mine' : 'theirs'}`}
                    >
                      <MessageBubble
                        message={message}
                        isMine={isMine}
                        contact={contact}
                        showAvatar={!isMine && isEndOfGroup}
                        isNewGroup={isNewGroup}
                        isEndOfGroup={isEndOfGroup}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
            
            {/* Reference for auto-scrolling to most recent message */}
            <div ref={messagesEndRef}></div>
          </div>
        </>
      )}
    </div>
  );
};

export default MessagePanel;
