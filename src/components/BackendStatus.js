import React, { useState, useEffect } from 'react';
import backendService from '../services/backendService';

const BackendStatus = () => {
  const [status, setStatus] = useState('checking');
  const [latency, setLatency] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  // Check backend status
  const checkBackendStatus = async () => {
    try {
      setStatus('checking');
      const result = await backendService.ping();
      
      if (result.online) {
        setStatus('online');
        setLatency(result.latency);
      } else {
        setStatus('offline');
      }
    } catch (error) {
      setStatus('offline');
    }
    
    setLastChecked(new Date());
  };

  // Check status on mount and every 30 seconds
  useEffect(() => {
    checkBackendStatus();
    
    const intervalId = setInterval(() => {
      checkBackendStatus();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Status indicator style
  const getIndicatorStyle = () => {
    switch (status) {
      case 'online':
        return { backgroundColor: '#28a745' };
      case 'offline':
        return { backgroundColor: '#dc3545' };
      case 'checking':
      default:
        return { backgroundColor: '#ffc107' };
    }
  };

  // Status text
  const getStatusText = () => {
    switch (status) {
      case 'online':
        return `Connected (${latency}ms)`;
      case 'offline':
        return 'Disconnected';
      case 'checking':
      default:
        return 'Checking...';
    }
  };

  return (
    <div className="backend-status" style={{ padding: '10px', margin: '10px 0' }}>
      <h5>Backend Connection</h5>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            marginRight: '8px',
            ...getIndicatorStyle()
          }}
        />
        <span>{getStatusText()}</span>
        
        <button
          onClick={checkBackendStatus}
          style={{ marginLeft: '10px', fontSize: '0.8rem', padding: '2px 8px' }}
          className="btn btn-sm btn-outline-secondary"
        >
          Refresh
        </button>
      </div>
      {lastChecked && (
        <div style={{ fontSize: '0.8rem', marginTop: '5px', color: '#6c757d' }}>
          Last checked: {lastChecked.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default BackendStatus;
