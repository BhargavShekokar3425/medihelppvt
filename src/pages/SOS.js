import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useBackendContext } from '../contexts/BackendContext';
import { motion } from 'framer-motion';
import '../styles/SOS.css';
import smsService from '../services/smsService'; // Import smsService

const SOS = () => {
  // Core state management
  const { currentUser, apiService } = useBackendContext();
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [sosStatus, setSosStatus] = useState('idle');
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [sosId, setSosId] = useState(null);
  const [mapZoom, setMapZoom] = useState(14);
  
  // React refs that won't cause DOM manipulation issues
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const directionsRendererRef = useRef(null);
  const routeInfoRef = useRef(null);

  // Use a ref for cleanup functions to avoid recreating them
  const cleanupFunctionsRef = useRef([]);
  
  // Predefined hospitals data
  const presetHospitals = useMemo(() => [
    {
      id: 'h1',
      name: 'PHC (IIT Jodhpur)',
      description: 'Primary Health Center at IIT Jodhpur campus',
      address: 'IIT Jodhpur Campus, Karwar, Rajasthan 342037',
      contact: '0291-123456',
      email: 'phc@iitj.ac.in',
      location: { latitude: 26.475174, longitude: 73.116942 }, // Updated correct location
      distance: 'On campus',
      type: 'primary',
      services: ['emergency', 'general medicine', 'first aid'],
      operatingHours: '24x7',
      emergencyContacts: ['9876543210', '0291-123456', '0291-123457'] // Added emergency contacts
    },
    {
      id: 'h2',
      name: 'AIIMS Jodhpur',
      description: 'All India Institute of Medical Sciences, Jodhpur',
      address: 'Basni Industrial Area Phase-2, Jodhpur, Rajasthan 342005',
      contact: '0291-2740741',
      email: 'emergency@aiimsjodhapur.edu.in',
      location: { latitude: 26.2418, longitude: 73.0137 },
      distance: '5.2 km',
      type: 'tertiary',
      services: ['emergency', 'trauma care', 'intensive care', 'surgery'],
      operatingHours: '24x7',
      emergencyContacts: ['0291-2740741', '0291-2740742', '9998887776'] // Added emergency contacts
    },
    {
      id: 'h3',
      name: 'MediPulse Hospital',
      description: 'Multispecialty hospital in Jodhpur city',
      address: '2nd E Rd, near Amrit Nagar, Medipulse Hospital Campus, Jodhpur, Rajasthan 342005',
      contact: '0291-2795555',
      email: 'emergency@medipulse.in',
      location: { latitude: 26.2802, longitude: 73.0234 },
      distance: '4.8 km',
      type: 'secondary',
      services: ['emergency', 'cardiology', 'neurology', 'orthopedics'],
      operatingHours: '24x7',
      emergencyContacts: ['0291-2795555', '0291-2795556', '9876543211'] // Added emergency contacts
    },
    {
      id: 'h4',
      name: 'Goyal Hospital',
      description: 'Goyal Hospital & Research Centre',
      address: 'Residency Road, Sardarpura, Jodhpur, Rajasthan 342003',
      contact: '0291-2434641',
      email: 'emergency@goyalhospital.com',
      location: { latitude: 26.2724, longitude: 73.0081 },
      distance: '6.3 km',
      type: 'secondary',
      services: ['emergency', 'pediatrics', 'gynecology', 'general medicine'],
      operatingHours: '24x7',
      emergencyContacts: ['0291-2434641', '0291-2434642', '9876543212'] // Added emergency contacts
    },
    {
      id: 'h5',
      name: 'Test Hospital (For Testing)',
      description: 'Hospital with test contact details',
      address: 'Test Address, Jodhpur, Rajasthan 342011',
      contact: '8850463357',
      email: 'b23cs1008@iitj.ac.in',
      location: { latitude: 26.475174, longitude: 73.116942 }, // Updated to PHC location for testing
      distance: '3.5 km',
      type: 'primary',
      services: ['emergency', 'testing'],
      operatingHours: '24x7',
      emergencyContacts: ['8850463357', '9999999998', '9999999997'] // Added test emergency contacts
    }
  ], []);
  
  // Get current location safely
  useEffect(() => {
    let locationWatchId = null;
    
    if (navigator.geolocation) {
      // Use watchPosition instead of getCurrentPosition for more reliability
      locationWatchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        (err) => {
          console.error('Error getting location:', err);
          setError('Unable to access your location. Please enable location services.');
          // Fallback to a default location (IIT Jodhpur area)
          setLocation({ latitude: 26.4766, longitude: 73.1140 });
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      // Fallback to a default location
      setLocation({ latitude: 26.4766, longitude: 73.1140 });
    }
    
    // Cleanup function
    return () => {
      if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
      }
    };
  }, []);
  
  // Calculate distance between two coordinates in kilometers using Haversine formula
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const deg2rad = (deg) => deg * (Math.PI/180);
    
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  }, []);
  
  // Process hospital data when location changes
  useEffect(() => {
    if (location) {
      try {
        // Calculate distances and sort hospitals by proximity
        const hospitalsWithDistance = presetHospitals.map(hospital => {
          const distance = calculateDistance(
            location.latitude, location.longitude,
            hospital.location.latitude, hospital.location.longitude
          );
          
          return {
            ...hospital,
            distanceValue: distance,
            distance: distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`
          };
        }).sort((a, b) => a.distanceValue - b.distanceValue);
        
        setNearbyHospitals(hospitalsWithDistance);
        
        // Only set selected hospital if none is already selected
        if (!selectedHospital) {
          setSelectedHospital(hospitalsWithDistance[0]);
        }
      } catch (err) {
        console.error('Error processing hospital data:', err);
        setError('Failed to process hospital data');
      }
    }
  }, [location, calculateDistance, presetHospitals, selectedHospital]);

  // Google Maps integration using React-friendly approach
  const loadGoogleMapsScript = useCallback(() => {
    // Only load if not already loaded
    if (window.google?.maps) {
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBNLrJhOMz6idD05pzfn5lhA-TAw-mAZCU&libraries=places,directions`;
      script.async = true;
      script.defer = true;
      
      script.onload = resolve;
      script.onerror = reject;
      
      document.head.appendChild(script);
      
      // Add cleanup function
      cleanupFunctionsRef.current.push(() => {
        if (script.parentNode) {
          document.head.removeChild(script);
        }
      });
    });
  }, []);
  
  // Initialize map when container is ready and script is loaded
  const initMap = useCallback(() => {
    if (!mapRef.current || !location || !window.google?.maps) return;
    
    // Create new map instance
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: location.latitude, lng: location.longitude },
      zoom: mapZoom,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.TOP_RIGHT,
      },
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true
    });
    
    mapInstanceRef.current = mapInstance;
    
    // Add event listener for zoom changes
    const zoomListener = mapInstance.addListener('zoom_changed', () => {
      setMapZoom(mapInstance.getZoom());
    });
    
    // Create user marker
    const userMarker = new window.google.maps.Marker({
      position: { lat: location.latitude, lng: location.longitude },
      map: mapInstance,
      title: "Your Current Location",
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: "#4285F4",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 3,
      }
    });
    
    // Create user location accuracy circle
    const accuracyCircle = new window.google.maps.Circle({
      strokeColor: "#4285F4",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#4285F4",
      fillOpacity: 0.2,
      map: mapInstance,
      center: { lat: location.latitude, lng: location.longitude },
      radius: 250, // Approximate accuracy in meters
      zIndex: 1
    });
    
    // Store cleanup functions
    cleanupFunctionsRef.current.push(() => {
      // Clean up listeners
      window.google.maps.event.removeListener(zoomListener);
      
      // Clean up markers
      userMarker.setMap(null);
      accuracyCircle.setMap(null);
    });
    
    // Add hospital markers
    updateMapMarkers();
    
    // Draw route if a hospital is selected
    if (selectedHospital) {
      drawRouteToHospital(selectedHospital);
    }
  }, [location, mapZoom]);

  // Update markers on the map
  const updateMapMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !window.google?.maps) return;
    
    // Clear existing markers first
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Add hospital markers
    nearbyHospitals.forEach(hospital => {
      const isSelected = selectedHospital?.id === hospital.id;
      
      // Create marker for each hospital
      const marker = new window.google.maps.Marker({
        position: { 
          lat: hospital.location.latitude, 
          lng: hospital.location.longitude 
        },
        map: mapInstanceRef.current,
        title: hospital.name,
        icon: {
          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
          fillColor: isSelected ? "#d32f2f" : "#388e3c",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: isSelected ? 2.0 : 1.5,
          anchor: new window.google.maps.Point(12, 22),
        }
      });
      
      // Add event listener to select hospital on click
      const clickListener = marker.addListener('click', () => {
        setSelectedHospital(hospital);
      });
      
      // Store cleanup function
      cleanupFunctionsRef.current.push(() => {
        window.google.maps.event.removeListener(clickListener);
        marker.setMap(null);
      });
      
      // Store marker for later cleanup
      markersRef.current.push(marker);
    });
  }, [nearbyHospitals, selectedHospital]);
  
  // Draw route to selected hospital
  const drawRouteToHospital = useCallback((hospital) => {
    if (!mapInstanceRef.current || !window.google?.maps || !location) return;
    
    // Clear any existing directions renderer
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }
    
    // Clean up route info if exists
    if (routeInfoRef.current) {
      routeInfoRef.current.remove();
      routeInfoRef.current = null;
    }
    
    // Create new directions renderer
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#d32f2f',
        strokeOpacity: 0.8,
        strokeWeight: 5
      }
    });
    
    directionsRenderer.setMap(mapInstanceRef.current);
    directionsRendererRef.current = directionsRenderer;
    
    // Get directions
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route({
      origin: { lat: location.latitude, lng: location.longitude },
      destination: { 
        lat: hospital.location.latitude, 
        lng: hospital.location.longitude 
      },
      travelMode: window.google.maps.TravelMode.DRIVING,
    }, (response, status) => {
      if (status === 'OK' && response) {
        directionsRenderer.setDirections(response);
        
        // Extract route info
        const route = response.routes[0];
        if (route && route.legs[0]) {
          const distance = route.legs[0].distance.text;
          const duration = route.legs[0].duration.text;
          
          // Create route info element without DOM manipulation issues
          const routeInfoDiv = document.createElement('div');
          routeInfoDiv.className = 'route-info-panel';
          routeInfoDiv.innerHTML = `
            <div class="route-info">
              <strong>Distance:</strong> ${distance}<br>
              <strong>Est. Arrival Time:</strong> ${duration}
            </div>
          `;
          
          // Add to map controls safely
          if (mapInstanceRef.current.controls) {
            mapInstanceRef.current.controls[window.google.maps.ControlPosition.TOP_CENTER].push(routeInfoDiv);
            routeInfoRef.current = routeInfoDiv;
          }
        }
        
        // Fit bounds to show route
        fitMapToRoute();
      }
    });
    
    // Store cleanup function
    cleanupFunctionsRef.current.push(() => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
      if (routeInfoRef.current) {
        routeInfoRef.current.remove();
      }
    });
  }, [location]);

  // Fit map to show both user location and selected hospital
  const fitMapToRoute = useCallback(() => {
    if (!mapInstanceRef.current || !selectedHospital || !location) return;
    
    try {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: location.latitude, lng: location.longitude });
      bounds.extend({ 
        lat: selectedHospital.location.latitude, 
        lng: selectedHospital.location.longitude 
      });
      
      mapInstanceRef.current.fitBounds(bounds, {
        top: 50, right: 50, bottom: 50, left: 50
      });
    } catch (e) {
      console.warn("Error fitting bounds:", e);
    }
  }, [selectedHospital, location]);

  // Effect to initialize/update map when dependencies change
  useEffect(() => {
    const initializeMap = async () => {
      try {
        await loadGoogleMapsScript();
        initMap();
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };
    
    if (location && mapRef.current) {
      initializeMap();
    }
    
    return () => {
      // Run all cleanup functions
      cleanupFunctionsRef.current.forEach(cleanup => {
        try {
          cleanup();
        } catch (err) {
          console.warn('Cleanup error:', err);
        }
      });
      cleanupFunctionsRef.current = [];
    };
  }, [location, loadGoogleMapsScript, initMap]);
  
  // Effect to update markers and route when dependencies change
  useEffect(() => {
    if (mapInstanceRef.current && window.google?.maps) {
      updateMapMarkers();
      
      if (selectedHospital) {
        drawRouteToHospital(selectedHospital);
      }
    }
  }, [selectedHospital, updateMapMarkers, drawRouteToHospital]);

  // Handle hospital selection
  const handleHospitalSelect = useCallback((hospital) => {
    setSelectedHospital(hospital);
  }, []);
  
  // Add additional state for tracking SMS status
  const [smsStatus, setSmsStatus] = useState({ sent: false, error: null });
  
  // Send emergency SMS function - enhanced with better error handling
  const sendEmergencySMS = useCallback(async (hospitalData, emergencyData) => {
    if (!hospitalData) {
      console.warn('No hospital data provided for SMS');
      return { success: false, error: 'Missing hospital data' };
    }

    try {
      setSmsStatus({ sent: false, error: null });
      
      // Try multiple emergency contacts if available
      let successfulSend = false;
      let lastError = null;
      
      // If hospital has emergency contacts, try them in sequence
      if (hospitalData.emergencyContacts && hospitalData.emergencyContacts.length > 0) {
        // Try each emergency contact until one succeeds
        for (const contact of hospitalData.emergencyContacts) {
          try {
            // Clone hospital data to avoid modifying the original
            const hospitalWithContact = { 
              ...hospitalData,
              emergencyContacts: [contact] // Use just this contact
            };
            
            console.log(`Attempting SMS to emergency contact: ${contact}`);
            const result = await smsService.sendEmergencyAlert(hospitalWithContact, {
              patientName: currentUser?.name || 'Anonymous',
              patientId: currentUser?.id || 'Unknown',
              location: emergencyData,
              type: 'Medical Emergency',
              additionalInfo: 'Requires immediate assistance'
            });
            
            if (result.success) {
              successfulSend = true;
              setSmsStatus({ sent: true, error: null });
              console.log(`Emergency SMS sent successfully to ${contact}`);
              return result;
            } else {
              lastError = result.error;
              console.warn(`Failed to send SMS to ${contact}:`, result.error);
            }
          } catch (contactError) {
            lastError = contactError.message;
            console.warn(`Error sending SMS to ${contact}:`, contactError);
          }
        }
      } else {
        // No emergency contacts, try with the hospital's main contact
        const result = await smsService.sendEmergencyAlert(hospitalData, {
          patientName: currentUser?.name || 'Anonymous',
          patientId: currentUser?.id || 'Unknown',
          location: emergencyData,
          type: 'Medical Emergency',
          additionalInfo: 'Requires immediate assistance'
        });
        
        if (result.success) {
          successfulSend = true;
          setSmsStatus({ sent: true, error: null });
          return result;
        } else {
          lastError = result.error;
        }
      }
      
      // If we tried all contacts but none succeeded
      if (!successfulSend) {
        setSmsStatus({ 
          sent: false, 
          error: `Could not reach emergency contacts: ${lastError || 'Unknown error'}` 
        });
        return { success: false, error: lastError || 'All SMS attempts failed' };
      }
      
      return { success: false, error: 'No SMS sent' };
    } catch (error) {
      console.error('Error in sendEmergencySMS:', error);
      setSmsStatus({ 
        sent: false, 
        error: error.message || 'Unknown error occurred' 
      });
      return { success: false, error: error.message };
    }
  }, [currentUser]);

  // Add the missing testSmsService function
  const testSmsService = useCallback(async () => {
    if (!selectedHospital) {
      setError('Please select a hospital first');
      return;
    }
    
    try {
      setLoading(true);
      const result = await smsService.sendTestSMS(selectedHospital.contact);
      
      if (result.success) {
        setError(null);
        alert('Test SMS sent successfully to ' + selectedHospital.contact);
      } else {
        setError('Failed to send test SMS: ' + result.error);
      }
    } catch (err) {
      console.error('Error testing SMS service:', err);
      setError('Error in SMS test: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedHospital]);

  // Handle sending SOS alert with improved error handling
  const handleSosButtonClick = useCallback(async () => {
    if (!currentUser) {
      setError('Please log in to use the SOS feature.');
      return;
    }

    if (!location) {
      setError('Location not available. Please enable location services.');
      return;
    }
    
    if (!selectedHospital) {
      setError('Please select a hospital first.');
      return;
    }

    setLoading(true);
    setSosStatus('sending');
    let serverSosSuccess = false;
    let smsSosSuccess = false;

    try {
      // Send SOS to the server
      try {
        const response = await apiService.sendSos(
          currentUser.id, 
          location.latitude, 
          location.longitude,
          selectedHospital.id
        );
        
        if (response.success) {
          setSosId(response.id);
          serverSosSuccess = true;
        }
      } catch (serverError) {
        console.error('Server SOS error:', serverError);
        // Continue to SMS attempt even if server fails
      }
      
      // Send emergency SMS as a backup/parallel notification
      try {
        const smsResult = await sendEmergencySMS(selectedHospital, {
          latitude: location.latitude,
          longitude: location.longitude
        });
        
        smsSosSuccess = smsResult.success;
      } catch (smsError) {
        console.error('SMS sending error:', smsError);
        // Continue processing regardless of SMS failure
      }

      // Handle the combined result
      if (serverSosSuccess || smsSosSuccess) {
        setSosSent(true);
        setSosStatus('sent');
        
        // Show notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Emergency SOS Sent', {
            body: `Help is on the way. ${smsSosSuccess ? 'Emergency contacts have been notified.' : ''} Stay calm and wait for assistance.`,
            icon: '/assets/emergency-icon.png'
          });
        }
      } else {
        throw new Error('Failed to send SOS through all channels');
      }
    } catch (error) {
      console.error('Error sending SOS:', error);
      setError('Failed to send SOS. Please try calling emergency services directly at 108.');
      setSosStatus('failed');
    } finally {
      setLoading(false);
    }
  }, [currentUser, location, selectedHospital, apiService, sendEmergencySMS]);
  
  // Handle SOS cancellation
  const cancelSOS = useCallback(async () => {
    try {
      setLoading(true);
      await apiService.put(`/emergency/${sosId}/status`, { status: 'cancelled' });
      setSosSent(false);
      setSosStatus('cancelled');
      setSosId(null);
    } catch (err) {
      console.error('Error cancelling SOS:', err);
      setError('Failed to cancel SOS. Please contact emergency services directly.');
    } finally {
      setLoading(false);
    }
  }, [sosId, apiService]);

  // Recenter map to user location
  const recenterMap = useCallback(() => {
    if (mapInstanceRef.current && location) {
      mapInstanceRef.current.setCenter({ lat: location.latitude, lng: location.longitude });
      mapInstanceRef.current.setZoom(15);
    }
  }, [location]);

  // Render the SOS button
  const renderSOSButton = () => (
    <motion.div 
      className="sos-button-container"
      initial={{ scale: 1 }}
      animate={{ scale: sosStatus === 'sending' ? [1, 1.2, 1] : 1 }}
      transition={{ duration: 0.3 }}
    >
      <button
        className={`sos-button ${sosStatus !== 'idle' ? 'active' : ''}`}
        onClick={handleSosButtonClick}
        disabled={loading || sosSent || !location}
      >
        {loading ? (
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        ) : (
          <>
            <i className="fas fa-ambulance fa-lg me-2"></i>
            EMERGENCY SOS
          </>
        )}
      </button>
      <p className="sos-description">Press in case of medical emergency</p>
    </motion.div>
  );
  
  // Render SOS status message with enhanced feedback
  const renderSOSStatus = () => {
    const statusMessages = {
      sending: 'Sending SOS alert...',
      sent: 'SOS alert sent! Help is on the way.',
      acknowledged: 'Emergency services have acknowledged your SOS.',
      dispatched: 'Emergency responders have been dispatched to your location.',
      resolved: 'Emergency has been marked as resolved.',
      cancelled: 'SOS alert has been cancelled.',
      failed: 'Failed to send SOS. Please try again.'
    };
    
    const statusIcons = {
      sending: 'fa-paper-plane',
      sent: 'fa-check-circle',
      acknowledged: 'fa-headset',
      dispatched: 'fa-ambulance',
      resolved: 'fa-check-double',
      cancelled: 'fa-times-circle',
      failed: 'fa-exclamation-triangle'
    };
    
    const statusClasses = {
      sending: 'text-info',
      sent: 'text-success',
      acknowledged: 'text-primary',
      dispatched: 'text-primary',
      resolved: 'text-success',
      cancelled: 'text-secondary',
      failed: 'text-danger'
    };
    
    // Add SMS status information
    const renderSMSStatus = () => {
      if (!smsStatus.sent && !smsStatus.error) return null;
      
      if (smsStatus.sent) {
        return (
          <div className="mt-2 small text-success">
            <i className="fas fa-check-circle me-1"></i>
            Emergency contacts notified via SMS
          </div>
        );
      } else if (smsStatus.error) {
        return (
          <div className="mt-2 small text-warning">
            <i className="fas fa-exclamation-triangle me-1"></i>
            SMS notification failed: {smsStatus.error}
          </div>
        );
      }
      
      return null;
    };
    
    if (sosStatus === 'idle') return null;
    
    return (
      <motion.div 
        className={`alert ${statusClasses[sosStatus] || 'alert-info'}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <i className={`fas ${statusIcons[sosStatus] || 'fa-info-circle'} me-2`}></i>
        {statusMessages[sosStatus] || 'Processing your emergency request.'}
        
        {renderSMSStatus()}
        
        {(sosStatus === 'sent' || sosStatus === 'acknowledged' || sosStatus === 'dispatched') && (
          <button 
            className="btn btn-sm btn-outline-danger float-end"
            onClick={cancelSOS}
            disabled={loading}
          >
            Cancel SOS
          </button>
        )}
      </motion.div>
    );
  };
  
  // Render hospital selection list
  const renderHospitalSelector = () => {
    if (loading && !nearbyHospitals.length) {
      return (
        <div className="text-center my-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Finding nearby medical facilities...</p>
        </div>
      );
    }
    
    if (!nearbyHospitals.length) return null;
    
    return (
      <div className="hospital-selector mt-4">
        <h5>Nearby Medical Facilities</h5>
        <div className="hospital-list">
          {nearbyHospitals.map(hospital => (
            <motion.div 
              key={hospital.id}
              className={`hospital-card ${selectedHospital?.id === hospital.id ? 'selected' : ''}`}
              onClick={() => handleHospitalSelect(hospital)}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <h6>{hospital.name}</h6>
              <p className="mb-1"><i className="fas fa-map-marker-alt me-1"></i> {hospital.distance}</p>
              <p className="mb-0"><i className="fas fa-phone me-1"></i> {hospital.contact}</p>
              {hospital.type && (
                <span className={`badge bg-${
                  hospital.type === 'primary' ? 'success' : 
                  hospital.type === 'secondary' ? 'info' : 'warning'
                } mt-2`}>
                  {hospital.type.charAt(0).toUpperCase() + hospital.type.slice(1)} Care
                </span>
              )}
            </motion.div>
          ))}
        </div>
        
        {/* Add SMS test button for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-3 text-end">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={testSmsService}
              disabled={!selectedHospital || loading}
            >
              <i className="fas fa-sms me-1"></i> Test SMS
            </button>
          </div>
        )}
      </div>
    );
  };
  
  // Render user location information
  const renderUserLocation = () => {
    if (!location) {
      return (
        <div className="alert alert-warning">
          <i className="fas fa-map-marker-alt me-2"></i>
          Acquiring your location...
        </div>
      );
    }
    
    return (
      <div className="user-location">
        <div className="location-indicator">
          <i className="fas fa-map-marker-alt pulse"></i>
        </div>
        <p>
          <strong>Your coordinates:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
        </p>
        <p className="text-muted">
          <small>These coordinates will be shared with emergency services</small>
        </p>
      </div>
    );
  };
  
  // Render the emergency tracking timeline
  const renderEmergencyTracking = () => {
    if (!sosSent || sosStatus === 'cancelled') return null;
    
    return (
      <motion.div 
        className="live-tracking-container mt-4"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={{ duration: 0.5 }}
      >
        <h4>Live Emergency Tracking</h4>
        <div className="status-timeline">
          <div className={`status-step ${sosStatus !== 'idle' ? 'active' : ''}`}>
            <div className="status-icon">
              <i className="fas fa-paper-plane"></i>
            </div>
            <div className="status-text">
              <h6>SOS Sent</h6>
              <p>Your emergency alert has been transmitted</p>
            </div>
          </div>
          <div className={`status-step ${sosStatus === 'acknowledged' || sosStatus === 'dispatched' || sosStatus === 'resolved' ? 'active' : ''}`}>
            <div className="status-icon">
              <i className="fas fa-headset"></i>
            </div>
            <div className="status-text">
              <h6>Acknowledged</h6>
              <p>Emergency services have received your alert</p>
            </div>
          </div>
          <div className={`status-step ${sosStatus === 'dispatched' || sosStatus === 'resolved' ? 'active' : ''}`}>
            <div className="status-icon">
              <i className="fas fa-ambulance"></i>
            </div>
            <div className="status-text">
              <h6>Help Dispatched</h6>
              <p>Responders are on their way to your location</p>
            </div>
          </div>
          <div className={`status-step ${sosStatus === 'resolved' ? 'active' : ''}`}>
            <div className="status-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="status-text">
              <h6>Resolved</h6>
              <p>Emergency has been addressed</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Main component render
  return (
    <div className="sos-page">
      <div className="jumbotron gradient-background p-4 p-md-5 text-white rounded bg-dark mb-4">
        <div className="col-md-8 px-0" style={{ color: "black" }}>
          <h1 className="display-4 font-italic">Emergency SOS</h1>
          <p className="lead my-3">
            Press the SOS button to alert emergency services of your situation and location.
            Help will be dispatched to your precise coordinates.
          </p>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-5">
          <div className="sos-main-container">
            {error && (
              <motion.div 
                className="alert alert-danger"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
                <button 
                  type="button" 
                  className="btn-close float-end" 
                  onClick={() => setError(null)}
                />
              </motion.div>
            )}
            
            {renderSOSStatus()}
            {!sosSent && renderSOSButton()}
            {renderUserLocation()}
            {!sosSent && renderHospitalSelector()}
          </div>
        </div>
        
        <div className="col-md-7">
          <div className="map-container">
            <div 
              ref={mapRef} 
              className="map-area" 
              style={{ height: '500px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            />
            
            <div className="map-controls mt-3 d-flex justify-content-between">
              <button 
                className="btn btn-sm btn-primary" 
                onClick={fitMapToRoute}
                disabled={!selectedHospital || !mapInstanceRef.current}
              >
                <i className="fas fa-route me-1"></i> Show Route
              </button>
              
              <button 
                className="btn btn-sm btn-outline-secondary" 
                onClick={recenterMap}
                disabled={!mapInstanceRef.current}
              >
                <i className="fas fa-location-arrow me-1"></i> Recenter Map
              </button>
            </div>
            
            <div className="emergency-contacts mt-3">
              <h5>Emergency Contacts</h5>
              <div className="contact-card">
                <i className="fas fa-phone-alt"></i>
                <div>
                  <p className="mb-0"><strong>Campus Emergency:</strong> 0291-280-1234</p>
                  <p className="text-muted mb-0"><small>Available 24/7</small></p>
                </div>
              </div>
              <div className="contact-card">
                <i className="fas fa-ambulance"></i>
                <div>
                  <p className="mb-0"><strong>Ambulance:</strong> 108</p>
                  <p className="text-muted mb-0"><small>National Emergency Number</small></p>
                </div>
              </div>
              <div className="contact-card">
                <i className="fas fa-hospital"></i>
                <div>
                  <p className="mb-0"><strong>PHC IIT Jodhpur:</strong> {selectedHospital?.contact || "0291-280-5678"}</p>
                  <p className="text-muted mb-0"><small>Campus Medical Center</small></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {renderEmergencyTracking()}
    </div>
  );
};

export default SOS;