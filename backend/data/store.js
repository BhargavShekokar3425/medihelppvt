// Persistent in-memory data store with file-based persistence

const { saveCollection, loadCollection } = require('../utils/dbUtils');

// Default data for users collection
const defaultUsers = [
  {
    id: 'p1',
    email: 'patient@example.com',
    password: 'password123', // In a real app, this would be hashed
    name: 'Test Patient',
    role: 'patient',
    username: 'testpatient',
    dob: '1990-01-01',
    address: '123 Test St, Test City',
    contact: '555-123-4567',
    bloodGroup: 'O+',
    gender: 'Male',
    allergies: 'Penicillin, peanuts',
    medicalHistory: 'Hypertension, Type 2 Diabetes',
    emergencyContact: 'John Doe, 555-987-6543'
  },
  {
    id: 'p2',
    email: 'patient2@example.com', 
    password: 'password123',
    name: 'Jane Smith',
    role: 'patient',
    username: 'janesmith',
    dob: '1985-05-15',
    address: '456 Main St, Another City',
    contact: '555-222-3333',
    bloodGroup: 'B-',
    gender: 'Female',
    allergies: 'Shellfish',
    medicalHistory: 'Asthma',
    emergencyContact: 'Mike Smith, 555-444-5555'
  },
  {
    id: '1',
    email: 'user@example.com',
    password: 'password', // In a real app, this would be hashed
    name: 'Test User',
    role: 'patient',
    username: 'testuser',
    dob: '1990-01-01',
    address: '123 Test St',
    contact: '555-1234',
    bloodGroup: 'O+',
    gender: 'Male',
    allergies: 'None'
  },
  {
    id: 'd1',
    email: 'doctor@example.com',
    password: 'password',
    name: 'Dr. Neha Sharma',
    role: 'doctor',
    username: 'drneha',
    specialization: 'Cardiology',
    experience: '10 years',
    avatar: '/assets/femme.jpeg'
  },
  {
    id: 'd2',
    email: 'shikha@example.com',
    password: 'password',
    name: 'Dr. Shikha Chibber',
    role: 'doctor',
    username: 'drshikha',
    specialization: 'Neurology',
    experience: '8 years',
    avatar: '/assets/fem.jpeg'
  },
  {
    id: 'd3',
    email: 'ayurvedic@example.com',
    password: 'password',
    name: 'Dr. Ayurvedic Specialists',
    role: 'doctor',
    username: 'drayurvedic',
    specialization: 'Ayurveda',
    experience: '15 years',
    avatar: '/assets/doctorman.avif'
  },
  {
    id: 'd4',
    email: 'vibha@example.com',
    password: 'password',
    name: 'Dr. Vibha Dubey',
    role: 'doctor',
    username: 'drvibha',
    specialization: 'Dermatology',
    experience: '12 years',
    avatar: '/assets/femmedocie.jpg'
  },
  {
    id: 'd5',
    email: 'shweta@example.com',
    password: 'password',
    name: 'Dr. Shweta Singh',
    role: 'doctor',
    username: 'drshweta',
    specialization: 'Pediatrics',
    experience: '7 years',
    avatar: '/assets/cutu.jpeg'
  },
  {
    id: 'd6',
    email: 'misha@example.com',
    password: 'password',
    name: 'Dr. Misha Goyal',
    role: 'doctor',
    username: 'drmisha',
    specialization: 'Gynecology',
    experience: '9 years',
    avatar: '/assets/vcutu.jpg'
  }
];

// Default data for appointments collection
const defaultAppointments = [
  {
    id: 'apt1',
    patientId: '1',
    patientName: 'Test User',
    doctorId: 'd1',
    doctorName: 'Dr. Neha Sharma',
    date: '2023-06-15',
    timeSlot: '10:00 AM',
    reason: 'Regular checkup',
    status: 'completed',
    notes: 'Patient is doing well',
    createdAt: '2023-06-10T10:00:00Z'
  },
  {
    id: 'apt2',
    patientId: '1',
    patientName: 'Test User',
    doctorId: 'd2',
    doctorName: 'Dr. Shikha Chibber',
    date: '2023-06-20',
    timeSlot: '2:00 PM',
    reason: 'Follow-up',
    status: 'pending',
    createdAt: '2023-06-15T10:00:00Z'
  }
];

// Default data for reviews collection
const defaultReviews = [
  {
    id: 'rev1',
    doctorId: 'd1',
    doctor: {
      id: 'd1',
      name: 'Dr. Neha Sharma',
      specialization: 'Cardiology',
      avatar: '/assets/femme.jpeg'
    },
    authorId: '1',
    author: {
      id: '1',
      name: 'Test User',
      avatar: null
    },
    rating: 5,
    title: 'Excellent doctor!',
    content: 'Dr. Neha was very professional and took the time to explain everything clearly.',
    createdAt: '2023-06-12T08:00:00Z',
    isPublic: true,
    reviewType: 'doctor'
  },
  {
    id: 'rev2',
    doctorId: 'd2',
    doctor: {
      id: 'd2',
      name: 'Dr. Shikha Chibber',
      specialization: 'Neurology',
      avatar: '/assets/fem.jpeg'
    },
    authorId: '1',
    author: {
      id: '1',
      name: 'Test User',
      avatar: null
    },
    rating: 4,
    title: 'Good experience',
    content: 'Dr. Shikha was knowledgeable and helpful.',
    createdAt: '2023-06-14T09:30:00Z',
    isPublic: true,
    reviewType: 'doctor'
  },
  {
    id: 'rev3',
    authorId: '1',
    author: {
      id: '1',
      name: 'Test User',
      avatar: null
    },
    rating: 5,
    title: 'Great app!',
    content: 'The app is very user-friendly and helpful.',
    createdAt: '2023-06-16T10:00:00Z',
    isPublic: true,
    reviewType: 'app'
  }
];

// Default prescriptions data
const defaultPrescriptions = [];

// Load data from disk or use defaults
const users = loadCollection('users', defaultUsers);
const appointments = loadCollection('appointments', defaultAppointments);
const reviews = loadCollection('reviews', defaultReviews);
const prescriptions = loadCollection('prescriptions', defaultPrescriptions);

// Create store with auto-save functionality
const store = {
  users,
  appointments,
  reviews,
  prescriptions,
  
  // Helper functions with auto-save
  findUserByEmail: (email) => {
    return users.find(user => user.email === email);
  },
  
  findUserById: (id) => {
    return users.find(user => user.id === id);
  },
  
  createUser: (userData) => {
    const id = `user_${Date.now()}`;
    const newUser = { id, ...userData };
    users.push(newUser);
    
    // Auto-save after modification
    saveCollection('users', users);
    
    return newUser;
  },
  
  updateUser: (id, userData) => {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...userData };
      
      // Auto-save after modification
      saveCollection('users', users);
      
      return users[index];
    }
    return null;
  },
  
  // Enhanced isTimeSlotAvailable function
  isTimeSlotAvailable: (doctorId, date, timeSlot) => {
    return !appointments.some(apt => 
      apt.doctorId === doctorId && 
      apt.date === date && 
      apt.timeSlot === timeSlot &&
      ['pending', 'confirmed', 'in-progress'].includes(apt.status)
    );
  },
  
  // Check if a patient has a conflicting appointment
  hasPatientConflict: (patientId, date, timeSlot) => {
    return appointments.some(apt => 
      apt.patientId === patientId && 
      apt.date === date && 
      apt.timeSlot === timeSlot &&
      ['pending', 'confirmed', 'in-progress'].includes(apt.status)
    );
  },
  
  // Create appointment with auto-save
  createAppointment: (appointmentData) => {
    const id = `apt_${Date.now()}`;
    const newAppointment = { 
      id, 
      ...appointmentData, 
      createdAt: new Date().toISOString() 
    };
    
    appointments.push(newAppointment);
    
    // Auto-save after modification
    saveCollection('appointments', appointments);
    
    return newAppointment;
  },
  
  // Update appointment with auto-save
  updateAppointment: (id, data) => {
    const index = appointments.findIndex(apt => apt.id === id);
    if (index !== -1) {
      appointments[index] = { 
        ...appointments[index], 
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      // Auto-save after modification
      saveCollection('appointments', appointments);
      
      return appointments[index];
    }
    return null;
  },
  
  // Delete appointment with auto-save
  deleteAppointment: (id) => {
    const index = appointments.findIndex(apt => apt.id === id);
    if (index !== -1) {
      const deleted = appointments.splice(index, 1)[0];
      
      // Auto-save after modification
      saveCollection('appointments', appointments);
      
      return deleted;
    }
    return null;
  },
  
  // Get all reviews for a doctor
  getDoctorReviews: (doctorId) => {
    return reviews.filter(review => 
      review.doctorId === doctorId && 
      review.isPublic === true &&
      review.reviewType === 'doctor'
    );
  },

  // Create review with auto-save
  createReview: (reviewData) => {
    const id = `rev_${Date.now()}`;
    const newReview = { 
      id, 
      ...reviewData, 
      createdAt: new Date().toISOString() 
    };
    
    reviews.push(newReview);
    
    // Auto-save after modification
    saveCollection('reviews', reviews);
    
    return newReview;
  },
  
  // Update review with auto-save
  updateReview: (id, data) => {
    const index = reviews.findIndex(rev => rev.id === id);
    if (index !== -1) {
      reviews[index] = { 
        ...reviews[index], 
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      // Auto-save after modification
      saveCollection('reviews', reviews);
      
      return reviews[index];
    }
    return null;
  },
  
  // Delete review with auto-save
  deleteReview: (id) => {
    const index = reviews.findIndex(rev => rev.id === id);
    if (index !== -1) {
      const deleted = reviews.splice(index, 1)[0];
      
      // Auto-save after modification
      saveCollection('reviews', reviews);
      
      return deleted;
    }
    return null;
  },

  // Get general app reviews
  getAppReviews: () => {
    return reviews.filter(review => 
      review.reviewType === 'app' && 
      review.isPublic === true
    );
  },

  // Get all public reviews
  getPublicReviews: (page = 1, limit = 10) => {
    const startIndex = (page - 1) * limit;
    return reviews
      .filter(review => review.isPublic === true)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(startIndex, startIndex + limit);
  },

  // Get all appointments for a user (as patient or doctor)
  getUserAppointments: (userId) => {
    return appointments.filter(apt => apt.patientId === userId || apt.doctorId === userId);
  },
  
  // Get appointment by ID
  getAppointmentById: (appointmentId) => {
    return appointments.find(apt => apt.id === appointmentId);
  },
  
  // Update appointment status with auto-save
  updateAppointmentStatus: (appointmentId, status, updatedBy) => {
    const index = appointments.findIndex(apt => apt.id === appointmentId);
    if (index === -1) return null;
    
    appointments[index] = {
      ...appointments[index],
      status,
      updatedBy,
      updatedAt: new Date().toISOString()
    };
    
    // Auto-save after modification
    saveCollection('appointments', appointments);
    
    return appointments[index];
  },
  
  // Create prescription with auto-save
  createPrescription: (prescriptionData) => {
    const id = `pres_${Date.now()}`;
    const newPrescription = {
      id,
      ...prescriptionData,
      createdAt: new Date().toISOString()
    };
    
    prescriptions.push(newPrescription);
    
    // Auto-save after modification
    saveCollection('prescriptions', prescriptions);
    
    return newPrescription;
  },
  
  // Get prescriptions by patient ID
  getPatientPrescriptions: (patientId) => {
    return prescriptions.filter(pres => pres.patientId === patientId);
  },
  
  // Get prescriptions by doctor ID
  getDoctorPrescriptions: (doctorId) => {
    return prescriptions.filter(pres => pres.doctorId === doctorId);
  },
  
  // Manual save function to force saving all collections
  saveAllData: () => {
    console.log('[DB] Saving all collections to disk...');
    try {
      saveCollection('users', users);
      saveCollection('appointments', appointments);
      saveCollection('reviews', reviews);
      saveCollection('prescriptions', prescriptions);
      console.log('[DB] All collections saved to disk');
    } catch (error) {
      console.error('[DB] Error saving collections:', error);
    }
  }
};

// Move this after the store object is fully defined to avoid any reference issues
setTimeout(() => {
  // Save initial data after server has fully started
  store.saveAllData();
  console.log('[DB] Initial data saved to disk');
}, 1000);

module.exports = store;
