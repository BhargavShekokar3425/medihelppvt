/**
 * Database Initialization Script
 * Run this script to set up initial data in Firebase
 */

const dbService = require('../services/database.service');

// Sample user data
const sampleUsers = [
  {
    email: 'patient1@example.com',
    name: 'John Doe',
    userType: 'patient',
    gender: 'Male',
    age: 35,
    bloodGroup: 'O+',
    allergies: 'Peanuts, Penicillin'
  },
  {
    email: 'doctor1@example.com',
    name: 'Dr. Sarah Wilson',
    userType: 'doctor',
    specialization: 'Cardiology',
    experience: 12,
    licenseNumber: 'MED12345'
  },
  {
    email: 'pharmacy1@example.com',
    name: 'City Pharmacy',
    userType: 'pharmacy',
    address: '123 Main St, Anytown',
    phone: '555-123-4567',
    operatingHours: '9AM-9PM'
  }
];

// Sample prescriptions
const samplePrescriptions = [
  {
    patientId: 'user_patient1',  // Will be replaced with actual ID
    doctorId: 'user_doctor1',    // Will be replaced with actual ID
    medications: [
      {
        name: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Three times daily',
        duration: '7 days'
      }
    ],
    diagnosis: 'Upper respiratory infection',
    instructions: 'Take with food. Complete full course.',
    status: 'active'
  }
];

// Initialize database with sample data
const initializeDatabase = async () => {
  try {
    console.log('Initializing database with sample data...');
    
    // Add users
    const userIds = {};
    for (const userData of sampleUsers) {
      const userKey = `user_${userData.email.split('@')[0]}`;
      
      console.log(`Adding ${userData.userType}: ${userData.name}`);
      const user = await dbService.addDocument('users', userData);
      userIds[userKey] = user.id;
      console.log(`Added user: ${user.id}`);
    }
    
    // Add prescriptions with correct user references
    for (const prescriptionData of samplePrescriptions) {
      // Replace placeholder IDs with actual IDs
      const prescription = {
        ...prescriptionData,
        patientId: userIds[prescriptionData.patientId] || prescriptionData.patientId,
        doctorId: userIds[prescriptionData.doctorId] || prescriptionData.doctorId,
      };
      
      console.log('Adding prescription');
      await dbService.addDocument('prescriptions', prescription);
    }
    
    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Run initialization
initializeDatabase();
