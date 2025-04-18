const dbService = require('./database.service');
const { storage } = require('../config/firebase.config');
const path = require('path');

const prescriptionService = {
  // Create a prescription 
  createPrescription: async (prescriptionData) => {
    try {
      const { patientId, doctorId, medications, diagnosis, instructions, fileUrl } = prescriptionData;
      
      // Validate required fields
      if (!patientId || !doctorId || !medications) {
        throw new Error('Missing required prescription fields');
      }
      
      // Create prescription document
      const prescription = await dbService.addDocument('prescriptions', {
        patientId,
        doctorId,
        medications,
        diagnosis,
        instructions,
        fileUrl,
        status: 'active'
      });
      
      return prescription;
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    }
  },
  
  // Upload prescription image
  uploadPrescriptionImage: async (file, patientId) => {
    try {
      if (!file) {
        throw new Error('No file provided');
      }
      
      const fileExtension = path.extname(file.originalname);
      const fileName = `${Date.now()}${fileExtension}`;
      const filePath = `prescriptions/${patientId}/${fileName}`;
      
      const bucket = storage.bucket();
      const fileRef = bucket.file(filePath);
      
      await fileRef.save(file.buffer, {
        metadata: {
          contentType: file.mimetype
        }
      });
      
      // Make file publicly accessible
      await fileRef.makePublic();
      
      const fileUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
      return { fileUrl };
    } catch (error) {
      console.error('Error uploading prescription image:', error);
      throw error;
    }
  },
  
  // Get prescriptions for a patient
  getPatientPrescriptions: async (patientId) => {
    try {
      const prescriptions = await dbService.queryDocuments('prescriptions', {
        filters: [
          { field: 'patientId', operator: '==', value: patientId }
        ],
        orderBy: { field: 'createdAt', direction: 'desc' }
      });
      
      return prescriptions;
    } catch (error) {
      console.error('Error getting patient prescriptions:', error);
      throw error;
    }
  },
  
  // Get prescriptions created by a doctor
  getDoctorPrescriptions: async (doctorId) => {
    try {
      const prescriptions = await dbService.queryDocuments('prescriptions', {
        filters: [
          { field: 'doctorId', operator: '==', value: doctorId }
        ],
        orderBy: { field: 'createdAt', direction: 'desc' }
      });
      
      return prescriptions;
    } catch (error) {
      console.error('Error getting doctor prescriptions:', error);
      throw error;
    }
  },
  
  // Update prescription status
  updatePrescriptionStatus: async (prescriptionId, status) => {
    try {
      await dbService.updateDocument('prescriptions', prescriptionId, { status });
      return { success: true };
    } catch (error) {
      console.error('Error updating prescription status:', error);
      throw error;
    }
  }
};

module.exports = prescriptionService;
