const express = require('express');
const router = express.Router();
const twilio = require('twilio');

// Initialize Twilio client with your Account SID and Auth Token
// These should be stored in environment variables
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Twilio phone number (purchased from Twilio console)
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Route for sending emergency SMS
router.post('/emergency', async (req, res) => {
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

    // Validate phone number format
    if (!to || !to.match(/^\+?[1-9]\d{9,14}$/)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid phone number format'
      });
    }

    // Format the message
    const message = `
EMERGENCY ALERT: ${emergencyType}
Patient: ${patientName} (ID: ${patientId})
Hospital: ${hospitalName}
Location: ${locationLink}
${additionalInfo ? `Additional Info: ${additionalInfo}` : ''}
Please respond ASAP.
    `.trim();

    // Send the SMS
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to.startsWith('+') ? to : `+${to}` // Ensure international format
    });

    console.log('SMS sent successfully:', result.sid);
    
    return res.status(200).json({
      success: true,
      messageId: result.sid,
      status: result.status
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send SMS',
      code: error.code
    });
  }
});

// Route for sending test SMS
router.post('/test', async (req, res) => {
  try {
    const { to, message } = req.body;
    
    // Send the test SMS
    const result = await client.messages.create({
      body: message || 'This is a test message from MediHelp emergency system.',
      from: twilioPhoneNumber,
      to: to.startsWith('+') ? to : `+${to}`
    });
    
    return res.status(200).json({
      success: true,
      messageId: result.sid,
      status: result.status
    });
  } catch (error) {
    console.error('Error sending test SMS:', error);
    
    return res.status(500).json({
      success: false,
      message: error.message,
      code: error.code
    });
  }
});

module.exports = router;
