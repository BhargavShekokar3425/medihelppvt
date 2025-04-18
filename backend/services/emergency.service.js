const dbService = require('./database.service');
const userService = require('./user.service');
const { messaging } = require('../config/firebase.config');

const emergencyService = {
  // Create a new emergency request
  createEmergencyRequest: async (requestData) => {
    try {
      const { userId, location, emergencyType, description, medicalInfo } = requestData;
      
      // Validate required fields
      if (!userId || !location) {
        throw new Error('Missing required emergency request fields');
      }
      
      // Get user's medical info if not provided
      let patientMedicalInfo = medicalInfo;
      
      if (!patientMedicalInfo) {
        const user = await userService.getUserById(userId);
        patientMedicalInfo = {
          bloodGroup: user.bloodGroup,
          allergies: user.allergies || [],
          medicalConditions: user.medicalConditions || []
        };
      }
      
      // Create emergency request
      const emergencyRequest = await dbService.addDocument('emergencyRequests', {
        userId,
        location,
        emergencyType: emergencyType || 'medical',
        description: description || '',
        status: 'pending',
        medicalInfo: patientMedicalInfo,
        contactedEmergencyServices: false,
      });
      
      // Notify nearby medical professionals
      await notifyNearbyResponders(emergencyRequest);
      
      // Notify emergency contacts
      await notifyEmergencyContacts(userId, emergencyRequest);
      
      return emergencyRequest;
    } catch (error) {
      console.error('Error creating emergency request:', error);
      throw error;
    }
  },
  
  // Get an emergency request
  getEmergencyRequest: async (requestId) => {
    try {
      return await dbService.getDocument('emergencyRequests', requestId);
    } catch (error) {
      console.error('Error getting emergency request:', error);
      throw error;
    }
  },
  
  // Update emergency request status
  updateEmergencyRequestStatus: async (requestId, status, responderId) => {
    try {
      const request = await dbService.getDocument('emergencyRequests', requestId);
      
      if (!request) {
        throw new Error('Emergency request not found');
      }
      
      // Update status
      const updateData = {
        status,
        updatedAt: dbService.fieldValues.serverTimestamp()
      };
      
      // If acknowledged or dispatched, add responder
      if (status === 'acknowledged' || status === 'dispatched') {
        updateData.responders = dbService.fieldValues.arrayUnion({
          responder: responderId,
          status: status === 'acknowledged' ? 'notified' : 'en-route',
          respondedAt: dbService.fieldValues.serverTimestamp()
        });
      }
      
      // If resolved, add resolution info
      if (status === 'resolved') {
        updateData.resolvedAt = dbService.fieldValues.serverTimestamp();
        updateData.resolvedBy = responderId;
      }
      
      await dbService.updateDocument('emergencyRequests', requestId, updateData);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating emergency request status:', error);
      throw error;
    }
  }
};

// Helper function to notify nearby responders
const notifyNearbyResponders = async (emergencyRequest) => {
  try {
    // In a real application, this would use geospatial queries
    // Here we'll just get all doctors for simplicity
    const doctors = await userService.getUsersByRole('doctor');
    
    // Send notifications
    for (const doctor of doctors) {
      // Skip if doctor doesn't have FCM token
      if (!doctor.fcmToken) continue;
      
      // Send notification via FCM
      await messaging.send({
        token: doctor.fcmToken,
        notification: {
          title: 'Emergency SOS Alert',
          body: `Medical emergency reported near you. Tap for details.`
        },
        data: {
          type: 'emergencyRequest',
          requestId: emergencyRequest.id
        }
      });
      
      // Record notification
      await dbService.addDocument(`emergencyRequests/${emergencyRequest.id}/notifications`, {
        recipient: doctor.id,
        recipientType: 'doctor',
        status: 'sent',
        sentAt: dbService.fieldValues.serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error notifying responders:', error);
    // Don't throw, the emergency request was created successfully
  }
};

// Helper function to notify emergency contacts
const notifyEmergencyContacts = async (userId, emergencyRequest) => {
  try {
    // Get user's emergency contacts
    const user = await userService.getUserById(userId);
    const emergencyContacts = user.emergencyContacts || [];
    
    // Update the emergency request with notification data
    const emergencyContactsNotified = [];
    
    for (const contact of emergencyContacts) {
      // In a real app, this would send SMS or call via Twilio
      console.log(`Would notify emergency contact: ${contact.name} at ${contact.contactNumber}`);
      
      emergencyContactsNotified.push({
        contact: {
          name: contact.name,
          relationship: contact.relationship,
          phone: contact.contactNumber
        },
        notifiedAt: dbService.fieldValues.serverTimestamp()
      });
    }
    
    // Update request with notified contacts
    if (emergencyContactsNotified.length > 0) {
      await dbService.updateDocument('emergencyRequests', emergencyRequest.id, {
        emergencyContactsNotified
      });
    }
  } catch (error) {
    console.error('Error notifying emergency contacts:', error);
    // Don't throw, the emergency request was created successfully
  }
};

module.exports = emergencyService;
