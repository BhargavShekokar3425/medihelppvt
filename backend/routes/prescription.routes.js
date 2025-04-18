const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Sample prescriptions data if not already in dataStore
if (!global.dataStore.prescriptions) {
  global.dataStore.prescriptions = {};
}

// Example prescription controller functions
const prescriptionController = {
  createPrescription: (req, res) => {
    const doctorId = req.user.id;
    const { patientId, medications, instructions, diagnosis } = req.body;
    
    if (!patientId || !medications) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID and medications are required'
      });
    }
    
    // Ensure doctor role
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        error: 'Only doctors can create prescriptions'
      });
    }
    
    const prescriptionId = uuidv4();
    const newPrescription = {
      id: prescriptionId,
      doctorId,
      patientId,
      medications,
      instructions,
      diagnosis,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    
    // Save to dataStore
    global.dataStore.prescriptions[prescriptionId] = newPrescription;
    
    res.status(201).json({
      success: true,
      data: newPrescription
    });
  },
  
  getPatientPrescriptions: (req, res) => {
    const { patientId } = req.params;
    
    // Ensure authorized (patient can only see their own, doctor can see their patients)
    if (req.user.role === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access these prescriptions'
      });
    }
    
    // Filter prescriptions for this patient
    const patientPrescriptions = Object.values(global.dataStore.prescriptions)
      .filter(prescription => prescription.patientId === patientId);
    
    res.json({
      success: true,
      data: patientPrescriptions
    });
  },
  
  getDoctorPrescriptions: (req, res) => {
    const { doctorId } = req.params;
    
    // Ensure authorized (doctor can only see their own)
    if (req.user.role === 'doctor' && req.user.id !== doctorId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access these prescriptions'
      });
    }
    
    // Filter prescriptions for this doctor
    const doctorPrescriptions = Object.values(global.dataStore.prescriptions)
      .filter(prescription => prescription.doctorId === doctorId);
    
    res.json({
      success: true,
      data: doctorPrescriptions
    });
  }
};

// Protected prescription routes
router.use(protect);
router.post('/', prescriptionController.createPrescription);
router.get('/patient/:patientId', prescriptionController.getPatientPrescriptions);
router.get('/doctor/:doctorId', prescriptionController.getDoctorPrescriptions);

module.exports = router;
