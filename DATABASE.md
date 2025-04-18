# MediHelp Database Guide

This document explains how to interact with and add data to your Firebase database.

## Setup Instructions

1. **Create a Firebase Service Account:**
   ```
   node create-service-account.js
   ```
   Follow the prompts to set up your service account.

2. **Test Firebase Connection:**
   ```
   node backend/scripts/testConnection.js
   ```
   This will verify your Firebase connection is working.

3. **Initialize Database with Sample Data:**
   ```
   node backend/scripts/initDatabase.js
   ```
   This adds sample users, prescriptions, and other data.

## Adding Data to Firebase (Modular Approach)

Our application uses a modular service-based approach for database operations:

### Using the Database Service

```javascript
const dbService = require('./backend/services/database.service');

// Adding a new user
const addUser = async () => {
  const userData = {
    email: 'newuser@example.com',
    name: 'New User',
    userType: 'patient',
    // ...other user fields
  };
  
  const newUser = await dbService.addDocument('users', userData);
  console.log('Added user:', newUser.id);
};

// Adding a prescription
const addPrescription = async (patientId, doctorId) => {
  const prescriptionData = {
    patientId,
    doctorId,
    medications: [
      {
        name: 'Medication Name',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '7 days'
      }
    ],
    diagnosis: 'Patient diagnosis',
    instructions: 'Special instructions',
    status: 'active'
  };
  
  const newPrescription = await dbService.addDocument('prescriptions', prescriptionData);
  console.log('Added prescription:', newPrescription.id);
};

// Adding a review
const addReview = async (patientId, doctorId) => {
  const reviewData = {
    patientId,
    doctorId,
    rating: 5,
    comment: 'Excellent service',
    date: new Date().toISOString()
  };
  
  const newReview = await dbService.addDocument('reviews', reviewData);
  console.log('Added review:', newReview.id);
};

// Adding a chat message
const addChatMessage = async (senderId, receiverId) => {
  // Generate conversation ID (sorted user IDs)
  const participants = [senderId, receiverId].sort();
  const conversationId = participants.join('_');
  
  // Create or update conversation
  await dbService.addDocument('conversations', {
    participants,
    lastActivity: new Date().toISOString()
  }, conversationId);
  
  // Add message to subcollection
  const messageData = {
    senderId,
    text: 'Hello, how are you?',
    timestamp: new Date().toISOString(),
    read: false
  };
  
  // Use path pattern: 'conversations/{conversationId}/messages'
  const newMessage = await dbService.addDocument(
    `conversations/${conversationId}/messages`, 
    messageData
  );
  
  console.log('Added message:', newMessage.id);
};
```

### Database Structure

Our Firebase database is structured as follows:

