const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting dependency cleanup and reinstallation...');

try {
  // Step 1: Delete node_modules and package-lock.json
  console.log('Removing node_modules directory...');
  if (fs.existsSync('node_modules')) {
    execSync('rmdir /s /q node_modules', { stdio: 'inherit' });
  }

  console.log('Removing package-lock.json...');
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
  }

  // Step 2: Clear npm cache
  console.log('Clearing npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });

  // Step 3: Install dependencies
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Step 4: Set up backend properly
  console.log('\nSetting up backend...');
  
  // Create backend folder if it doesn't exist
  if (!fs.existsSync('backend')) {
    fs.mkdirSync('backend');
    console.log('Created backend directory');
  }
  
  // Check if we need to install backend dependencies
  if (fs.existsSync('backend/package.json')) {
    console.log('Installing backend dependencies...');
    process.chdir('backend');
    execSync('npm install', { stdio: 'inherit' });
    process.chdir('..');
  } else {
    console.log('Backend package.json not found, skipping backend dependency installation');
  }

  console.log('\nDependencies successfully reinstalled!');
  console.log('You can now run "npm start" to start the frontend and "npm run server" to start the backend.');
} catch (error) {
  console.error('\nError during dependency reinstallation:', error.message);
  console.log('\nTry running these commands manually:');
  console.log('1. Delete the node_modules folder');
  console.log('2. Delete package-lock.json');
  console.log('3. Run: npm cache clean --force');
  console.log('4. Run: npm install');
}
