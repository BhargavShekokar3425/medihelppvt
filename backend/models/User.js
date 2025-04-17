const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['patient', 'doctor', 'pharmacy'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  profile: {
    // Common fields
    contactNumber: String,
    address: String,
    
    // Patient-specific fields
    age: Number,
    gender: String,
    bloodGroup: String,
    medicalHistory: [String],
    emergencyContact: String,
    
    // Doctor-specific fields
    specialization: String,
    qualifications: [String],
    experience: String,
    workingHours: String,
    hospitalAffiliation: String,
    languages: [String],
    patientsSeen: Number,
    
    // Pharmacy-specific fields
    licenseNumber: String,
    operatingHours: String,
    pharmacistOnDuty: String,
    servicesOffered: [String],
    establishedYear: Number
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password validity
userSchema.methods.isValidPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Method to return user data without sensitive information
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
