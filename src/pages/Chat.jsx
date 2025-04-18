import React from 'react';
import ChatContainer from '../components/chat/ChatContainer';
import { useBackendContext } from '../contexts/BackendContext';
import { Link, Navigate } from 'react-router-dom';

const Chat = () => {
  const { currentUser, loading } = useBackendContext();

  if (loading) {
    return (
      <div className="container mt-5 py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading...</p>
      </div>
    );
  }

  // Require authentication to access chat
  if (!currentUser) {
    return <Navigate to="/signup" replace />;
  }

  return (
    <div className="container-fluid py-4">
      <div className="jumbotron gradient-background p-4 mb-4 rounded">
        <div className="row align-items-center">
          <div className="col-md-8 px-0">
            <h1 className="display-4">MediHelp Chat</h1>
            <p className="lead my-3">
              Connect with doctors, patients, and pharmacies in real-time
            </p>
          </div>
        </div>
      </div>

      <ChatContainer />
    </div>
  );
};

export default Chat;
