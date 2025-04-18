import React from 'react';
import './ChatPlaceholder.css';

const ChatPlaceholder = () => {
  return (
    <div className="chat-placeholder">
      <div className="placeholder-content">
        <div className="placeholder-icon">
          <i className="far fa-comments"></i>
        </div>
        <h3>Welcome to MediHelp Chat</h3>
        <p>Select a conversation to start messaging or start a new one.</p>
        <div className="placeholder-features">
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-user-md"></i>
            </div>
            <div className="feature-text">
              <h4>Connect with Doctors</h4>
              <p>Get medical advice from specialists</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-prescription"></i>
            </div>
            <div className="feature-text">
              <h4>Share Medical Records</h4>
              <p>Send files and images securely</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-clipboard-list"></i>
            </div>
            <div className="feature-text">
              <h4>Manage Appointments</h4>
              <p>Book and discuss appointments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPlaceholder;
