/**
 * Firebase Connection Troubleshooter
 * This script helps diagnose and fix Firebase connectivity issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔍 Firebase Connection Troubleshooter');
console.log('====================================');

// Test internet connectivity
const testInternet = () => {
  try {
    console.log('\n🌐 Testing internet connectivity...');
    execSync('ping -n 4 8.8.8.8', { stdio: 'inherit' });
    console.log('✅ Internet connection is working.');
    return true;
  } catch (error) {
    console.log('❌ Internet connectivity issue detected.');
    console.log('   Please check your network connection and try again.');
    return false;
  }
};

// Test Firebase connectivity
const testFirebaseConnection = () => {
  try {
    console.log('\n🔥 Testing Firebase connectivity...');
    execSync('ping -n 4 firestore.googleapis.com', { stdio: 'inherit' });
    console.log('✅ Firebase domains are accessible.');
    return true;
  } catch (error) {
    console.log('❌ Cannot reach Firebase servers.');
    console.log('   This could be due to a firewall blocking Firebase connections.');
    return false;
  }
};

// Check for service account file
const checkServiceAccount = () => {
  const serviceAccountPath = path.join(__dirname, 'backend', 'serviceAccountKey.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = require(serviceAccountPath);
      console.log('✅ Service account file found and valid.');
      
      if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
        console.log('❌ Service account file is missing required fields.');
        return false;
      }
      
      return true;
    } catch (error) {
      console.log('❌ Service account file is invalid JSON.');
      return false;
    }
  } else {
    console.log('❌ Service account file not found at:', serviceAccountPath);
    return false;
  }
};

// Check for environment variables
const checkEnvironmentVariables = () => {
  const envPath = path.join(__dirname, '.env');
  let hasRequiredVars = true;
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const requiredVars = [
      'FIREBASE_API_KEY',
      'FIREBASE_AUTH_DOMAIN',
      'FIREBASE_PROJECT_ID',
      'FIREBASE_STORAGE_BUCKET'
    ];
    
    console.log('\n🔑 Checking Firebase environment variables...');
    
    requiredVars.forEach(variable => {
      if (!envContent.includes(variable + '=')) {
        console.log(`❌ Missing environment variable: ${variable}`);
        hasRequiredVars = false;
      }
    });
    
    if (hasRequiredVars) {
      console.log('✅ All required environment variables are present.');
    }
  } else {
    console.log('❌ .env file not found');
    hasRequiredVars = false;
  }
  
  return hasRequiredVars;
};

// Create a new service account file
const createServiceAccountFile = async () => {
  console.log('\n📝 Creating a new service account file...');
  console.log('Go to Firebase Console > Project Settings > Service accounts > Generate new private key');
  
  const answer = await questionAsync('Have you downloaded the service account JSON file? (y/n): ');
  
  if (answer.toLowerCase() === 'y') {
    const filePath = await questionAsync('Enter the path to the downloaded file: ');
    
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found at: ${filePath}`);
        return false;
      }
      
      const serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Ensure backend directory exists
      const backendDir = path.join(__dirname, 'backend');
      if (!fs.existsSync(backendDir)) {
        fs.mkdirSync(backendDir, { recursive: true });
      }
      
      // Save service account file to backend directory
      const targetPath = path.join(backendDir, 'serviceAccountKey.json');
      fs.writeFileSync(targetPath, JSON.stringify(serviceAccount, null, 2));
      
      console.log(`✅ Service account file copied to ${targetPath}`);
      return true;
    } catch (error) {
      console.log('❌ Error processing service account file:', error.message);
      return false;
    }
  } else {
    console.log('❌ A service account file is required for Firebase admin operations.');
    return false;
  }
};

// Fix Firebase client config
const fixFirebaseClientConfig = async () => {
  const configPath = path.join(__dirname, 'src', 'firebase', 'config.js');
  
  if (!fs.existsSync(configPath)) {
    console.log(`❌ Firebase config file not found at: ${configPath}`);
    return false;
  }
  
  try {
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Update import statements if necessary
    if (!configContent.includes('import { initializeApp }')) {
      configContent = configContent.replace('// Import statements', 
        `// Import statements
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";`);
    }
    
    // Add offline persistence for Firestore
    if (!configContent.includes('enablePersistence')) {
      configContent = configContent.replace('// Initialize Firebase services',
        `// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence
db.enablePersistence({ synchronizeTabs: true })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.log('The current browser does not support offline persistence.');
    }
  });`);
    }
    
    fs.writeFileSync(configPath, configContent);
    console.log('✅ Firebase client config updated with offline persistence');
    return true;
  } catch (error) {
    console.log('❌ Error updating Firebase client config:', error.message);
    return false;
  }
};

// Helper function for async questions
const questionAsync = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Main troubleshooting function
const troubleshoot = async () => {
  let issues = 0;
  
  // Run diagnostic tests
  if (!testInternet()) issues++;
  if (!testFirebaseConnection()) issues++;
  if (!checkServiceAccount()) issues++;
  if (!checkEnvironmentVariables()) issues++;
  
  console.log(`\n📊 Diagnostics complete. Found ${issues} potential issues.`);
  
  if (issues > 0) {
    console.log('\n🔧 Recommended fixes:');
    
    // Apply fixes based on identified issues
    if (!checkServiceAccount()) {
      const created = await createServiceAccountFile();
      if (created) {
        console.log('✅ Service account configuration fixed!');
      }
    }
    
    // Update Firebase client config
    await fixFirebaseClientConfig();
    
    console.log('\n🚀 Recommended next steps:');
    console.log('1. Restart your development server');
    console.log('2. Clear your browser cache');
    console.log('3. Run: node backend/scripts/testConnection.js');
    console.log('4. Test your chat login again');
  } else {
    console.log('\n✅ No issues detected with Firebase configuration.');
    console.log('\nIf you\'re still experiencing "auth/network-request-failed" errors:');
    console.log('1. Check browser console for specific error messages');
    console.log('2. Ensure you\'re using the correct Firebase project');
    console.log('3. Verify your Firebase project has Authentication enabled');
  }
  
  rl.close();
};

// Run the troubleshooter
troubleshoot();
