const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    prescriptionNumber: { type: String, unique: true },
    diagnosis: String,
    medications: [
      {
        name: { type: String, required: true },
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String,
      },
    ],
    tests: [{ name: String, instructions: String }],
    notes: String,
    status: {
      type: String,
      enum: ['active', 'filled', 'expired', 'cancelled'],
      default: 'active',
    },
    // Snapshot of patient data at prescription time (for historical accuracy)
    patientSnapshot: {
      name: String,
      email: String,
      phone: String,
      address: String,
      dateOfBirth: Date,
      gender: String,
      bloodGroup: String,
      allergies: [String],
      medicalConditions: [String],
    },
    // Snapshot of doctor data at prescription time
    doctorSnapshot: {
      name: String,
      specialization: String,
      qualifications: [String],
      phone: String,
      clinic: {
        name: String,
        address: String,
        phone: String,
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Auto-generate prescription number before saving
prescriptionSchema.pre('save', async function (next) {
  if (!this.prescriptionNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.prescriptionNumber = `RX-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index for faster queries
prescriptionSchema.index({ patient: 1, createdAt: -1 });
prescriptionSchema.index({ doctor: 1, createdAt: -1 });
// Note: prescriptionNumber already has unique:true which creates an index automatically

module.exports = mongoose.model('Prescription', prescriptionSchema);
