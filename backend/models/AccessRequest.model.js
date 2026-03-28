const mongoose = require('mongoose');

const accessRequestSchema = new mongoose.Schema(
  {
    // Doctor requesting access
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Patient whose data is being requested
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Status of the request
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied', 'expired'],
      default: 'pending',
    },

    // Specific fields/data types being requested
    requestedFields: [
      {
        type: String,
        enum: [
          'fullMedicalHistory',
          'allergies',
          'medicalConditions',
          'prescriptionHistory',
          'testReports',
          'emergencyContacts',
        ],
      },
    ],

    // Reason for requesting access
    reason: { type: String, required: true },

    // Doctor's notes when making request
    doctorNotes: String,

    // Patient's response notes (if any)
    patientNotes: String,

    // When the patient responded
    respondedAt: Date,

    // Access expiry (optional - for time-limited access)
    expiresAt: Date,

    // Snapshot of doctor info at request time
    doctorSnapshot: {
      name: String,
      specialization: String,
      clinic: String,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Index for faster queries
accessRequestSchema.index({ doctor: 1, status: 1 });
accessRequestSchema.index({ patient: 1, status: 1 });
accessRequestSchema.index({ createdAt: -1 });

// Compound index to prevent duplicate pending requests
accessRequestSchema.index(
  { doctor: 1, patient: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'pending' },
  }
);

module.exports = mongoose.model('AccessRequest', accessRequestSchema);
