const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['patient', 'doctor', 'pharmacy', 'admin'], default: 'patient' },

  // Profile
  phone: String,
  address: String,
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  profileImage: String,
  avatar: String,                               // Alias for profileImage
  bio: String,                                   // Short bio/description

  // Location for geo-queries
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    city: String,
    state: String,
    country: { type: String, default: 'India' },
    pincode: String,
    formattedAddress: String
  },

  // Doctor-specific
  specialization: String,
  experience: Number,
  qualifications: [String],
  consultationFee: Number,
  availableSlots: [String],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  
  // Doctor clinic/hospital info
  clinic: {
    name: String,
    address: String,
    phone: String,
    email: String,
    timings: String,                            // e.g., "Mon-Fri 9AM-6PM"
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    }
  },
  
  // Doctor availability settings
  workingDays: {
    type: [String],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  workingHours: {
    start: { type: String, default: '09:00 AM' },
    end: { type: String, default: '06:00 PM' }
  },
  slotDuration: { type: Number, default: 30 },  // Minutes per slot
  breakTime: {
    start: { type: String, default: '01:00 PM' },
    end: { type: String, default: '02:00 PM' }
  },
  blockedSlots: [{                              // Doctor can block specific slots
    date: String,
    timeSlot: String,
    reason: String
  }],
  
  // Languages spoken (useful for patients)
  languages: { type: [String], default: ['English', 'Hindi'] },

  // Patient-specific
  bloodGroup: String,
  allergies: [String],
  medicalConditions: [String],
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  
  // Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  lastActive: Date,
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Geospatial index for location-based queries
userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ 'clinic.location.coordinates': '2dsphere' });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ 'location.city': 1, role: 1 });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Strip password from JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
