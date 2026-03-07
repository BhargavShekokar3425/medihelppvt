const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment.model');
const User = require('../models/User.model');
const { protect, authorize } = require('../middleware/auth');

// ============================================
// PATIENT ROUTES
// ============================================

// GET /api/appointments — user's appointments (patient or doctor)
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, startDate, endDate } = req.query;
    const filter = req.user.role === 'doctor'
      ? { doctor: req.user._id }
      : { patient: req.user._id };

    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone bloodGroup gender')
      .populate('doctor', 'name email specialization phone clinic avatar profileImage')
      .sort({ date: 1, timeSlot: 1 });

    res.json(appointments);
  } catch (err) {
    next(err);
  }
});

// GET /api/appointments/upcoming - Get upcoming appointments for current user
router.get('/upcoming', protect, async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const filter = req.user.role === 'doctor'
      ? { doctor: req.user._id }
      : { patient: req.user._id };
    
    filter.date = { $gte: today };
    filter.status = { $in: ['pending', 'confirmed'] };

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization clinic phone avatar')
      .sort({ date: 1, timeSlot: 1 })
      .limit(10);

    res.json(appointments);
  } catch (err) {
    next(err);
  }
});

// GET /api/appointments/doctor-availability/:doctorId - Get doctor's availability for calendar
router.get('/doctor-availability/:doctorId', protect, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const doctorId = req.params.doctorId;

    const doctor = await User.findById(doctorId).select('workingDays workingHours slotDuration breakTime blockedSlots clinic name');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Get all appointments for this doctor in date range
    const filter = { doctor: doctorId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const appointments = await Appointment.find(filter)
      .select('date timeSlot endTimeSlot duration status patient patientName')
      .lean();

    // Build availability map
    const availability = {};
    appointments.forEach(apt => {
      const key = `${apt.date}-${apt.timeSlot}`;
      availability[key] = {
        status: apt.status,
        appointmentId: apt._id,
        patientName: req.user._id.equals(apt.patient) ? apt.patientName : null,
        isOwn: req.user._id.equals(apt.patient),
        duration: apt.duration
      };
    });

    // Add blocked slots
    if (doctor.blockedSlots) {
      doctor.blockedSlots.forEach(slot => {
        if ((!startDate || slot.date >= startDate) && (!endDate || slot.date <= endDate)) {
          const key = `${slot.date}-${slot.timeSlot}`;
          availability[key] = { status: 'blocked', reason: slot.reason };
        }
      });
    }

    res.json({
      doctor: {
        id: doctor._id,
        name: doctor.name,
        workingDays: doctor.workingDays,
        workingHours: doctor.workingHours,
        slotDuration: doctor.slotDuration || 30,
        breakTime: doctor.breakTime,
        clinic: doctor.clinic
      },
      availability
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/appointments/check-availability
router.get('/check-availability', protect, async (req, res, next) => {
  try {
    const { doctorId, date, timeSlot } = req.query;
    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ available: false, message: 'Missing required parameters.' });
    }

    // Check if slot is blocked by doctor
    const doctor = await User.findById(doctorId).select('blockedSlots');
    if (doctor?.blockedSlots?.some(s => s.date === date && s.timeSlot === timeSlot)) {
      return res.json({ available: false, reason: 'blocked' });
    }

    const existing = await Appointment.findOne({
      doctor: doctorId,
      date,
      timeSlot,
      status: { $nin: ['cancelled', 'rejected'] },
    });

    res.json({ 
      available: !existing, 
      doctorId, 
      date, 
      timeSlot,
      existingStatus: existing?.status 
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/appointments/booked-slots/:doctorId
router.get('/booked-slots/:doctorId', protect, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { 
      doctor: req.params.doctorId, 
      status: { $nin: ['cancelled', 'rejected'] } 
    };
    if (startDate) filter.date = { ...filter.date, $gte: startDate };
    if (endDate) filter.date = { ...(filter.date || {}), $lte: endDate };

    const slots = await Appointment.find(filter)
      .select('date timeSlot endTimeSlot duration status doctorName patientName patient')
      .lean();

    // Mark which ones belong to the current user
    const enrichedSlots = slots.map(slot => ({
      ...slot,
      isOwn: req.user._id.equals(slot.patient),
      patientName: req.user._id.equals(slot.patient) ? slot.patientName : undefined
    }));

    res.json(enrichedSlots);
  } catch (err) {
    next(err);
  }
});

// POST /api/appointments — patient creates appointment request
router.post('/', protect, async (req, res, next) => {
  try {
    const { doctorId, date, timeSlot, reason, symptoms, duration } = req.body;

    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'doctorId, date and timeSlot are required.' });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    // Check if slot is blocked
    if (doctor.blockedSlots?.some(s => s.date === date && s.timeSlot === timeSlot)) {
      return res.status(409).json({ success: false, message: 'This time slot is not available.' });
    }

    // Check slot availability
    const booked = await Appointment.findOne({
      doctor: doctorId, date, timeSlot, status: { $nin: ['cancelled', 'rejected'] },
    });
    if (booked) {
      return res.status(409).json({ success: false, message: 'This time slot is no longer available.' });
    }

    // Check patient conflict
    const conflict = await Appointment.findOne({
      patient: req.user._id, date, timeSlot, status: { $nin: ['cancelled', 'rejected'] },
    });
    if (conflict) {
      return res.status(409).json({ success: false, message: 'You already have an appointment at this time.' });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      patientName: req.user.name,
      patientPhone: req.user.phone,
      patientEmail: req.user.email,
      doctor: doctorId,
      doctorName: doctor.name,
      date,
      timeSlot,
      duration: duration || doctor.slotDuration || 30,
      reason: reason || 'General consultation',
      symptoms: symptoms || [],
      status: 'pending',
      clinicName: doctor.clinic?.name,
      clinicAddress: doctor.clinic?.address,
      clinicPhone: doctor.clinic?.phone || doctor.phone,
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('doctor', 'name email specialization clinic avatar');

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

// ============================================
// DOCTOR ROUTES
// ============================================

// GET /api/appointments/doctor — doctor's appointments with full patient details
router.get('/doctor', protect, authorize('doctor'), async (req, res, next) => {
  try {
    const { status, date, startDate, endDate } = req.query;
    const filter = { doctor: req.user._id };
    
    if (status) filter.status = status;
    if (date) filter.date = date;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone bloodGroup gender dateOfBirth allergies medicalConditions')
      .sort({ date: 1, timeSlot: 1 });
    
    res.json(appointments);
  } catch (err) {
    next(err);
  }
});

// GET /api/appointments/doctor/pending — doctor's pending requests
router.get('/doctor/pending', protect, authorize('doctor'), async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ 
      doctor: req.user._id, 
      status: 'pending' 
    })
      .populate('patient', 'name email phone bloodGroup gender')
      .sort({ date: 1, timeSlot: 1 });
    
    res.json(appointments);
  } catch (err) {
    next(err);
  }
});

// GET /api/appointments/doctor/today — doctor's today appointments
router.get('/doctor/today', protect, authorize('doctor'), async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const appointments = await Appointment.find({ 
      doctor: req.user._id, 
      date: today,
      status: { $in: ['confirmed', 'pending'] }
    })
      .populate('patient', 'name email phone bloodGroup gender allergies medicalConditions')
      .sort({ timeSlot: 1 });
    
    res.json(appointments);
  } catch (err) {
    next(err);
  }
});

// PUT /api/appointments/:id/confirm — doctor confirms appointment
router.put('/:id/confirm', protect, authorize('doctor'), async (req, res, next) => {
  try {
    const { duration, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    if (!req.user._id.equals(appointment.doctor)) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    if (appointment.status !== 'pending') {
      return res.status(400).json({ message: 'Can only confirm pending appointments.' });
    }

    appointment.status = 'confirmed';
    appointment.confirmedAt = new Date();
    appointment.confirmedBy = req.user._id;
    if (duration) appointment.duration = duration;
    if (notes) appointment.doctorNotes = notes;
    
    await appointment.save();
    
    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone');
    
    res.json(populated);
  } catch (err) {
    next(err);
  }
});

// PUT /api/appointments/:id/reject — doctor rejects appointment
router.put('/:id/reject', protect, authorize('doctor'), async (req, res, next) => {
  try {
    const { reason, suggestedSlots } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    if (!req.user._id.equals(appointment.doctor)) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    appointment.status = 'rejected';
    appointment.cancellationReason = reason;
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = req.user._id;
    if (suggestedSlots) appointment.suggestedSlots = suggestedSlots;
    
    await appointment.save();
    res.json(appointment);
  } catch (err) {
    next(err);
  }
});

// PUT /api/appointments/:id/reschedule — doctor reschedules appointment
router.put('/:id/reschedule', protect, authorize('doctor'), async (req, res, next) => {
  try {
    const { newDate, newTimeSlot, reason } = req.body;
    
    if (!newDate || !newTimeSlot) {
      return res.status(400).json({ message: 'newDate and newTimeSlot are required.' });
    }

    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    if (!req.user._id.equals(appointment.doctor)) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    // Check if new slot is available
    const conflict = await Appointment.findOne({
      doctor: appointment.doctor,
      date: newDate,
      timeSlot: newTimeSlot,
      status: { $nin: ['cancelled', 'rejected'] },
      _id: { $ne: appointment._id }
    });
    if (conflict) {
      return res.status(409).json({ message: 'New time slot is not available.' });
    }

    // Store old slot info
    appointment.rescheduledFrom = {
      date: appointment.date,
      timeSlot: appointment.timeSlot,
      reason: reason || 'Rescheduled by doctor'
    };
    
    appointment.date = newDate;
    appointment.timeSlot = newTimeSlot;
    appointment.status = 'rescheduled';
    
    await appointment.save();
    
    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone');
    
    res.json(populated);
  } catch (err) {
    next(err);
  }
});

// PUT /api/appointments/:id/complete — doctor marks appointment as completed
router.put('/:id/complete', protect, authorize('doctor'), async (req, res, next) => {
  try {
    const { notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    if (!req.user._id.equals(appointment.doctor)) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    appointment.status = 'completed';
    if (notes) appointment.doctorNotes = notes;
    
    await appointment.save();
    res.json(appointment);
  } catch (err) {
    next(err);
  }
});

// POST /api/appointments/doctor-book — doctor books for patient
router.post('/doctor-book', protect, authorize('doctor'), async (req, res, next) => {
  try {
    const { patientId, date, timeSlot, reason, duration } = req.body;
    if (!patientId || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'patientId, date and timeSlot are required.' });
    }

    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    // Check slot availability
    const conflict = await Appointment.findOne({
      doctor: req.user._id, date, timeSlot, status: { $nin: ['cancelled', 'rejected'] }
    });
    if (conflict) {
      return res.status(409).json({ success: false, message: 'Time slot not available.' });
    }

    const appointment = await Appointment.create({
      patient: patientId,
      patientName: patient.name,
      patientPhone: patient.phone,
      patientEmail: patient.email,
      doctor: req.user._id,
      doctorName: req.user.name,
      date,
      timeSlot,
      duration: duration || req.user.slotDuration || 30,
      reason: reason || 'Appointment booked by doctor',
      status: 'confirmed',
      confirmedAt: new Date(),
      confirmedBy: req.user._id,
      createdBy: req.user._id,
      clinicName: req.user.clinic?.name,
      clinicAddress: req.user.clinic?.address,
      clinicPhone: req.user.clinic?.phone || req.user.phone,
    });

    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
});

// ============================================
// DOCTOR AVAILABILITY MANAGEMENT
// ============================================

// POST /api/appointments/block-slot — doctor blocks a time slot
router.post('/block-slot', protect, authorize('doctor'), async (req, res, next) => {
  try {
    const { date, timeSlot, reason } = req.body;
    
    if (!date || !timeSlot) {
      return res.status(400).json({ message: 'date and timeSlot are required.' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $push: { blockedSlots: { date, timeSlot, reason } }
    });

    res.json({ message: 'Slot blocked successfully.' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/appointments/unblock-slot — doctor unblocks a time slot
router.delete('/unblock-slot', protect, authorize('doctor'), async (req, res, next) => {
  try {
    const { date, timeSlot } = req.body;
    
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { blockedSlots: { date, timeSlot } }
    });

    res.json({ message: 'Slot unblocked successfully.' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/appointments/update-availability — doctor updates working hours
router.put('/update-availability', protect, authorize('doctor'), async (req, res, next) => {
  try {
    const { workingDays, workingHours, slotDuration, breakTime } = req.body;
    
    const update = {};
    if (workingDays) update.workingDays = workingDays;
    if (workingHours) update.workingHours = workingHours;
    if (slotDuration) update.slotDuration = slotDuration;
    if (breakTime) update.breakTime = breakTime;

    const doctor = await User.findByIdAndUpdate(req.user._id, update, { new: true })
      .select('workingDays workingHours slotDuration breakTime');

    res.json(doctor);
  } catch (err) {
    next(err);
  }
});

// ============================================
// SHARED ROUTES
// ============================================

// GET /api/appointments/:id — get single appointment
router.get('/:id', protect, async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone bloodGroup gender allergies medicalConditions')
      .populate('doctor', 'name email specialization phone clinic avatar');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    // Check authorization
    const isOwner = req.user._id.equals(appointment.patient._id) || 
                    req.user._id.equals(appointment.doctor._id) ||
                    req.user.role === 'admin';
    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    res.json(appointment);
  } catch (err) {
    next(err);
  }
});

// PUT /api/appointments/:id — update appointment
router.put('/:id', protect, async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });

    const isOwner =
      req.user._id.equals(appointment.patient) ||
      req.user._id.equals(appointment.doctor) ||
      req.user.role === 'admin';
    if (!isOwner) return res.status(403).json({ message: 'Not authorised.' });

    // Patients can only update certain fields
    if (req.user.role === 'patient') {
      const allowed = ['reason', 'symptoms', 'notes'];
      Object.keys(req.body).forEach(key => {
        if (!allowed.includes(key)) delete req.body[key];
      });
    }

    Object.assign(appointment, req.body);
    await appointment.save();
    
    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization clinic');
    
    res.json(populated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/appointments/:id — cancel appointment
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });

    const isOwner =
      req.user._id.equals(appointment.patient) ||
      req.user._id.equals(appointment.doctor) ||
      req.user.role === 'admin';
    if (!isOwner) return res.status(403).json({ message: 'Not authorised.' });

    appointment.status = 'cancelled';
    appointment.cancelledBy = req.user._id;
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = reason;
    await appointment.save();

    res.json({ message: 'Appointment cancelled successfully.', appointment });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
