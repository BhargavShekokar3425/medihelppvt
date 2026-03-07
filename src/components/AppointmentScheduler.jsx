import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useBackendContext } from '../contexts/BackendContext';

/**
 * Patient Appointment Scheduler
 * Features:
 * - Beautiful calendar UI with 30-minute time slots
 * - Color-coded slots: Red=Unavailable, Blue=Available, Yellow=Pending, Green=Confirmed
 * - Doctor selection with location/specialization filters
 * - Doctor profile cards with clinic details
 * - Location-based filtering
 */
export default function AppointmentScheduler() {
  const { currentUser, apiService } = useBackendContext();
  
  // State
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [myAppointments, setMyAppointments] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    city: '',
    specialization: '',
    search: ''
  });
  const [cities, setCities] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  
  // Booking modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingData, setBookingData] = useState({
    reason: '',
    symptoms: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Doctor detail modal
  const [showDoctorModal, setShowDoctorModal] = useState(false);

  // Status colors for calendar slots
  const slotColors = {
    available: { bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6', label: 'Available' },
    unavailable: { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444', label: 'Unavailable' },
    pending: { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B', label: 'Your Pending' },
    confirmed: { bg: '#D1FAE5', text: '#065F46', border: '#10B981', label: 'Your Confirmed' },
    blocked: { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB', label: 'Blocked' },
    break: { bg: '#F9FAFB', text: '#9CA3AF', border: '#E5E7EB', label: 'Break' }
  };

  // Generate dates for current week
  const weekDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentWeekStart]);

  // Generate 30-minute time slots
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const h12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        const period = hour >= 12 ? 'PM' : 'AM';
        const time = `${String(h12).padStart(2, '0')}:${String(min).padStart(2, '0')} ${period}`;
        slots.push({ time, hour24: hour, minute: min });
      }
    }
    return slots;
  }, []);

  // Fetch doctors with filters
  const fetchDoctors = useCallback(async () => {
    if (!apiService) return;
    setDoctorsLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.specialization) params.append('specialization', filters.specialization);
      if (filters.search) params.append('search', filters.search);
      
      const res = await apiService.get(`/users/doctors?${params.toString()}`);
      const doctorsList = res.doctors || res.data?.doctors || res;
      setDoctors(Array.isArray(doctorsList) ? doctorsList : []);
      
      // Auto-select first doctor if none selected
      if (!selectedDoctor && doctorsList.length > 0) {
        setSelectedDoctor(doctorsList[0]);
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setDoctorsLoading(false);
    }
  }, [apiService, filters, selectedDoctor]);

  // Fetch filter options
  useEffect(() => {
    if (!apiService) return;
    
    const fetchFilters = async () => {
      try {
        // Get unique cities and specializations from doctors
        const res = await apiService.get('/users/doctors');
        const doctorsList = res.doctors || res.data?.doctors || res;
        
        if (Array.isArray(doctorsList)) {
          const citySet = new Set();
          const specSet = new Set();
          
          doctorsList.forEach(doc => {
            if (doc.location?.city) citySet.add(doc.location.city);
            if (doc.specialization) specSet.add(doc.specialization);
          });
          
          setCities([...citySet].sort());
          setSpecializations([...specSet].sort());
        }
      } catch (err) {
        console.error('Failed to fetch filter options:', err);
      }
    };
    
    fetchFilters();
  }, [apiService]);

  // Fetch availability for selected doctor
  const fetchAvailability = useCallback(async () => {
    if (!apiService || !selectedDoctor) return;
    setLoading(true);
    
    try {
      const startDate = weekDates[0].toISOString().split('T')[0];
      const endDate = weekDates[6].toISOString().split('T')[0];
      
      const res = await apiService.get(
        `/appointments/doctor-availability/${selectedDoctor._id || selectedDoctor.id}?startDate=${startDate}&endDate=${endDate}`
      );
      
      setAvailability(res.availability || {});
    } catch (err) {
      console.error('Failed to fetch availability:', err);
      setAvailability({});
    } finally {
      setLoading(false);
    }
  }, [apiService, selectedDoctor, weekDates]);

  // Fetch user's appointments
  const fetchMyAppointments = useCallback(async () => {
    if (!apiService || !currentUser) return;
    
    try {
      const res = await apiService.get('/appointments/upcoming');
      setMyAppointments(res.data || res || []);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    }
  }, [apiService, currentUser]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  useEffect(() => {
    fetchMyAppointments();
  }, [fetchMyAppointments]);

  // Navigate weeks
  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    // Don't go before today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newStart >= today || weekDates[0] > today) {
      setCurrentWeekStart(newStart);
    }
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const goToToday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(today.setDate(diff)));
  };

  // Get slot status for a specific date and time
  const getSlotStatus = (date, timeSlot) => {
    const dateStr = date.toISOString().split('T')[0];
    const key = `${dateStr}-${timeSlot}`;
    const slotData = availability[key];
    
    // Check if it's in the past
    const now = new Date();
    const slotDateTime = new Date(dateStr);
    const [time, period] = timeSlot.split(' ');
    const [hours, mins] = time.split(':').map(Number);
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;
    slotDateTime.setHours(hour24, mins);
    
    if (slotDateTime < now) {
      return { status: 'unavailable', data: null };
    }
    
    // Check if day is a working day
    if (selectedDoctor?.workingDays) {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      if (!selectedDoctor.workingDays.includes(dayName)) {
        return { status: 'unavailable', data: null };
      }
    }
    
    // Check break time
    if (selectedDoctor?.breakTime) {
      const breakStart = selectedDoctor.breakTime.start;
      const breakEnd = selectedDoctor.breakTime.end;
      // Simple comparison (assuming same format)
      if (timeSlot >= breakStart && timeSlot < breakEnd) {
        return { status: 'break', data: null };
      }
    }
    
    if (slotData) {
      if (slotData.status === 'blocked') {
        return { status: 'blocked', data: slotData };
      }
      if (slotData.isOwn) {
        // This is the current user's appointment
        return { status: slotData.status, data: slotData };
      }
      // Someone else's appointment
      return { status: 'unavailable', data: slotData };
    }
    
    return { status: 'available', data: null };
  };

  // Handle slot click
  const handleSlotClick = (date, timeSlot) => {
    const { status } = getSlotStatus(date, timeSlot);
    
    if (status === 'available') {
      setSelectedSlot({
        date: date.toISOString().split('T')[0],
        timeSlot,
        dateDisplay: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
      setShowBookingModal(true);
    }
  };

  // Book appointment
  const handleBookAppointment = async () => {
    if (!selectedSlot || !selectedDoctor) return;
    
    setBookingLoading(true);
    try {
      await apiService.post('/appointments', {
        doctorId: selectedDoctor._id || selectedDoctor.id,
        date: selectedSlot.date,
        timeSlot: selectedSlot.timeSlot,
        reason: bookingData.reason || 'General consultation',
        symptoms: bookingData.symptoms ? bookingData.symptoms.split(',').map(s => s.trim()) : []
      });
      
      alert('Appointment request sent successfully! Waiting for doctor confirmation.');
      setShowBookingModal(false);
      setSelectedSlot(null);
      setBookingData({ reason: '', symptoms: '' });
      fetchAvailability();
      fetchMyAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  // Styles
  const styles = {
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#F9FAFB',
      minHeight: '100vh'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '16px',
      color: '#6B7280'
    },
    mainLayout: {
      display: 'grid',
      gridTemplateColumns: '320px 1fr',
      gap: '24px'
    },
    sidebar: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    },
    cardHeader: {
      padding: '16px 20px',
      borderBottom: '1px solid #E5E7EB',
      fontWeight: '600',
      color: '#111827'
    },
    cardBody: {
      padding: '16px 20px'
    },
    filterGroup: {
      marginBottom: '16px'
    },
    filterLabel: {
      fontSize: '13px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '6px',
      display: 'block'
    },
    filterSelect: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #D1D5DB',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'white'
    },
    filterInput: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #D1D5DB',
      borderRadius: '8px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    doctorList: {
      maxHeight: '400px',
      overflowY: 'auto'
    },
    doctorItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      marginBottom: '8px'
    },
    doctorItemActive: {
      backgroundColor: '#EFF6FF',
      border: '2px solid #3B82F6'
    },
    doctorItemInactive: {
      backgroundColor: '#F9FAFB',
      border: '2px solid transparent'
    },
    doctorAvatar: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '2px solid #E5E7EB'
    },
    doctorInfo: {
      flex: 1
    },
    doctorName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#111827'
    },
    doctorSpec: {
      fontSize: '12px',
      color: '#6B7280',
      marginTop: '2px'
    },
    doctorLocation: {
      fontSize: '11px',
      color: '#9CA3AF',
      marginTop: '2px'
    },
    doctorRating: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '12px',
      color: '#F59E0B'
    },
    calendarSection: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    },
    calendarHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 24px',
      borderBottom: '1px solid #E5E7EB',
      backgroundColor: '#F9FAFB'
    },
    calendarNav: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    navBtn: {
      padding: '8px 16px',
      border: '1px solid #D1D5DB',
      borderRadius: '8px',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s'
    },
    todayBtn: {
      backgroundColor: '#3B82F6',
      color: 'white',
      border: 'none'
    },
    calendarTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827'
    },
    legend: {
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px',
      color: '#6B7280'
    },
    legendDot: {
      width: '12px',
      height: '12px',
      borderRadius: '4px'
    },
    calendarGrid: {
      display: 'grid',
      gridTemplateColumns: '80px repeat(7, 1fr)',
      borderTop: '1px solid #E5E7EB'
    },
    calendarCorner: {
      padding: '12px',
      borderRight: '1px solid #E5E7EB',
      borderBottom: '1px solid #E5E7EB',
      backgroundColor: '#F9FAFB'
    },
    dayHeader: {
      padding: '12px 8px',
      textAlign: 'center',
      borderRight: '1px solid #E5E7EB',
      borderBottom: '1px solid #E5E7EB',
      backgroundColor: '#F9FAFB'
    },
    dayName: {
      fontSize: '12px',
      fontWeight: '500',
      color: '#6B7280',
      textTransform: 'uppercase'
    },
    dayDate: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      marginTop: '4px'
    },
    todayHighlight: {
      backgroundColor: '#EFF6FF',
      color: '#3B82F6'
    },
    timeLabel: {
      padding: '4px 8px',
      borderRight: '1px solid #E5E7EB',
      borderBottom: '1px solid #F3F4F6',
      fontSize: '12px',
      color: '#6B7280',
      textAlign: 'right',
      backgroundColor: '#FAFAFA',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end'
    },
    slotCell: {
      padding: '2px',
      borderRight: '1px solid #E5E7EB',
      borderBottom: '1px solid #F3F4F6',
      height: '40px'
    },
    slot: {
      width: '100%',
      height: '100%',
      borderRadius: '6px',
      border: '1px solid',
      cursor: 'pointer',
      transition: 'all 0.15s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
      fontWeight: '500'
    },
    slotAvailable: {
      backgroundColor: slotColors.available.bg,
      borderColor: slotColors.available.border,
      color: slotColors.available.text
    },
    slotUnavailable: {
      backgroundColor: slotColors.unavailable.bg,
      borderColor: slotColors.unavailable.border,
      color: slotColors.unavailable.text,
      cursor: 'not-allowed'
    },
    slotPending: {
      backgroundColor: slotColors.pending.bg,
      borderColor: slotColors.pending.border,
      color: slotColors.pending.text
    },
    slotConfirmed: {
      backgroundColor: slotColors.confirmed.bg,
      borderColor: slotColors.confirmed.border,
      color: slotColors.confirmed.text
    },
    slotBlocked: {
      backgroundColor: slotColors.blocked.bg,
      borderColor: slotColors.blocked.border,
      color: slotColors.blocked.text,
      cursor: 'not-allowed'
    },
    slotBreak: {
      backgroundColor: slotColors.break.bg,
      borderColor: slotColors.break.border,
      color: slotColors.break.text,
      cursor: 'not-allowed'
    },
    // Doctor detail card
    doctorCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      padding: '20px',
      marginBottom: '20px'
    },
    doctorCardHeader: {
      display: 'flex',
      gap: '16px',
      marginBottom: '16px'
    },
    doctorCardAvatar: {
      width: '80px',
      height: '80px',
      borderRadius: '12px',
      objectFit: 'cover'
    },
    doctorCardInfo: {
      flex: 1
    },
    doctorCardName: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#111827'
    },
    doctorCardSpec: {
      fontSize: '14px',
      color: '#3B82F6',
      marginTop: '4px'
    },
    doctorCardRating: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '8px'
    },
    stars: {
      color: '#F59E0B'
    },
    ratingText: {
      fontSize: '14px',
      color: '#6B7280'
    },
    doctorCardDetails: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: '1px solid #E5E7EB'
    },
    detailItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px'
    },
    detailIcon: {
      fontSize: '16px'
    },
    detailText: {
      fontSize: '13px',
      color: '#6B7280'
    },
    detailValue: {
      fontSize: '13px',
      fontWeight: '500',
      color: '#111827'
    },
    viewProfileBtn: {
      width: '100%',
      padding: '10px',
      border: '1px solid #3B82F6',
      borderRadius: '8px',
      backgroundColor: 'white',
      color: '#3B82F6',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      marginTop: '16px',
      transition: 'all 0.2s'
    },
    // My appointments
    appointmentItem: {
      padding: '12px',
      borderRadius: '8px',
      backgroundColor: '#F9FAFB',
      marginBottom: '10px'
    },
    appointmentDate: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#111827'
    },
    appointmentDoctor: {
      fontSize: '13px',
      color: '#6B7280',
      marginTop: '4px'
    },
    appointmentStatus: {
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500',
      marginTop: '8px'
    },
    // Modal
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '20px',
      width: '100%',
      maxWidth: '480px',
      maxHeight: '90vh',
      overflow: 'auto'
    },
    modalHeader: {
      padding: '20px 24px',
      borderBottom: '1px solid #E5E7EB',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#6B7280'
    },
    modalBody: {
      padding: '24px'
    },
    bookingInfo: {
      backgroundColor: '#EFF6FF',
      padding: '16px',
      borderRadius: '12px',
      marginBottom: '20px'
    },
    bookingDoctor: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#111827'
    },
    bookingTime: {
      fontSize: '14px',
      color: '#3B82F6',
      marginTop: '4px'
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '6px'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #D1D5DB',
      borderRadius: '10px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '1px solid #D1D5DB',
      borderRadius: '10px',
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical',
      boxSizing: 'border-box'
    },
    modalActions: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px'
    },
    cancelBtn: {
      flex: 1,
      padding: '12px',
      border: '1px solid #D1D5DB',
      borderRadius: '10px',
      backgroundColor: 'white',
      color: '#374151',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    submitBtn: {
      flex: 1,
      padding: '12px',
      border: 'none',
      borderRadius: '10px',
      backgroundColor: '#3B82F6',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    loadingOverlay: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px',
      color: '#6B7280'
    },
    emptyState: {
      textAlign: 'center',
      padding: '48px 24px',
      color: '#6B7280'
    }
  };

  // Format month/year for header
  const formatMonthYear = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    const startMonth = start.toLocaleDateString('en-US', { month: 'long' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'long' });
    const year = start.getFullYear();
    
    if (startMonth === endMonth) {
      return `${startMonth} ${year}`;
    }
    return `${startMonth} - ${endMonth} ${year}`;
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Book an Appointment</h1>
        <p style={styles.subtitle}>Find a doctor and schedule your visit</p>
      </div>

      <div style={styles.mainLayout}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          {/* Filters */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>🔍 Find a Doctor</div>
            <div style={styles.cardBody}>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Search</label>
                <input
                  type="text"
                  placeholder="Doctor name or specialization..."
                  style={styles.filterInput}
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>City</label>
                <select
                  style={styles.filterSelect}
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                >
                  <option value="">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Specialization</label>
                <select
                  style={styles.filterSelect}
                  value={filters.specialization}
                  onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
                >
                  <option value="">All Specializations</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Doctor List */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>👨‍⚕️ Doctors ({doctors.length})</div>
            <div style={{ ...styles.cardBody, ...styles.doctorList }}>
              {doctorsLoading ? (
                <div style={styles.emptyState}>Loading doctors...</div>
              ) : doctors.length === 0 ? (
                <div style={styles.emptyState}>No doctors found</div>
              ) : (
                doctors.map(doc => (
                  <div
                    key={doc._id || doc.id}
                    style={{
                      ...styles.doctorItem,
                      ...(selectedDoctor?._id === doc._id || selectedDoctor?.id === doc.id
                        ? styles.doctorItemActive
                        : styles.doctorItemInactive)
                    }}
                    onClick={() => setSelectedDoctor(doc)}
                  >
                    <img
                      src={doc.avatar || doc.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=3B82F6&color=fff`}
                      alt={doc.name}
                      style={styles.doctorAvatar}
                    />
                    <div style={styles.doctorInfo}>
                      <div style={styles.doctorName}>{doc.name}</div>
                      <div style={styles.doctorSpec}>{doc.specialization || 'General'}</div>
                      <div style={styles.doctorLocation}>📍 {doc.location?.city || doc.clinic?.address?.split(',')[0] || 'N/A'}</div>
                    </div>
                    <div style={styles.doctorRating}>
                      ⭐ {doc.rating?.toFixed(1) || '4.5'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My Appointments */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>📋 My Upcoming</div>
            <div style={styles.cardBody}>
              {myAppointments.length === 0 ? (
                <div style={{ ...styles.emptyState, padding: '16px' }}>
                  No upcoming appointments
                </div>
              ) : (
                myAppointments.slice(0, 3).map(apt => (
                  <div key={apt._id || apt.id} style={styles.appointmentItem}>
                    <div style={styles.appointmentDate}>
                      {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {apt.timeSlot}
                    </div>
                    <div style={styles.appointmentDoctor}>
                      {apt.doctorName || apt.doctor?.name}
                    </div>
                    <span style={{
                      ...styles.appointmentStatus,
                      backgroundColor: slotColors[apt.status]?.bg || '#F3F4F6',
                      color: slotColors[apt.status]?.text || '#6B7280'
                    }}>
                      {apt.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div>
          {/* Selected Doctor Card */}
          {selectedDoctor && (
            <div style={styles.doctorCard}>
              <div style={styles.doctorCardHeader}>
                <img
                  src={selectedDoctor.avatar || selectedDoctor.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoctor.name)}&background=3B82F6&color=fff&size=160`}
                  alt={selectedDoctor.name}
                  style={styles.doctorCardAvatar}
                />
                <div style={styles.doctorCardInfo}>
                  <div style={styles.doctorCardName}>{selectedDoctor.name}</div>
                  <div style={styles.doctorCardSpec}>{selectedDoctor.specialization}</div>
                  <div style={styles.doctorCardRating}>
                    <span style={styles.stars}>{'★'.repeat(Math.round(selectedDoctor.rating || 4))}</span>
                    <span style={styles.ratingText}>
                      {selectedDoctor.rating?.toFixed(1) || '4.5'} ({selectedDoctor.totalReviews || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>
              <div style={styles.doctorCardDetails}>
                <div style={styles.detailItem}>
                  <span style={styles.detailIcon}>📍</span>
                  <div>
                    <div style={styles.detailText}>Location</div>
                    <div style={styles.detailValue}>{selectedDoctor.clinic?.address || selectedDoctor.location?.city || 'N/A'}</div>
                  </div>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailIcon}>📞</span>
                  <div>
                    <div style={styles.detailText}>Contact</div>
                    <div style={styles.detailValue}>{selectedDoctor.clinic?.phone || selectedDoctor.phone || 'N/A'}</div>
                  </div>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailIcon}>💰</span>
                  <div>
                    <div style={styles.detailText}>Consultation Fee</div>
                    <div style={styles.detailValue}>₹{selectedDoctor.consultationFee || 500}</div>
                  </div>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailIcon}>🕐</span>
                  <div>
                    <div style={styles.detailText}>Timings</div>
                    <div style={styles.detailValue}>{selectedDoctor.clinic?.timings || 'Mon-Sat 9AM-6PM'}</div>
                  </div>
                </div>
              </div>
              <button
                style={styles.viewProfileBtn}
                onClick={() => setShowDoctorModal(true)}
              >
                View Full Profile
              </button>
            </div>
          )}

          {/* Calendar */}
          <div style={styles.calendarSection}>
            <div style={styles.calendarHeader}>
              <div style={styles.calendarNav}>
                <button
                  style={styles.navBtn}
                  onClick={goToPreviousWeek}
                >
                  ← Prev
                </button>
                <button
                  style={{ ...styles.navBtn, ...styles.todayBtn }}
                  onClick={goToToday}
                >
                  Today
                </button>
                <button
                  style={styles.navBtn}
                  onClick={goToNextWeek}
                >
                  Next →
                </button>
              </div>
              <div style={styles.calendarTitle}>{formatMonthYear()}</div>
              <div style={styles.legend}>
                {Object.entries(slotColors).slice(0, 4).map(([key, value]) => (
                  <div key={key} style={styles.legendItem}>
                    <div style={{ ...styles.legendDot, backgroundColor: value.bg, border: `1px solid ${value.border}` }} />
                    <span>{value.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={styles.loadingOverlay}>Loading availability...</div>
            ) : !selectedDoctor ? (
              <div style={styles.emptyState}>
                <p>Please select a doctor to view availability</p>
              </div>
            ) : (
              <div style={styles.calendarGrid}>
                {/* Corner */}
                <div style={styles.calendarCorner}></div>
                
                {/* Day Headers */}
                {weekDates.map((date, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...styles.dayHeader,
                      ...(isToday(date) ? styles.todayHighlight : {})
                    }}
                  >
                    <div style={styles.dayName}>
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div style={{
                      ...styles.dayDate,
                      ...(isToday(date) ? { color: '#3B82F6' } : {})
                    }}>
                      {date.getDate()}
                    </div>
                  </div>
                ))}

                {/* Time Slots */}
                {timeSlots.map((slot, slotIdx) => (
                  <React.Fragment key={slot.time}>
                    {/* Time Label */}
                    <div style={styles.timeLabel}>{slot.time}</div>
                    
                    {/* Day Cells */}
                    {weekDates.map((date, dayIdx) => {
                      const { status } = getSlotStatus(date, slot.time);
                      const slotStyle = {
                        available: styles.slotAvailable,
                        unavailable: styles.slotUnavailable,
                        pending: styles.slotPending,
                        confirmed: styles.slotConfirmed,
                        blocked: styles.slotBlocked,
                        break: styles.slotBreak
                      }[status] || styles.slotUnavailable;
                      
                      return (
                        <div key={`${slotIdx}-${dayIdx}`} style={styles.slotCell}>
                          <div
                            style={{ ...styles.slot, ...slotStyle }}
                            onClick={() => handleSlotClick(date, slot.time)}
                            title={status === 'available' ? 'Click to book' : status}
                          >
                            {status === 'pending' && '⏳'}
                            {status === 'confirmed' && '✓'}
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedSlot && (
        <div style={styles.modalOverlay} onClick={() => setShowBookingModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Book Appointment</span>
              <button style={styles.closeBtn} onClick={() => setShowBookingModal(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.bookingInfo}>
                <div style={styles.bookingDoctor}>{selectedDoctor?.name}</div>
                <div style={styles.bookingTime}>
                  📅 {selectedSlot.dateDisplay} at {selectedSlot.timeSlot}
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '8px' }}>
                  📍 {selectedDoctor?.clinic?.address || 'Clinic address'}
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Reason for Visit *</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="e.g., General checkup, Follow-up..."
                  value={bookingData.reason}
                  onChange={(e) => setBookingData(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Symptoms (comma separated)</label>
                <textarea
                  style={styles.textarea}
                  placeholder="e.g., Headache, Fever, Fatigue..."
                  value={bookingData.symptoms}
                  onChange={(e) => setBookingData(prev => ({ ...prev, symptoms: e.target.value }))}
                />
              </div>
              
              <div style={styles.modalActions}>
                <button style={styles.cancelBtn} onClick={() => setShowBookingModal(false)}>
                  Cancel
                </button>
                <button
                  style={styles.submitBtn}
                  onClick={handleBookAppointment}
                  disabled={bookingLoading || !bookingData.reason}
                >
                  {bookingLoading ? 'Booking...' : 'Request Appointment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Profile Modal */}
      {showDoctorModal && selectedDoctor && (
        <div style={styles.modalOverlay} onClick={() => setShowDoctorModal(false)}>
          <div style={{ ...styles.modal, maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Doctor Profile</span>
              <button style={styles.closeBtn} onClick={() => setShowDoctorModal(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                <img
                  src={selectedDoctor.avatar || selectedDoctor.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoctor.name)}&size=200`}
                  alt={selectedDoctor.name}
                  style={{ width: '120px', height: '120px', borderRadius: '16px', objectFit: 'cover' }}
                />
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>{selectedDoctor.name}</h2>
                  <p style={{ color: '#3B82F6', fontSize: '16px', marginBottom: '8px' }}>{selectedDoctor.specialization}</p>
                  <p style={{ color: '#6B7280', fontSize: '14px' }}>
                    {selectedDoctor.experience} years experience
                  </p>
                  <div style={{ marginTop: '12px' }}>
                    <span style={{ color: '#F59E0B' }}>{'★'.repeat(Math.round(selectedDoctor.rating || 4))}</span>
                    <span style={{ color: '#6B7280', marginLeft: '8px' }}>
                      {selectedDoctor.rating?.toFixed(1)} ({selectedDoctor.totalReviews} reviews)
                    </span>
                  </div>
                </div>
              </div>
              
              {selectedDoctor.bio && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>About</h3>
                  <p style={{ color: '#6B7280', lineHeight: '1.6' }}>{selectedDoctor.bio}</p>
                </div>
              )}
              
              {selectedDoctor.qualifications?.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Qualifications</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedDoctor.qualifications.map((q, i) => (
                      <span key={i} style={{
                        backgroundColor: '#EFF6FF',
                        color: '#3B82F6',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '13px'
                      }}>
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedDoctor.languages?.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Languages</h3>
                  <p style={{ color: '#6B7280' }}>{selectedDoctor.languages.join(', ')}</p>
                </div>
              )}
              
              <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Clinic Details</h3>
                <p style={{ fontWeight: '500', marginBottom: '4px' }}>{selectedDoctor.clinic?.name || 'Clinic'}</p>
                <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '8px' }}>{selectedDoctor.clinic?.address}</p>
                <p style={{ color: '#6B7280', fontSize: '14px' }}>📞 {selectedDoctor.clinic?.phone || selectedDoctor.phone}</p>
                <p style={{ color: '#6B7280', fontSize: '14px' }}>🕐 {selectedDoctor.clinic?.timings}</p>
                <p style={{ color: '#3B82F6', fontSize: '16px', fontWeight: '600', marginTop: '12px' }}>
                  Consultation Fee: ₹{selectedDoctor.consultationFee}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
