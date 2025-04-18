const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if backend directory exists
const backendDir = path.join(__dirname, 'backend');
if (!fs.existsSync(backendDir)) {
  console.error('Backend directory not found!');
  process.exit(1);
}

console.log('Installing nodemailer package...');
try {
  execSync('npm install nodemailer --save', { 
    cwd: backendDir,
    stdio: 'inherit' 
  });
  
  console.log('\nNodamailer has been successfully installed!');
} catch (error) {
  console.error('Failed to install nodemailer:', error);
  process.exit(1);
}
