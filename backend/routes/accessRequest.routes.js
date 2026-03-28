const express = require('express');
const router = express.Router();
const AccessRequest = require('../models/AccessRequest.model');
const User = require('../models/User.model');
const { protect, authorize } = require('../middleware/auth');

// GET /api/access-requests — list access requests for current user
router.get('/', protect, async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role === 'patient') {
      // Patients see requests made TO them
      filter.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      // Doctors see requests they made
      filter.doctor = req.user._id;
    }

    const requests = await AccessRequest.find(filter)
      .populate('patient', 'name email avatar')
      .populate('doctor', 'name specialization avatar clinic')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    next(err);
  }
});

// GET /api/access-requests/:id — get single access request
router.get('/:id', protect, async (req, res, next) => {
  try {
    const request = await AccessRequest.findById(req.params.id)
      .populate('patient', 'name email phone avatar')
      .populate('doctor', 'name specialization qualifications phone clinic avatar');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Access request not found.' });
    }

    // Check authorization
    const isPatient = req.user._id.equals(request.patient._id);
    const isDoctor = req.user._id.equals(request.doctor._id);
    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    res.json(request);
  } catch (err) {
    next(err);
  }
});

// POST /api/access-requests — doctor requests access to patient data
router.post('/', protect, authorize('doctor'), async (req, res, next) => {
  try {
    const { patientId, requestedFields, reason, doctorNotes, expiresAt } = req.body;

    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient ID is required.' });
    }

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Reason is required.' });
    }

    // Verify patient exists
    const patient = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    // Check if there's already a pending request
    const existingPending = await AccessRequest.findOne({
      doctor: req.user._id,
      patient: patientId,
      status: 'pending',
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending access request for this patient.',
      });
    }

    // Create doctor snapshot
    const doctor = await User.findById(req.user._id);
    const doctorSnapshot = {
      name: doctor.name,
      specialization: doctor.specialization,
      clinic: doctor.clinic?.name || '',
    };

    const accessRequest = await AccessRequest.create({
      doctor: req.user._id,
      patient: patientId,
      requestedFields: requestedFields || ['fullMedicalHistory'],
      reason,
      doctorNotes,
      expiresAt,
      doctorSnapshot,
    });

    // Emit socket event to notify patient
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${patientId}`).emit('accessRequest:new', {
        request: accessRequest,
        doctor: {
          name: doctor.name,
          specialization: doctor.specialization,
          avatar: doctor.avatar || doctor.profileImage,
        },
      });
    }

    const populated = await AccessRequest.findById(accessRequest._id)
      .populate('patient', 'name email avatar')
      .populate('doctor', 'name specialization avatar');

    res.status(201).json(populated);
  } catch (err) {
    // Handle unique constraint error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending access request for this patient.',
      });
    }
    next(err);
  }
});

// PUT /api/access-requests/:id/respond — patient responds to access request
router.put('/:id/respond', protect, authorize('patient'), async (req, res, next) => {
  try {
    const { status, patientNotes } = req.body;

    if (!status || !['approved', 'denied'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved or denied.',
      });
    }

    const request = await AccessRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Access request not found.' });
    }

    // Verify this patient owns the request
    if (!req.user._id.equals(request.patient)) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Can only respond to pending requests
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been responded to.',
      });
    }

    request.status = status;
    request.patientNotes = patientNotes;
    request.respondedAt = new Date();

    await request.save();

    // Emit socket event to notify doctor
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${request.doctor}`).emit('accessRequest:response', {
        requestId: request._id,
        status: request.status,
        patientId: request.patient,
      });
    }

    res.json(request);
  } catch (err) {
    next(err);
  }
});

// GET /api/access-requests/check/:patientId — check if doctor has approved access
router.get('/check/:patientId', protect, authorize('doctor'), async (req, res, next) => {
  try {
    const approvedAccess = await AccessRequest.findOne({
      doctor: req.user._id,
      patient: req.params.patientId,
      status: 'approved',
      $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
    });

    res.json({
      hasAccess: !!approvedAccess,
      accessRequest: approvedAccess,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/access-requests/pending/count — get count of pending requests (for notifications)
router.get('/pending/count', protect, async (req, res, next) => {
  try {
    let filter = { status: 'pending' };

    if (req.user.role === 'patient') {
      filter.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      filter.doctor = req.user._id;
    }

    const count = await AccessRequest.countDocuments(filter);
    res.json({ count });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
