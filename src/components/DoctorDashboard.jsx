import React, { useState, useEffect, useCallback } from 'react';
import { useBackendContext } from '../contexts/BackendContext';

/**
 * Doctor Dashboard - Appointment Management
 * 
 * SECURITY BOUNDARIES:
 * - Doctors can ONLY see their own schedule and their own patients
 * - Cannot browse other doctors' schedules or patient lists  
 * - Patient details (phone, blood group, allergies) only shown for the doctor's own appointments
 * - All API endpoints are auth-guarded with role='doctor' + ownership checks
 * 
 * Features:
 * - View own appointments by date
 * - Pending appointment requests queue (only this doctor's)
 * - Today's schedule overview
 * - Confirm/Reject/Reschedule actions on own appointments
 * - Block/Unblock time slots for own schedule
 * - Update own availability settings
 */
export default function DoctorDashboard() {
  const { currentUser, apiService } = useBackendContext();
  
  // State
  const [activeTab, setActiveTab] = useState('today');
  const [appointments, setAppointments] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'confirm', 'reject', 'reschedule', 'details'
  const [actionLoading, setActionLoading] = useState(false);
  
  // Availability settings
  const [availabilitySettings, setAvailabilitySettings] = useState({
    workingDays: [],
    workingHours: { start: '09:00 AM', end: '06:00 PM' },
    slotDuration: 30,
    breakTime: { start: '01:00 PM', end: '02:00 PM' }
  });
  
  // Reschedule form
  const [rescheduleData, setRescheduleData] = useState({
    newDate: '',
    newTimeSlot: '',
    reason: ''
  });

  // Colors for status
  const statusColors = {
    pending: { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
    confirmed: { bg: '#D1FAE5', text: '#065F46', border: '#10B981' },
    completed: { bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6' },
    cancelled: { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' },
    rejected: { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' },
    rescheduled: { bg: '#E0E7FF', text: '#3730A3', border: '#6366F1' }
  };

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    if (!apiService) return;
    setLoading(true);
    setError(null);
    
    try {
      const [allAppts, pending] = await Promise.all([
        apiService.get(`/appointments/doctor?date=${selectedDate}`),
        apiService.get('/appointments/doctor/pending')
      ]);
      
      setAppointments(allAppts.data || allAppts);
      setPendingRequests(pending.data || pending);
    } catch (err) {
      setError('Failed to load appointments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiService, selectedDate]);

  // Fetch today's appointments
  const fetchTodayAppointments = useCallback(async () => {
    if (!apiService) return;
    setLoading(true);
    
    try {
      const res = await apiService.get('/appointments/doctor/today');
      setAppointments(res.data || res);
    } catch (err) {
      setError('Failed to load today\'s appointments');
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  useEffect(() => {
    if (activeTab === 'today') {
      fetchTodayAppointments();
    } else if (activeTab === 'calendar') {
      fetchAppointments();
    } else if (activeTab === 'pending') {
      fetchPendingOnly();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedDate, fetchAppointments, fetchTodayAppointments]);

  const fetchPendingOnly = async () => {
    if (!apiService) return;
    setLoading(true);
    try {
      const res = await apiService.get('/appointments/doctor/pending');
      setPendingRequests(res.data || res);
    } catch (err) {
      setError('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  // Load availability settings
  useEffect(() => {
    if (currentUser) {
      setAvailabilitySettings({
        workingDays: currentUser.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workingHours: currentUser.workingHours || { start: '09:00 AM', end: '06:00 PM' },
        slotDuration: currentUser.slotDuration || 30,
        breakTime: currentUser.breakTime || { start: '01:00 PM', end: '02:00 PM' }
      });
    }
  }, [currentUser]);

  // Action handlers
  const handleConfirm = async (appointmentId, duration) => {
    setActionLoading(true);
    try {
      await apiService.put(`/appointments/${appointmentId}/confirm`, { duration });
      setShowModal(false);
      fetchAppointments();
      fetchPendingOnly();
    } catch (err) {
      alert('Failed to confirm appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (appointmentId, reason) => {
    setActionLoading(true);
    try {
      await apiService.put(`/appointments/${appointmentId}/reject`, { reason });
      setShowModal(false);
      fetchAppointments();
      fetchPendingOnly();
    } catch (err) {
      alert('Failed to reject appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async (appointmentId) => {
    if (!rescheduleData.newDate || !rescheduleData.newTimeSlot) {
      alert('Please select new date and time');
      return;
    }
    setActionLoading(true);
    try {
      await apiService.put(`/appointments/${appointmentId}/reschedule`, rescheduleData);
      setShowModal(false);
      setRescheduleData({ newDate: '', newTimeSlot: '', reason: '' });
      fetchAppointments();
    } catch (err) {
      alert('Failed to reschedule appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (appointmentId) => {
    setActionLoading(true);
    try {
      await apiService.put(`/appointments/${appointmentId}/complete`);
      fetchAppointments();
      fetchTodayAppointments();
    } catch (err) {
      alert('Failed to mark as completed');
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (type, appointment) => {
    setModalType(type);
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  // Generate time slots for rescheduling
  const generateTimeSlots = () => {
    const slots = [];
    const start = 9; // 9 AM
    const end = 18; // 6 PM
    for (let hour = start; hour < end; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const h = hour > 12 ? hour - 12 : hour;
        const period = hour >= 12 ? 'PM' : 'AM';
        const time = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')} ${period}`;
        slots.push(time);
      }
    }
    return slots;
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
      marginBottom: '24px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#6B7280'
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      borderBottom: '1px solid #E5E7EB',
      paddingBottom: '12px'
    },
    tab: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s'
    },
    tabActive: {
      backgroundColor: '#3B82F6',
      color: 'white'
    },
    tabInactive: {
      backgroundColor: '#F3F4F6',
      color: '#4B5563'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    statNumber: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#111827'
    },
    statLabel: {
      fontSize: '14px',
      color: '#6B7280',
      marginTop: '4px'
    },
    mainContent: {
      display: 'grid',
      gridTemplateColumns: '1fr 350px',
      gap: '24px'
    },
    appointmentsList: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    },
    listHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 20px',
      borderBottom: '1px solid #E5E7EB'
    },
    listTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#111827'
    },
    dateInput: {
      padding: '8px 12px',
      border: '1px solid #D1D5DB',
      borderRadius: '6px',
      fontSize: '14px'
    },
    appointmentItem: {
      display: 'flex',
      padding: '16px 20px',
      borderBottom: '1px solid #F3F4F6',
      alignItems: 'flex-start',
      gap: '16px',
      transition: 'background 0.2s'
    },
    appointmentTime: {
      minWidth: '80px',
      textAlign: 'center'
    },
    timeText: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#111827'
    },
    durationText: {
      fontSize: '12px',
      color: '#9CA3AF'
    },
    appointmentDetails: {
      flex: 1
    },
    patientName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '4px'
    },
    patientInfo: {
      fontSize: '13px',
      color: '#6B7280',
      marginBottom: '4px'
    },
    reason: {
      fontSize: '13px',
      color: '#4B5563',
      backgroundColor: '#F9FAFB',
      padding: '8px 12px',
      borderRadius: '6px',
      marginTop: '8px'
    },
    statusBadge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
      textTransform: 'capitalize'
    },
    actions: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    actionBtn: {
      padding: '6px 12px',
      border: 'none',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    confirmBtn: {
      backgroundColor: '#10B981',
      color: 'white'
    },
    rejectBtn: {
      backgroundColor: '#EF4444',
      color: 'white'
    },
    rescheduleBtn: {
      backgroundColor: '#6366F1',
      color: 'white'
    },
    completeBtn: {
      backgroundColor: '#3B82F6',
      color: 'white'
    },
    viewBtn: {
      backgroundColor: '#F3F4F6',
      color: '#374151'
    },
    sidebar: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    pendingCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    },
    pendingHeader: {
      padding: '16px 20px',
      borderBottom: '1px solid #E5E7EB',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    pendingCount: {
      backgroundColor: '#FEF3C7',
      color: '#92400E',
      padding: '2px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600'
    },
    pendingItem: {
      padding: '12px 20px',
      borderBottom: '1px solid #F3F4F6'
    },
    pendingName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#111827'
    },
    pendingTime: {
      fontSize: '13px',
      color: '#6B7280',
      marginTop: '2px'
    },
    pendingActions: {
      display: 'flex',
      gap: '8px',
      marginTop: '8px'
    },
    smallBtn: {
      padding: '4px 10px',
      border: 'none',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    // Modal styles
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
      borderRadius: '16px',
      width: '100%',
      maxWidth: '500px',
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
      padding: '10px 12px',
      border: '1px solid #D1D5DB',
      borderRadius: '8px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #D1D5DB',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'white'
    },
    textarea: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #D1D5DB',
      borderRadius: '8px',
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical',
      boxSizing: 'border-box'
    },
    modalActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '24px'
    },
    cancelBtn: {
      padding: '10px 20px',
      border: '1px solid #D1D5DB',
      borderRadius: '8px',
      backgroundColor: 'white',
      color: '#374151',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    submitBtn: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: '#3B82F6',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    // Patient details in modal
    detailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid #F3F4F6'
    },
    detailLabel: {
      fontSize: '14px',
      color: '#6B7280'
    },
    detailValue: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#111827'
    },
    emptyState: {
      textAlign: 'center',
      padding: '48px 24px',
      color: '#6B7280'
    },
    emptyIcon: {
      fontSize: '48px',
      marginBottom: '16px'
    },
    loadingState: {
      textAlign: 'center',
      padding: '48px 24px',
      color: '#6B7280'
    }
  };

  // Render appointment card
  const renderAppointmentCard = (apt, showActions = true) => {
    const statusStyle = statusColors[apt.status] || statusColors.pending;
    
    return (
      <div key={apt._id || apt.id} style={styles.appointmentItem}>
        <div style={styles.appointmentTime}>
          <div style={styles.timeText}>{apt.timeSlot}</div>
          <div style={styles.durationText}>{apt.duration || 30} min</div>
        </div>
        
        <div style={styles.appointmentDetails}>
          <div style={styles.patientName}>
            {apt.patientName || apt.patient?.name || 'Unknown Patient'}
          </div>
          <div style={styles.patientInfo}>
            📞 {apt.patientPhone || apt.patient?.phone || 'N/A'} • 
            🩸 {apt.patient?.bloodGroup || 'N/A'}
          </div>
          {apt.reason && (
            <div style={styles.reason}>
              <strong>Reason:</strong> {apt.reason}
            </div>
          )}
          {apt.patient?.allergies?.length > 0 && (
            <div style={{ ...styles.reason, backgroundColor: '#FEF3C7', marginTop: '8px' }}>
              ⚠️ <strong>Allergies:</strong> {apt.patient.allergies.join(', ')}
            </div>
          )}
        </div>
        
        <div>
          <span style={{
            ...styles.statusBadge,
            backgroundColor: statusStyle.bg,
            color: statusStyle.text,
            border: `1px solid ${statusStyle.border}`
          }}>
            {apt.status}
          </span>
          
          {showActions && (
            <div style={{ ...styles.actions, marginTop: '12px' }}>
              {apt.status === 'pending' && (
                <>
                  <button
                    style={{ ...styles.actionBtn, ...styles.confirmBtn }}
                    onClick={() => openModal('confirm', apt)}
                  >
                    ✓ Confirm
                  </button>
                  <button
                    style={{ ...styles.actionBtn, ...styles.rejectBtn }}
                    onClick={() => openModal('reject', apt)}
                  >
                    ✕ Reject
                  </button>
                  <button
                    style={{ ...styles.actionBtn, ...styles.rescheduleBtn }}
                    onClick={() => openModal('reschedule', apt)}
                  >
                    ↻ Reschedule
                  </button>
                </>
              )}
              {apt.status === 'confirmed' && (
                <button
                  style={{ ...styles.actionBtn, ...styles.completeBtn }}
                  onClick={() => handleComplete(apt._id || apt.id)}
                  disabled={actionLoading}
                >
                  ✓ Mark Complete
                </button>
              )}
              <button
                style={{ ...styles.actionBtn, ...styles.viewBtn }}
                onClick={() => openModal('details', apt)}
              >
                View Details
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Stats calculation
  const todayCount = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  if (!currentUser || currentUser.role !== 'doctor') {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔒</div>
          <h2>Access Denied</h2>
          <p>This dashboard is only available for doctors.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Doctor Dashboard</h1>
        <p style={styles.subtitle}>Welcome back, {currentUser.name}! Manage your appointments and schedule.</p>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{todayCount}</div>
          <div style={styles.statLabel}>Today&apos;s Appointments</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #F59E0B' }}>
          <div style={{ ...styles.statNumber, color: '#F59E0B' }}>{pendingRequests.length}</div>
          <div style={styles.statLabel}>Pending Requests</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #10B981' }}>
          <div style={{ ...styles.statNumber, color: '#10B981' }}>{confirmedCount}</div>
          <div style={styles.statLabel}>Confirmed</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #3B82F6' }}>
          <div style={{ ...styles.statNumber, color: '#3B82F6' }}>{completedCount}</div>
          <div style={styles.statLabel}>Completed Today</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['today', 'pending', 'calendar', 'settings'].map(tab => (
          <button
            key={tab}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.tabActive : styles.tabInactive)
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'today' && '📅 Today'}
            {tab === 'pending' && `⏳ Pending (${pendingRequests.length})`}
            {tab === 'calendar' && '🗓️ Calendar'}
            {tab === 'settings' && '⚙️ Availability'}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Appointments List */}
        <div style={styles.appointmentsList}>
          <div style={styles.listHeader}>
            <span style={styles.listTitle}>
              {activeTab === 'today' && (<>Today&apos;s Schedule</>)}
              {activeTab === 'pending' && 'Pending Appointment Requests'}
              {activeTab === 'calendar' && 'Appointments by Date'}
              {activeTab === 'settings' && 'Availability Settings'}
            </span>
            {activeTab === 'calendar' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={styles.dateInput}
              />
            )}
          </div>

          {loading ? (
            <div style={styles.loadingState}>
              <p>Loading appointments...</p>
            </div>
          ) : error ? (
            <div style={styles.emptyState}>
              <p style={{ color: '#EF4444' }}>{error}</p>
            </div>
          ) : activeTab === 'settings' ? (
            <div style={{ padding: '24px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Working Days</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="checkbox"
                        checked={availabilitySettings.workingDays.includes(day)}
                        onChange={(e) => {
                          const days = e.target.checked
                            ? [...availabilitySettings.workingDays, day]
                            : availabilitySettings.workingDays.filter(d => d !== day);
                          setAvailabilitySettings(prev => ({ ...prev, workingDays: days }));
                        }}
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Working Hours Start</label>
                  <select
                    style={styles.select}
                    value={availabilitySettings.workingHours.start}
                    onChange={(e) => setAvailabilitySettings(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, start: e.target.value }
                    }))}
                  >
                    {generateTimeSlots().map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Working Hours End</label>
                  <select
                    style={styles.select}
                    value={availabilitySettings.workingHours.end}
                    onChange={(e) => setAvailabilitySettings(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, end: e.target.value }
                    }))}
                  >
                    {generateTimeSlots().map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Slot Duration (minutes)</label>
                <select
                  style={styles.select}
                  value={availabilitySettings.slotDuration}
                  onChange={(e) => setAvailabilitySettings(prev => ({
                    ...prev,
                    slotDuration: parseInt(e.target.value)
                  }))}
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
              <button
                style={{ ...styles.submitBtn, marginTop: '16px' }}
                onClick={async () => {
                  try {
                    await apiService.put('/appointments/update-availability', availabilitySettings);
                    alert('Settings saved!');
                  } catch (err) {
                    alert('Failed to save settings');
                  }
                }}
              >
                Save Settings
              </button>
            </div>
          ) : (
            <div>
              {(activeTab === 'pending' ? pendingRequests : appointments).length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📭</div>
                  <p>No appointments found</p>
                </div>
              ) : (
                (activeTab === 'pending' ? pendingRequests : appointments).map(apt => 
                  renderAppointmentCard(apt, true)
                )
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Pending Quick View */}
        <div style={styles.sidebar}>
          <div style={styles.pendingCard}>
            <div style={styles.pendingHeader}>
              <span style={styles.listTitle}>Quick Actions</span>
            </div>
            <div style={{ padding: '16px' }}>
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '12px' }}>
                Pending requests need your attention
              </p>
              {pendingRequests.slice(0, 3).map(apt => (
                <div key={apt._id || apt.id} style={styles.pendingItem}>
                  <div style={styles.pendingName}>{apt.patientName}</div>
                  <div style={styles.pendingTime}>
                    {apt.date} at {apt.timeSlot}
                  </div>
                  <div style={styles.pendingActions}>
                    <button
                      style={{ ...styles.smallBtn, backgroundColor: '#10B981', color: 'white' }}
                      onClick={() => handleConfirm(apt._id || apt.id, 30)}
                    >
                      Confirm
                    </button>
                    <button
                      style={{ ...styles.smallBtn, backgroundColor: '#F3F4F6', color: '#374151' }}
                      onClick={() => openModal('details', apt)}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
              {pendingRequests.length > 3 && (
                <button
                  style={{ ...styles.cancelBtn, width: '100%', marginTop: '12px' }}
                  onClick={() => setActiveTab('pending')}
                >
                  View All ({pendingRequests.length})
                </button>
              )}
            </div>
          </div>

          {/* Clinic Info */}
          <div style={styles.pendingCard}>
            <div style={styles.pendingHeader}>
              <span style={styles.listTitle}>Clinic Info</span>
            </div>
            <div style={{ padding: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                {currentUser.clinic?.name || 'Your Clinic'}
              </p>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>
                {currentUser.clinic?.address || 'Address not set'}
              </p>
              <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '8px' }}>
                📞 {currentUser.clinic?.phone || currentUser.phone || 'N/A'}
              </p>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>
                🕐 {currentUser.clinic?.timings || 'Mon-Fri 9AM-6PM'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedAppointment && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>
                {modalType === 'confirm' && 'Confirm Appointment'}
                {modalType === 'reject' && 'Reject Appointment'}
                {modalType === 'reschedule' && 'Reschedule Appointment'}
                {modalType === 'details' && 'Appointment Details'}
              </span>
              <button style={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              {/* Patient Info */}
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Patient</span>
                <span style={styles.detailValue}>{selectedAppointment.patientName}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Date & Time</span>
                <span style={styles.detailValue}>{selectedAppointment.date} at {selectedAppointment.timeSlot}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Reason</span>
                <span style={styles.detailValue}>{selectedAppointment.reason}</span>
              </div>
              {selectedAppointment.patient && (
                <>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Phone</span>
                    <span style={styles.detailValue}>{selectedAppointment.patient.phone || 'N/A'}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Blood Group</span>
                    <span style={styles.detailValue}>{selectedAppointment.patient.bloodGroup || 'N/A'}</span>
                  </div>
                  {selectedAppointment.patient.allergies?.length > 0 && (
                    <div style={{ ...styles.detailRow, backgroundColor: '#FEF3C7', padding: '12px', borderRadius: '8px', marginTop: '12px' }}>
                      <span style={styles.detailLabel}>⚠️ Allergies</span>
                      <span style={styles.detailValue}>{selectedAppointment.patient.allergies.join(', ')}</span>
                    </div>
                  )}
                </>
              )}

              {/* Confirm Form */}
              {modalType === 'confirm' && (
                <div style={{ marginTop: '20px' }}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Duration (minutes)</label>
                    <select style={styles.select} defaultValue={30}>
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                    </select>
                  </div>
                  <div style={styles.modalActions}>
                    <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                    <button
                      style={{ ...styles.submitBtn, backgroundColor: '#10B981' }}
                      onClick={() => handleConfirm(selectedAppointment._id || selectedAppointment.id, 30)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Confirming...' : 'Confirm Appointment'}
                    </button>
                  </div>
                </div>
              )}

              {/* Reject Form */}
              {modalType === 'reject' && (
                <div style={{ marginTop: '20px' }}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Reason for rejection</label>
                    <textarea
                      style={styles.textarea}
                      placeholder="Please provide a reason..."
                      id="rejectReason"
                    />
                  </div>
                  <div style={styles.modalActions}>
                    <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                    <button
                      style={{ ...styles.submitBtn, backgroundColor: '#EF4444' }}
                      onClick={() => handleReject(
                        selectedAppointment._id || selectedAppointment.id,
                        document.getElementById('rejectReason').value
                      )}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Rejecting...' : 'Reject Appointment'}
                    </button>
                  </div>
                </div>
              )}

              {/* Reschedule Form */}
              {modalType === 'reschedule' && (
                <div style={{ marginTop: '20px' }}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>New Date</label>
                    <input
                      type="date"
                      style={styles.input}
                      value={rescheduleData.newDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setRescheduleData(prev => ({ ...prev, newDate: e.target.value }))}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>New Time</label>
                    <select
                      style={styles.select}
                      value={rescheduleData.newTimeSlot}
                      onChange={(e) => setRescheduleData(prev => ({ ...prev, newTimeSlot: e.target.value }))}
                    >
                      <option value="">Select time...</option>
                      {generateTimeSlots().map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Reason</label>
                    <textarea
                      style={styles.textarea}
                      placeholder="Reason for rescheduling..."
                      value={rescheduleData.reason}
                      onChange={(e) => setRescheduleData(prev => ({ ...prev, reason: e.target.value }))}
                    />
                  </div>
                  <div style={styles.modalActions}>
                    <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                    <button
                      style={{ ...styles.submitBtn, backgroundColor: '#6366F1' }}
                      onClick={() => handleReschedule(selectedAppointment._id || selectedAppointment.id)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Rescheduling...' : 'Reschedule'}
                    </button>
                  </div>
                </div>
              )}

              {/* Details View */}
              {modalType === 'details' && (
                <div style={styles.modalActions}>
                  <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
