/**
 * Utility functions for emergency services
 */

import smsService from '../services/smsService';

// Format location data for emergency services
export const formatLocationForEmergency = (location) => {
  if (!location) return null;
  
  // If it's already in the right format, return as is
  if (location.latitude && location.longitude) {
    return location;
  }
  
  // Handle different possible location formats
  if (location.lat && location.lng) {
    return { latitude: location.lat, longitude: location.lng };
  }
  
  if (location.coords) {
    return { 
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy
    };
  }
  
  if (Array.isArray(location) && location.length >= 2) {
    return { latitude: location[0], longitude: location[1] };
  }
  
  return null;
};

// Get map URL for a location
export const getMapUrl = (location) => {
  if (!location) return null;
  
  const formattedLocation = formatLocationForEmergency(location);
  if (!formattedLocation) return null;
  
  return `https://www.google.com/maps?q=${formattedLocation.latitude},${formattedLocation.longitude}`;
};

// Send emergency notification to all hospital emergency contacts
export const notifyEmergencyContacts = async (hospital, emergencyData) => {
  if (!hospital) {
    console.error('No hospital data provided for emergency notification');
    return { success: false, message: 'Hospital data is required' };
  }
  
  try {
    // Send via SMS service
    return await smsService.sendEmergencyAlert(hospital, emergencyData);
  } catch (error) {
    console.error('Failed to notify emergency contacts:', error);
    return { success: false, error: error.message };
  }
};

// Determine the severity of emergency based on provided info
export const determineSeverity = (emergencyData) => {
  // Default to high if no information is provided
  if (!emergencyData || !emergencyData.symptoms || emergencyData.symptoms.length === 0) {
    return 'high';
  }
  
  // Critical symptoms that indicate high severity
  const criticalSymptoms = [
    'chest pain', 'difficulty breathing', 'severe bleeding', 
    'unconscious', 'stroke', 'head injury', 'seizure',
    'anaphylaxis', 'heart attack', 'cardiac arrest'
  ];
  
  // Check if any critical symptoms are present
  for (const symptom of emergencyData.symptoms) {
    if (criticalSymptoms.some(critical => 
      symptom.toLowerCase().includes(critical))) {
      return 'high';
    }
  }
  
  return emergencyData.severity || 'medium';
};

export default {
  formatLocationForEmergency,
  getMapUrl,
  notifyEmergencyContacts,
  determineSeverity
};
