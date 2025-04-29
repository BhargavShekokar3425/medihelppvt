const nodemailer = require('nodemailer');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// File path for storing SMS logs when actual sending fails
const SMS_LOGS_PATH = path.join(__dirname, '../data/sms_logs.json');

// Create logs directory if it doesn't exist
async function ensureLogDirectory() {
  const dir = path.dirname(SMS_LOGS_PATH);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    console.error('Failed to create logs directory:', error);
  }
}

// Initialize nodemailer transport with improved Gmail configuration
const createTransport = () => {
  try {
    // First try to use environment variables
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
    
    // If not configured, try to use Gmail with app password
    // Note: This requires setting up 2-factor authentication and creating an app password
    // https://support.google.com/accounts/answer/185833
    console.log('Attempting to use Gmail transport as fallback');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'your-email@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password'
      },
      tls: {
        rejectUnauthorized: false // Only use in development!
      }
    });
  } catch (error) {
    console.error('Failed to create email transport:', error);
    // Return a mock transport that logs but doesn't send
    return {
      sendMail: async (mailOptions) => {
        console.log('MOCK EMAIL (FALLBACK):', JSON.stringify(mailOptions, null, 2));
        return { 
          messageId: `mock_fallback_${Date.now()}`,
          response: 'Mock fallback email logged' 
        };
      }
    };
  }
};

// Email transport instance
let transport = createTransport();

// Attempt to verify connection and recreate if needed
try {
  transport.verify(function(error, success) {
    if (error) {
      console.error('Email transport verification failed:', error);
      // Try to recreate the transport
      transport = createTransport();
    } else {
      console.log('Email server is ready to take our messages');
    }
  });
} catch (error) {
  console.error('Failed to verify email transport:', error);
}

// SMS Service Configuration
const SMS_PROVIDERS = {
  FAST2SMS: {
    name: 'Fast2SMS',
    apiKey: process.env.FAST2SMS_API_KEY || 'demo-key',
    baseUrl: 'https://www.fast2sms.com/dev/bulkV2'
  },
  TEXTLOCAL: {
    name: 'TextLocal',
    apiKey: process.env.TEXTLOCAL_API_KEY || 'demo-key',
    sender: process.env.TEXTLOCAL_SENDER || 'MEDHLP'
  }
};

// Select the active SMS provider
const activeProvider = process.env.SMS_PROVIDER 
  ? SMS_PROVIDERS[process.env.SMS_PROVIDER]
  : SMS_PROVIDERS.FAST2SMS;

// SMS Sending function
async function sendSMS(to, message) {
  // Log the SMS attempt
  console.log(`Attempting to send SMS to ${to}: ${message.substring(0, 30)}...`);
  
  try {
    // First attempt with Fast2SMS if it's the active provider
    if (activeProvider === SMS_PROVIDERS.FAST2SMS) {
      return await sendWithFast2SMS(to, message);
    } 
    // Otherwise try TextLocal
    else if (activeProvider === SMS_PROVIDERS.TEXTLOCAL) {
      return await sendWithTextLocal(to, message);
    } 
    // Fallback to logging if no provider is available
    else {
      throw new Error('No SMS provider configured');
    }
  } catch (error) {
    console.error('Failed to send SMS:', error);
    
    // Log the failed SMS
    await logSMS(to, message, error.message);
    
    // Return failure
    return { 
      success: false, 
      message: `SMS sending failed: ${error.message}`, 
      provider: activeProvider.name
    };
  }
}

// Send SMS through Fast2SMS
async function sendWithFast2SMS(to, message) {
  // Clean the phone number
  const phoneNumber = to.replace(/\D/g, '');
  
  // Validate phone number format
  if (phoneNumber.length !== 10 && phoneNumber.length !== 12) {
    throw new Error('Invalid phone number format');
  }
  
  // Make the API request
  try {
    const response = await axios({
      method: 'post',
      url: SMS_PROVIDERS.FAST2SMS.baseUrl,
      headers: {
        'Authorization': SMS_PROVIDERS.FAST2SMS.apiKey,
        'Content-Type': 'application/json'
      },
      data: {
        route: 'q', // Quick SMS route
        message: message,
        language: 'english',
        flash: 0,
        numbers: phoneNumber
      }
    });
    
    if (response.data && response.data.return === true) {
      console.log('Fast2SMS response:', response.data);
      return {
        success: true,
        message: 'SMS sent successfully',
        provider: 'Fast2SMS',
        data: response.data
      };
    } else {
      console.error('Fast2SMS error response:', response.data);
      throw new Error(response.data?.message || 'Failed to send SMS');
    }
  } catch (error) {
    console.error('Fast2SMS request error:', error);
    throw new Error(error.response?.data?.message || error.message || 'SMS provider error');
  }
}

// Send SMS through TextLocal (alternative provider)
async function sendWithTextLocal(to, message) {
  // Clean the phone number
  const phoneNumber = to.replace(/\D/g, '');
  
  // Make the API request
  try {
    const params = new URLSearchParams();
    params.append('apiKey', SMS_PROVIDERS.TEXTLOCAL.apiKey);
    params.append('sender', SMS_PROVIDERS.TEXTLOCAL.sender);
    params.append('numbers', phoneNumber);
    params.append('message', message);
    
    const response = await axios({
      method: 'post',
      url: 'https://api.textlocal.in/send/',
      data: params
    });
    
    if (response.data && response.data.status === 'success') {
      console.log('TextLocal response:', response.data);
      return {
        success: true,
        message: 'SMS sent successfully',
        provider: 'TextLocal',
        data: response.data
      };
    } else {
      console.error('TextLocal error response:', response.data);
      throw new Error(response.data?.errors?.[0] || 'Failed to send SMS');
    }
  } catch (error) {
    console.error('TextLocal request error:', error);
    throw new Error(error.response?.data?.errors?.[0] || error.message || 'SMS provider error');
  }
}

// Log SMS when actual sending fails
async function logSMS(to, message, error) {
  try {
    await ensureLogDirectory();
    
    // Create log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      to,
      message,
      error,
      provider: activeProvider.name
    };
    
    // Read existing logs
    let logs = [];
    try {
      const data = await fs.readFile(SMS_LOGS_PATH, 'utf8');
      logs = JSON.parse(data);
    } catch (err) {
      // File might not exist yet, that's OK
    }
    
    // Add new log entry
    logs.push(logEntry);
    
    // Save logs
    await fs.writeFile(SMS_LOGS_PATH, JSON.stringify(logs, null, 2), 'utf8');
    
    console.log(`SMS log saved for ${to}`);
  } catch (error) {
    console.error('Failed to log SMS:', error);
  }
}

// Send an email
async function sendEmail(to, subject, html, text = '') {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'emergency@medihelp.com',
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML as fallback text
      html
    };
    
    const info = await transport.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    
    return { 
      success: true, 
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Send emergency notification through all available channels
async function sendEmergencyNotification(data) {
  const { user, location, message, hospital } = data;
  const results = {
    email: { attempted: false, success: false },
    sms: { attempted: false, success: false }
  };
  
  // Format the message
  const emergencyMessage = `
EMERGENCY SOS ALERT
Patient: ${user?.name || 'Anonymous User'}
Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
Google Maps: https://www.google.com/maps?q=${location.latitude},${location.longitude}
Hospital: ${hospital?.name || 'Not specified'}
Message: ${message || 'Medical emergency, please respond immediately'}
Time: ${new Date().toLocaleString()}

This is an automated emergency alert. Please respond immediately!
  `.trim();
  
  // Try sending email first
  if (hospital?.email) {
    results.email.attempted = true;
    const emailResult = await sendEmail(
      hospital.email,
      'EMERGENCY SOS ALERT - IMMEDIATE RESPONSE REQUIRED',
      `<h1 style="color:red">EMERGENCY MEDICAL ALERT</h1>
      <p><strong>Patient:</strong> ${user?.name || 'Anonymous User'}</p>
      <p><strong>Location:</strong> <a href="https://www.google.com/maps?q=${location.latitude},${location.longitude}" target="_blank">
        ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)} (Click to view map)
      </a></p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Message:</strong> ${message || 'Medical emergency, please respond immediately'}</p>
      <p style="color:red;font-weight:bold">This is an automated emergency alert. Please respond immediately!</p>`
    );
    results.email.success = emailResult.success;
  }
  
  // Then try sending SMS
  if (hospital?.emergencyContacts && hospital.emergencyContacts.length > 0) {
    results.sms.attempted = true;
    
    // Send to all emergency contacts
    const smsPromises = hospital.emergencyContacts.map(contact => 
      sendSMS(contact, emergencyMessage)
    );
    
    const smsResults = await Promise.allSettled(smsPromises);
    
    // Check if any SMS was successful
    results.sms.success = smsResults.some(result => 
      result.status === 'fulfilled' && result.value && result.value.success
    );
    
    results.sms.details = smsResults.map((result, index) => ({
      contact: hospital.emergencyContacts[index],
      success: result.status === 'fulfilled' && result.value && result.value.success,
      error: result.status === 'rejected' ? result.reason.message : 
        (result.value?.success ? null : result.value?.message)
    }));
  }
  
  return {
    success: results.email.success || results.sms.success,
    message: `Notifications attempted through ${results.email.attempted ? 'email' : ''}${
      results.email.attempted && results.sms.attempted ? ' and ' : ''
    }${results.sms.attempted ? 'SMS' : ''}`,
    results
  };
}

module.exports = {
  sendEmail,
  sendSMS,
  sendEmergencyNotification
};
