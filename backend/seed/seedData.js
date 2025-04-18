const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User.model');
const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');

// Load environment variables
dotenv.config({ path: '../config/config.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medihelp')
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.error('DB Connection Error:', err));

// Sample user data
const users = [
  {
    name: 'Dr. Neha Sharma',
    email: 'doctor@example.com',
    password: 'password', // In a real app, this would be hashed
    role: 'doctor',
    username: 'drneha',
    specialization: 'Cardiology',
    experience: '10 years',
    avatar: '/assets/femme.jpeg',
    status: 'offline'
  },
  {
    name: 'Test Patient',
    email: 'patient@example.com',
    password: 'password123',
    role: 'patient',
    username: 'testpatient',
    dob: '1990-01-01',
    address: '123 Test St, Test City',
    contact: '555-123-4567',
    bloodGroup: 'O+',
    gender: 'Male',
    allergies: 'Penicillin, peanuts',
    status: 'offline'
  },
  {
    name: 'MediPulse Pharmacy',
    email: 'pharmacy@example.com',
    password: 'password',
    role: 'pharmacy',
    username: 'medipulse',
    address: '456 Med St, Medicine City',
    contact: '555-987-6543',
    status: 'offline'
  }
];

// Seed function
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create users
    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);
    
    const doctor = createdUsers[0];
    const patient = createdUsers[1];
    const pharmacy = createdUsers[2];
    
    // Create conversations
    const doctorPatientConvo = await Conversation.create({
      participants: [doctor._id, patient._id],
      type: 'individual',
      createdBy: doctor._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      unreadCounts: new Map([
        [doctor._id.toString(), 0],
        [patient._id.toString(), 0]
      ])
    });
    
    const patientPharmacyConvo = await Conversation.create({
      participants: [patient._id, pharmacy._id],
      type: 'individual',
      createdBy: patient._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      unreadCounts: new Map([
        [patient._id.toString(), 0],
        [pharmacy._id.toString(), 0]
      ])
    });
    
    console.log(`Created ${2} conversations`);
    
    // Create messages
    const messages = [
      {
        conversationId: doctorPatientConvo._id,
        sender: doctor._id,
        text: 'Hello! How can I help you today?',
        readBy: [doctor._id],
        createdAt: new Date(Date.now() - 3600000 * 2)
      },
      {
        conversationId: doctorPatientConvo._id,
        sender: patient._id,
        text: "I've been experiencing headaches for the past week.",
        readBy: [patient._id, doctor._id],
        createdAt: new Date(Date.now() - 3600000 * 1.5)
      },
      {
        conversationId: doctorPatientConvo._id,
        sender: doctor._id,
        text: "I see. How severe are these headaches on a scale of 1-10?",
        readBy: [doctor._id],
        createdAt: new Date(Date.now() - 3600000)
      },
      {
        conversationId: patientPharmacyConvo._id,
        sender: patient._id,
        text: "Do you have my prescription ready?",
        readBy: [patient._id],
        createdAt: new Date(Date.now() - 7200000)
      },
      {
        conversationId: patientPharmacyConvo._id,
        sender: pharmacy._id,
        text: "Yes, your prescription is ready for pickup. We close at 9pm today.",
        readBy: [pharmacy._id],
        createdAt: new Date(Date.now() - 3600000 * 1.2)
      }
    ];
    
    const createdMessages = await Message.insertMany(messages);
    console.log(`Created ${createdMessages.length} messages`);
    
    // Update conversations with last message
    await Conversation.findByIdAndUpdate(doctorPatientConvo._id, {
      lastMessage: messages[2].text,
      lastMessageAt: messages[2].createdAt,
      lastSenderId: doctor._id
    });
    
    await Conversation.findByIdAndUpdate(patientPharmacyConvo._id, {
      lastMessage: messages[4].text,
      lastMessageAt: messages[4].createdAt,
      lastSenderId: pharmacy._id
    });
    
    console.log('Seed data completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    // Close connection
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seeder
seedData();
