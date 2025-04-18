const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('Starting MediHelp Network Issue Fixer');
console.log('===================================');

// Make sure backend directory exists
const backendDir = path.join(__dirname, 'backend');
if (!fs.existsSync(backendDir)) {
  console.log('Creating backend directory...');
  fs.mkdirSync(backendDir, { recursive: true });
}

// Create utils directory if it doesn't exist
const utilsDir = path.join(backendDir, 'utils');
if (!fs.existsSync(utilsDir)) {
  console.log('Creating utils directory...');
  fs.mkdirSync(utilsDir, { recursive: true });
}

// Check for nodemailer installation
console.log('\nChecking for nodemailer installation...');
try {
  // Try to install nodemailer
  console.log('Installing nodemailer...');
  execSync('npm install nodemailer --save', { 
    cwd: backendDir,
    stdio: 'inherit'
  });
  console.log('✓ Nodemailer installed successfully');
} catch (error) {
  console.error('Failed to install nodemailer:', error.message);
  console.log('Please run "cd backend && npm install nodemailer" manually');
}

// Test backend server
console.log('\nTesting backend server connection...');
http.get('http://localhost:5000/api/health', (res) => {
  console.log(`Server response: ${res.statusCode}`);
  if (res.statusCode === 200) {
    console.log('✓ Backend server is running properly');
  } else {
    console.warn(`⚠ Backend server returned status code ${res.statusCode}`);
  }
  
  res.on('data', (chunk) => {
    console.log(`Response body: ${chunk}`);
  });
}).on('error', (err) => {
  console.error('⚠ Backend server is not running or unreachable:', err.message);
  console.log('Please start the backend server with: cd backend && node server.js');
});

// Checking frontend setup
console.log('\nChecking frontend setup...');
try {
  // Check for SOS page
  const sosPagePath = path.join(__dirname, 'src', 'pages', 'SOSPage.jsx');
  if (!fs.existsSync(sosPagePath)) {
    console.warn('⚠ SOS page not found. Please copy the updated SOSPage.jsx file.');
  } else {
    console.log('✓ SOSPage.jsx found');
  }
  
  console.log('\nSetup complete! Here are your next steps:');
  console.log('1. Start the backend server: cd backend && node server.js');
  console.log('2. In a separate terminal, start the frontend: npm start');
  console.log('3. Access the app in your browser at: http://localhost:5001');
} catch (error) {
  console.error('Error checking frontend setup:', error.message);
}
