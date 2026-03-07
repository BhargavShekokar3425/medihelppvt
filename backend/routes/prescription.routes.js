const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription.model');
const { protect, authorize } = require('../middleware/auth');

// GET /api/prescriptions — user's prescriptions
router.get('/', protect, async (req, res, next) => {
  try {
    const filter = req.user.role === 'doctor'
      ? { doctor: req.user._id }
      : { patient: req.user._id };

    const prescriptions = await Prescription.find(filter)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (err) {
    next(err);
  }
});

// POST /api/prescriptions — doctor creates prescription
router.post('/', protect, authorize('doctor'), async (req, res, next) => {
  try {
    const { patientId, diagnosis, medications, tests, notes } = req.body;
    if (!patientId || !medications || medications.length === 0) {
      return res.status(400).json({ success: false, message: 'patientId and medications are required.' });
    }

    const prescription = await Prescription.create({
      patient: patientId,
      doctor: req.user._id,
      diagnosis,
      medications,
      tests,
      notes,
    });

    res.status(201).json(prescription);
  } catch (err) {
    next(err);
  }
});

// PUT /api/prescriptions/:id/status
router.put('/:id/status', protect, async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ message: 'Prescription not found.' });

    prescription.status = req.body.status;
    await prescription.save();
    res.json(prescription);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
