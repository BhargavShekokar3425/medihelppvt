const { db, auth } = require('./config/firebase.config');
const dbService = require('./services/database.service');
const userService = require('./services/user.service');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User.model');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: './config/config.env' });

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medihelp', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    return false;
  }
};

// Initialize system with required data
const initializeSystem = async () => {
  try {
    console.log('Starting system initialization...');
    
    // Connect to MongoDB if URI is provided
    if (process.env.MONGO_URI) {
      await connectDB();
    }
    
    // Create admin user if it doesn't exist
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@medihelp.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'adminPassword123!';
      
      // Check if admin exists in MongoDB
      if (mongoose.connection.readyState === 1) {
        const adminUser = await User.findOne({ email: adminEmail });
        
        if (!adminUser) {
          console.log('Creating admin user in MongoDB...');
          
          // Create admin user
          await User.create({
            name: 'System Administrator',
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
          });
          
          console.log(`Admin user created in MongoDB`);
        } else {
          console.log('Admin user already exists in MongoDB');
        }
      }
      
      // Check if admin exists in Firebase
      try {
        const adminExists = await auth.getUserByEmail(adminEmail)
          .then(() => true)
          .catch(() => false);
        
        if (!adminExists) {
          console.log('Creating admin user in Firebase...');
          
          // Create admin user
          const adminUser = await userService.createUser({
            email: adminEmail,
            password: adminPassword,
            name: 'System Administrator',
            userType: 'admin'
          });
          
          console.log(`Admin user created in Firebase with ID: ${adminUser.uid}`);
        } else {
          console.log('Admin user already exists in Firebase');
        }
      } catch (error) {
        console.error('Error checking Firebase admin:', error);
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
    }
    
    // Ensure required collections exist in Firebase
    const requiredCollections = [
      'users',
      'conversations',
      'prescriptions',
      'appointments',
      'reviews',
      'posts',
      'emergencyRequests',
      'system_health'
    ];
    
    // Create a document in each collection to ensure it exists
    for (const collection of requiredCollections) {
      try {
        // Check if collection exists
        const snapshot = await db.collection(collection).limit(1).get();
        
        if (snapshot.empty) {
          console.log(`Creating initial document in ${collection} collection...`);
          
          // Create a system document to initialize collection
          await dbService.addDocument(collection, {
            system: true,
            initialized: true,
            createdAt: dbService.fieldValues.serverTimestamp()
          });
        }
      } catch (error) {
        console.error(`Error initializing ${collection} collection:`, error);
      }
    }
    
    console.log('System initialization complete');
    return true;
  } catch (error) {
    console.error('System initialization failed:', error);
    return false;
  }
};

// Export for use during server startup
module.exports = { initializeSystem, connectDB };

// If run directly, execute initialization
if (require.main === module) {
  initializeSystem()
    .then(success => {
      if (success) {
        console.log('Initialization successful');
        process.exit(0);
      } else {
        console.error('Initialization failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Initialization error:', error);
      process.exit(1);
    });
}
