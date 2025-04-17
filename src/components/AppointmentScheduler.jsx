import React, { useState, useEffect } from 'react';

export default function AppointmentScheduler() {
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
      border: '2px solid transparent',
      transition: 'border-color 0.2s ease'
    },
    activeStaffImage: {
      borderColor: '#3b82f6'
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
    { id: 1, name: 'Dr. Neha Sharma', image: '/api/placeholder/60/60' },
    { id: 2, name: 'Dr. Shikha Chibber', image: '/api/placeholder/60/60' },
    { id: 3, name: 'Dr. Ayurvedic Specialists', image: '/api/placeholder/60/60' },
    { id: 4, name: 'Dr. Vibha Dubey', image: '/api/placeholder/60/60' },
    { id: 5, name: 'Dr. Shweta Singh', image: '/api/placeholder/60/60' },
    { id: 6, name: 'Dr. Misha Goyal', image: '/api/placeholder/60/60' }
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
  
  // Handle staff selection
  const handleStaffSelect = (staff) => {
    setSelectedStaff(staff);
  };
  
  // Handle cell click to create/edit appointment
  const handleCellClick = (date, timeSlot) => {
    const dateKey = formatDateKey(date);
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
    
    setShowModal(true);
  };
  
  // Save appointment
  const saveAppointment = () => {
    if (!currentAppointment.date || !currentAppointment.timeSlot) return;
    
    const dateKey = formatDateKey(currentAppointment.date);
    const appointmentKey = `${dateKey}-${currentAppointment.timeSlot}`;
    const currentAppointments = getAppointments();
    
    const updatedAppointments = {
      ...currentAppointments,
      [appointmentKey]: {
        text: currentAppointment.text,
        color: currentAppointment.color,
        completed: currentAppointment.completed
      }
    };
    
    updateAppointments(updatedAppointments);
    setShowModal(false);
  };
  
  // Delete appointment
  const deleteAppointment = () => {
    if (!currentAppointment.date || !currentAppointment.timeSlot) return;
    
    const dateKey = formatDateKey(currentAppointment.date);
    const appointmentKey = `${dateKey}-${currentAppointment.timeSlot}`;
    const currentAppointments = getAppointments();
    
    const updatedAppointments = {...currentAppointments};
    delete updatedAppointments[appointmentKey];
    
    updateAppointments(updatedAppointments);
    setShowModal(false);
  };
  
  // Toggle appointment completion
  const toggleCompleted = () => {
    setCurrentAppointment(prev => ({
      ...prev,
      completed: !prev.completed
    }));
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

  return (
    <div style={styles.container}>
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
      
      {/* Staff Carousel */}
      <div style={styles.staffCarousel}>
        {staffMembers.map(staff => (
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
                ...(selectedStaff.id === staff.id ? styles.activeStaffImage : {})
              }}
            />
            <div style={styles.staffName}>{staff.name}</div>
          </div>
        ))}
      </div>
      
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
                      
                      return (
                        <td 
                          key={dateIndex} 
                          style={{...styles.td, ...styles.appointmentCell}}
                          onClick={() => handleCellClick(date, timeSlot)}
                        >
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
        </div>
      </div>
      
      {/* Appointment modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <div style={styles.modalContent}>
              <h3 style={styles.modalTitle}>
                {getAppointments()[`${formatDateKey(currentAppointment.date)}-${currentAppointment.timeSlot}`] 
                  ? 'Edit Appointment' 
                  : 'New Appointment'}
              </h3>
              
              <div style={styles.modalField}>
                <label style={styles.modalLabel}>Staff Member</label>
                <div style={styles.modalValue}>
                  {selectedStaff.name}
                </div>
              </div>
              
              <div style={styles.modalField}>
                <label style={styles.modalLabel}>Date & Time</label>
                <div style={styles.modalValue}>
                  {currentAppointment.date && formatDateDisplay(currentAppointment.date)} at {currentAppointment.timeSlot}
                </div>
              </div>
              
              <div style={styles.modalField}>
                <label style={styles.modalLabel}>Description</label>
                <textarea
                  style={styles.modalTextarea}
                  rows="3"
                  value={currentAppointment.text}
                  onChange={(e) => setCurrentAppointment(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Appointment details..."
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
                  <span>Mark as completed</span>
                </label>
              </div>
              
              <div style={styles.modalActions}>
                <div>
                  <button
                    onClick={deleteAppointment}
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
                <div style={styles.actionButtons}>
                  <button
                    onClick={() => setShowModal(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveAppointment}
                    style={styles.saveButton}
                  >
                    Save
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