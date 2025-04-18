/**
 * Helper script to create a service account key file
 * This avoids network request errors when Firebase can't find credentials
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user for input
const promptUser = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const createServiceAccount = async () => {
  console.log('===== Firebase Service Account Creation =====');
  console.log('This script will help you create a service account key file for Firebase.');
  console.log('You need to get this information from Firebase Console:');
  console.log('1. Go to Firebase Console > Project Settings > Service accounts');
  console.log('2. Click "Generate new private key"');
  console.log('3. You can either upload that file directly or input details here\n');
  
  const useExistingFile = await promptUser('Do you have a downloaded service account JSON file? (y/n): ');
  
  if (useExistingFile.toLowerCase() === 'y') {
    const filePath = await promptUser('Enter the full path to your service account JSON file: ');
    
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const serviceAccount = JSON.parse(fileContent);
      
      // Save to backend directory
      const targetPath = path.join(__dirname, 'backend', 'serviceAccountKey.json');
      fs.writeFileSync(targetPath, JSON.stringify(serviceAccount, null, 2));
      
      console.log(`\nService account key file saved to: ${targetPath}`);
    } catch (error) {
      console.error('Error processing file:', error.message);
    }
  } else {
    console.log('\nPlease provide the following information from your Firebase project:');
    
    const projectId = await promptUser('Project ID: ');
    const privateKeyId = await promptUser('Private Key ID: ');
    const clientEmail = await promptUser('Client Email: ');
    const privateKey = await promptUser('Private Key (paste the entire key, including BEGIN and END lines): ');
    
    const serviceAccount = {
      type: 'service_account',
      project_id: projectId,
      private_key_id: privateKeyId,
      private_key: privateKey,
      client_email: clientEmail,
      client_id: '',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(clientEmail)}`
    };
    
    // Save to backend directory
    const targetDir = path.join(__dirname, 'backend');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const targetPath = path.join(targetDir, 'serviceAccountKey.json');
    fs.writeFileSync(targetPath, JSON.stringify(serviceAccount, null, 2));
    
    console.log(`\nService account key file saved to: ${targetPath}`);
  }
  
  rl.close();
};

createServiceAccount();
