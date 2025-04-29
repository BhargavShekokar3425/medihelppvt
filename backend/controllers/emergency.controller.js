const nodemailer = require('nodemailer');
const store = require('../data/store');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'medihelp.test@ethereal.email',
    pass: process.env.EMAIL_PASS || 'testpassword123'
  },
  tls: {
    rejectUnauthorized: false // For development only
  }
});

// Test transporter connection
transporter.verify((error) => {
  if (error) {
    console.error('Error verifying email transport:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Simple SMS messaging service simulation
const smsService = {
  sendSMS: async (to, body) => {
    console.log(`[SMS SIMULATION] Sending SMS to ${to}: ${body}`);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[SMS SIMULATION] Successfully sent SMS to ${to}`);
        resolve({ success: true, to, messageId: `msg_${Date.now()}` });
      }, 500);
    });
  }
};

const emergencyController = {
  // Create a new emergency request
  createEmergencyRequest: async (req, res) => {
    try {
      const { userId, location, hospitalId, emergencyType, description, medicalInfo } = req.body;
      
      if (!userId || !location) {
        return res.status(400).json({
          success: false,
          message: 'User ID and location are required'
        });
      }
      
      const requestId = `sos-${Date.now()}`;
      const hospital = store.hospitals?.find(h => h.id === hospitalId);
      
      const emergencyRequest = {
        id: requestId,
        userId,
        location,
        emergencyType: emergencyType || 'medical',
        description: description || 'Medical emergency',
        medicalInfo: medicalInfo || {},
        hospitalId,
        hospitalName: hospital?.name || 'Unknown Hospital',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      if (!store.emergencyRequests) {
        store.emergencyRequests = [];
      }
      store.emergencyRequests.push(emergencyRequest);
      
      // Send notifications but don't fail if they don't work
      try {
        const user = store.users?.find(u => u.id === userId) || { name: 'Unknown User' };
        
        // Send email notification
        if (hospital?.email) {
          sendEmergencyEmail(emergencyRequest, user, hospital)
            .catch(err => console.error('Failed to send email notification:', err));
        }
        
        // Send SMS notification
        if (hospital?.contact) {
          const phoneNumber = hospital.contact.replace(/\D/g, '');
          if (phoneNumber.length >= 10) {
            smsService.sendSMS(
              phoneNumber,
              `URGENT: Medical emergency. Patient: ${user.name}. Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}. View: https://maps.google.com/?q=${location.latitude},${location.longitude}`
            ).catch(err => console.error('Failed to send SMS notification:', err));
          }
        }
      } catch (notifyError) {
        console.error('Error during notification process:', notifyError);
        // Continue with response - don't fail the request
      }
      
      // Always return success
      res.status(201).json({
        success: true,
        id: requestId,
        message: 'Emergency request created successfully'
      });
    } catch (error) {
      console.error('Error creating emergency request:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while processing emergency request'
      });
    }
  },
  
  // Get emergency request details
  getEmergencyRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const emergency = store.emergencyRequests?.find(req => req.id === id);
      
      if (!emergency) {
        return res.status(404).json({
          success: false,
          message: 'Emergency request not found'
        });
      }
      
      res.status(200).json({
        success: true,
        status: emergency.status,
        data: emergency
      });
    } catch (error) {
      console.error('Error getting emergency request:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while retrieving emergency request'
      });
    }
  },
  
  // Update emergency request status
  updateEmergencyRequestStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const validStatuses = ['acknowledged', 'dispatched', 'resolved', 'cancelled'];
      
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status provided'
        });
      }
      
      const emergencyIndex = store.emergencyRequests?.findIndex(req => req.id === id);
      
      if (emergencyIndex === -1 || !store.emergencyRequests) {
        return res.status(404).json({
          success: false,
          message: 'Emergency request not found'
        });
      }
      
      store.emergencyRequests[emergencyIndex] = {
        ...store.emergencyRequests[emergencyIndex],
        status,
        updatedAt: new Date().toISOString()
      };
      
      if (status === 'dispatched') {
        store.emergencyRequests[emergencyIndex].dispatchedAt = new Date().toISOString();
      } else if (status === 'resolved') {
        store.emergencyRequests[emergencyIndex].resolvedAt = new Date().toISOString();
      }
      
      res.status(200).json({
        success: true,
        message: `Emergency request status updated to ${status}`
      });
    } catch (error) {
      console.error('Error updating emergency status:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating emergency status'
      });
    }
  },
  
  // Get nearby hospitals
  getNearbyHospitals: async (req, res) => {
    try {
      const { latitude, longitude, radius = 10 } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }
      
      const hospitals = store.hospitals || [];
      
      const nearbyHospitals = hospitals.map(hospital => {
        const distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          hospital.location?.latitude || 0,
          hospital.location?.longitude || 0
        );
        
        return {
          ...hospital,
          distanceValue: distance,
          distance: distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`
        };
      }).filter(hospital => {
        return parseFloat(hospital.distanceValue) <= parseFloat(radius);
      }).sort((a, b) => parseFloat(a.distanceValue) - parseFloat(b.distanceValue));
      
      res.status(200).json(nearbyHospitals);
    } catch (error) {
      console.error('Error getting nearby hospitals:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching hospitals'
      });
    }
  }
};

// Helper function to send emergency email
async function sendEmergencyEmail(emergencyRequest, user, hospital) {
  try {
    const mapLink = `https://www.google.com/maps?q=${emergencyRequest.location.latitude},${emergencyRequest.location.longitude}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'medihelp.notifications@gmail.com',
      to: hospital.email || process.env.DEFAULT_EMERGENCY_EMAIL || 'emergency@example.com',
      subject: 'URGENT: Medical Emergency SOS Alert',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #f44336; border-radius: 5px;">
          <div style="background-color: #f44336; color: white; padding: 10px; text-align: center; font-size: 24px; font-weight: bold;">
            ⚠️ MEDICAL EMERGENCY ALERT ⚠️
          </div>
          
          <div style="padding: 20px;">
            <p style="font-size: 18px; font-weight: bold;">A patient has requested emergency assistance:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Patient Name:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${user.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Emergency Type:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${emergencyRequest.emergencyType}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Location:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">
                  <a href="${mapLink}" target="_blank">
                    ${emergencyRequest.location.latitude.toFixed(6)}, ${emergencyRequest.location.longitude.toFixed(6)}
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Request Time:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
            
            <div style="margin-top: 20px;">
              <p><strong>Medical Information:</strong></p>
              <p>Blood Group: ${emergencyRequest.medicalInfo?.bloodGroup || 'Unknown'}</p>
              <p>Allergies: ${emergencyRequest.medicalInfo?.allergies || 'None reported'}</p>
              <p>Medical Conditions: ${emergencyRequest.medicalInfo?.medicalConditions || 'None reported'}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${mapLink}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">VIEW ON MAP</a>
            </div>
            
            <p style="margin-top: 30px; font-size: 12px; color: #777;">This is an automated emergency alert sent from the MediHelp system. Please respond immediately.</p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Emergency email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending emergency email:', error);
    throw error;
  }
}

// Helper function to calculate distance between coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

module.exports = emergencyController;
