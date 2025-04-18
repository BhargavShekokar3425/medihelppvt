import React, { useState, useEffect } from 'react';
import { useBackendContext } from '../contexts/BackendContext';

const SOSPage = () => {
  const { currentUser } = useBackendContext();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [reason, setReason] = useState('');
  const [locationStatus, setLocationStatus] = useState('Waiting for location...');
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [emergencyContacts] = useState([
    { name: 'Medical Emergency', number: '108' },
    { name: 'All India Emergency', number: '112' },
    { name: 'Ambulance', number: '102' },
    { name: 'Police', number: '100' }
  ]);
  const [errorDetails, setErrorDetails] = useState({
    where: '',
    status: '',
    message: '',
    timestamp: ''
  });

  // Check network status on mount and update on changes
  useEffect(() => {
    const handleOnline = () => setNetworkStatus(true);
    const handleOffline = () => setNetworkStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial ping test to check actual connectivity
    pingServer();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Function to ping server and check actual connectivity
  const pingServer = async () => {
    try {
      console.log('Checking server connectivity...');
      setNetworkStatus(true); // Assume we're online until proven otherwise
      
      // Use a simple fetch with timeout to test connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const backendUrl = 'http://localhost:5000/api/health';
      console.log(`Pinging: ${backendUrl}`);
      
      const response = await fetch(backendUrl, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      // Get response status
      console.log(`Server response status: ${response.status}`);
      
      if (!response.ok) {
        console.warn(`Backend server returned error status: ${response.status}`);
        setNetworkStatus(false);
        setFallbackMode(true);
        setErrorDetails({
          where: 'Server Connectivity Check',
          status: response.status,
          message: `Server returned ${response.status} status`,
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        const data = await response.json();
        console.log('Server health data:', data);
        setNetworkStatus(true);
        setFallbackMode(false);
      }
    } catch (error) {
      console.warn('Backend server is unreachable:', error);
      setNetworkStatus(false);
      setFallbackMode(true);
      setErrorDetails({
        where: 'Server Connectivity Check',
        status: 'Request Failed',
        message: error.message || 'Connection failed',
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  // Function to get current location
  const getCurrentLocation = () => {
    setLocationStatus('Fetching your location...');
    
    if (!navigator.geolocation) {
      setLocationStatus('Location services not available');
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setLocationStatus(`Location found: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      },
      (error) => {
        console.error("Error getting location:", error);
        setError(`Unable to retrieve your location: ${error.message}`);
        setLocationStatus('Failed to get location');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Handle SOS request submission with direct fetch (bypassing API service)
  const handleSendSOS = async (e) => {
    e.preventDefault();
    
    if (!location) {
      setError("Please wait for your location to be determined or try again.");
      return;
    }

    if (!reason) {
      setError("Please provide a reason for the emergency.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    setErrorDetails({
      where: '',
      status: '',
      message: '',
      timestamp: ''
    });

    try {
      // Check if browser reports online status
      if (!navigator.onLine) {
        setFallbackMode(true);
        throw new Error('You appear to be offline. Please use direct emergency contact methods.');
      }

      // Prepare emergency data
      const sosData = {
        name: currentUser?.name || "Unknown User",
        phone: currentUser?.contact || "Not provided",
        email: currentUser?.email || "Not provided",
        userId: currentUser?.id || null,
        userType: currentUser?.role || "unknown",
        reason,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString()
      };
      
      console.log("Sending SOS request:", sosData);
      console.log("Request URL: http://localhost:5000/api/sos");

      // Use direct fetch with full URL to avoid any service layer issues
      const response = await fetch('http://localhost:5000/api/sos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}` 
        },
        body: JSON.stringify(sosData)
      });

      console.log("Response status:", response.status);

      // Check if response was received
      if (!response.ok) {
        let errorText = '';
        let errorData = {};
        
        try {
          errorData = await response.json();
          errorText = errorData.message || 'Server returned an error';
        } catch (e) {
          errorText = `HTTP error: ${response.status}`;
        }
        
        setErrorDetails({
          where: 'SOS API Request',
          status: response.status,
          message: errorText,
          timestamp: new Date().toLocaleTimeString()
        });
        
        throw new Error(errorText);
      }

      // Parse the response
      const responseData = await response.json();
      console.log("SOS Response data:", responseData);
      
      if (responseData.success && responseData.success.length > 0) {
        setSuccess(`Emergency alert sent successfully to ${responseData.success.length} hospital(s). Help is on the way!`);
      } else {
        throw new Error("Failed to send emergency alert. Please try direct contact methods.");
      }
    } catch (error) {
      console.error("Error sending SOS:", error);
      setError(error.message || "Failed to send emergency alert. Please use the emergency contact numbers.");
      
      if (!errorDetails.where) {
        setErrorDetails({
          where: 'SOS Request Processing',
          status: 'Failed',
          message: error.message || 'Unknown error',
          timestamp: new Date().toLocaleTimeString()
        });
      }
      
      setFallbackMode(true);
    } finally {
      setLoading(false);
    }
  };

  // Emergency call function
  const makeEmergencyCall = (number) => {
    window.location.href = `tel:${number}`;
  };

  // Use direct sharing of location
  const shareLocation = () => {
    if (location) {
      const locationUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      
      // For browsers that support the Share API
      if (navigator.share) {
        navigator.share({
          title: 'My Emergency Location',
          text: `I need help! This is my current location: ${locationUrl}`,
          url: locationUrl
        }).catch((error) => {
          console.error('Error sharing:', error);
          // Fallback to clipboard copy
          copyLocationToClipboard(locationUrl);
        });
      } else {
        // Fallback for browsers without Web Share API
        copyLocationToClipboard(locationUrl);
      }
    }
  };
  
  // Helper to copy location to clipboard with fallback
  const copyLocationToClipboard = (locationUrl) => {
    try {
      navigator.clipboard.writeText(locationUrl)
        .then(() => {
          alert('Location link copied to clipboard! You can paste it in your emergency message.');
        })
        .catch(err => {
          console.error('Could not copy location:', err);
          alert(`Your location: ${locationUrl} (Please copy manually)`);
        });
    } catch (e) {
      // Final fallback for very old browsers
      const textArea = document.createElement("textarea");
      textArea.value = locationUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Location copied to clipboard!');
      } catch (err) {
        console.error('Fallback: Could not copy text: ', err);
        alert(`Your location: ${locationUrl} (Please copy manually)`);
      }
      document.body.removeChild(textArea);
    }
  };

  const toggleDebugInfo = () => {
    const debugPanel = document.getElementById('debug-panel');
    if (debugPanel) {
      debugPanel.classList.toggle('d-none');
    }
  };

  // The rest of the component code remains the same
  return (
    <div className="container py-5">
      {/* Network status banner - Make this more prominent */}
      <div className={`alert ${networkStatus ? 'alert-success' : 'alert-danger'} mb-4`}>
        <div className="d-flex align-items-center">
          <div className="me-3">
            {networkStatus ? (
              <i className="fas fa-wifi fa-2x"></i>
            ) : (
              <i className="fas fa-exclamation-triangle fa-2x"></i>
            )}
          </div>
          <div>
            <strong>{networkStatus ? 'Connected' : 'Network Connection Issue'}</strong>
            <div>
              {networkStatus
                ? 'Your device is connected. Emergency alerts can be sent.'
                : "We're having trouble connecting to our servers. Please use the emergency numbers below for immediate help."}
            </div>
            
            {!networkStatus && (
              <div className="mt-2">
                <button 
                  className="btn btn-sm btn-outline-light me-2"
                  onClick={pingServer}
                >
                  <i className="fas fa-sync-alt me-1"></i> Check Connection
                </button>
                
                <button 
                  className="btn btn-sm btn-outline-light"
                  onClick={toggleDebugInfo}
                >
                  <i className="fas fa-bug me-1"></i> Debug Info
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Debug Panel - Hidden by default */}
      <div id="debug-panel" className="card mb-4 d-none">
        <div className="card-header bg-dark text-white">
          Debug Information
        </div>
        <div className="card-body">
          <h5>Network Status</h5>
          <ul className="list-group mb-3">
            <li className="list-group-item d-flex justify-content-between">
              <span>Browser Online Status:</span>
              <span className={navigator.onLine ? 'text-success' : 'text-danger'}>
                {navigator.onLine ? 'Online' : 'Offline'}
              </span>
            </li>
            <li className="list-group-item d-flex justify-content-between">
              <span>Server Connection:</span>
              <span className={networkStatus ? 'text-success' : 'text-danger'}>
                {networkStatus ? 'Connected' : 'Disconnected'}
              </span>
            </li>
            <li className="list-group-item d-flex justify-content-between">
              <span>Fallback Mode:</span>
              <span>{fallbackMode ? 'Active' : 'Inactive'}</span>
            </li>
          </ul>
          
          <h5>Last Error</h5>
          {errorDetails.where ? (
            <div className="table-responsive">
              <table className="table table-bordered table-sm">
                <tbody>
                  <tr>
                    <th>Where:</th>
                    <td>{errorDetails.where}</td>
                  </tr>
                  <tr>
                    <th>Status:</th>
                    <td>{errorDetails.status}</td>
                  </tr>
                  <tr>
                    <th>Message:</th>
                    <td>{errorDetails.message}</td>
                  </tr>
                  <tr>
                    <th>Time:</th>
                    <td>{errorDetails.timestamp}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted">No errors recorded</p>
          )}
          
          <div className="mt-3">
            <button className="btn btn-primary me-2" onClick={pingServer}>
              Test Server Connection
            </button>
            <button className="btn btn-secondary" onClick={toggleDebugInfo}>
              Close Debug Panel
            </button>
          </div>
        </div>
      </div>

      <div className="jumbotron text-white rounded gradient-background p-4 p-md-5 mb-4">
        <div className="col-md-8 px-0" style={{ color: "black" }}>
          <h1 className="display-4 font-weight-bold">Emergency SOS</h1>
          <p className="lead my-3">Use this feature in case of a medical emergency. Your location will be shared with nearby hospitals.</p>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card border-danger shadow-sm">
            <div className="card-header bg-danger text-white">
              <h3 className="mb-0">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Send Emergency Alert
              </h3>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  <strong>Error: </strong>{error}
                  {errorDetails.where && (
                    <div className="mt-2">
                      <small className="text-muted">
                        Error location: {errorDetails.where} | 
                        Status: {errorDetails.status} | 
                        Time: {errorDetails.timestamp}
                      </small>
                      <button 
                        className="btn btn-sm btn-link p-0 ms-2"
                        onClick={toggleDebugInfo}
                      >
                        Show Details
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success" role="alert">
                  <i className="fas fa-check-circle me-2"></i>
                  {success}
                </div>
              )}
              
              {fallbackMode && (
                <div className="alert alert-warning" role="alert">
                  <h5><i className="fas fa-exclamation-triangle me-2"></i> Network Connection Issue</h5>
                  <p>We're having trouble connecting to our servers. Please use the emergency numbers listed below to get immediate help.</p>
                </div>
              )}
              
              <form onSubmit={handleSendSOS}>
                <div className="mb-3">
                  <label className="form-label">Your Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={currentUser?.name || ''} 
                    disabled 
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Contact Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={currentUser?.contact || 'Not provided'} 
                    disabled 
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Emergency Reason/Description</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="Describe your emergency (e.g., chest pain, difficulty breathing, severe injury)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label className="form-label">Your Location</label>
                  <div className="d-flex align-items-center">
                    <span className={`badge ${location ? 'bg-success' : 'bg-warning'} me-2`}>
                      {location ? 'Location Available' : 'Acquiring Location'}
                    </span>
                    <small className="text-muted">{locationStatus}</small>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-secondary ms-auto"
                      onClick={getCurrentLocation}
                    >
                      <i className="fas fa-sync-alt me-1"></i> Refresh
                    </button>
                  </div>
                  
                  {location && (
                    <div className="mt-2 d-flex gap-2">
                      <a 
                        href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        <i className="fas fa-map-marker-alt me-1"></i> View on Map
                      </a>
                      <button 
                        type="button"
                        className="btn btn-sm btn-outline-success"
                        onClick={shareLocation}
                      >
                        <i className="fas fa-share-alt me-1"></i> Share Location
                      </button>
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-danger btn-lg w-100"
                  disabled={loading || !location || (!networkStatus && !fallbackMode)}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Sending Alert...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-bell me-2"></i>
                      Send Emergency Alert
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
          
          {/* Emergency contacts card - always visible but highlighted in offline mode */}
          <div className={`card mt-4 ${fallbackMode || !networkStatus ? 'border-danger' : ''}`}>
            <div className={`card-header ${fallbackMode || !networkStatus ? 'bg-danger text-white' : 'bg-light'}`}>
              <h4 className="mb-0">
                <i className="fas fa-phone me-2"></i>
                {fallbackMode || !networkStatus ? 'CALL IMMEDIATELY' : 'Emergency Contacts'}
              </h4>
            </div>
            <div className="card-body">
              {(fallbackMode || !networkStatus) && (
                <div className="alert alert-danger">
                  <strong>Our automated alert system is currently unavailable.</strong>
                  <p className="mb-0">Please call one of these emergency numbers immediately:</p>
                </div>
              )}
              
              <div className="list-group">
                {emergencyContacts.map((contact, index) => (
                  <button 
                    key={index}
                    onClick={() => makeEmergencyCall(contact.number)}
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h5 className="mb-1">{contact.name}</h5>
                      <p className="mb-0 text-muted">Call for immediate assistance</p>
                    </div>
                    <div className="btn btn-danger">
                      <i className="fas fa-phone me-2"></i>
                      {contact.number}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Important Information
              </h3>
            </div>
            <div className="card-body">
              <div className="alert alert-warning">
                <strong>This is not a replacement for emergency services.</strong> In case of a life-threatening emergency, please also call your local emergency number.
              </div>
              
              <h5><i className="fas fa-medkit me-2"></i>What happens when you press the SOS button?</h5>
              <ul className="list-group list-group-flush mb-4">
                <li className="list-group-item">Your location is sent to nearby hospitals</li>
                <li className="list-group-item">Your medical profile information is shared with responders</li>
                <li className="list-group-item">You'll receive confirmation when help is dispatched</li>
                <li className="list-group-item">
                  <strong>Offline mode:</strong> If network is unavailable, use the direct contact numbers
                </li>
              </ul>
              
              <div className="card bg-light mb-3">
                <div className="card-body">
                  <h5 className="card-title"><i className="fas fa-map-marked-alt me-2"></i>Share Your Location</h5>
                  <p className="card-text">In an emergency, sharing your precise location is critical.</p>
                  <div className="d-flex gap-2">
                    <button 
                      onClick={getCurrentLocation}
                      className="btn btn-outline-primary"
                    >
                      <i className="fas fa-location-arrow me-2"></i>
                      Refresh My Location
                    </button>
                    {location && (
                      <button 
                        onClick={shareLocation}
                        className="btn btn-outline-success"
                      >
                        <i className="fas fa-share-alt me-2"></i>
                        Share Location
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOSPage;
