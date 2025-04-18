const nodemailer = require('nodemailer');

// Create email transporter - handles both environment variable and direct config
const createTransporter = () => {
  // Default values only used if env variables not set
  const emailUser = process.env.EMAIL_USER || 'evolutionoftexh@gmail.com';
  const emailPass = process.env.EMAIL_PASS || 'riuybldpleqlcwyl';
  
  console.log(`Setting up email transporter with account: ${emailUser}`);
  
  // Create the transporter object
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    },
    tls: { 
      rejectUnauthorized: false // Important for some network setups
    }
  });
  
  return transporter;
};

// Test the email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    const verification = await transporter.verify();
    console.log('Email configuration is valid, server is ready to send messages');
    return true;
  } catch (err) {
    console.error('Email configuration error:', err);
    return false;
  }
};

// List of emergency hospitals from configuration
const getEmergencyContacts = () => {
  // Default list for testing
  const defaultList = [
    { name: "IIT Jodhpur Medical Center", email: "b23cs1015@iitj.ac.in" },
    { name: "Hospital B", email: "b23cs1008@iitj.ac.in" }
  ];
  
  // In the future, this could be loaded from a database or config file
  return defaultList;
};

module.exports = {
  createTransporter,
  testEmailConfig,
  getEmergencyContacts
};
