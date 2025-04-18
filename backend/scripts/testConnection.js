/**
 * Firebase Connection Test Script
 * Run this to verify your Firebase connection is working
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const dns = require('dns');

console.log('Testing Firebase connection...');

// First, check for internet connectivity
console.log('Checking internet connectivity...');
dns.resolve('www.google.com', (err) => {
  if (err) {
    console.error('❌ Internet connection issue detected!');
    console.error('   Please check your network settings and try again.');
    process.exit(1);
  }
  
  console.log('✅ Internet connectivity confirmed');
  
  // Continue with Firebase initialization after confirming internet connectivity
  initializeFirebase();
});

function initializeFirebase() {
  try {
    // Look for service account file
    const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      console.log('Using service account file for Firebase initialization');
      const serviceAccount = require(serviceAccountPath);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
        storageBucket: `${serviceAccount.project_id}.appspot.com`
      });
    } else {
      console.log('Service account file not found, using application default credentials');
      admin.initializeApp();
    }
    
    // Test Firestore connection and create test user credentials
    const db = admin.firestore();
    
    // Create test users collection for login credentials
    console.log('Setting up test users...');
    
    // Default test credentials
    const testUsers = [
      {
        email: 'patient@medihelp.com',
        password: 'password123', // In production, never store plain text passwords
        name: 'Test Patient',
        userType: 'patient',
        profileData: {
          age: 30,
          gender: 'Male',
          bloodGroup: 'O+',
          allergies: 'None'
        }
      },
      {
        email: 'doctor@medihelp.com',
        password: 'password123',
        name: 'Dr. Test Doctor',
        userType: 'doctor',
        profileData: {
          specialization: 'Cardiology',
          experience: 10,
          licenseNumber: 'MED12345'
        }
      },
      {
        email: 'pharmacy@medihelp.com',
        password: 'password123',
        name: 'Test Pharmacy',
        userType: 'pharmacy',
        profileData: {
          storeName: 'MediHelp Pharmacy',
          address: '123 Health Street',
          operatingHours: '9AM-9PM'
        }
      }
    ];
    
    // Create users in Firebase Authentication and Firestore
    const promises = testUsers.map(async (user) => {
      try {
        // Try to create user in Firebase Auth
        const userRecord = await admin.auth().createUser({
          email: user.email,
          password: user.password,
          displayName: user.name,
        }).catch(error => {
          // If user already exists, just retrieve it
          if (error.code === 'auth/email-already-exists') {
            return admin.auth().getUserByEmail(user.email);
          }
          throw error;
        });
        
        // Store user data in Firestore (excluding password)
        const { password, profileData, ...userData } = user;
        await db.collection('users').doc(userRecord.uid).set({
          ...userData,
          ...profileData,
          uid: userRecord.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        console.log(`✅ Test user created/updated: ${user.email} (${user.userType})`);
        return userRecord;
      } catch (error) {
        console.error(`❌ Error creating test user ${user.email}:`, error);
        return null;
      }
    });
    
    // Wait for all user creation promises to complete
    Promise.all(promises)
      .then(() => {
        console.log('\n✅ Test users setup complete!');
        console.log('\n📝 Test Login Credentials:');
        testUsers.forEach(user => {
          console.log(`- ${user.userType.toUpperCase()}: ${user.email} / ${user.password}`);
        });
        
        console.log('\n🔗 You can now use these credentials to log in from the frontend.');
        
        // Create test connection document
        return db.collection('test').doc('connection').set({
          timestamp: new Date().toISOString(),
          message: 'Connection test successful'
        });
      })
      .then(() => {
        console.log('✅ Firebase connection successful!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Error during setup:', error);
        process.exit(1);
      });
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    
    if (error.code === 'auth/network-request-failed') {
      console.log('\n🔧 TROUBLESHOOTING NETWORK ISSUES:');
      console.log('1. Check your internet connection');
      console.log('2. Make sure you have created a service account key file (serviceAccountKey.json)');
      console.log('3. Verify your firewall/proxy settings aren\'t blocking Firebase');
      console.log('4. Try running: node create-service-account.js');
    }
    
    process.exit(1);
  }
}
