const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name can not be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'pharmacy', 'admin'],
    default: 'patient'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  dob: {
    type: Date
  },
  address: {
    type: String
  },
  contact: {
    type: String
  },
  bloodGroup: {
    type: String
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', '']
  },
  allergies: {
    type: String
  },
  // Doctor specific fields
  specialization: {
    type: String
  },
  experience: {
    type: String
  },
  qualifications: {
    type: String
  },
  // Pharmacy specific fields
  openingHours: {
    type: String
  },
  avatar: {
    type: String
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate JWT
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Check if password matches
UserSchema.methods.matchPassword = function(enteredPassword) {
  return enteredPassword === this.password; // In a real app, use bcrypt compare here
};

// Update lastSeen whenever user is retrieved
UserSchema.pre('find', function() {
  this.where({ status: 'online' }).updateOne({ lastSeen: Date.now() });
});

module.exports = mongoose.model('User', UserSchema);
