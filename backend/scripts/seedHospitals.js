/**
 * Seed hospitals into MongoDB.
 *
 * Usage:
 *   cd backend && node scripts/seedHospitals.js
 *
 * Idempotent — uses upsert so it can be run multiple times safely.
 */

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', 'config', 'config.env') });

const mongoose = require('mongoose');
const Hospital = require('../models/Hospital.model');

const hospitals = [
  {
    name: 'PHC (IIT Jodhpur)',
    description: 'Primary Health Center at IIT Jodhpur campus',
    address: 'IIT Jodhpur Campus, Karwar, Rajasthan 342037',
    contact: '0291-123456',
    email: 'phc@iitj.ac.in',
    emergencyEmails: ['phc@iitj.ac.in'],
    emergencyContacts: ['9876543210', '0291-123456', '0291-123457'],
    location: { latitude: 26.475174, longitude: 73.116942 },
    type: 'primary',
    services: ['emergency', 'general medicine', 'first aid'],
    operatingHours: '24x7',
    acceptingEmergencies: true,
  },
  {
    name: 'AIIMS Jodhpur',
    description: 'All India Institute of Medical Sciences, Jodhpur',
    address: 'Basni Industrial Area Phase-2, Jodhpur, Rajasthan 342005',
    contact: '0291-2740741',
    email: 'emergency@aiimsjodhapur.edu.in',
    emergencyEmails: ['emergency@aiimsjodhapur.edu.in'],
    emergencyContacts: ['0291-2740741', '0291-2740742', '9998887776'],
    location: { latitude: 26.2418, longitude: 73.0137 },
    type: 'tertiary',
    services: ['emergency', 'trauma care', 'intensive care', 'surgery'],
    operatingHours: '24x7',
    acceptingEmergencies: true,
  },
  {
    name: 'MediPulse Hospital',
    description: 'Multispecialty hospital in Jodhpur city',
    address: '2nd E Rd, near Amrit Nagar, Medipulse Hospital Campus, Jodhpur, Rajasthan 342005',
    contact: '0291-2795555',
    email: 'emergency@medipulse.in',
    emergencyEmails: ['emergency@medipulse.in'],
    emergencyContacts: ['0291-2795555', '0291-2795556', '9876543211'],
    location: { latitude: 26.2802, longitude: 73.0234 },
    type: 'secondary',
    services: ['emergency', 'cardiology', 'neurology', 'orthopedics'],
    operatingHours: '24x7',
    acceptingEmergencies: true,
  },
  {
    name: 'Goyal Hospital',
    description: 'Goyal Hospital & Research Centre',
    address: 'Residency Road, Sardarpura, Jodhpur, Rajasthan 342003',
    contact: '0291-2434641',
    email: 'emergency@goyalhospital.com',
    emergencyEmails: ['emergency@goyalhospital.com'],
    emergencyContacts: ['0291-2434641', '0291-2434642', '9876543212'],
    location: { latitude: 26.2724, longitude: 73.0081 },
    type: 'secondary',
    services: ['emergency', 'pediatrics', 'gynecology', 'general medicine'],
    operatingHours: '24x7',
    acceptingEmergencies: true,
  },
  {
    name: 'Test Hospital (For Testing)',
    description: 'Hospital with test contact details',
    address: 'Test Address, Jodhpur, Rajasthan 342011',
    contact: '8850463357',
    email: 'b23cs1008@iitj.ac.in',
    emergencyEmails: ['b23cs1008@iitj.ac.in'],
    emergencyContacts: ['8850463357', '9999999998', '9999999997'],
    location: { latitude: 26.475174, longitude: 73.116942 },
    type: 'primary',
    services: ['emergency', 'testing'],
    operatingHours: '24x7',
    acceptingEmergencies: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    for (const h of hospitals) {
      const result = await Hospital.findOneAndUpdate(
        { name: h.name },
        { $set: h },
        { upsert: true, new: true }
      );
      console.log(`  ✓ ${result.name} (${result._id})`);
    }

    console.log(`\nSeeded ${hospitals.length} hospitals.`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
