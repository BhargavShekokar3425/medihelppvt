const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Modules to install
const modules = ['nodemailer', 'dotenv'];

console.log('Installing required modules...');

// Make sure backend directory exists
const backendDir = path.join(__dirname, 'backend');
if (!fs.existsSync(backendDir)) {
  console.log('Creating backend directory...');
  fs.mkdirSync(backendDir, { recursive: true });
}

try {
  // Install modules in backend directory
  modules.forEach(module => {
    console.log(`Installing ${module}...`);
    execSync(`npm install ${module} --save`, { 
      cwd: backendDir,
      stdio: 'inherit' 
    });
  });
  
  console.log('\nModule installation complete! 🎉');
  console.log('Run your server with: cd backend && node server.js');
} catch (error) {
  console.error('Error installing modules:', error.message);
  console.log('\nManual installation command:');
  console.log(`cd backend && npm install ${modules.join(' ')} --save`);
}
