import React, { useState, useEffect } from 'react';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div className={`network-status-banner ${isOnline ? 'online' : 'offline'}`}>
      {isOnline ? 
        'Connection restored. Your changes will sync automatically.' : 
        'You are currently offline. Some features may be limited.'}
    </div>
  );
};

export default NetworkStatus;

// Add this component to your src/App.js file
// import NetworkStatus from './components/NetworkStatus';
// ...
// <div className="container">
//   <NetworkStatus />
//   ...
// </div>
