/**
 * Database Seed Script for MediHelp
 * Seeds doctors, patients, and sample appointments
 * Run: node scripts/seed.js
 */

require('dotenv').config({ path: './config/config.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User.model');
const Appointment = require('../models/Appointment.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medihelp';

// Sample Doctors Data
const doctors = [
  {
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@medihelp.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '+91 98765 43210',
    gender: 'female',
    specialization: 'Cardiologist',
    experience: 12,
    qualifications: ['MBBS', 'MD Cardiology', 'DM'],
    consultationFee: 800,
    rating: 4.8,
    totalReviews: 156,
    bio: 'Expert cardiologist with over 12 years of experience in treating heart conditions.',
    languages: ['English', 'Hindi', 'Marathi'],
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.0760], // Mumbai
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400001'
    },
    clinic: {
      name: 'Heart Care Clinic',
      address: '123, Marine Drive, Mumbai, Maharashtra 400001',
      phone: '+91 22 2345 6789',
      email: 'heartcare@clinic.com',
      timings: 'Mon-Sat: 9AM-6PM'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    workingHours: { start: '09:00 AM', end: '06:00 PM' },
    slotDuration: 30,
    breakTime: { start: '01:00 PM', end: '02:00 PM' }
  },
  {
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@medihelp.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '+91 98765 43211',
    gender: 'male',
    specialization: 'Orthopedic Surgeon',
    experience: 15,
    qualifications: ['MBBS', 'MS Orthopedics', 'Fellowship Joint Replacement'],
    consultationFee: 1000,
    rating: 4.9,
    totalReviews: 234,
    bio: 'Senior orthopedic surgeon specializing in joint replacement and sports injuries.',
    languages: ['English', 'Hindi', 'Punjabi'],
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    location: {
      type: 'Point',
      coordinates: [77.1025, 28.7041], // Delhi
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      pincode: '110001'
    },
    clinic: {
      name: 'Ortho Care Hospital',
      address: '456, Connaught Place, New Delhi 110001',
      phone: '+91 11 2345 6789',
      email: 'orthocare@hospital.com',
      timings: 'Mon-Fri: 10AM-7PM'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    workingHours: { start: '10:00 AM', end: '07:00 PM' },
    slotDuration: 30,
    breakTime: { start: '01:30 PM', end: '02:30 PM' }
  },
  {
    name: 'Dr. Ananya Patel',
    email: 'ananya.patel@medihelp.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '+91 98765 43212',
    gender: 'female',
    specialization: 'Dermatologist',
    experience: 8,
    qualifications: ['MBBS', 'MD Dermatology'],
    consultationFee: 600,
    rating: 4.7,
    totalReviews: 189,
    bio: 'Specialized in skin care, cosmetic dermatology, and laser treatments.',
    languages: ['English', 'Hindi', 'Gujarati'],
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    profileImage: 'https://randomuser.me/api/portraits/women/68.jpg',
    location: {
      type: 'Point',
      coordinates: [72.5714, 23.0225], // Ahmedabad
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
      pincode: '380001'
    },
    clinic: {
      name: 'Skin Glow Clinic',
      address: '789, CG Road, Ahmedabad, Gujarat 380009',
      phone: '+91 79 2345 6789',
      email: 'skinglow@clinic.com',
      timings: 'Mon-Sat: 11AM-8PM'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    workingHours: { start: '11:00 AM', end: '08:00 PM' },
    slotDuration: 30,
    breakTime: { start: '02:00 PM', end: '03:00 PM' }
  },
  {
    name: 'Dr. Vikram Singh',
    email: 'vikram.singh@medihelp.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '+91 98765 43213',
    gender: 'male',
    specialization: 'Neurologist',
    experience: 18,
    qualifications: ['MBBS', 'MD Medicine', 'DM Neurology'],
    consultationFee: 1200,
    rating: 4.9,
    totalReviews: 312,
    bio: 'Expert neurologist with extensive experience in treating complex neurological disorders.',
    languages: ['English', 'Hindi'],
    avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
    profileImage: 'https://randomuser.me/api/portraits/men/52.jpg',
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716], // Bangalore
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      pincode: '560001'
    },
    clinic: {
      name: 'Neuro Wellness Center',
      address: '321, MG Road, Bangalore, Karnataka 560001',
      phone: '+91 80 2345 6789',
      email: 'neurowellness@center.com',
      timings: 'Mon-Fri: 9AM-5PM'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    workingHours: { start: '09:00 AM', end: '05:00 PM' },
    slotDuration: 30,
    breakTime: { start: '12:30 PM', end: '01:30 PM' }
  },
  {
    name: 'Dr. Meera Reddy',
    email: 'meera.reddy@medihelp.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '+91 98765 43214',
    gender: 'female',
    specialization: 'Gynecologist',
    experience: 14,
    qualifications: ['MBBS', 'MS OBG', 'Fellowship in IVF'],
    consultationFee: 900,
    rating: 4.8,
    totalReviews: 267,
    bio: 'Experienced gynecologist and obstetrician specializing in high-risk pregnancies and fertility.',
    languages: ['English', 'Hindi', 'Telugu'],
    avatar: 'https://randomuser.me/api/portraits/women/89.jpg',
    profileImage: 'https://randomuser.me/api/portraits/women/89.jpg',
    location: {
      type: 'Point',
      coordinates: [78.4867, 17.3850], // Hyderabad
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      pincode: '500001'
    },
    clinic: {
      name: 'Women Care Hospital',
      address: '567, Banjara Hills, Hyderabad, Telangana 500034',
      phone: '+91 40 2345 6789',
      email: 'womencare@hospital.com',
      timings: 'Mon-Sat: 10AM-6PM'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    workingHours: { start: '10:00 AM', end: '06:00 PM' },
    slotDuration: 30,
    breakTime: { start: '01:00 PM', end: '02:00 PM' }
  },
  {
    name: 'Dr. Arjun Nair',
    email: 'arjun.nair@medihelp.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '+91 98765 43215',
    gender: 'male',
    specialization: 'Pediatrician',
    experience: 10,
    qualifications: ['MBBS', 'MD Pediatrics', 'Fellowship NICU'],
    consultationFee: 700,
    rating: 4.7,
    totalReviews: 198,
    bio: 'Child specialist with expertise in neonatal care and childhood development.',
    languages: ['English', 'Hindi', 'Malayalam'],
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    profileImage: 'https://randomuser.me/api/portraits/men/75.jpg',
    location: {
      type: 'Point',
      coordinates: [76.2711, 9.9312], // Kochi
      city: 'Kochi',
      state: 'Kerala',
      country: 'India',
      pincode: '682001'
    },
    clinic: {
      name: 'Little Stars Clinic',
      address: '890, Marine Drive, Kochi, Kerala 682001',
      phone: '+91 484 234 5678',
      email: 'littlestars@clinic.com',
      timings: 'Mon-Sat: 9AM-7PM'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    workingHours: { start: '09:00 AM', end: '07:00 PM' },
    slotDuration: 30,
    breakTime: { start: '01:00 PM', end: '02:00 PM' }
  },
  {
    name: 'Dr. Sanjay Mehta',
    email: 'sanjay.mehta@medihelp.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '+91 98765 43216',
    gender: 'male',
    specialization: 'General Physician',
    experience: 20,
    qualifications: ['MBBS', 'MD Internal Medicine'],
    consultationFee: 500,
    rating: 4.6,
    totalReviews: 456,
    bio: 'Senior general physician with expertise in preventive medicine and chronic disease management.',
    languages: ['English', 'Hindi', 'Marathi'],
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    profileImage: 'https://randomuser.me/api/portraits/men/22.jpg',
    location: {
      type: 'Point',
      coordinates: [73.8567, 18.5204], // Pune
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      pincode: '411001'
    },
    clinic: {
      name: 'Family Health Clinic',
      address: '234, FC Road, Pune, Maharashtra 411004',
      phone: '+91 20 2345 6789',
      email: 'familyhealth@clinic.com',
      timings: 'Mon-Sat: 8AM-8PM'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    workingHours: { start: '08:00 AM', end: '08:00 PM' },
    slotDuration: 30,
    breakTime: { start: '01:00 PM', end: '02:00 PM' }
  },
  {
    name: 'Dr. Kavita Joshi',
    email: 'kavita.joshi@medihelp.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '+91 98765 43217',
    gender: 'female',
    specialization: 'Psychiatrist',
    experience: 11,
    qualifications: ['MBBS', 'MD Psychiatry'],
    consultationFee: 1000,
    rating: 4.8,
    totalReviews: 134,
    bio: 'Mental health specialist focusing on anxiety, depression, and stress management.',
    languages: ['English', 'Hindi'],
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    profileImage: 'https://randomuser.me/api/portraits/women/33.jpg',
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.0760], // Mumbai (another doctor in same city)
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400050'
    },
    clinic: {
      name: 'Mind Wellness Center',
      address: '456, Bandra West, Mumbai, Maharashtra 400050',
      phone: '+91 22 3456 7890',
      email: 'mindwellness@center.com',
      timings: 'Mon-Fri: 11AM-7PM'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    workingHours: { start: '11:00 AM', end: '07:00 PM' },
    slotDuration: 45, // Longer sessions for psychiatry
    breakTime: { start: '02:00 PM', end: '03:00 PM' }
  }
];

// Sample Patients Data
const patients = [
  {
    name: 'Amit Kumar',
    email: 'amit.kumar@email.com',
    password: 'patient123',
    role: 'patient',
    phone: '+91 99887 76655',
    gender: 'male',
    dateOfBirth: new Date('1985-05-15'),
    bloodGroup: 'B+',
    allergies: ['Penicillin'],
    medicalConditions: ['High Blood Pressure'],
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.0760],
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India'
    },
    emergencyContact: {
      name: 'Priya Kumar',
      phone: '+91 99887 76656',
      relationship: 'Wife'
    }
  },
  {
    name: 'Sneha Gupta',
    email: 'sneha.gupta@email.com',
    password: 'patient123',
    role: 'patient',
    phone: '+91 99887 76657',
    gender: 'female',
    dateOfBirth: new Date('1990-08-22'),
    bloodGroup: 'O+',
    allergies: [],
    medicalConditions: ['Diabetes Type 2'],
    location: {
      type: 'Point',
      coordinates: [77.1025, 28.7041],
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India'
    },
    emergencyContact: {
      name: 'Rahul Gupta',
      phone: '+91 99887 76658',
      relationship: 'Husband'
    }
  },
  {
    name: 'Rahul Verma',
    email: 'rahul.verma@email.com',
    password: 'patient123',
    role: 'patient',
    phone: '+91 99887 76659',
    gender: 'male',
    dateOfBirth: new Date('1978-12-10'),
    bloodGroup: 'A+',
    allergies: ['Sulfa drugs', 'Aspirin'],
    medicalConditions: [],
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716],
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India'
    },
    emergencyContact: {
      name: 'Anjali Verma',
      phone: '+91 99887 76660',
      relationship: 'Sister'
    }
  }
];

async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({ email: { $regex: /@medihelp\.com$|@email\.com$/ } });
    await Appointment.deleteMany({});

    // Hash passwords and create doctors
    console.log('Creating doctors...');
    const hashedDoctors = await Promise.all(
      doctors.map(async (doc) => ({
        ...doc,
        password: await bcrypt.hash(doc.password, 12)
      }))
    );
    const createdDoctors = await User.insertMany(hashedDoctors);
    console.log(`Created ${createdDoctors.length} doctors`);

    // Hash passwords and create patients
    console.log('Creating patients...');
    const hashedPatients = await Promise.all(
      patients.map(async (pat) => ({
        ...pat,
        password: await bcrypt.hash(pat.password, 12)
      }))
    );
    const createdPatients = await User.insertMany(hashedPatients);
    console.log(`Created ${createdPatients.length} patients`);

    // Create sample appointments
    console.log('Creating sample appointments...');
    const today = new Date();
    const appointments = [];

    // Create a few appointments for each doctor
    for (let i = 0; i < createdDoctors.length && i < 3; i++) {
      const doctor = createdDoctors[i];
      const patient = createdPatients[i % createdPatients.length];
      
      // Confirmed appointment for today
      const todayStr = today.toISOString().split('T')[0];
      appointments.push({
        patient: patient._id,
        patientName: patient.name,
        patientPhone: patient.phone,
        patientEmail: patient.email,
        doctor: doctor._id,
        doctorName: doctor.name,
        date: todayStr,
        timeSlot: '10:00 AM',
        duration: 30,
        reason: 'Regular checkup',
        status: 'confirmed',
        confirmedAt: new Date(),
        clinicName: doctor.clinic?.name,
        clinicAddress: doctor.clinic?.address,
        clinicPhone: doctor.clinic?.phone
      });

      // Pending appointment for tomorrow
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      appointments.push({
        patient: patient._id,
        patientName: patient.name,
        patientPhone: patient.phone,
        patientEmail: patient.email,
        doctor: doctor._id,
        doctorName: doctor.name,
        date: tomorrowStr,
        timeSlot: '11:30 AM',
        duration: 30,
        reason: 'Follow-up consultation',
        status: 'pending',
        clinicName: doctor.clinic?.name,
        clinicAddress: doctor.clinic?.address,
        clinicPhone: doctor.clinic?.phone
      });
    }

    await Appointment.insertMany(appointments);
    console.log(`Created ${appointments.length} appointments`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('─────────────────────────────────────');
    console.log('DOCTORS:');
    doctors.forEach(d => {
      console.log(`  ${d.name} (${d.specialization})`);
      console.log(`    Email: ${d.email}`);
      console.log(`    Password: doctor123`);
      console.log(`    City: ${d.location.city}\n`);
    });
    console.log('PATIENTS:');
    patients.forEach(p => {
      console.log(`  ${p.name}`);
      console.log(`    Email: ${p.email}`);
      console.log(`    Password: patient123\n`);
    });

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
}

seed();
