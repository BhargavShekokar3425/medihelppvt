const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.blue}===== MediHelp Setup Fixer =====${colors.reset}`);
console.log(`${colors.yellow}This script will fix common issues with the MediHelp setup${colors.reset}\n`);

// Make sure backend directory exists
const backendDir = path.join(__dirname, 'backend');
if (!fs.existsSync(backendDir)) {
  console.log(`${colors.red}Error: Backend directory not found!${colors.reset}`);
  process.exit(1);
}

try {
  // Create necessary directories
  console.log(`${colors.cyan}Creating necessary directories...${colors.reset}`);
  const dbDir = path.join(backendDir, 'data', 'db');
  const utilsDir = path.join(backendDir, 'utils');
  
  if (!fs.existsSync(path.join(backendDir, 'data'))) {
    fs.mkdirSync(path.join(backendDir, 'data'), { recursive: true });
  }
  
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
  }
  
  // Create .env file if it doesn't exist
  const envPath = path.join(backendDir, '.env');
  if (!fs.existsSync(envPath)) {
    console.log(`${colors.cyan}Creating .env file...${colors.reset}`);
    fs.writeFileSync(envPath, `PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5001
JWT_SECRET=medihelp_secure_jwt_secret_key

EMAIL_USER=evolutionoftexh@gmail.com
EMAIL_PASS=riuybldpleqlcwyl
`);
  }
  
  // Install backend dependencies
  console.log(`${colors.cyan}Installing backend dependencies...${colors.reset}`);
  execSync('npm install nodemailer dotenv --save', { cwd: backendDir, stdio: 'inherit' });
  
  console.log(`\n${colors.green}${colors.bright}✓ Setup fixed successfully!${colors.reset}`);
  console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
  console.log(`1. Start the backend server: ${colors.yellow}cd backend && node server.js${colors.reset}`);
  console.log(`2. Start the frontend: ${colors.yellow}npm start${colors.reset}`);
  console.log(`3. Access the app at ${colors.yellow}http://localhost:5001${colors.reset}`);
  
} catch (error) {
  console.error(`${colors.red}Error fixing setup:${colors.reset} ${error.message}`);
  process.exit(1);
}
