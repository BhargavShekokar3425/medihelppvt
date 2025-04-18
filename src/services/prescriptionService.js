import apiService from './apiService';

export const prescriptionService = {
  // Upload a new prescription
  uploadPrescription: async (patientId, doctorId, prescriptionData, file) => {
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patientId', patientId);
      formData.append('doctorId', doctorId);
      
      // Add prescription data
      Object.entries(prescriptionData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      // Send upload request
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/prescriptions/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload prescription');
      }
      
      return data;
    } catch (error) {
      console.error("Upload prescription error:", error);
      throw error;
    }
  },
  
  // Get prescriptions for a patient
  getPatientPrescriptions: async (patientId) => {
    try {
      const response = await apiService.get(`/prescriptions/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error("Get patient prescriptions error:", error);
      throw error;
    }
  },
  
  // Get prescriptions for a doctor
  getDoctorPrescriptions: async (doctorId) => {
    try {
      const response = await apiService.get(`/prescriptions/doctor/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error("Get doctor prescriptions error:", error);
      throw error;
    }
  },
  
  // Get a specific prescription
  getPrescription: async (prescriptionId) => {
    try {
      const response = await apiService.get(`/prescriptions/${prescriptionId}`);
      return response.data;
    } catch (error) {
      console.error("Get prescription error:", error);
      throw error;
    }
  },
  
  // Update a prescription
  updatePrescription: async (prescriptionId, prescriptionData) => {
    try {
      const response = await apiService.put(`/prescriptions/${prescriptionId}`, prescriptionData);
      return response.data;
    } catch (error) {
      console.error("Update prescription error:", error);
      throw error;
    }
  },
  
  // Delete a prescription
  deletePrescription: async (prescriptionId) => {
    try {
      const response = await apiService.delete(`/prescriptions/${prescriptionId}`);
      return response.data;
    } catch (error) {
      console.error("Delete prescription error:", error);
      throw error;
    }
  }
};

export default prescriptionService;
