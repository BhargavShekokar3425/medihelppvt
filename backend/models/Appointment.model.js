const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: String,
  patientPhone: String,
  patientEmail: String,
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName: String,
  date: { type: String, required: true },       // 'YYYY-MM-DD'
  timeSlot: { type: String, required: true },    // '09:00 AM'
  endTimeSlot: String,                           // '09:30 AM' - calculated from duration
  duration: { type: Number, default: 30 },       // Duration in minutes (default 30 min)
  reason: { type: String, default: 'General consultation' },
  symptoms: [String],                            // List of symptoms
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected', 'rescheduled'],
    default: 'pending'
  },
  notes: String,
  doctorNotes: String,                           // Private notes from doctor
  
  // Rescheduling support
  rescheduledFrom: {
    date: String,
    timeSlot: String,
    reason: String
  },
  suggestedSlots: [{                             // Doctor can suggest alternative slots
    date: String,
    timeSlot: String
  }],
  
  // Tracking
  confirmedAt: Date,
  confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelledAt: Date,
  cancellationReason: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // For patient reference
  clinicName: String,
  clinicAddress: String,
  clinicPhone: String,
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Calculate end time slot based on duration
appointmentSchema.pre('save', function(next) {
  if (this.timeSlot && this.duration) {
    const [time, period] = this.timeSlot.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes;
    if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
    if (period === 'AM' && hours === 12) totalMinutes = minutes;
    
    totalMinutes += this.duration;
    let endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    const endPeriod = endHours >= 12 ? 'PM' : 'AM';
    if (endHours > 12) endHours -= 12;
    if (endHours === 0) endHours = 12;
    
    this.endTimeSlot = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')} ${endPeriod}`;
  }
  next();
});

// Compound index to prevent double-booking
appointmentSchema.index(
  { doctor: 1, date: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: { $nin: ['cancelled', 'rejected'] } } }
);

// Index for efficient queries
appointmentSchema.index({ patient: 1, date: 1 });
appointmentSchema.index({ doctor: 1, date: 1, status: 1 });
appointmentSchema.index({ status: 1, date: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
