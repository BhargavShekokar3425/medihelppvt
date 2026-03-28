import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBackendContext } from '../contexts/BackendContext';

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  header: {
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '24px',
    color: '#fff',
  },
  headerTitle: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 700,
  },
  headerSubtitle: {
    margin: '8px 0 0',
    fontSize: '14px',
    opacity: 0.9,
  },
  statsRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  statCard: {
    flex: '1 1 150px',
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#1e40af',
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '4px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  rxNumber: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e40af',
  },
  cardDate: {
    fontSize: '12px',
    color: '#64748b',
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  statusActive: {
    background: '#dcfce7',
    color: '#166534',
  },
  statusFilled: {
    background: '#dbeafe',
    color: '#1e40af',
  },
  statusExpired: {
    background: '#fee2e2',
    color: '#991b1b',
  },
  statusCancelled: {
    background: '#f3f4f6',
    color: '#6b7280',
  },
  doctorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  avatarPlaceholder: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 600,
    fontSize: '16px',
  },
  doctorName: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
  },
  specialization: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
  },
  diagnosis: {
    fontSize: '14px',
    color: '#334155',
    marginBottom: '12px',
    padding: '10px 12px',
    background: '#fef3c7',
    borderRadius: '8px',
    borderLeft: '3px solid #f59e0b',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #e2e8f0',
  },
  medCount: {
    fontSize: '13px',
    color: '#64748b',
  },
  viewBtn: {
    padding: '8px 16px',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: '#fff',
    borderRadius: '16px',
    maxWidth: '700px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    background: '#fff',
    zIndex: 10,
  },
  modalTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 700,
    color: '#1e293b',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#64748b',
    padding: '4px',
  },
  modalBody: {
    padding: '24px',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '12px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  infoItem: {
    fontSize: '14px',
  },
  infoLabel: {
    color: '#64748b',
    marginRight: '4px',
  },
  infoValue: {
    color: '#1e293b',
    fontWeight: 500,
  },
  medsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  tableHeader: {
    background: '#f8fafc',
    textAlign: 'left',
    padding: '12px',
    fontWeight: 600,
    color: '#475569',
    borderBottom: '2px solid #e2e8f0',
  },
  tableCell: {
    padding: '12px',
    borderBottom: '1px solid #e2e8f0',
    color: '#334155',
  },
  testsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  testItem: {
    padding: '10px 12px',
    background: '#f0f9ff',
    borderRadius: '8px',
    marginBottom: '8px',
    borderLeft: '3px solid #0ea5e9',
    fontSize: '14px',
  },
  notes: {
    padding: '16px',
    background: '#f5f3ff',
    borderRadius: '8px',
    borderLeft: '3px solid #8b5cf6',
    fontSize: '14px',
    color: '#334155',
    lineHeight: 1.6,
  },
  modalFooter: {
    display: 'flex',
    gap: '12px',
    padding: '20px 24px',
    borderTop: '1px solid #e2e8f0',
    justifyContent: 'flex-end',
  },
  downloadBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cancelBtn: {
    padding: '12px 24px',
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#64748b',
  },
  loader: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '16px',
    color: '#64748b',
  },
  errorBox: {
    padding: '16px 20px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    color: '#dc2626',
    marginBottom: '20px',
  },
  allergyWarning: {
    background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
    border: '2px solid #ef4444',
    padding: '12px 16px',
    borderRadius: '8px',
    margin: '12px 0',
    color: '#991b1b',
    fontSize: '14px',
    fontWeight: 500,
  },
  // Request Bar styles
  requestBarSection: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
  },
  requestBarContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
  requestBarTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
  },
  requestBarSubtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: '4px 0 0',
  },
  requestBarButtons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  requestButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  medicineRequestBtn: {
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
  },
  prescriptionRequestBtn: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
  },
  // Access Request Notification styles
  notificationSection: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '24px',
    border: '2px solid #f59e0b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
  },
  notificationContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  notificationIcon: {
    fontSize: '28px',
  },
  notificationText: {
    margin: 0,
  },
  notificationTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#92400e',
  },
  notificationSubtitle: {
    fontSize: '13px',
    color: '#a16207',
    marginTop: '2px',
  },
  notificationBadge: {
    background: '#dc2626',
    color: '#fff',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 600,
  },
  reviewButton: {
    padding: '10px 20px',
    background: '#f59e0b',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  // Access Request Review Dialog styles
  accessRequestCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  accessRequestHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  doctorAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 600,
    fontSize: '18px',
    marginRight: '12px',
  },
  requestedFieldsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '12px',
    marginBottom: '16px',
  },
  fieldChip: {
    padding: '6px 12px',
    background: '#dbeafe',
    color: '#1e40af',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: 500,
  },
  reasonBox: {
    background: '#f8fafc',
    padding: '12px 16px',
    borderRadius: '8px',
    borderLeft: '3px solid #2563eb',
    marginBottom: '16px',
  },
  reasonLabel: {
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '4px',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  reasonText: {
    fontSize: '14px',
    color: '#334155',
    margin: 0,
    lineHeight: 1.5,
  },
  accessActionsContainer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  approveBtn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  denyBtn: {
    padding: '10px 24px',
    background: '#fff',
    color: '#dc2626',
    border: '2px solid #dc2626',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  // Role Check Dialog styles
  roleCheckOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px',
  },
  roleCheckModal: {
    background: '#fff',
    borderRadius: '16px',
    maxWidth: '440px',
    width: '100%',
    textAlign: 'center',
    padding: '32px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  roleCheckIcon: {
    fontSize: '56px',
    marginBottom: '16px',
  },
  roleCheckTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '12px',
  },
  roleCheckMessage: {
    fontSize: '15px',
    color: '#64748b',
    lineHeight: 1.6,
    marginBottom: '24px',
  },
  roleCheckBtn: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
  noRequestsState: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  noRequestsIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  noRequestsText: {
    fontSize: '15px',
    color: '#64748b',
  },
  patientNotesInput: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px',
    minHeight: '80px',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
};

function PresPatients() {
  const { currentUser, loading: authLoading, apiService } = useBackendContext();
  const navigate = useNavigate();
  const isLoggedIn = !!currentUser;

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // Access request states
  const [accessRequests, setAccessRequests] = useState([]);
  const [showAccessRequestsModal, setShowAccessRequestsModal] = useState(false);
  const [respondingTo, setRespondingTo] = useState(null);
  const [patientNotes, setPatientNotes] = useState('');

  // Role check dialog
  const [showRoleCheckDialog, setShowRoleCheckDialog] = useState(false);

  // Check role on mount
  useEffect(() => {
    if (currentUser && currentUser.role === 'doctor') {
      setShowRoleCheckDialog(true);
    }
  }, [currentUser]);

  // Fetch access requests for patient
  const fetchAccessRequests = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'patient') return;
    try {
      const data = await apiService.get('/access-requests');
      const pendingRequests = data.filter(req => req.status === 'pending');
      setAccessRequests(pendingRequests);
    } catch (err) {
      console.error('Failed to fetch access requests:', err);
    }
  }, [currentUser, apiService]);

  useEffect(() => {
    if (isLoggedIn && currentUser?.role === 'patient') {
      fetchAccessRequests();
    }
  }, [isLoggedIn, currentUser, fetchAccessRequests]);

  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch('/api/prescriptions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch prescriptions');
      const data = await res.json();
      setPrescriptions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchPrescriptions();
    }
  }, [isLoggedIn, fetchPrescriptions]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active':
        return { ...styles.statusBadge, ...styles.statusActive };
      case 'filled':
        return { ...styles.statusBadge, ...styles.statusFilled };
      case 'expired':
        return { ...styles.statusBadge, ...styles.statusExpired };
      case 'cancelled':
        return { ...styles.statusBadge, ...styles.statusCancelled };
      default:
        return styles.statusBadge;
    }
  };

  const handleViewDetails = async (prescription) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/prescriptions/${prescription._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch prescription details');
      const data = await res.json();
      setSelectedPrescription(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedPrescription) return;
    try {
      setDownloading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/prescriptions/${selectedPrescription._id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to generate PDF');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prescription-${selectedPrescription.prescriptionNumber || selectedPrescription._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  };

  // Calculate stats
  const stats = {
    total: prescriptions.length,
    active: prescriptions.filter((p) => p.status === 'active').length,
    filled: prescriptions.filter((p) => p.status === 'filled').length,
  };

  // Handle access request response (approve/deny)
  const handleAccessRequestResponse = async (requestId, status) => {
    try {
      setRespondingTo(requestId);
      await apiService.put(`/access-requests/${requestId}/respond`, {
        status,
        patientNotes: patientNotes.trim() || undefined,
      });
      setPatientNotes('');
      // Remove from list
      setAccessRequests(prev => prev.filter(req => req._id !== requestId));
      if (accessRequests.length <= 1) {
        setShowAccessRequestsModal(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to respond to access request');
    } finally {
      setRespondingTo(null);
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'Dr';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format requested field names
  const formatFieldName = (field) => {
    const fieldNames = {
      fullMedicalHistory: 'Full Medical History',
      allergies: 'Allergies',
      medicalConditions: 'Medical Conditions',
      prescriptionHistory: 'Prescription History',
      testReports: 'Test Reports',
      emergencyContacts: 'Emergency Contacts',
    };
    return fieldNames[field] || field;
  };

  // Navigate to request pages
  const handleMedicineRequest = () => {
    navigate('/medicine-request');
  };

  const handlePrescriptionRequest = () => {
    navigate('/patient-prescription');
  };

  // Handle role check dialog redirect
  const handleRoleCheckRedirect = () => {
    setShowRoleCheckDialog(false);
    navigate('/pres-doctor');
  };

  if (authLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loader}>Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔒</div>
          <div style={styles.emptyTitle}>Sign In Required</div>
          <div style={styles.emptyText}>Please sign in to view your prescriptions.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Role Check Dialog for Doctors */}
      {showRoleCheckDialog && (
        <div style={styles.roleCheckOverlay}>
          <div style={styles.roleCheckModal}>
            <div style={styles.roleCheckIcon}>🩺</div>
            <h2 style={styles.roleCheckTitle}>Access Restricted</h2>
            <p style={styles.roleCheckMessage}>
              You are logged in as a <strong>Doctor</strong>. This page is for patients to view their prescriptions.
              <br /><br />
              Please use the <strong>Doctors Prescribe Request Bar</strong> to create prescriptions for your patients.
            </p>
            <button style={styles.roleCheckBtn} onClick={handleRoleCheckRedirect}>
              Go to Doctor&apos;s Prescription Page
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>My Prescriptions</h1>
        <p style={styles.headerSubtitle}>View and download your medical prescriptions</p>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {/* Access Request Notification */}
      {accessRequests.length > 0 && (
        <div style={styles.notificationSection}>
          <div style={styles.notificationContent}>
            <span style={styles.notificationIcon}>🔔</span>
            <div style={styles.notificationText}>
              <div style={styles.notificationTitle}>
                You have pending access requests
                <span style={{ ...styles.notificationBadge, marginLeft: '10px' }}>
                  {accessRequests.length}
                </span>
              </div>
              <div style={styles.notificationSubtitle}>
                Doctors are requesting access to your medical information
              </div>
            </div>
          </div>
          <button
            style={styles.reviewButton}
            onClick={() => setShowAccessRequestsModal(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#d97706';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f59e0b';
            }}
          >
            Review Requests
          </button>
        </div>
      )}

      {/* Request Bar Section */}
      <div style={styles.requestBarSection}>
        <div style={styles.requestBarContainer}>
          <div>
            <p style={styles.requestBarTitle}>Medical Request Portal</p>
            <p style={styles.requestBarSubtitle}>
              Request medicines or create prescription requests for doctor review
            </p>
          </div>
          <div style={styles.requestBarButtons}>
            <button
              style={{ ...styles.requestButton, ...styles.medicineRequestBtn }}
              onClick={handleMedicineRequest}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
              }}
            >
              <span>📄</span>
              Request Medicine
            </button>
            <button
              style={{ ...styles.requestButton, ...styles.prescriptionRequestBtn }}
              onClick={handlePrescriptionRequest}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
              }}
            >
              <span>⚕️</span>
              Prescription Request
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>Total Prescriptions</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#166534' }}>{stats.active}</div>
          <div style={styles.statLabel}>Active</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#0369a1' }}>{stats.filled}</div>
          <div style={styles.statLabel}>Filled</div>
        </div>
      </div>

      {/* Prescriptions Grid */}
      {loading ? (
        <div style={styles.loader}>Loading prescriptions...</div>
      ) : prescriptions.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📋</div>
          <div style={styles.emptyTitle}>No Prescriptions Yet</div>
          <div style={styles.emptyText}>
            Your prescriptions will appear here after your doctor creates them.
          </div>
        </div>
      ) : (
        <div style={styles.grid}>
          {prescriptions.map((pres) => (
            <div
              key={pres._id}
              style={styles.card}
              onClick={() => handleViewDetails(pres)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              }}
            >
              <div style={styles.cardHeader}>
                <div>
                  <div style={styles.rxNumber}>
                    {pres.prescriptionNumber || `#${pres._id.slice(-6)}`}
                  </div>
                  <div style={styles.cardDate}>{formatDate(pres.createdAt)}</div>
                </div>
                <span style={getStatusStyle(pres.status || 'active')}>
                  {pres.status || 'active'}
                </span>
              </div>

              <div style={styles.doctorInfo}>
                <div style={styles.avatarPlaceholder}>
                  {getInitials(pres.doctor?.name || pres.doctorSnapshot?.name)}
                </div>
                <div>
                  <p style={styles.doctorName}>
                    Dr. {pres.doctor?.name || pres.doctorSnapshot?.name || 'Unknown'}
                  </p>
                  <p style={styles.specialization}>
                    {pres.doctor?.specialization || pres.doctorSnapshot?.specialization || 'General'}
                  </p>
                </div>
              </div>

              {pres.diagnosis && (
                <div style={styles.diagnosis}>
                  <strong>Diagnosis:</strong> {pres.diagnosis}
                </div>
              )}

              <div style={styles.cardFooter}>
                <span style={styles.medCount}>
                  {pres.medications?.length || 0} medication(s)
                </span>
                <button
                  style={styles.viewBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(pres);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPrescription && (
        <div style={styles.modalOverlay} onClick={() => setSelectedPrescription(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                Prescription {selectedPrescription.prescriptionNumber || ''}
              </h2>
              <button style={styles.closeBtn} onClick={() => setSelectedPrescription(null)}>
                &times;
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Doctor Info */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Prescribed By</h3>
                <div style={styles.doctorInfo}>
                  <div style={styles.avatarPlaceholder}>
                    {getInitials(
                      selectedPrescription.doctorSnapshot?.name ||
                        selectedPrescription.doctor?.name
                    )}
                  </div>
                  <div>
                    <p style={styles.doctorName}>
                      Dr.{' '}
                      {selectedPrescription.doctorSnapshot?.name ||
                        selectedPrescription.doctor?.name}
                    </p>
                    <p style={styles.specialization}>
                      {selectedPrescription.doctorSnapshot?.specialization ||
                        selectedPrescription.doctor?.specialization}
                    </p>
                  </div>
                </div>
              </div>

              {/* Prescription Info */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Details</h3>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Date:</span>
                    <span style={styles.infoValue}>
                      {formatDate(selectedPrescription.createdAt)}
                    </span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Status:</span>
                    <span style={getStatusStyle(selectedPrescription.status || 'active')}>
                      {selectedPrescription.status || 'active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              {selectedPrescription.diagnosis && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Diagnosis</h3>
                  <div style={styles.diagnosis}>{selectedPrescription.diagnosis}</div>
                </div>
              )}

              {/* Allergy Warning */}
              {selectedPrescription.patientSnapshot?.allergies?.length > 0 && (
                <div style={styles.allergyWarning}>
                  <strong>KNOWN ALLERGIES:</strong>{' '}
                  {selectedPrescription.patientSnapshot.allergies.join(', ')}
                </div>
              )}

              {/* Medications */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Medications</h3>
                {selectedPrescription.medications?.length > 0 ? (
                  <table style={styles.medsTable}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>#</th>
                        <th style={styles.tableHeader}>Medicine</th>
                        <th style={styles.tableHeader}>Dosage</th>
                        <th style={styles.tableHeader}>Frequency</th>
                        <th style={styles.tableHeader}>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPrescription.medications.map((med, idx) => (
                        <tr key={idx}>
                          <td style={styles.tableCell}>{idx + 1}</td>
                          <td style={{ ...styles.tableCell, fontWeight: 500 }}>{med.name}</td>
                          <td style={styles.tableCell}>{med.dosage || '-'}</td>
                          <td style={styles.tableCell}>{med.frequency || '-'}</td>
                          <td style={styles.tableCell}>{med.duration || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: '#64748b' }}>No medications listed.</p>
                )}
              </div>

              {/* Tests */}
              {selectedPrescription.tests?.length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Recommended Tests</h3>
                  <ul style={styles.testsList}>
                    {selectedPrescription.tests.map((test, idx) => (
                      <li key={idx} style={styles.testItem}>
                        {test.name || test}
                        {test.instructions && (
                          <span style={{ fontStyle: 'italic', marginLeft: '8px' }}>
                            — {test.instructions}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Notes */}
              {selectedPrescription.notes && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Additional Notes</h3>
                  <div style={styles.notes}>{selectedPrescription.notes}</div>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setSelectedPrescription(null)}>
                Close
              </button>
              <button
                style={styles.downloadBtn}
                onClick={handleDownloadPDF}
                disabled={downloading}
              >
                {downloading ? (
                  'Generating...'
                ) : (
                  <>
                    <span>📥</span> Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Access Requests Review Modal */}
      {showAccessRequestsModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAccessRequestsModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Doctor Access Requests</h2>
              <button style={styles.closeBtn} onClick={() => setShowAccessRequestsModal(false)}>
                &times;
              </button>
            </div>

            <div style={styles.modalBody}>
              {accessRequests.length === 0 ? (
                <div style={styles.noRequestsState}>
                  <div style={styles.noRequestsIcon}>✅</div>
                  <p style={styles.noRequestsText}>No pending access requests</p>
                </div>
              ) : (
                accessRequests.map((request) => (
                  <div key={request._id} style={styles.accessRequestCard}>
                    <div style={styles.accessRequestHeader}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={styles.doctorAvatar}>
                          {getInitials(request.doctor?.name || request.doctorSnapshot?.name)}
                        </div>
                        <div>
                          <p style={{ ...styles.doctorName, marginBottom: '2px' }}>
                            Dr. {request.doctor?.name || request.doctorSnapshot?.name}
                          </p>
                          <p style={styles.specialization}>
                            {request.doctor?.specialization || request.doctorSnapshot?.specialization}
                          </p>
                        </div>
                      </div>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {new Date(request.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Requested Fields */}
                    <div style={styles.requestedFieldsContainer}>
                      {(request.requestedFields || []).map((field, idx) => (
                        <span key={idx} style={styles.fieldChip}>
                          {formatFieldName(field)}
                        </span>
                      ))}
                    </div>

                    {/* Reason */}
                    <div style={styles.reasonBox}>
                      <p style={styles.reasonLabel}>Reason for Request</p>
                      <p style={styles.reasonText}>{request.reason}</p>
                    </div>

                    {/* Doctor Notes */}
                    {request.doctorNotes && (
                      <div style={{ ...styles.reasonBox, borderLeftColor: '#8b5cf6' }}>
                        <p style={styles.reasonLabel}>Doctor&apos;s Notes</p>
                        <p style={styles.reasonText}>{request.doctorNotes}</p>
                      </div>
                    )}

                    {/* Patient Response Notes */}
                    <textarea
                      style={styles.patientNotesInput}
                      placeholder="Add a note (optional)..."
                      value={respondingTo === request._id ? patientNotes : ''}
                      onChange={(e) => setPatientNotes(e.target.value)}
                      onFocus={() => setRespondingTo(request._id)}
                    />

                    {/* Action Buttons */}
                    <div style={styles.accessActionsContainer}>
                      <button
                        style={styles.denyBtn}
                        onClick={() => handleAccessRequestResponse(request._id, 'denied')}
                        disabled={respondingTo === request._id}
                      >
                        <span>✕</span> Deny
                      </button>
                      <button
                        style={styles.approveBtn}
                        onClick={() => handleAccessRequestResponse(request._id, 'approved')}
                        disabled={respondingTo === request._id}
                      >
                        <span>✓</span> Approve Access
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowAccessRequestsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PresPatients;
