const mongoose = require('mongoose');

const emergencyRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: String
  },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'dispatched', 'resolved', 'cancelled'],
    default: 'pending'
  },
  emergencyType: {
    type: String,
    enum: ['medical', 'accident', 'other'],
    default: 'medical'
  },
  description: String,
  responders: [{
    responder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['notified', 'en-route', 'arrived', 'completed'],
      default: 'notified'
    },
    respondedAt: Date
  }],
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String,
  medicalInfo: {
    bloodGroup: String,
    allergies: [String],
    medicalConditions: [String],
    medications: [String]
  },
  contactedEmergencyServices: {
    type: Boolean,
    default: false
  },
  emergencyContactsNotified: [{
    contact: {
      name: String,
      relationship: String,
      phone: String
    },
    notifiedAt: Date
  }]
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
emergencyRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('EmergencyRequest', emergencyRequestSchema);
