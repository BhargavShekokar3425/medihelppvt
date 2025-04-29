import axios from 'axios';

/**
 * SMS Service for emergency notifications
 * Uses Twilio API through the backend
 */
class SMSService {
  constructor() {
    // Base URL from environment or default
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    
    // Create axios instance for making requests
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout for emergencies
    });
    
    // Add auth token to requests
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Send emergency alert via SMS
   * @param {Object} hospitalData - Hospital information including emergency contacts
   * @param {Object} emergencyData - Emergency information including location
   * @returns {Promise<Object>} Response indicating success or failure
   */
  async sendEmergencyAlert(hospitalData, emergencyData) {
    try {
      // Validate required data
      if (!hospitalData || !hospitalData.emergencyContacts || !emergencyData) {
        console.error('Missing required data for emergency SMS');
        return { success: false, error: 'Missing required data' };
      }

      // Get coordinates for Google Maps link
      const coords = `${emergencyData.location?.latitude || emergencyData.latitude},${emergencyData.location?.longitude || emergencyData.longitude}`;
      const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${coords}`;
      
      // Create message content
      const messageContent = {
        to: hospitalData.emergencyContacts[0], // Primary emergency contact
        patientName: emergencyData.patientName || 'Anonymous',
        patientId: emergencyData.patientId || 'Unknown',
        emergencyType: emergencyData.type || 'Medical Emergency',
        locationLink: googleMapsLink,
        additionalInfo: emergencyData.additionalInfo || '',
        hospitalName: hospitalData.name,
      };

      console.log('Sending emergency SMS with data:', messageContent);

      // Send through backend API
      const response = await this.axiosInstance.post('/notifications/sms/emergency', messageContent);
      console.log('SMS service response:', response);
      
      return { success: true, data: response };
    } catch (error) {
      console.error('Error sending emergency SMS:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to send SMS'
      };
    }
  }

  /**
   * Send a test SMS for verification purposes
   * @param {string} phoneNumber - Destination phone number
   * @returns {Promise<Object>} Response object
   */
  async sendTestSMS(phoneNumber) {
    try {
      if (!phoneNumber) {
        return { success: false, error: 'Phone number is required' };
      }

      // Format phone number properly
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      console.log(`Sending test SMS to ${formattedNumber}`);
      
      const response = await this.axiosInstance.post('/notifications/sms/test', {
        to: formattedNumber,
        message: 'This is a test message from MediHelp emergency system.'
      });
      
      return { success: true, data: response };
    } catch (error) {
      console.error('Error sending test SMS:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to send test SMS' 
      };
    }
  }
}

const smsService = new SMSService();
export default smsService;
