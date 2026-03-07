const mongoose = require('mongoose');

const emergencyRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  status: {
    type: String,
    enum: ['created', 'acknowledged', 'dispatched', 'resolved', 'cancelled'],
    default: 'created',
  },
  emergencyType: { type: String, enum: ['medical', 'accident', 'other'], default: 'medical' },
  description: String,
  resolvedAt: Date,
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = mongoose.model('EmergencyRequest', emergencyRequestSchema);
