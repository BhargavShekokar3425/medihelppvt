const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  diagnosis: String,
  prescriptionDate: {
    type: Date,
    default: Date.now
  },
  validUntil: Date,
  medications: [{
    name: {
      type: String,
      required: true
    },
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String,
    quantity: Number
  }],
  tests: [{
    name: String,
    instructions: String
  }],
  notes: String,
  refills: {
    type: Number,
    default: 0
  },
  refillsUsed: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'filled', 'expired', 'cancelled'],
    default: 'active'
  },
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  filledDate: Date,
  filledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  digitalSignature: String,
  isElectronic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
