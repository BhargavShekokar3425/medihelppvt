const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  address: String,
  contact: String,
  email: { type: String, required: true },         // Primary email — REQUIRED for SOS alerts
  emergencyEmails: [String],                        // Additional emails that receive SOS
  emergencyContacts: [String],                      // Phone numbers for SMS alerts
  location: {
    latitude: Number,
    longitude: Number,
  },
  type: { type: String, enum: ['primary', 'secondary', 'tertiary'], default: 'primary' },
  services: [String],
  operatingHours: { type: String, default: '24x7' },
  acceptingEmergencies: { type: Boolean, default: true }, // Whether hospital is currently accepting
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = mongoose.model('Hospital', hospitalSchema);
