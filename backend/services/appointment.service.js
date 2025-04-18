const dbService = require('./database.service');

const appointmentService = {
  // Create a new appointment
  createAppointment: async (appointmentData) => {
    try {
      const { patientId, doctorId, dateTime, duration, reason } = appointmentData;
      
      // Validate required fields
      if (!patientId || !doctorId || !dateTime || !reason) {
        throw new Error('Missing required appointment fields');
      }
      
      // Check doctor availability for the requested time
      const isAvailable = await checkDoctorAvailability(doctorId, dateTime, duration || 30);
      
      if (!isAvailable) {
        throw new Error('Doctor is not available at the requested time');
      }
      
      // Create appointment
      const appointment = await dbService.addDocument('appointments', {
        patientId,
        doctorId, 
        dateTime,
        duration: duration || 30,
        reason,
        notes: appointmentData.notes || '',
        status: 'pending',
        notificationSent: false
      });
      
      // Schedule reminders
      await scheduleAppointmentReminders(appointment);
      
      return appointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },
  
  // Get appointments for a patient
  getPatientAppointments: async (patientId) => {
    try {
      return await dbService.queryDocuments('appointments', {
        filters: [
          { field: 'patientId', operator: '==', value: patientId }
        ],
        orderBy: { field: 'dateTime', direction: 'asc' }
      });
    } catch (error) {
      console.error('Error getting patient appointments:', error);
      throw error;
    }
  },
  
  // Get appointments for a doctor
  getDoctorAppointments: async (doctorId) => {
    try {
      return await dbService.queryDocuments('appointments', {
        filters: [
          { field: 'doctorId', operator: '==', value: doctorId }
        ],
        orderBy: { field: 'dateTime', direction: 'asc' }
      });
    } catch (error) {
      console.error('Error getting doctor appointments:', error);
      throw error;
    }
  },
  
  // Update appointment status
  updateAppointmentStatus: async (appointmentId, status, userId) => {
    try {
      // Get the appointment to validate
      const appointment = await dbService.getDocument('appointments', appointmentId);
      
      if (!appointment) {
        throw new Error('Appointment not found');
      }
      
      // Only the doctor or the patient can update the appointment
      if (appointment.doctorId !== userId && appointment.patientId !== userId) {
        throw new Error('Unauthorized to update this appointment');
      }
      
      // Update status
      const updateData = {
        status,
        updatedAt: dbService.fieldValues.serverTimestamp(),
        updatedBy: userId
      };
      
      // If completed, add completion time
      if (status === 'completed') {
        updateData.completedAt = dbService.fieldValues.serverTimestamp();
      }
      
      // If cancelled, add cancellation info
      if (status === 'cancelled') {
        updateData.cancelledAt = dbService.fieldValues.serverTimestamp();
        updateData.cancelledBy = userId;
      }
      
      await dbService.updateDocument('appointments', appointmentId, updateData);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }
};

// Helper function to check doctor availability
const checkDoctorAvailability = async (doctorId, dateTime, duration) => {
  const appointmentDate = new Date(dateTime);
  const endTime = new Date(appointmentDate.getTime() + duration * 60000);
  
  // Get doctor's schedule for that day
  // This would be more complex in a real application, checking working hours, etc.
  
  // Check for overlapping appointments
  const overlappingAppointments = await dbService.queryDocuments('appointments', {
    filters: [
      { field: 'doctorId', operator: '==', value: doctorId },
      { field: 'dateTime', operator: '<=', value: endTime },
      { field: 'status', operator: 'in', value: ['pending', 'confirmed'] }
    ]
  });
  
  // Check if any appointment overlaps
  for (const apt of overlappingAppointments) {
    const aptDateTime = new Date(apt.dateTime.toDate());
    const aptEndTime = new Date(aptDateTime.getTime() + (apt.duration || 30) * 60000);
    
    // If this appointment's end time is after our start time, we have an overlap
    if (aptEndTime > appointmentDate) {
      return false;
    }
  }
  
  return true;
};

// Helper function to schedule reminders
const scheduleAppointmentReminders = async (appointment) => {
  try {
    // This would be implemented with cloud functions or a separate scheduler
    // For now, just mark that we'll need reminders
    await dbService.updateDocument('appointments', appointment.id, {
      reminderScheduled: true
    });
  } catch (error) {
    console.error('Error scheduling appointment reminders:', error);
    // Don't throw here, appointment was created successfully
  }
};

module.exports = appointmentService;
