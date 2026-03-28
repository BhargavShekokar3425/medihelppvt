const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const MedicineRequest = require('../models/MedicineRequest.model');
const User = require('../models/User.model');
const { protect, authorize } = require('../middleware/auth');
const { generateMedicineRequestPDF } = require('../services/pdfService');

// ---- Multer config for prescription uploads ----
const prescriptionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'prescriptions'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `rx-${req.user._id}-${Date.now()}${ext}`);
  },
});

const uploadPrescription = multer({
  storage: prescriptionStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (extOk && mimeOk) return cb(null, true);
    cb(new Error('Only image files (jpg, png) and PDFs are allowed.'));
  },
});

// GET /api/medicine-requests — list user's requests
router.get('/', protect, async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role === 'patient') {
      filter.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      filter.doctor = req.user._id;
    }

    const requests = await MedicineRequest.find(filter)
      .populate('patient', 'name email phone avatar')
      .populate('doctor', 'name specialization avatar')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    next(err);
  }
});

// GET /api/medicine-requests/doctor/pending — get pending requests for doctor
// NOTE: This route MUST come before /:id to avoid "doctor" being matched as an id
router.get('/doctor/pending', protect, authorize('doctor'), async (req, res, next) => {
  try {
    const requests = await MedicineRequest.find({
      doctor: req.user._id,
      status: 'pending',
    })
      .populate('patient', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    next(err);
  }
});

// GET /api/medicine-requests/:id — get single request
router.get('/:id', protect, async (req, res, next) => {
  try {
    const request = await MedicineRequest.findById(req.params.id)
      .populate('patient', 'name email phone avatar dateOfBirth gender bloodGroup allergies medicalConditions address')
      .populate('doctor', 'name specialization qualifications phone clinic avatar');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    // Check authorization
    const isPatient = req.user._id.equals(request.patient._id);
    const isDoctor = request.doctor && req.user._id.equals(request.doctor._id);
    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    res.json(request);
  } catch (err) {
    next(err);
  }
});

// POST /api/medicine-requests — create new request (patient only)
router.post(
  '/',
  protect,
  authorize('patient'),
  uploadPrescription.single('prescription'),
  async (req, res, next) => {
    try {
      const {
        requestType,
        doctorId,
        medicines,
        patientSnapshot,
        patientNotes,
        newlyFilledFields,
      } = req.body;

      // Validate request type
      if (!requestType || !['manual_upload', 'doctor_verification'].includes(requestType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request type. Must be manual_upload or doctor_verification.',
        });
      }

      // For doctor_verification, doctorId is required
      if (requestType === 'doctor_verification' && !doctorId) {
        return res.status(400).json({
          success: false,
          message: 'Doctor ID is required for doctor verification requests.',
        });
      }

      // For manual_upload, file is required
      if (requestType === 'manual_upload' && !req.file) {
        return res.status(400).json({
          success: false,
          message: 'Prescription file is required for manual upload.',
        });
      }

      // Parse medicines if string
      let parsedMedicines = medicines;
      if (typeof medicines === 'string') {
        try {
          parsedMedicines = JSON.parse(medicines);
        } catch (e) {
          parsedMedicines = [];
        }
      }

      // Parse newlyFilledFields if string
      let parsedNewlyFilledFields = newlyFilledFields;
      if (typeof newlyFilledFields === 'string') {
        try {
          parsedNewlyFilledFields = JSON.parse(newlyFilledFields);
        } catch (e) {
          parsedNewlyFilledFields = [];
        }
      }

      // Parse patientSnapshot if string
      let parsedPatientSnapshot = patientSnapshot;
      if (typeof patientSnapshot === 'string') {
        try {
          parsedPatientSnapshot = JSON.parse(patientSnapshot);
        } catch (e) {
          parsedPatientSnapshot = null;
        }
      }

      // Build patient snapshot from current user if not provided
      const patient = await User.findById(req.user._id);
      const finalPatientSnapshot = parsedPatientSnapshot || {
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

      // Verify doctor exists if doctor_verification
      let doctor = null;
      if (requestType === 'doctor_verification') {
        doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
        if (!doctor) {
          return res.status(404).json({ success: false, message: 'Doctor not found.' });
        }
      }

      // Create the request
      const requestData = {
        patient: req.user._id,
        requestType,
        patientSnapshot: finalPatientSnapshot,
        medicines: parsedMedicines || [],
        patientNotes,
        newlyFilledFields: parsedNewlyFilledFields || [],
      };

      if (requestType === 'doctor_verification') {
        requestData.doctor = doctorId;
      }

      if (req.file) {
        requestData.uploadedPrescription = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          uploadedAt: new Date(),
        };
      }

      const medicineRequest = await MedicineRequest.create(requestData);

      // Emit socket event to notify doctor
      if (requestType === 'doctor_verification' && doctorId) {
        const io = req.app.get('io');
        if (io) {
          io.to(`user:${doctorId}`).emit('medicineRequest:new', {
            request: medicineRequest,
            patient: {
              name: patient.name,
              avatar: patient.avatar || patient.profileImage,
            },
          });
        }
      }

      const populated = await MedicineRequest.findById(medicineRequest._id)
        .populate('patient', 'name email avatar')
        .populate('doctor', 'name specialization avatar');

      res.status(201).json({
        success: true,
        data: populated,
        newlyFilledFields: parsedNewlyFilledFields || [],
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/medicine-requests/:id/status — update status (doctor or admin)
router.put('/:id/status', protect, async (req, res, next) => {
  try {
    const { status, notes, rejectionReason } = req.body;

    const request = await MedicineRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    // Only assigned doctor or admin can update status
    const isDoctor = request.doctor && req.user._id.equals(request.doctor);
    if (!isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Validate status
    const validStatuses = ['under_review', 'approved', 'rejected', 'expired', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    request.status = status;

    if (status === 'approved') {
      // Add doctor snapshot and verification data
      const doctor = await User.findById(req.user._id);
      request.doctorSnapshot = {
        name: doctor.name,
        specialization: doctor.specialization,
        qualifications: doctor.qualifications || [],
        phone: doctor.phone,
        clinic: doctor.clinic || {},
      };
      request.doctorVerification = {
        verifiedAt: new Date(),
        notes: notes || '',
        signature: true,
      };
    }

    if (status === 'rejected' && rejectionReason) {
      request.rejectionReason = rejectionReason;
    }

    await request.save();

    // Emit socket event to notify patient
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${request.patient}`).emit('medicineRequest:status', {
        requestId: request._id,
        requestNumber: request.requestNumber,
        status: request.status,
      });
    }

    res.json(request);
  } catch (err) {
    next(err);
  }
});

// GET /api/medicine-requests/:id/pdf — generate and download PDF
router.get('/:id/pdf', protect, async (req, res, next) => {
  try {
    const request = await MedicineRequest.findById(req.params.id)
      .populate('patient', 'name email phone dateOfBirth gender bloodGroup allergies medicalConditions address')
      .populate('doctor', 'name specialization qualifications phone clinic');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    // Check authorization
    const isPatient = req.user._id.equals(request.patient._id);
    const isDoctor = request.doctor && req.user._id.equals(request.doctor._id);
    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Use snapshots if available, otherwise use populated data
    const requestData = {
      ...request.toObject(),
      patientSnapshot: request.patientSnapshot?.name
        ? request.patientSnapshot
        : {
            name: request.patient?.name,
            email: request.patient?.email,
            phone: request.patient?.phone,
            dateOfBirth: request.patient?.dateOfBirth,
            gender: request.patient?.gender,
            bloodGroup: request.patient?.bloodGroup,
            allergies: request.patient?.allergies,
            medicalConditions: request.patient?.medicalConditions,
            address: request.patient?.address,
          },
      doctorSnapshot: request.doctorSnapshot?.name
        ? request.doctorSnapshot
        : request.doctor
        ? {
            name: request.doctor?.name,
            specialization: request.doctor?.specialization,
            qualifications: request.doctor?.qualifications,
            phone: request.doctor?.phone,
            clinic: request.doctor?.clinic,
          }
        : null,
    };

    const pdf = await generateMedicineRequestPDF(requestData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="medicine-request-${request.requestNumber || request._id}.pdf"`
    );
    res.send(pdf);
  } catch (err) {
    console.error('PDF generation error:', err);
    next(err);
  }
});

module.exports = router;
