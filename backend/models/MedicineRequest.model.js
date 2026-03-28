const mongoose = require('mongoose');

const medicineRequestSchema = new mongoose.Schema(
  {
    // Core references
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional - for doctor_verification type

    // Request identification
    requestNumber: { type: String, unique: true },

    // Request type
    requestType: {
      type: String,
      enum: ['manual_upload', 'doctor_verification'],
      required: true,
    },

    // Status workflow
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected', 'expired', 'cancelled'],
      default: 'pending',
    },

    // Patient snapshot at request time (for historical accuracy - follows Prescription pattern)
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

    // Medicine details
    medicines: [
      {
        name: { type: String, required: true },
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String,
      },
    ],

    // Uploaded prescription file (for manual_upload type)
    uploadedPrescription: {
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number,
      uploadedAt: Date,
    },

    // Doctor verification data (for doctor_verification type)
    doctorVerification: {
      verifiedAt: Date,
      notes: String,
      signature: { type: Boolean, default: false },
    },

    // Doctor snapshot when verified
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

    // Generated PDF path
    generatedPdf: String,

    // Additional notes from patient
    patientNotes: String,

    // Rejection reason (if rejected)
    rejectionReason: String,

    // Fields that were newly filled (for profile sync suggestion)
    newlyFilledFields: [String],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Auto-generate request number before saving
medicineRequestSchema.pre('save', async function (next) {
  if (!this.requestNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.requestNumber = `MR-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index for faster queries
medicineRequestSchema.index({ patient: 1, createdAt: -1 });
medicineRequestSchema.index({ doctor: 1, createdAt: -1 });
medicineRequestSchema.index({ status: 1 });
// Note: requestNumber already has unique:true which creates an index automatically

module.exports = mongoose.model('MedicineRequest', medicineRequestSchema);
