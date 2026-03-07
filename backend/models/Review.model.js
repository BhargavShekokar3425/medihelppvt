const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional for app reviews
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, default: '' },
  content: { type: String, default: '' },
  reviewType: { type: String, enum: ['doctor', 'app'], default: 'doctor' },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// One review per patient per doctor (only for doctor reviews)
reviewSchema.index(
  { patient: 1, doctor: 1 },
  { unique: true, partialFilterExpression: { doctor: { $exists: true, $ne: null } } }
);

module.exports = mongoose.model('Review', reviewSchema);
