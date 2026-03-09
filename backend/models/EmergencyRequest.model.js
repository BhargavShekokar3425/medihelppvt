const mongoose = require('mongoose');

const emergencyRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  // The hospital that accepted (first-to-accept wins)
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  // All hospitals that were notified
  notifiedHospitals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' }],
  // Track which hospitals were emailed successfully
  emailResults: [{
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    email: String,
    sent: Boolean,
    error: String,
    sentAt: Date,
  }],
  status: {
    type: String,
    enum: ['created', 'notified', 'acknowledged', 'dispatched', 'resolved', 'cancelled'],
    default: 'created',
  },
  emergencyType: { type: String, enum: ['medical', 'accident', 'other'], default: 'medical' },
  description: String,
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' }, // First hospital to accept
  acceptedAt: Date,
  resolvedAt: Date,
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = mongoose.model('EmergencyRequest', emergencyRequestSchema);
