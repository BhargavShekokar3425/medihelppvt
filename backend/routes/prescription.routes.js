const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription.model');
const User = require('../models/User.model');
const { protect, authorize } = require('../middleware/auth');
const { generatePrescriptionPDF } = require('../services/pdfService');

// GET /api/prescriptions — user's prescriptions
router.get('/', protect, async (req, res, next) => {
  try {
    const filter =
      req.user.role === 'doctor' ? { doctor: req.user._id } : { patient: req.user._id };

    const prescriptions = await Prescription.find(filter)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (err) {
    next(err);
  }
});

// GET /api/prescriptions/:id — single prescription with full details
router.get('/:id', protect, async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate(
        'patient',
        'name email phone bloodGroup gender dateOfBirth allergies medicalConditions address'
      )
      .populate('doctor', 'name specialization qualifications phone clinic');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }

    // Check authorization - only patient, doctor, or admin can view
    const isPatient = req.user._id.equals(prescription.patient._id);
    const isDoctor = req.user._id.equals(prescription.doctor._id);
    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    res.json(prescription);
  } catch (err) {
    next(err);
  }
});

// GET /api/prescriptions/:id/pdf — generate and return PDF
router.get('/:id/pdf', protect, async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate(
        'patient',
        'name email phone bloodGroup gender dateOfBirth allergies medicalConditions address'
      )
      .populate('doctor', 'name specialization qualifications phone clinic');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }

    // Check authorization
    const isPatient = req.user._id.equals(prescription.patient._id);
    const isDoctor = req.user._id.equals(prescription.doctor._id);
    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Use snapshots if available, otherwise use populated data
    const prescriptionData = {
      ...prescription.toObject(),
      patientSnapshot: prescription.patientSnapshot?.name
        ? prescription.patientSnapshot
        : {
            name: prescription.patient?.name,
            email: prescription.patient?.email,
            phone: prescription.patient?.phone,
            dateOfBirth: prescription.patient?.dateOfBirth,
            gender: prescription.patient?.gender,
            bloodGroup: prescription.patient?.bloodGroup,
            allergies: prescription.patient?.allergies,
            medicalConditions: prescription.patient?.medicalConditions,
            address: prescription.patient?.address,
          },
      doctorSnapshot: prescription.doctorSnapshot?.name
        ? prescription.doctorSnapshot
        : {
            name: prescription.doctor?.name,
            specialization: prescription.doctor?.specialization,
            qualifications: prescription.doctor?.qualifications,
            phone: prescription.doctor?.phone,
            clinic: prescription.doctor?.clinic,
          },
    };

    const pdf = await generatePrescriptionPDF(prescriptionData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="prescription-${prescription.prescriptionNumber || prescription._id}.pdf"`
    );
    res.send(pdf);
  } catch (err) {
    console.error('PDF generation error:', err);
    next(err);
  }
});

// POST /api/prescriptions — doctor creates prescription with snapshots
router.post('/', protect, authorize('doctor'), async (req, res, next) => {
  try {
    const { patientId, diagnosis, medications, tests, notes, patientSnapshot, doctorSnapshot } =
      req.body;

    if (!patientId || !medications || medications.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'patientId and medications are required.' });
    }

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    // Build final snapshots (use provided or fetch fresh from DB)
    const finalPatientSnapshot = patientSnapshot || {
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      address: patient.address,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      allergies: patient.allergies || [],
      medicalConditions: patient.medicalConditions || [],
    };

    const finalDoctorSnapshot = doctorSnapshot || {
      name: req.user.name,
      specialization: req.user.specialization,
      qualifications: req.user.qualifications || [],
      phone: req.user.phone,
      clinic: req.user.clinic || {},
    };

    const prescription = await Prescription.create({
      patient: patientId,
      doctor: req.user._id,
      diagnosis,
      medications,
      tests: tests || [],
      notes,
      patientSnapshot: finalPatientSnapshot,
      doctorSnapshot: finalDoctorSnapshot,
    });

    const populated = await Prescription.findById(prescription._id)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

// PUT /api/prescriptions/:id/status — update prescription status
router.put('/:id/status', protect, async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }

    // Check authorization
    const isPatient = req.user._id.equals(prescription.patient);
    const isDoctor = req.user._id.equals(prescription.doctor);
    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    prescription.status = req.body.status;
    await prescription.save();
    res.json(prescription);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
