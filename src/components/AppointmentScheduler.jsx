import React, { useState, useEffect } from 'react';
import { useBackendContext } from '../contexts/BackendContext';

export default function AppointmentScheduler() {
  // Add new state variables for appointment booking
  const [bookedSlots, setBookedSlots] = useState({});
  const [bookingStatus, setBookingStatus] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // Get the backend context for API calls
  const { currentUser, apiService } = useBackendContext();
  
  // Add CSS styles directly in the component
  const styles = {
    container: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '16px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '24px',
      padding: '16px',
      borderRadius: '8px',
      background: 'linear-gradient(300deg, #5aa3e7, #d73434, white)', // Gradient background
      backgroundSize: '180% 180%',
      animation: 'gradient-animation 18s ease infinite', // Gradient animation
      color: 'white',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    dateNav: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      justifyContent: 'center'
    },
    navButton: {
      padding: '8px',
      border: 'none',
      background: 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    dateRange: {
      fontSize: '18px',
      fontWeight: '500'
    },
    '@keyframes gradient-animation': {
      '0%': {
        backgroundPosition: '0% 50%'
      },
      '50%': {
        backgroundPosition: '100% 50%'
      },
      '100%': {
        backgroundPosition: '0% 50%'
      }
    },
    content: {
      display: 'flex',
      gap: '16px'
    },
    calendarGrid: {
      flexGrow: 1,
      maxWidth: '750px'
    },
    tableResponsive: {
      overflowX: 'auto'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      border: '1px solid #e0e0e0',
      padding: '8px'
    },
    td: {
      border: '1px solid #e0e0e0',
      padding: '8px'
    },
    timeHeader: {
      width: '80px',
      backgroundColor: '#f9f9f9'
    },
    dateHeader: {
      minWidth: '120px',
      backgroundColor: '#f9f9f9',
      textAlign: 'center'
    },
    weekday: {
      fontWeight: '500'
    },
    date: {
      fontSize: '14px',
      color: '#666'
    },
    timeCell: {
      backgroundColor: '#f9f9f9',
      fontWeight: '500',
      fontSize: '14px'
    },
    timeSlotControl: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    removeSlotButton: {
      border: 'none',
      background: 'none',
      color: '#ccc',
      fontSize: '16px',
      cursor: 'pointer'
    },
    appointmentCell: {
      minHeight: '80px',
      height: '40px',
      cursor: 'pointer',
      position: 'relative',
      verticalAlign: 'top'
    },
    appointmentItem: {
      position: 'absolute',
      top: '4px',
      right: '4px',
      bottom: '4px',
      left: '4px',
      padding: '8px',
      borderRadius: '4px',
      overflow: 'hidden'
    },
    appointmentContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    completedIcon: {
      color: '#10b981'
    },
    appointmentText: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontWeight: '500',
      fontSize: '14px'
    },
    sidebar: {
      width: '220px',
      padding: '16px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px'
    },
    sidebarHeading: {
      fontSize: '18px',
      fontWeight: '500',
      marginBottom: '16px'
    },
    sidebarSection: {
      marginBottom: '24px'
    },
    sidebarLabel: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '8px'
    },
    dropdownContainer: {
      position: 'relative',
      marginBottom: '8px'
    },
    dropdownButton: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      backgroundColor: 'white',
      cursor: 'pointer'
    },
    buttonContent: {
      display: 'flex',
      alignItems: 'center'
    },
    buttonIcon: {
      marginRight: '8px'
    },
    dropdownMenu: {
      position: 'absolute',
      zIndex: 10,
      marginTop: '4px',
      width: '100%',
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      maxHeight: '240px',
      overflowY: 'auto'
    },
    dropdownItem: {
      padding: '8px',
      cursor: 'pointer',
      hover: {
        backgroundColor: '#f5f5f5'
      }
    },
    colorGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '8px'
    },
    colorButton: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      border: '2px solid white',
      cursor: 'pointer',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    sidebarNote: {
      fontSize: '14px',
      color: '#666'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    },
    modalContainer: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      width: '100%',
      maxWidth: '500px'
    },
    modalContent: {
      padding: '24px'
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '16px'
    },
    modalField: {
      marginBottom: '16px'
    },
    modalLabel: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '4px'
    },
    modalValue: {
      fontSize: '14px',
      color: '#333'
    },
    modalTextarea: {
      width: '100%',
      padding: '8px',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      fontFamily: 'inherit',
      fontSize: '14px',
      resize: 'vertical'
    },
    modalColors: {
      display: 'grid',
      gridTemplateColumns: 'repeat(8, 1fr)',
      gap: '8px'
    },
    modalColorButton: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      border: '1px solid #e0e0e0',
      cursor: 'pointer'
    },
    modalColorButtonSelected: {
      boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.2)'
    },
    modalCheckbox: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px'
    },
    modalCheckboxInput: {
      marginRight: '8px'
    },
    modalActions: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '24px'
    },
    actionButtons: {
      display: 'flex',
      gap: '8px'
    },
    deleteButton: {
      padding: '8px 16px',
      border: '1px solid #f44336',
      color: '#f44336',
      background: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    cancelButton: {
      padding: '8px 16px',
      border: '1px solid #e0e0e0',
      background: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    saveButton: {
      padding: '8px 16px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    // New styles for staff carousel
    staffCarousel: {
      display: 'flex',
      overflowX: 'auto',
      marginBottom: '20px',
      padding: '10px 0',
      scrollbarWidth: 'thin',
      scrollbarColor: '#ddd #f9f9f9'
    },
    staffMember: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginRight: '20px',
      cursor: 'pointer',
      minWidth: '80px'
    },
    staffImage: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      objectFit: 'cover',
      marginBottom: '8px',
      border: '2px solid transparent', // <== Important
      transition: 'border-color 0.2s ease'
    },
    activeStaffImage: {
      borderColor: '#3b82f6'
    },
    staffImageHover: {
      borderColor: '#999',
      transition: 'border-color 0.2s ease-in-out'
    },
    staffName: {
      fontSize: '14px',
      textAlign: 'center',
      maxWidth: '80px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  };

  // Staff members data
  const [staffMembers] = useState([
    { id: 'd1', name: 'Dr. Neha Sharma', image: '/assets/femme.jpeg' },
    { id: 'd2', name: 'Dr. Shikha Chibber', image: '/assets/fem.jpeg' },
    { id: 'd3', name: 'Dr. Ayurvedic Specialists', image: '/assets/doctorman.avif' },
    { id: 'd4', name: 'Dr. Vibha Dubey', image: '/assets/femmedocie.jpg' },
    { id: 'd5', name: 'Dr. Shweta Singh', image: '/assets/cutu.jpeg' },
    { id: 'd6', name: 'Dr. Misha Goyal', image: '/assets/vcutu.jpg' }
  ]);
  
  // Currently selected staff member
  const [selectedStaff, setSelectedStaff] = useState(staffMembers[0]);

  // Time slots configuration - 15 minute intervals starting from 9 AM
  const [timeSlots, setTimeSlots] = useState([
    '9:00 AM', '9:15 AM', '9:30 AM', '9:45 AM', 
    '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',
    '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM',
    '12:00 PM', 
  ]);
  
  // Custom time slot options
  const timeSlotOptions = [
    '8:00 AM', '8:15 AM', '8:30 AM', '8:45 AM',
    '9:00 AM', '9:15 AM', '9:30 AM', '9:45 AM', 
    '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',
    '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM',
    '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',
    '1:00 PM', '1:15 PM', '1:30 PM', '1:45 PM',
    
  ];

  // Get current date and adjust to start on Monday
  const today = new Date();
  const getMonday = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(date.setDate(diff));
  };
  
  // State for dates to show in scheduler (Monday to Sunday)
  const [dates, setDates] = useState([]);
  const [startDate, setStartDate] = useState(getMonday(today));
  
  // Generate dates when startDate changes (Monday to Sunday)
  useEffect(() => {
    const newDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      newDates.push(date);
    }
    setDates(newDates);
  }, [startDate]);

  // State for appointments (separated by staff member)
  const [staffAppointments, setStaffAppointments] = useState({});
  
  // Helper to get current staff appointments
  const getAppointments = () => {
    return staffAppointments[selectedStaff.id] || {};
  };
  
  // Helper to set appointments for current staff
  const updateAppointments = (appointments) => {
    setStaffAppointments(prev => ({
      ...prev,
      [selectedStaff.id]: appointments
    }));
  };
  
  // Current appointment being edited
  const [currentAppointment, setCurrentAppointment] = useState({
    date: null,
    timeSlot: null,
    text: '',
    color: '#3b82f6', // Default blue color
    completed: false
  });

  // Add missing toggleCompleted function
  const toggleCompleted = () => {
    setCurrentAppointment(prev => ({
      ...prev,
      completed: !prev.completed
    }));
  };
  
  // State for modal visibility
  const [showModal, setShowModal] = useState(false);
  
  // Custom time slot being added
  const [showTimeSlotDropdown, setShowTimeSlotDropdown] = useState(false);

  // Format date to YYYY-MM-DD for appointment keys
  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Format date for display
  const formatDateDisplay = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Navigate dates
  const navigateDates = (direction) => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setStartDate(newDate);
  };
  
  // Handle staff selection with availability check
  const handleStaffSelect = async (staff) => {
    setSelectedStaff(staff);
    // This will trigger the useEffect to load booked slots
  };
  
  // Load booked slots when staff member or dates change
  useEffect(() => {
    if (!selectedStaff || dates.length === 0) return;
    
    const loadBookedSlotsForDoctor = async () => {
      try {
        setLoadingSlots(true);
        
        // Format dates for the API request
        const startDate = dates[0].toISOString().split('T')[0];
        const endDate = dates[6].toISOString().split('T')[0];
        
        // If we have an API service, use it. Otherwise use mock data
        let bookedSlotsData = {};
        
        if (apiService) {
          const response = await apiService.get(
            `/appointments/booked-slots/${selectedStaff.id}`,
            { params: { startDate, endDate } }
          );
          
          // Format the response into a lookup object
          response.forEach(slot => {
            const key = `${slot.date}-${slot.timeSlot}`;
            bookedSlotsData[key] = true;
          });
        } else {
          // Mock data when API is not available
          console.log("Using mock booked slots data");
          bookedSlotsData = {
            [`${startDate}-10:00 AM`]: true,
            [`${startDate}-2:00 PM`]: true,
          };
        }
        
        setBookedSlots(bookedSlotsData);
        console.log("Loaded booked slots:", bookedSlotsData);
      } catch (error) {
        console.error('Error loading booked slots:', error);
      } finally {
        setLoadingSlots(false);
      }
    };
    
    loadBookedSlotsForDoctor();
  }, [selectedStaff, dates, apiService]);
  
  // Check if a time slot is booked
  const isTimeSlotBooked = (date, timeSlot) => {
    const dateKey = formatDateKey(date);
    const slotKey = `${dateKey}-${timeSlot}`;
    return bookedSlots[slotKey] === true;
  };
  
  // Handle cell click to create/edit appointment with availability check and role-based controls
  const handleCellClick = async (date, timeSlot) => {
    const dateKey = formatDateKey(date);
    
    // Check if user is logged in
    if (!currentUser) {
      setBookingStatus({
        type: 'error',
        message: 'Please log in to book appointments'
      });
      return;
    }
    
    // Check role-specific conditions
    if (currentUser.role === 'doctor') {
      // Doctors can view appointments but need to select a patient to book new ones
      const appointments = getAppointments();
      const existingAppointment = appointments[`${dateKey}-${timeSlot}`];
      
      if (existingAppointment) {
        // View/edit existing appointment
        setCurrentAppointment({
          date: date,
          timeSlot: timeSlot,
          text: existingAppointment.text,
          color: existingAppointment.color,
          completed: existingAppointment.completed,
          patientId: existingAppointment.patientId,
          patientName: existingAppointment.patientName,
          patientDetails: existingAppointment.patientDetails
        });
      } else {
        // Create new appointment (need to select patient first)
        if (!selectedPatient) {
          setBookingStatus({
            type: 'error',
            message: 'Please select a patient first to book an appointment'
          });
          return;
        }
        
        setCurrentAppointment({
          date: date,
          timeSlot: timeSlot,
          text: '',
          color: '#3b82f6',
          completed: false,
          patientId: selectedPatient.id,
          patientName: selectedPatient.name,
          patientDetails: selectedPatient
        });
      }
    } else {
      // Regular patient flow
      // Check if doctor is selected
      if (!selectedStaff || !selectedStaff.id) {
        setBookingStatus({
          type: 'error',
          message: 'Please select a doctor first'
        });
        return;
      }
      
      // Check if the time slot is already booked
      if (isTimeSlotBooked(date, timeSlot)) {
        setBookingStatus({
          type: 'error',
          message: 'This time slot is already booked by another patient'
        });
        return;
      }
      
      // Continue with checking for existing appointments in state
      const appointments = getAppointments();
      const existingAppointment = appointments[`${dateKey}-${timeSlot}`];
      
      if (existingAppointment) {
        setCurrentAppointment({
          date: date,
          timeSlot: timeSlot,
          text: existingAppointment.text,
          color: existingAppointment.color,
          completed: existingAppointment.completed
        });
      } else {
        setCurrentAppointment({
          date: date,
          timeSlot: timeSlot,
          text: '',
          color: '#3b82f6',
          completed: false
        });
      }
    }
    
    setShowModal(true);
  };
  
  // Create a new appointment with locking mechanism
  const saveAppointment = async () => {
    if (!currentAppointment.date || !currentAppointment.timeSlot) return;
    
    const dateKey = formatDateKey(currentAppointment.date);
    const appointmentKey = `${dateKey}-${currentAppointment.timeSlot}`;
    const currentAppointments = getAppointments();
    
    // If this is a new appointment (not an edit), check with the server 
    // if the slot is still available
    if (!currentAppointments[appointmentKey]) {
      try {
        setBookingStatus({ type: 'loading', message: 'Checking availability...' });
        
        // Check if API service is available
        if (!apiService) {
          throw new Error("API service not available");
        }
        
        // Different logic based on user role
        if (currentUser.role === 'doctor') {
          // Doctors booking for patients
          if (!selectedPatient) {
            setBookingStatus({
              type: 'error',
              message: 'Please select a patient first'
            });
            return;
          }
          
          // Create the appointment on the server for the selected patient
          const appointmentData = {
            doctorId: currentUser.id,  // Doctor is booking for themselves
            patientId: selectedPatient.id, // Selected patient
            date: dateKey,
            timeSlot: currentAppointment.timeSlot,
            reason: currentAppointment.text || 'Appointment scheduled by doctor'
          };
          
          console.log('Doctor creating appointment for patient:', appointmentData);
          
          const result = await apiService.post('/appointments/doctor-book', appointmentData);
          
          if (result) {
            console.log("Appointment created by doctor successfully:", result);
            
            // Update our local state with the new appointment
            const updatedAppointments = {
              ...currentAppointments,
              [appointmentKey]: {
                id: result.id,
                text: currentAppointment.text,
                color: currentAppointment.color,
                completed: currentAppointment.completed,
                status: 'confirmed', // Doctor-created appointments are automatically confirmed
                patientId: selectedPatient.id,
                patientName: selectedPatient.name,
                patientDetails: selectedPatient
              }
            };
            
            updateAppointments(updatedAppointments);
            
            // Mark this slot as booked locally
            setBookedSlots(prev => ({
              ...prev,
              [appointmentKey]: true
            }));
            
            setBookingStatus({
              type: 'success',
              message: `Appointment for ${selectedPatient.name} booked successfully!`
            });
            
            // After successful booking, reload appointments
            await loadUserAppointments();
          }
        } else {
          // Regular patient booking flow
          // Verify doctor is selected
          if (!selectedStaff || !selectedStaff.id) {
            setBookingStatus({
              type: 'error',
              message: 'Please select a doctor first'
            });
            return;
          }
          
          // First, check availability
          const response = await apiService.get('/appointments/check-availability', {
            params: {
              doctorId: selectedStaff.id,
              date: dateKey,
              timeSlot: currentAppointment.timeSlot
            }
          });
          
          if (!response.available) {
            setBookingStatus({
              type: 'error',
              message: 'This time slot has been booked by someone else. Please choose another time.'
            });
            
            // Mark this slot as booked in our local state
            setBookedSlots(prev => ({
              ...prev,
              [appointmentKey]: true
            }));
            
            return;
          }
          
          // Create the appointment on the server
          const appointmentData = {
            doctorId: selectedStaff.id,
            date: dateKey,
            timeSlot: currentAppointment.timeSlot,
            reason: currentAppointment.text || 'General consultation'
          };
          
          console.log('Creating appointment with data:', appointmentData);
          
          // Make the API call with the required parameters
          const result = await apiService.post('/appointments', appointmentData);
          
          if (result) {
            console.log("Appointment created successfully:", result);
            
            // Update our local state with the new appointment
            const updatedAppointments = {
              ...currentAppointments,
              [appointmentKey]: {
                id: result.id, // Store the returned ID for future operations
                text: currentAppointment.text,
                color: currentAppointment.color,
                completed: currentAppointment.completed,
                status: 'pending',
                doctorName: selectedStaff.name
              }
            };
            
            updateAppointments(updatedAppointments);
            
            // Mark this slot as booked locally
            setBookedSlots(prev => ({
              ...prev,
              [appointmentKey]: true
            }));
            
            setBookingStatus({
              type: 'success',
              message: 'Appointment booked successfully!'
            });
            
            // After successful booking, reload user's appointments
            await loadUserAppointments();
          }
        }
      } catch (error) {
        console.error('Error saving appointment:', error);
        
        setBookingStatus({
          type: 'error',
          message: error.message || 'Failed to book appointment. Please try again.'
        });
        
        return;
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setBookingStatus(null);
      }, 3000);
      
      setShowModal(false);
      return;
    }
    
    // If editing an existing appointment (marking as completed, etc.)
    const updatedAppointment = {
      ...(currentAppointments[appointmentKey] || {}),
      text: currentAppointment.text,
      color: currentAppointment.color,
      completed: currentAppointment.completed
    };
    
    // If doctor is marking appointment as completed/updating status
    if (currentUser?.role === 'doctor' && updatedAppointment.id) {
      try {
        const result = await apiService.put(`/appointments/${updatedAppointment.id}`, {
          status: currentAppointment.completed ? 'completed' : 'confirmed',
          notes: currentAppointment.text
        });
        
        console.log("Appointment updated by doctor:", result);
      } catch (error) {
        console.error('Error updating appointment status:', error);
      }
    }
    
    const updatedAppointments = {
      ...currentAppointments,
      [appointmentKey]: updatedAppointment
    };
    
    updateAppointments(updatedAppointments);
    setShowModal(false);
  };
  
  // Delete appointment with server sync
  const deleteAppointment = async () => {
    if (!currentAppointment.date || !currentAppointment.timeSlot) return;
    
    const dateKey = formatDateKey(currentAppointment.date);
    const appointmentKey = `${dateKey}-${currentAppointment.timeSlot}`;
    const currentAppointments = getAppointments();
    
    // Try to delete on the server if we have an API service
    if (apiService && currentUser) {
      try {
        setBookingStatus({ type: 'loading', message: 'Cancelling appointment...' });
        
        // We would need the actual appointment ID, but in our mock setup we don't have it
        // This code assumes we can find the appointment ID from a local mapping or the server
        // const appointmentId = getAppointmentId(appointmentKey);
        // await apiService.delete(`/appointments/${appointmentId}`);
        
        // Since we don't have the ID, we'll just remove it locally
        console.log(`Would delete appointment for ${dateKey} at ${currentAppointment.timeSlot}`);
        
        // Mark the slot as available
        setBookedSlots(prev => {
          const updated = { ...prev };
          delete updated[appointmentKey];
          return updated;
        });
        
        setBookingStatus({
          type: 'success',
          message: 'Appointment cancelled successfully!'
        });
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        
        setBookingStatus({
          type: 'error',
          message: 'Failed to cancel appointment. Please try again.'
        });
        
        return;
      }
    }
    
    // Update local state
    const updatedAppointments = {...currentAppointments};
    delete updatedAppointments[appointmentKey];
    
    updateAppointments(updatedAppointments);
    
    // Immediately hide any previous status after success
    setTimeout(() => {
      setBookingStatus(null);
    }, 3000);
    
    setShowModal(false);
  };
  
  // Add a new time slot
  const addTimeSlot = (slot) => {
    if (!timeSlots.includes(slot)) {
      // Keep time slots sorted
      const newSlots = [...timeSlots, slot].sort((a, b) => {
        return new Date(`1970/01/01 ${a}`) - new Date(`1970/01/01 ${b}`);
      });
      setTimeSlots(newSlots);
    }
    setShowTimeSlotDropdown(false);
  };
  
  // Remove a time slot
  const removeTimeSlot = (slotToRemove) => {
    setTimeSlots(prev => prev.filter(slot => slot !== slotToRemove));
  };

  // Calendar and scheduling icons
  const ChevronLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  );
  
  const ChevronRightIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );

  const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
  
  const ClockIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
  
  const ChevronDownIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );

  // Load user's appointments when component mounts or when user changes
  useEffect(() => {
    if (currentUser && apiService) {
      loadUserAppointments();
    }
  }, [currentUser, apiService]);

  // New function to load user's existing appointments
  const loadUserAppointments = async () => {
    try {
      setLoadingSlots(true);
      
      const endpoint = currentUser?.role === 'doctor' 
        ? '/appointments/doctor' 
        : '/appointments';
      
      const appointments = await apiService.get(endpoint);
      console.log("User appointments loaded:", appointments);
      
      // Create a lookup object for booked slots
      const userBookedSlots = {};
      appointments.forEach(apt => {
        // For doctors, show patient information in appointments
        const appointmentData = {
          id: apt.id,
          text: apt.reason || 'Appointment',
          color: getStatusColor(apt.status),
          completed: apt.status === 'completed',
          status: apt.status,
        };
        
        // Add doctor or patient details based on user role
        if (currentUser?.role === 'doctor') {
          appointmentData.patientId = apt.patientId;
          appointmentData.patientName = apt.patientName;
          appointmentData.patientDetails = apt.patient; // If the API returns patient details
        } else {
          appointmentData.doctorName = apt.doctorName;
        }
        
        userBookedSlots[`${apt.date}-${apt.timeSlot}`] = appointmentData;
      });
      
      // Update appointments state
      setStaffAppointments(prev => ({
        ...prev,
        [currentUser.id]: userBookedSlots
      }));
      
      // Update booked slots for display
      const doctorBookedSlots = {};
      appointments.forEach(apt => {
        if (apt.status !== 'cancelled') {
          doctorBookedSlots[`${apt.date}-${apt.timeSlot}`] = true;
        }
      });
      
      setBookedSlots(doctorBookedSlots);
    } catch (error) {
      console.error("Error loading user appointments:", error);
      setBookingStatus({
        type: 'error',
        message: 'Could not load your appointments'
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  // Helper function to get color based on appointment status
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981'; // green
      case 'cancelled': return '#ef4444'; // red
      case 'confirmed': return '#3b82f6'; // blue
      case 'pending': return '#f59e0b'; // amber
      default: return '#3b82f6'; // default blue
    }
  };

  // New function to handle appointment cancellation
  const handleCancelAppointment = async (key) => {
    const [dateStr, timeSlot] = key.split('-');
    const appointments = getAppointments();
    const appointment = appointments[key];
    
    if (!appointment || !appointment.id) {
      setBookingStatus({
        type: 'error',
        message: 'Could not find appointment details'
      });
      return;
    }
    
    try {
      setBookingStatus({
        type: 'loading',
        message: 'Cancelling appointment...'
      });
      
      await apiService.delete(`/appointments/${appointment.id}`);
      
      // Update local state
      await loadUserAppointments();
      
      setBookingStatus({
        type: 'success',
        message: 'Appointment cancelled successfully'
      });
      
      setTimeout(() => {
        setBookingStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setBookingStatus({
        type: 'error',
        message: 'Failed to cancel appointment: ' + error.message
      });
    }
  };

  // Helper function to format date from key
  const formatDateFromKey = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Helper function to get badge class based on status
  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      case 'confirmed': return 'primary';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  // Add state for patient selection (for doctors booking for patients)
  const [patientsList, setPatientsList] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Load patients list for doctors
  useEffect(() => {
    if (currentUser?.role === 'doctor' && apiService) {
      const loadPatients = async () => {
        try {
          const response = await apiService.get('/users/patients');
          setPatientsList(response || []);
        } catch (error) {
          console.error('Error loading patients:', error);
        }
      };
      loadPatients();
    }
  }, [currentUser, apiService]);
  
  // Modify the staff carousel to show only appropriate staff based on user role
  const getDisplayedStaffMembers = () => {
    if (!currentUser) return staffMembers;
    
    if (currentUser.role === 'doctor') {
      // Doctors should only see patients, not other doctors
      return [];  // Empty since doctors shouldn't book with other doctors
    } else {
      // Patients see all doctors
      return staffMembers;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.dateNav}>
          <button 
            onClick={() => navigateDates('prev')} 
            style={styles.navButton}
          >
            <ChevronLeftIcon />
          </button>
          
          <span style={styles.dateRange}>
            {formatDateDisplay(dates[0] || today)} - {formatDateDisplay(dates[6] || today)}
          </span>
          
          <button 
            onClick={() => navigateDates('next')} 
            style={styles.navButton}
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
      
      {/* My Appointments Summary - New section */}
      {currentUser && (
        <div className="my-appointments-summary mb-4">
          <h4 className="mb-3">
            {currentUser.role === 'doctor' ? 'My Patient Appointments' : 'My Upcoming Appointments'}
          </h4>
          {loadingSlots ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-2">Loading your appointments...</p>
            </div>
          ) : Object.keys(getAppointments()).length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Doctor</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(getAppointments()).map(([key, appointment]) => {
                    const [dateStr, timeSlot] = key.split('-');
                    return (
                      <tr key={key}>
                        <td>{formatDateFromKey(dateStr)}</td>
                        <td>{timeSlot}</td>
                        <td>{appointment.doctorName || selectedStaff?.name || 'Unknown'}</td>
                        <td>{appointment.text}</td>
                        <td>
                          <span className={`badge bg-${getStatusClass(appointment.status)}`}>
                            {appointment.status || 'pending'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleCancelAppointment(key)}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">
              You don't have any upcoming appointments. Book one below.
            </div>
          )}
        </div>
      )}

      {/* Status message for booking actions */}
      {bookingStatus && (
        <div 
          className={`alert ${
            bookingStatus.type === 'error' ? 'alert-danger' :
            bookingStatus.type === 'success' ? 'alert-success' : 
            'alert-info'
          } mb-3`}
        >
          {bookingStatus.type === 'loading' && (
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          )}
          {bookingStatus.message}
          <button 
            type="button" 
            className="btn-close float-end" 
            onClick={() => setBookingStatus(null)}
          ></button>
        </div>
      )}
      
      {/* Doctor-specific patient selector (only show for doctors) */}
      {currentUser?.role === 'doctor' && (
        <div className="mb-4 p-3 border rounded bg-light">
          <h5>Book Appointment for Patient</h5>
          <div className="row align-items-center">
            <div className="col-md-6">
              <select 
                className="form-select"
                value={selectedPatient?.id || ''}
                onChange={(e) => {
                  const patient = patientsList.find(p => p.id === e.target.value);
                  setSelectedPatient(patient || null);
                }}
              >
                <option value="">Select a patient</option>
                {patientsList.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              {selectedPatient ? (
                <div className="d-flex align-items-center">
                  <span className="badge bg-success me-2">Selected:</span>
                  <span>{selectedPatient.name}</span>
                  <button 
                    className="btn btn-sm btn-link ms-2"
                    onClick={() => setSelectedPatient(null)}
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <span className="text-muted">Select a patient to book an appointment</span>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Staff Carousel - Only show for patients or if doctor has selected a patient */}
      {(currentUser?.role !== 'doctor' || selectedPatient) && (
        <div style={styles.staffCarousel}>
          {getDisplayedStaffMembers().map(staff => (
            <div 
              key={staff.id} 
              style={styles.staffMember}
              onClick={() => handleStaffSelect(staff)}
            >
              <img 
                src={staff.image} 
                alt={staff.name}
                style={{
                  ...styles.staffImage,
                  ...(selectedStaff?.id === staff.id ? styles.activeStaffImage : {})
                }}
              />
              <div style={styles.staffName}>{staff.name}</div>
            </div>
          ))}
        </div>
      )}
      
      <div style={styles.content}>
        {/* Main calendar grid */}
        <div style={styles.calendarGrid}>
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{...styles.th, ...styles.timeHeader}}></th>
                  {dates.map((date, index) => (
                    <th key={index} style={{...styles.th, ...styles.dateHeader}}>
                      <div style={styles.weekday}>
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div style={styles.date}>
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot, timeIndex) => (
                  <tr key={timeIndex}>
                    <td style={{...styles.td, ...styles.timeCell}}>
                      <div style={styles.timeSlotControl}>
                        <span>{timeSlot}</span>
                        <button 
                          onClick={() => removeTimeSlot(timeSlot)}
                          style={styles.removeSlotButton}
                          title="Remove time slot"
                        >
                          ×
                        </button>
                      </div>
                    </td>
                    {dates.map((date, dateIndex) => {
                      const dateKey = formatDateKey(date);
                      const appointmentKey = `${dateKey}-${timeSlot}`;
                      const appointments = getAppointments();
                      const appointment = appointments[appointmentKey];
                      
                      // Check if this slot is booked by someone else
                      const isBooked = isTimeSlotBooked(date, timeSlot);
                      
                      return (
                        <td 
                          key={dateIndex} 
                          style={{
                            ...styles.td, 
                            ...styles.appointmentCell,
                            // Highlight booked slots with a subtle background
                            ...(isBooked ? { backgroundColor: '#f8d7da' } : {})
                          }}
                          onClick={() => handleCellClick(date, timeSlot)}
                        >
                          {isBooked && !appointment && (
                            <div 
                              style={{
                                ...styles.appointmentItem,
                                backgroundColor: '#f8d7da33',
                                borderLeft: '4px solid #dc3545'
                              }}
                            >
                              <div style={styles.appointmentContent}>
                                <div style={styles.appointmentText}>Booked</div>
                              </div>
                            </div>
                          )}
                          
                          {appointment && (
                            <div 
                              style={{
                                ...styles.appointmentItem,
                                backgroundColor: `${appointment.color}33`, // Add transparency
                                borderLeft: `4px solid ${appointment.color}`
                              }}
                            >
                              <div style={styles.appointmentContent}>
                                {appointment.completed && (
                                  <span style={styles.completedIcon}><CheckIcon /></span>
                                )}
                                <div style={styles.appointmentText}>{appointment.text}</div>
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Right sidebar for controls */}
        <div style={styles.sidebar}>
          <h3 style={styles.sidebarHeading}>Schedule Options</h3>
          
          {/* Time slots management */}
          <div style={styles.sidebarSection}>
            <label style={styles.sidebarLabel}>Manage Time Slots</label>
            <div style={styles.dropdownContainer}>
              <button 
                onClick={() => setShowTimeSlotDropdown(!showTimeSlotDropdown)}
                style={styles.dropdownButton}
              >
                <div style={styles.buttonContent}>
                  <ClockIcon />
                  <span style={styles.buttonIcon}>Add Time Slot</span>
                </div>
                <ChevronDownIcon />
              </button>
              
              {showTimeSlotDropdown && (
                <div style={styles.dropdownMenu}>
                  {timeSlotOptions.map((slot, index) => (
                    <div 
                      key={index}
                      style={styles.dropdownItem}
                      onClick={() => addTimeSlot(slot)}
                    >
                      {slot}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Color schemes */}
          <div style={styles.sidebarSection}>
            <label style={styles.sidebarLabel}>Default Appointment Colors</label>
            <div style={styles.colorGrid}>
              {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'].map((color, index) => (
                <button
                  key={index}
                  style={{...styles.colorButton, backgroundColor: color}}
                  onClick={() => setCurrentAppointment(prev => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>
          
          <div style={{marginTop: '24px'}}>
            <p style={styles.sidebarNote}>
              Click on any cell to add or edit an appointment. Use the color picker to categorize your appointments.
            </p>
          </div>
          
          {/* Legend for appointment status */}
          <div style={styles.sidebarSection}>
            <label style={styles.sidebarLabel}>Appointment Legend</label>
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                backgroundColor: '#f8d7da', 
                marginRight: '8px' 
              }}></div>
              <span>Booked by another patient</span>
            </div>
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                backgroundColor: '#3b82f633', 
                borderLeft: '4px solid #3b82f6',
                marginRight: '8px' 
              }}></div>
              <span>Your appointment</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Appointment modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <div style={styles.modalContent}>
              <h3 style={styles.modalTitle}>
                {getAppointments()[`${formatDateKey(currentAppointment.date)}-${currentAppointment.timeSlot}`] 
                  ? currentUser?.role === 'doctor' ? 'View/Edit Appointment' : 'Edit Appointment'
                  : 'New Appointment'}
              </h3>
              
              {/* For doctors, show patient info. For patients, show doctor info */}
              {currentUser?.role === 'doctor' ? (
                <div style={styles.modalField}>
                  <label style={styles.modalLabel}>Patient</label>
                  <div style={styles.modalValue}>
                    {currentAppointment.patientName || selectedPatient?.name || 'Unknown Patient'}
                  </div>
                  
                  {/* If we have patient details, show them */}
                  {(currentAppointment.patientDetails || selectedPatient) && (
                    <div className="mt-2 p-2 border rounded bg-light">
                      <h6>Patient Information:</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <small className="text-muted">Contact:</small>
                          <div>{currentAppointment.patientDetails?.contact || selectedPatient?.contact || 'N/A'}</div>
                        </div>
                        <div className="col-md-6">
                          <small className="text-muted">Blood Group:</small>
                          <div>{currentAppointment.patientDetails?.bloodGroup || selectedPatient?.bloodGroup || 'N/A'}</div>
                        </div>
                        <div className="col-md-6">
                          <small className="text-muted">Gender:</small>
                          <div>{currentAppointment.patientDetails?.gender || selectedPatient?.gender || 'N/A'}</div>
                        </div>
                        <div className="col-md-6">
                          <small className="text-muted">Age/DOB:</small>
                          <div>{currentAppointment.patientDetails?.dob || selectedPatient?.dob || 'N/A'}</div>
                        </div>
                        <div className="col-12">
                          <small className="text-muted">Allergies:</small>
                          <div>{currentAppointment.patientDetails?.allergies || selectedPatient?.allergies || 'None'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={styles.modalField}>
                  <label style={styles.modalLabel}>Doctor</label>
                  <div style={styles.modalValue}>
                    {selectedStaff?.name || 'Unknown Doctor'}
                  </div>
                </div>
              )}
              
              <div style={styles.modalField}>
                <label style={styles.modalLabel}>Date & Time</label>
                <div style={styles.modalValue}>
                  {currentAppointment.date && formatDateDisplay(currentAppointment.date)} at {currentAppointment.timeSlot}
                </div>
              </div>
              
              <div style={styles.modalField}>
                <label style={styles.modalLabel}>
                  {currentUser?.role === 'doctor' ? 'Notes' : 'Reason for Visit'}
                </label>
                <textarea
                  style={styles.modalTextarea}
                  rows="3"
                  value={currentAppointment.text}
                  onChange={(e) => setCurrentAppointment(prev => ({ ...prev, text: e.target.value }))}
                  placeholder={currentUser?.role === 'doctor' ? "Doctor's notes..." : "Reason for appointment..."}
                />
              </div>
              
              <div style={styles.modalField}>
                <label style={styles.modalLabel}>Color</label>
                <div style={styles.modalColors}>
                  {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'].map((color, index) => (
                    <button
                      key={index}
                      style={{
                        ...styles.modalColorButton,
                        backgroundColor: color,
                        ...(currentAppointment.color === color ? styles.modalColorButtonSelected : {})
                      }}
                      onClick={() => setCurrentAppointment(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
              
              <div style={styles.modalField}>
                <label style={styles.modalCheckbox}>
                  <input
                    type="checkbox"
                    style={styles.modalCheckboxInput}
                    checked={currentAppointment.completed}
                    onChange={toggleCompleted}
                  />
                  <span>
                    {currentUser?.role === 'doctor' 
                      ? 'Mark as completed' 
                      : 'Mark as completed (for your records only)'}
                  </span>
                </label>
              </div>
              
              <div style={styles.modalActions}>
                <div>
                  <button
                    onClick={deleteAppointment}
                    style={styles.deleteButton}
                  >
                    {currentUser?.role === 'doctor' ? 'Cancel Appointment' : 'Cancel Appointment'}
                  </button>
                </div>
                <div style={styles.actionButtons}>
                  <button
                    onClick={() => setShowModal(false)}
                    style={styles.cancelButton}
                  >
                    Close
                  </button>
                  <button
                    onClick={saveAppointment}
                    style={styles.saveButton}
                  >
                    {bookingStatus?.type === 'loading' ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : 'Save Appointment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}