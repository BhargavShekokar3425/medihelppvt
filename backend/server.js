const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // In production, use environment variable

// Import in-memory store
const store = require('./data/store');

// Enhanced CORS configuration to specify frontend origin
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5001',
  credentials: true, // Allow cookies to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Authentication middleware with improved error handling
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    console.log('Authentication failed: No token provided');
    return res.status(401).json({ 
      success: false,
      message: 'Authentication required. Please log in.'
    });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Authentication failed: Invalid token');
      return res.status(403).json({ 
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    // Add the decoded user to the request
    req.user = user;
    next();
  });
};

// Root API route
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to MediHelp API',
    version: '1.0.0',
    endpoints: {
      auth: [
        { method: 'POST', path: '/api/auth/login', description: 'Login with email and password' },
        { method: 'POST', path: '/api/auth/register', description: 'Register a new user' }
      ],
      users: [
        { method: 'GET', path: '/api/users/profile', description: 'Get current user profile' },
        { method: 'PUT', path: '/api/users/profile', description: 'Update user profile' },
        { method: 'GET', path: '/api/users/doctors', description: 'Get all doctors' }
      ],
      appointments: [
        { method: 'GET', path: '/api/appointments', description: 'Get user appointments' },
        { method: 'POST', path: '/api/appointments', description: 'Create a new appointment' }
      ],
      health: [
        { method: 'GET', path: '/api/health', description: 'Check API health status' }
      ]
    }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'ok', message: 'Server is running on port ' + PORT });
});

// AUTH ROUTES
// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt from: ${email}`);
  
  const user = store.findUserByEmail(email);
  
  if (!user || user.password !== password) {
    console.log(`Login failed: Invalid credentials for ${email}`);
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Create JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  // Remove password before sending
  const { password: _, ...userWithoutPassword } = user;
  
  console.log(`User logged in successfully: ${email}`);
  res.json({
    token,
    user: userWithoutPassword
  });
});

// Register
app.post('/api/auth/register', (req, res) => {
  const { email, password, role = 'patient', ...userData } = req.body;
  console.log(`New user registration: ${email} (${role})`);
  
  // Check if user already exists
  if (store.findUserByEmail(email)) {
    console.log(`Registration failed: Email ${email} already registered`);
    return res.status(400).json({ message: 'Email already registered' });
  }
  
  // Create new user
  const newUser = store.createUser({
    email,
    password, // In production, hash this password
    role,
    ...userData
  });
  
  // Create JWT token
  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  // Remove password before sending
  const { password: _, ...userWithoutPassword } = newUser;
  
  console.log(`User registered successfully: ${email} (ID: ${newUser.id})`);
  res.status(201).json({
    token,
    user: userWithoutPassword
  });
});

// USER ROUTES
// Get current user profile
app.get('/api/users/profile', authenticateToken, (req, res) => {
  const user = store.findUserById(req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Remove password before sending
  const { password: _, ...userWithoutPassword } = user;
  
  res.json(userWithoutPassword);
});

// Update user profile
app.put('/api/users/profile', authenticateToken, (req, res) => {
  const { password, role, ...updateData } = req.body;
  
  // Prevent changing password or role through this endpoint
  const updatedUser = store.updateUser(req.user.id, updateData);
  
  if (!updatedUser) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Remove password before sending
  const { password: _, ...userWithoutPassword } = updatedUser;
  
  res.json(userWithoutPassword);
});

// Get all doctors
app.get('/api/users/doctors', (req, res) => {
  try {
    // Filter users to get only doctors
    const doctors = store.users.filter(user => user.role === 'doctor').map(doctor => {
      // Remove sensitive info before sending
      const { password, ...doctorData } = doctor;
      return doctorData;
    });
    
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Failed to fetch doctors', success: false });
  }
});

// APPOINTMENT ROUTES (simplified)
app.get('/api/appointments', authenticateToken, (req, res) => {
  console.log(`Getting appointments for user ID: ${req.user.id}`);
  
  const userAppointments = store.appointments.filter(apt => 
    apt.patientId === req.user.id || apt.doctorId === req.user.id
  );
  
  res.json(userAppointments);
});

// Check if a time slot is available for a doctor
app.get('/api/appointments/check-availability', authenticateToken, (req, res) => {
  // Fix parameter handling - check for both direct and nested params
  const doctorId = req.query.doctorId || (req.query.params && req.query.params.doctorId);
  const date = req.query.date || (req.query.params && req.query.params.date);
  const timeSlot = req.query.timeSlot || (req.query.params && req.query.params.timeSlot);
  
  console.log('Received parameters:', { doctorId, date, timeSlot });
  
  if (!doctorId || !date || !timeSlot) {
    return res.status(400).json({ 
      message: 'Missing required parameters',
      available: false,
      received: req.query
    });
  }
  
  console.log(`Checking availability for doctor ${doctorId} on ${date} at ${timeSlot}`);
  
  // Check if the time slot is already taken
  const isBooked = store.appointments.some(apt => 
    apt.doctorId === doctorId && 
    apt.date === date && 
    apt.timeSlot === timeSlot &&
    apt.status !== 'cancelled'
  );
  
  res.json({ 
    available: !isBooked,
    doctorId,
    date,
    timeSlot
  });
});

// Create a new appointment with locking mechanism and improved validation
app.post('/api/appointments', authenticateToken, async (req, res) => {
  console.log('Received appointment data:', req.body);
  const { doctorId, date, timeSlot, reason } = req.body;
  
  // Enhanced validation with detailed errors
  const missingParams = [];
  if (!doctorId) missingParams.push('doctorId');
  if (!date) missingParams.push('date');
  if (!timeSlot) missingParams.push('timeSlot');
  
  if (missingParams.length > 0) {
    console.error(`Missing required parameters: ${missingParams.join(', ')}`);
    return res.status(400).json({ 
      success: false,
      message: `Missing required parameters: ${missingParams.join(', ')}` 
    });
  }
  
  console.log(`Attempting to create appointment for doctor ${doctorId} on ${date} at ${timeSlot}`);
  
  try {
    // Validate doctor exists
    const doctor = store.findUserById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ 
        success: false,
        message: 'Doctor not found' 
      });
    }
    
    // Check if this time slot is already taken (prevent race conditions)
    const isAvailable = store.isTimeSlotAvailable(doctorId, date, timeSlot);
    if (!isAvailable) {
      return res.status(409).json({ 
        success: false,
        message: 'This time slot is no longer available' 
      });
    }
    
    // Check if patient already has an appointment at this time
    const hasConflict = store.hasPatientConflict(req.user.id, date, timeSlot);
    if (hasConflict) {
      return res.status(409).json({ 
        success: false,
        message: 'You already have another appointment at this time' 
      });
    }
    
    // Create the appointment using store method
    const newAppointment = store.createAppointment({
      patientId: req.user.id,
      patientName: store.findUserById(req.user.id)?.name || 'Unknown Patient',
      doctorId,
      doctorName: doctor.name || 'Unknown Doctor',
      date,
      timeSlot,
      reason: reason || 'General consultation',
      status: 'pending'
    });
    
    console.log(`Appointment created successfully: ${newAppointment.id}`);
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while creating appointment' 
    });
  }
});

// Create a new endpoint for doctors to book appointments for patients
app.post('/api/appointments/doctor-book', authenticateToken, async (req, res) => {
  // Ensure the requester is a doctor
  if (req.user.role !== 'doctor') {
    return res.status(403).json({
      success: false,
      message: 'Only doctors can use this endpoint'
    });
  }
  
  console.log('Doctor booking appointment for patient:', req.body);
  const { patientId, date, timeSlot, reason } = req.body;
  
  // Enhanced validation with detailed errors
  const missingParams = [];
  if (!patientId) missingParams.push('patientId');
  if (!date) missingParams.push('date');
  if (!timeSlot) missingParams.push('timeSlot');
  
  if (missingParams.length > 0) {
    console.error(`Missing required parameters: ${missingParams.join(', ')}`);
    return res.status(400).json({ 
      success: false,
      message: `Missing required parameters: ${missingParams.join(', ')}` 
    });
  }
  
  try {
    // Validate patient exists
    const patient = store.findUserById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ 
        success: false,
        message: 'Patient not found' 
      });
    }
    
    // Doctor ID is the logged-in doctor
    const doctorId = req.user.id;
    
    // Check if this time slot is already taken
    const isBooked = store.appointments.some(apt => 
      apt.doctorId === doctorId && 
      apt.date === date && 
      apt.timeSlot === timeSlot &&
      apt.status !== 'cancelled'
    );
    
    if (isBooked) {
      return res.status(409).json({ 
        success: false,
        message: 'This time slot is no longer available' 
      });
    }
    
    // Check if patient already has an appointment at this time
    const hasConflict = store.appointments.some(apt => 
      apt.patientId === patientId && 
      apt.date === date && 
      apt.timeSlot === timeSlot &&
      apt.status !== 'cancelled'
    );
    
    if (hasConflict) {
      return res.status(409).json({ 
        success: false,
        message: 'Patient already has another appointment at this time' 
      });
    }
    
    // Create the appointment
    const newAppointment = {
      id: Date.now().toString(),
      patientId: patientId,
      patientName: patient.name || 'Unknown Patient',
      doctorId,
      doctorName: req.user.name || 'Unknown Doctor',
      date,
      timeSlot,
      reason: reason || 'Appointment booked by doctor',
      status: 'confirmed', // Doctor-created appointments are automatically confirmed
      createdAt: new Date().toISOString(),
      createdBy: req.user.id
    };
    
    // Add to appointments store
    store.appointments.push(newAppointment);
    
    console.log(`Doctor-created appointment successfully: ${newAppointment.id}`);
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Error creating doctor-booked appointment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while creating appointment' 
    });
  }
});

// Add an endpoint for doctors to get their patient list
app.get('/api/users/patients', authenticateToken, (req, res) => {
  try {
    // Only doctors can access this endpoint
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can use this endpoint'
      });
    }
    
    // Find all users who are patients and simplify the response
    const patients = store.users
      .filter(user => user.role === 'patient')
      .map(patient => {
        const { password, ...patientWithoutPassword } = patient;
        return patientWithoutPassword;
      });
    
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient list'
    });
  }
});

// Add a doctor-specific appointments endpoint
app.get('/api/appointments/doctor', authenticateToken, (req, res) => {
  try {
    // Only doctors can access this endpoint
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can use this endpoint'
      });
    }
    
    // Get appointments for this doctor and include patient details
    const doctorAppointments = store.appointments
      .filter(apt => apt.doctorId === req.user.id)
      .map(apt => {
        // Find the patient and include relevant details
        const patient = store.findUserById(apt.patientId);
        let patientDetails = null;
        
        if (patient) {
          const { password, ...patientWithoutPassword } = patient;
          patientDetails = patientWithoutPassword;
        }
        
        return {
          ...apt,
          patient: patientDetails
        };
      });
    
    res.json(doctorAppointments);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
});

// Update an appointment
app.put('/api/appointments/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  
  // Find the appointment
  const appointmentIndex = store.appointments.findIndex(apt => apt.id === id);
  
  if (appointmentIndex === -1) {
    return res.status(404).json({ message: 'Appointment not found' });
  }
  
  // Check authorization (only the doctor, patient, or admin can update)
  const appointment = store.appointments[appointmentIndex];
  
  if (req.user.id !== appointment.patientId && 
      req.user.id !== appointment.doctorId && 
      req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to update this appointment' });
  }
  
  // Update the appointment
  const updatedAppointment = {
    ...appointment,
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  // Special case: if changing status to cancelled, free up the time slot
  if (status === 'cancelled' && appointment.status !== 'cancelled') {
    console.log(`Appointment ${id} cancelled, freeing time slot`);
  }
  
  // Save the updated appointment
  store.appointments[appointmentIndex] = updatedAppointment;
  
  console.log(`Appointment ${id} updated successfully`);
  res.json(updatedAppointment);
});

// Cancel an appointment
app.delete('/api/appointments/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  // Find the appointment
  const appointment = store.getAppointmentById(id);
  
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }
  
  // Check authorization (only the doctor, patient, or admin can cancel)
  if (req.user.id !== appointment.patientId && 
      req.user.id !== appointment.doctorId && 
      req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
  }
  
  // Update status to cancelled instead of removing
  const updatedAppointment = store.updateAppointment(id, {
    status: 'cancelled',
    cancelledBy: req.user.id,
    cancelledAt: new Date().toISOString()
  });
  
  console.log(`Appointment ${id} cancelled successfully`);
  res.json({ 
    message: 'Appointment cancelled successfully',
    appointment: updatedAppointment
  });
});

// Get all booked slots for a doctor (for calendar display)
app.get('/api/appointments/booked-slots/:doctorId', authenticateToken, (req, res) => {
  const { doctorId } = req.params;
  const { startDate, endDate } = req.query;
  
  // Filter appointments by doctor and date range
  let bookedSlots = store.appointments.filter(apt => 
    apt.doctorId === doctorId && 
    apt.status !== 'cancelled'
  );
  
  // Apply date filters if provided
  if (startDate) {
    bookedSlots = bookedSlots.filter(apt => apt.date >= startDate);
  }
  
  if (endDate) {
    bookedSlots = bookedSlots.filter(apt => apt.date <= endDate);
  }
  
  // Format response to include only necessary fields
  const formattedSlots = bookedSlots.map(apt => ({
    date: apt.date,
    timeSlot: apt.timeSlot,
    appointmentId: apt.id,
    doctorName: apt.doctorName,
    patientName: apt.patientName,
    status: apt.status
  }));
  
  res.json(formattedSlots);
});

// REVIEW ROUTES
// Get all public reviews with pagination
app.get('/api/reviews', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  try {
    const publicReviews = store.getPublicReviews(parseInt(page), parseInt(limit));
    res.json(publicReviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

// Get reviews for a specific doctor
app.get('/api/reviews/doctor/:doctorId', (req, res) => {
  const { doctorId } = req.params;
  
  try {
    const doctorReviews = store.getDoctorReviews(doctorId);
    res.json(doctorReviews);
  } catch (error) {
    console.error(`Error fetching reviews for doctor ${doctorId}:`, error);
    res.status(500).json({ message: 'Failed to fetch doctor reviews' });
  }
});

// Get reviews for the app
app.get('/api/reviews/app', (req, res) => {
  try {
    const appReviews = store.getAppReviews();
    res.json(appReviews);
  } catch (error) {
    console.error('Error fetching app reviews:', error);
    res.status(500).json({ message: 'Failed to fetch app reviews' });
  }
});

// Add a new review
app.post('/api/reviews', authenticateToken, (req, res) => {
  const { doctorId, rating, title, content, reviewType = 'doctor' } = req.body;
  
  // Validate required fields
  if (!rating || !title || !content) {
    return res.status(400).json({ message: 'Rating, title and content are required' });
  }
  
  try {
    // Get author data
    const author = store.findUserById(req.user.id);
    
    if (!author) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    let doctor = null;
    let newReview;
    
    // Create the review object based on review type
    if (reviewType === 'doctor' && doctorId) {
      // Find the doctor
      doctor = store.findUserById(doctorId);
      
      if (!doctor || doctor.role !== 'doctor') {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      
      newReview = store.createReview({
        reviewType: 'doctor',
        doctorId,
        doctor: {
          id: doctor.id,
          name: doctor.name,
          specialization: doctor.specialization || 'General Practice',
          avatar: doctor.avatar
        },
        authorId: author.id,
        author: {
          id: author.id,
          name: author.name,
          avatar: author.avatar
        },
        rating: parseInt(rating),
        title,
        content,
        isPublic: true
      });
    } else {
      // General app review
      newReview = store.createReview({
        reviewType: 'app',
        authorId: author.id,
        author: {
          id: author.id,
          name: author.name,
          avatar: author.avatar
        },
        rating: parseInt(rating),
        title,
        content,
        isPublic: true
      });
    }
    
    console.log(`New ${newReview.reviewType} review added by user ${author.id}`);
    res.status(201).json(newReview);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Failed to add review' });
  }
});

// Update a review (only the author can update)
app.put('/api/reviews/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { rating, title, content } = req.body;
  
  try {
    // Find the review
    const existingReview = store.reviews.find(rev => rev.id === id);
    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if the user is the author
    if (existingReview.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }
    
    // Update the review
    const updatedReview = store.updateReview(id, {
      rating: rating !== undefined ? parseInt(rating) : existingReview.rating,
      title: title || existingReview.title,
      content: content || existingReview.content
    });
    
    console.log(`Review ${id} updated by user ${req.user.id}`);
    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Failed to update review' });
  }
});

// Delete a review (only the author can delete)
app.delete('/api/reviews/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  try {
    // Find the review
    const review = store.reviews.find(rev => rev.id === id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if the user is the author
    if (review.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    
    // Delete the review
    const deletedReview = store.deleteReview(id);
    
    console.log(`Review ${id} deleted by user ${req.user.id}`);
    res.json({ message: 'Review deleted successfully', review: deletedReview });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Failed to delete review' });
  }
});

// Catch-all for unknown API routes
app.all('/api/*', (req, res) => {
  console.log(`404: Endpoint not found - ${req.method} ${req.url}`);
  res.status(404).json({ message: 'API endpoint not found' });
});

// Handle graceful shutdown to ensure data is saved
process.on('SIGINT', () => {
  console.log('Server shutting down, saving data...');
  store.saveAllData();
  // Give enough time to save data before exiting
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

process.on('SIGTERM', () => {
  console.log('Server terminated, saving data...');
  store.saveAllData();
  // Give enough time to save data before exiting
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

// Unhandled exception handler to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  store.saveAllData();
  // In production, you might want to exit the process here
  // For development, we'll keep the server running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, you might want to exit the process here
  // For development, we'll keep the server running
});

// Start server
app.listen(PORT, () => {
  console.log(`
======================================================
🚀 Server running on port ${PORT}
📡 API available at http://localhost:${PORT}/api
✅ Accepting requests from: ${process.env.FRONTEND_URL || 'http://localhost:5001'}
======================================================
  `);
});
