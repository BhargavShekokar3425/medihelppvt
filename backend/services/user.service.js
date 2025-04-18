const { auth, db } = require('../config/firebase.config');
const dbService = require('./database.service');

const userService = {
  // Create a user with both Authentication and Firestore profile
  createUser: async (userData) => {
    try {
      const { email, password, name, userType, ...profileData } = userData;
      
      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
        disabled: false
      });
      
      // Create user profile in Firestore
      await dbService.addDocument('users', {
        email,
        name,
        userType,
        uid: userRecord.uid,
        emailVerified: userRecord.emailVerified,
        ...profileData
      }, userRecord.uid);
      
      // Set custom claims for role-based access
      await auth.setCustomUserClaims(userRecord.uid, { role: userType });
      
      return userRecord;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  // Verify a user token
  verifyToken: async (token) => {
    try {
      const decodedToken = await auth.verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      console.error('Error verifying token:', error);
      throw error;
    }
  },
  
  // Get user by ID
  getUserById: async (userId) => {
    try {
      // Get user from Firestore
      const userDoc = await dbService.getDocument('users', userId);
      
      if (!userDoc) {
        throw new Error('User not found');
      }
      
      return userDoc;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  },
  
  // Get user by email
  getUserByEmail: async (email) => {
    try {
      // Get user from Auth
      const userRecord = await auth.getUserByEmail(email);
      
      // Get user from Firestore
      const userDoc = await dbService.getDocument('users', userRecord.uid);
      
      return {
        ...userRecord,
        ...userDoc
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  },
  
  // Update user profile
  updateUserProfile: async (userId, userData) => {
    try {
      // Update Firestore profile
      await dbService.updateDocument('users', userId, userData);
      
      // Update Auth display name if provided
      if (userData.name) {
        await auth.updateUser(userId, {
          displayName: userData.name
        });
      }
      
      return await dbService.getDocument('users', userId);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },
  
  // Get users by role (type)
  getUsersByRole: async (role) => {
    try {
      return await dbService.queryDocuments('users', {
        filters: [
          { field: 'userType', operator: '==', value: role }
        ]
      });
    } catch (error) {
      console.error(`Error getting users by role ${role}:`, error);
      throw error;
    }
  }
};

module.exports = userService;
