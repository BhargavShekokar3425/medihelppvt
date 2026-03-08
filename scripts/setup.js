#!/usr/bin/env node

/**
 * MediHelp — Interactive Setup Script
 * 
 * Cross-platform (Windows + Linux). No dependencies outside Node.js stdlib.
 * Run: node scripts/setup.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');
const { execSync } = require('child_process');

// ─── Paths ───────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..');
const CONFIG_DIR = path.join(ROOT, 'backend', 'config');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.env');
const EXAMPLE_FILE = path.join(CONFIG_DIR, 'config.env.example');
const UPLOADS_DIR = path.join(ROOT, 'backend', 'uploads', 'avatars');

// ─── Colors (works on most terminals) ────────────────────────
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

const ok = (msg) => console.log(`  ${c.green}✔${c.reset} ${msg}`);
const warn = (msg) => console.log(`  ${c.yellow}⚠${c.reset} ${msg}`);
const fail = (msg) => console.log(`  ${c.red}✖${c.reset} ${msg}`);
const info = (msg) => console.log(`  ${c.blue}ℹ${c.reset} ${msg}`);
const heading = (msg) => console.log(`\n${c.bold}${c.cyan}  ${msg}${c.reset}\n`);

// ─── Readline interface ──────────────────────────────────────
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question, defaultValue = '') {
  const suffix = defaultValue ? ` ${c.dim}(${defaultValue})${c.reset}` : '';
  return new Promise((resolve) => {
    rl.question(`  ${c.bold}?${c.reset} ${question}${suffix}: `, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

function askYN(question, defaultYes = true) {
  const hint = defaultYes ? 'Y/n' : 'y/N';
  return new Promise((resolve) => {
    rl.question(`  ${c.bold}?${c.reset} ${question} ${c.dim}(${hint})${c.reset}: `, (ans) => {
      const a = ans.trim().toLowerCase();
      if (a === '') resolve(defaultYes);
      else resolve(a === 'y' || a === 'yes');
    });
  });
}

function askSecret(question) {
  return new Promise((resolve) => {
    rl.question(`  ${c.bold}?${c.reset} ${question}: `, (answer) => {
      resolve(answer.trim());
    });
  });
}

// ─── Utility: check if a command exists ──────────────────────
function commandExists(cmd) {
  try {
    const check = process.platform === 'win32' ? `where ${cmd}` : `which ${cmd}`;
    execSync(check, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// ─── Utility: test MongoDB connection ────────────────────────
async function testMongoConnection(uri) {
  try {
    // Try a quick connection using mongosh or the backend
    const testScript = `
      const mongoose = require('mongoose');
      mongoose.connect('${uri}', { serverSelectionTimeoutMS: 5000 })
        .then(() => { console.log('OK'); process.exit(0); })
        .catch(() => { console.log('FAIL'); process.exit(1); });
    `;
    const result = execSync(`node -e "${testScript.replace(/\n/g, ' ')}"`, {
      cwd: path.join(ROOT, 'backend'),
      timeout: 15000,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return result.trim().includes('OK');
  } catch {
    return false;
  }
}

// ═════════════════════════════════════════════════════════════
//  MAIN
// ═════════════════════════════════════════════════════════════
async function main() {
  console.log('');
  console.log(`${c.bold}${c.magenta}  ╔══════════════════════════════════════════╗${c.reset}`);
  console.log(`${c.bold}${c.magenta}  ║       MediHelp — Project Setup           ║${c.reset}`);
  console.log(`${c.bold}${c.magenta}  ╚══════════════════════════════════════════╝${c.reset}`);
  console.log(`${c.dim}  Cross-platform setup for Windows & Linux${c.reset}`);

  // ─── Step 1: System checks ─────────────────────────────────
  heading('Step 1 — System Checks');

  // Node.js
  const nodeVersion = process.version;
  const nodeMajor = parseInt(nodeVersion.slice(1));
  if (nodeMajor >= 16) {
    ok(`Node.js ${nodeVersion} detected`);
  } else {
    warn(`Node.js ${nodeVersion} detected — v16+ recommended`);
  }

  // npm
  if (commandExists('npm')) {
    try {
      const npmV = execSync('npm --version', { encoding: 'utf-8' }).trim();
      ok(`npm ${npmV} detected`);
    } catch {
      ok('npm detected');
    }
  } else {
    fail('npm not found — please install Node.js from https://nodejs.org');
  }

  // Git
  if (commandExists('git')) {
    ok('Git detected');
  } else {
    warn('Git not found — install from https://git-scm.com (optional for running)');
  }

  // MongoDB (local)
  const hasMongosh = commandExists('mongosh');
  const hasMongod = commandExists('mongod');
  if (hasMongosh || hasMongod) {
    ok('MongoDB (local) detected');
  } else {
    info('Local MongoDB not detected — you can use MongoDB Atlas (cloud) instead');
  }

  // ─── Step 2: Install dependencies ──────────────────────────
  heading('Step 2 — Dependencies');

  const hasNodeModules = fs.existsSync(path.join(ROOT, 'node_modules'));
  const hasBackendModules = fs.existsSync(path.join(ROOT, 'backend', 'node_modules'));

  if (hasNodeModules && hasBackendModules) {
    ok('Dependencies already installed');
  } else {
    const shouldInstall = await askYN('Dependencies not fully installed. Install now?', true);
    if (shouldInstall) {
      console.log(`\n  ${c.dim}Running npm run install-all ... (this may take a minute)${c.reset}\n`);
      try {
        execSync('npm run install-all', { cwd: ROOT, stdio: 'inherit' });
        ok('Dependencies installed successfully');
      } catch {
        fail('Failed to install dependencies. Try running: npm run install-all');
      }
    } else {
      warn('Skipping — run "npm run install-all" before starting the app');
    }
  }

  // ─── Step 3: Create directories ────────────────────────────
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  // ─── Step 4: config.env setup ──────────────────────────────
  heading('Step 3 — Environment Configuration');

  if (fs.existsSync(CONFIG_FILE)) {
    const overwrite = await askYN('config.env already exists. Overwrite it?', false);
    if (!overwrite) {
      ok('Keeping existing config.env');
      heading('Done!');
      printStartInstructions();
      rl.close();
      return;
    }
  }

  console.log(`  ${c.dim}Answer the following questions to generate your config.env${c.reset}`);
  console.log(`  ${c.dim}Press Enter to accept the default value shown in parentheses${c.reset}\n`);

  // --- PORT ---
  const port = await ask('Backend server port', '5000');

  // --- NODE_ENV ---
  const nodeEnv = 'development';

  // --- FRONTEND_URL ---
  const frontendUrl = await ask('Frontend URL', 'http://localhost:5001');

  // --- MONGO_URI ---
  console.log('');
  info('MongoDB connection string');
  console.log(`  ${c.dim}  Local:  mongodb://localhost:27017/medihelp${c.reset}`);
  console.log(`  ${c.dim}  Atlas:  mongodb+srv://user:pass@cluster.mongodb.net/medihelp${c.reset}`);
  const mongoUri = await ask('MongoDB URI', 'mongodb://localhost:27017/medihelp');

  // --- JWT_SECRET ---
  console.log('');
  const jwtSecret = crypto.randomBytes(64).toString('hex');
  ok(`JWT Secret auto-generated (128 chars)`);

  const jwtExpire = await ask('JWT token expiry', '30d');
  const jwtCookieExpire = '30';

  // --- EMAIL (optional) ---
  console.log('');
  const setupEmail = await askYN('Set up email notifications? (for SOS alerts)', false);
  let emailUser = '';
  let emailPass = '';
  if (setupEmail) {
    info('You need a Gmail address + App Password');
    console.log(`  ${c.dim}  Guide: https://myaccount.google.com/apppasswords${c.reset}`);
    emailUser = await ask('Gmail address');
    emailPass = await askSecret('Gmail App Password (16-char code)');
  } else {
    info('Skipped — email notifications will be disabled');
  }

  // --- TWILIO (optional) ---
  console.log('');
  const setupTwilio = await askYN('Set up Twilio SMS notifications?', false);
  let twilioSid = '';
  let twilioToken = '';
  let twilioPhone = '';
  if (setupTwilio) {
    info('Sign up at https://www.twilio.com/try-twilio');
    twilioSid = await ask('Twilio Account SID');
    twilioToken = await askSecret('Twilio Auth Token');
    twilioPhone = await ask('Twilio Phone Number (e.g. +15551234567)');
  } else {
    info('Skipped — SMS notifications will be disabled');
  }

  // ─── Step 5: Write config.env ──────────────────────────────
  heading('Step 4 — Writing Configuration');

  const configContent = `# =============================================================
# MediHelp — Backend Environment Configuration
# Generated by setup script on ${new Date().toISOString().split('T')[0]}
# =============================================================
# WARNING: This file contains secrets. NEVER commit to git.
# =============================================================

# ---- Server ----
PORT=${port}
NODE_ENV=${nodeEnv}
FRONTEND_URL=${frontendUrl}

# ---- MongoDB ----
MONGO_URI=${mongoUri}

# ---- JWT Authentication ----
JWT_SECRET=${jwtSecret}
JWT_EXPIRE=${jwtExpire}
JWT_COOKIE_EXPIRE=${jwtCookieExpire}

# ---- Email Notifications ----
EMAIL_USER=${emailUser}
EMAIL_PASS=${emailPass}

# ---- Twilio SMS ----
TWILIO_ACCOUNT_SID=${twilioSid}
TWILIO_AUTH_TOKEN=${twilioToken}
TWILIO_PHONE_NUMBER=${twilioPhone}
`;

  fs.writeFileSync(CONFIG_FILE, configContent, 'utf-8');
  ok(`config.env written to backend/config/config.env`);

  // ─── Step 6: Test MongoDB connection ───────────────────────
  heading('Step 5 — Verifying MongoDB Connection');

  console.log(`  ${c.dim}Testing connection to ${mongoUri} ...${c.reset}`);
  const mongoOk = await testMongoConnection(mongoUri);
  if (mongoOk) {
    ok('MongoDB connection successful!');
  } else {
    warn('Could not connect to MongoDB right now');
    console.log(`  ${c.dim}  Make sure MongoDB is running, or check your Atlas URI.${c.reset}`);
    console.log(`  ${c.dim}  The app will retry when you start it.${c.reset}`);
  }

  // ─── Step 7: Seed data ─────────────────────────────────────
  if (mongoOk) {
    console.log('');
    const shouldSeed = await askYN('Seed the database with sample doctors & patients?', true);
    if (shouldSeed) {
      try {
        console.log(`\n  ${c.dim}Running seed script...${c.reset}\n`);
        execSync('node seed.js', { cwd: path.join(ROOT, 'backend'), stdio: 'inherit' });
        ok('Sample data seeded successfully');
      } catch {
        warn('Seed script failed — you can run it later: cd backend && node seed.js');
      }
    }
  }

  // ─── Done ──────────────────────────────────────────────────
  heading('Setup Complete!');
  printStartInstructions();

  rl.close();
}

function printStartInstructions() {
  console.log(`  Start the app with:\n`);
  console.log(`    ${c.bold}${c.green}npm run dev${c.reset}\n`);
  console.log(`  Then open: ${c.cyan}${c.bold}http://localhost:5001${c.reset}\n`);
  console.log(`  ${c.dim}Frontend: http://localhost:5001${c.reset}`);
  console.log(`  ${c.dim}Backend:  http://localhost:5000/api${c.reset}\n`);
  console.log(`  ${c.dim}For detailed help, see: docs/SETUP_GUIDE.md${c.reset}`);
  console.log('');
}

// Run
main().catch((err) => {
  console.error(`\n${c.red}Setup failed:${c.reset}`, err.message);
  rl.close();
  process.exit(1);
});
