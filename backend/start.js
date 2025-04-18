// Enhanced server startup script to handle errors and avoid restart loops

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Make sure data directory exists
const dbDir = path.join(__dirname, 'data', 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`Created data directory: ${dbDir}`);
}

console.log('Starting MediHelp server...');

const serverProcess = spawn('node', ['server.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

serverProcess.on('error', (error) => {
  console.error('Failed to start server:', error);
});

serverProcess.on('exit', (code, signal) => {
  if (code !== 0) {
    console.log(`Server process exited with code ${code} and signal ${signal}`);
  }
  // Don't restart automatically - let nodemon handle that
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Stopping server...');
  serverProcess.kill('SIGINT');
  // Give the server time to shut down gracefully
  setTimeout(() => {
    process.exit(0);
  }, 2000);
});

process.on('SIGTERM', () => {
  console.log('Stopping server...');
  serverProcess.kill('SIGTERM');
  // Give the server time to shut down gracefully
  setTimeout(() => {
    process.exit(0);
  }, 2000);
});
