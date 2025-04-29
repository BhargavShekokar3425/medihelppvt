const express = require('express');
const router = express.Router();
const twilio = require('twilio');
require('dotenv').config();

// Initialize Twilio client with credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Authentication middleware (simplified version)
const authenticateToken = (req, res, next) => {
  // In a production app, implement proper authentication
  // For now, we'll just proceed with the request
  next();
};

// Create Twilio client
const client = twilio(accountSid, authToken);

// Test SMS endpoint - allows testing the connection
router.post('/sms/test', authenticateToken, async (req, res) => {
  try {
    const { to, message } = req.body;
    
    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }
    
    // Ensure number has proper format for Twilio (E.164 format)
    const formattedNumber = to.startsWith('+') ? to : `+${to}`;
    const messageText = message || 'This is a test message from MediHelp Emergency System';
    
    console.log(`Sending test SMS to ${formattedNumber}: ${messageText}`);
    
    // Send SMS using Twilio
    const twilioResponse = await client.messages.create({
      body: messageText,
      from: `+${twilioPhoneNumber}`, // Ensure number is in E.164 format
      to: formattedNumber
    });
    
    console.log('Twilio response:', twilioResponse.sid);
    
    res.status(200).json({
      success: true,
      messageId: twilioResponse.sid,
      status: twilioResponse.status
    });
  } catch (error) {
    console.error('Error sending test SMS:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send SMS',
      code: error.code
    });
  }
});

// Emergency SMS endpoint with enhanced formatting
router.post('/sms/emergency', authenticateToken, async (req, res) => {
  try {
    const {
      to,
      patientName,
      patientId,
      emergencyType,
      locationLink,
      additionalInfo,
      hospitalName
    } = req.body;

    if (!to) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recipient phone number is required'
      });
    }

    // Format message for emergency services
    const message = `
EMERGENCY ALERT: ${emergencyType}
Patient: ${patientName} (ID: ${patientId})
Hospital: ${hospitalName}
Location: ${locationLink}
${additionalInfo ? `Info: ${additionalInfo}` : ''}
Please respond urgently.
    `.trim();

    // Ensure number has proper format
    const formattedNumber = to.startsWith('+') ? to : `+${to}`;
    
    console.log(`Sending emergency SMS to ${formattedNumber}`);
    
    // Send SMS using Twilio
    const twilioResponse = await client.messages.create({
      body: message,
      from: `+${twilioPhoneNumber}`,
      to: formattedNumber
    });
    
    console.log('Emergency SMS sent:', twilioResponse.sid);
    
    return res.status(200).json({
      success: true,
      messageId: twilioResponse.sid,
      status: twilioResponse.status
    });
  } catch (error) {
    console.error('Error sending emergency SMS:', error);
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send emergency SMS',
      code: error.code
    });
  }
});

// Bulk SMS endpoint for multiple recipients
router.post('/sms/bulk', authenticateToken, async (req, res) => {
  try {
    const { recipients, message } = req.body;
    
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Recipients array is required'
      });
    }
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }
    
    // Send messages in parallel
    const sendPromises = recipients.map(recipient => {
      // Format phone number properly
      const formattedNumber = recipient.startsWith('+') ? recipient : `+${recipient}`;
      
      return client.messages.create({
        body: message,
        from: `+${twilioPhoneNumber}`,
        to: formattedNumber
      });
    });
    
    const results = await Promise.all(sendPromises);
    
    return res.status(200).json({
      success: true,
      sentCount: results.length,
      messages: results.map(r => ({ id: r.sid, status: r.status }))
    });
  } catch (error) {
    console.error('Error sending bulk SMS:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send bulk SMS'
    });
  }
});

module.exports = router;
