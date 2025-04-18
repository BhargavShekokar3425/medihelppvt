const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Setting up MediHelp backend...');

try {
  // Step 1: Create backend directory if it doesn't exist
  const backendDir = path.join(__dirname, 'backend');
  if (!fs.existsSync(backendDir)) {
    fs.mkdirSync(backendDir);
    console.log('Created backend directory');
  }

  // Step 2: Create routes directory if it doesn't exist
  const routesDir = path.join(backendDir, 'routes');
  if (!fs.existsSync(routesDir)) {
    fs.mkdirSync(routesDir);
    console.log('Created routes directory');
  }

  // Step 3: Create basic auth.routes.js file if it doesn't exist
  const authRoutesPath = path.join(routesDir, 'auth.routes.js');
  if (!fs.existsSync(authRoutesPath)) {
    const authRoutesContent = `
const express = require('express');
const router = express.Router();

// GET /api/auth/status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is running'
  });
});

module.exports = router;
`;
    fs.writeFileSync(authRoutesPath, authRoutesContent);
    console.log('Created auth.routes.js');
  }

  // Step 4: Create placeholders for other route files
  const routeFiles = ['user.routes.js', 'chat.routes.js', 'prescription.routes.js', 'review.routes.js'];
  routeFiles.forEach(file => {
    const filePath = path.join(routesDir, file);
    if (!fs.existsSync(filePath)) {
      const content = `
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: '${file.split('.')[0]} service is running'
  });
});

module.exports = router;
`;
      fs.writeFileSync(filePath, content);
      console.log(`Created ${file}`);
    }
  });

  // Step 5: Install backend dependencies
  console.log('Installing backend dependencies...');
  process.chdir('backend');
  execSync('npm install', { stdio: 'inherit' });

  console.log('\nBackend setup complete!');
  console.log('You can now run the backend with:');
  console.log('  npm run server');
  
} catch (error) {
  console.error('\nError during backend setup:', error.message);
  console.log('\nTry manually setting up the backend:');
  console.log('1. Make sure the backend directory exists');
  console.log('2. Make sure backend/package.json exists with proper scripts');
  console.log('3. Make sure all required route files exist in backend/routes/');
}
