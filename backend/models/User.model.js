const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'pharmacy', 'admin'],
    default: 'patient'
  },
  avatar: String,
  contactNumber: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Patient specific fields
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  allergies: [String],
  medicalConditions: [String],
  emergencyContacts: [{
    name: String,
    relationship: String,
    contactNumber: String
  }],
  
  // Doctor specific fields
  specialization: String,
  qualifications: [String],
  experience: Number, // in years
  licenseNumber: String,
  availabilitySchedule: {
    monday: { start: String, end: String, isAvailable: Boolean },
    tuesday: { start: String, end: String, isAvailable: Boolean },
    wednesday: { start: String, end: String, isAvailable: Boolean },
    thursday: { start: String, end: String, isAvailable: Boolean },
    friday: { start: String, end: String, isAvailable: Boolean },
    saturday: { start: String, end: String, isAvailable: Boolean },
    sunday: { start: String, end: String, isAvailable: Boolean }
  },
  consultationFee: Number,
  hospitalAffiliations: [String],
  languages: [String],
  
  // Pharmacy specific fields
  pharmacyName: String,
  pharmacistName: String,
  pharmacyLicenseNumber: String,
  operatingHours: {
    monday: { open: String, close: String, isOpen: Boolean },
    tuesday: { open: String, close: String, isOpen: Boolean },
    wednesday: { open: String, close: String, isOpen: Boolean },
    thursday: { open: String, close: String, isOpen: Boolean },
    friday: { open: String, close: String, isOpen: Boolean },
    saturday: { open: String, close: String, isOpen: Boolean },
    sunday: { open: String, close: String, isOpen: Boolean }
  },
  servicesOffered: [String],
  deliveryAvailable: Boolean,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
