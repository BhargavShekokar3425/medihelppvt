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
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
  },
  tab: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#2563eb',
    color: '#fff',
  },
  tabInactive: {
    background: '#f1f5f9',
    color: '#475569',
  },
  searchBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  searchInput: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    outline: 'none',
  },
  filterSelect: {
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    background: '#fff',
    minWidth: '150px',
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
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  avatar: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 600,
    fontSize: '18px',
  },
  patientName: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
  },
  patientMeta: {
    fontSize: '13px',
    color: '#64748b',
    margin: '2px 0 0',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '16px',
  },
  infoItem: {
    fontSize: '13px',
  },
  infoLabel: {
    color: '#64748b',
  },
  infoValue: {
    color: '#1e293b',
    fontWeight: 500,
  },
  conditionTag: {
    display: 'inline-block',
    padding: '4px 8px',
    background: '#fef3c7',
    color: '#92400e',
    borderRadius: '4px',
    fontSize: '11px',
    marginRight: '6px',
    marginBottom: '6px',
  },
  allergyTag: {
    display: 'inline-block',
    padding: '4px 8px',
    background: '#fee2e2',
    color: '#991b1b',
    borderRadius: '4px',
    fontSize: '11px',
    marginRight: '6px',
    marginBottom: '6px',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e2e8f0',
  },
  actionBtn: {
    flex: 1,
    padding: '10px 12px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  primaryBtn: {
    background: '#2563eb',
    color: '#fff',
  },
  secondaryBtn: {
    background: '#f1f5f9',
    color: '#475569',
  },
  warningBtn: {
    background: '#fef3c7',
    color: '#92400e',
  },
  requestList: {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  requestItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
  },
  requestInfo: {
    flex: 1,
  },
  requestTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
  },
  requestMeta: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px',
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  statusPending: {
    background: '#fef3c7',
    color: '#92400e',
  },
  statusApproved: {
    background: '#dcfce7',
    color: '#166534',
  },
  statusRejected: {
    background: '#fee2e2',
    color: '#991b1b',
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
  modal: {
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
  modalContent: {
    background: '#fff',
    borderRadius: '16px',
    maxWidth: '500px',
    width: '100%',
    padding: '24px',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '16px',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    minHeight: '100px',
    resize: 'vertical',
    marginBottom: '16px',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  loader: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '16px',
    color: '#64748b',
  },
  errorBox: {
    padding: '12px 16px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#dc2626',
    marginBottom: '16px',
    fontSize: '14px',
  },
};

function PatientDirectory() {
  const { currentUser, loading: authLoading } = useBackendContext();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('patients');
  const [patients, setPatients] = useState([]);
  const [medicineRequests, setMedicineRequests] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState('');

  // Modal state
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [accessReason, setAccessReason] = useState('');
  const [requestingAccess, setRequestingAccess] = useState(false);

  const fetchPatients = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/patients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      }
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    }
  }, []);

  const fetchMedicineRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/medicine-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMedicineRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch medicine requests:', err);
    }
  }, []);

  const fetchAccessRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/access-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAccessRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch access requests:', err);
    }
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchPatients(), fetchMedicineRequests(), fetchAccessRequests()]);
      setLoading(false);
    };
    if (currentUser?.role === 'doctor') {
      fetchAll();
    }
  }, [currentUser, fetchPatients, fetchMedicineRequests, fetchAccessRequests]);

  const handleRequestAccess = async () => {
    if (!selectedPatient || !accessReason.trim()) return;

    setRequestingAccess(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/access-requests', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: selectedPatient._id,
          reason: accessReason,
          requestedFields: ['fullMedicalHistory', 'allergies', 'medicalConditions'],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to send access request.');
      }

      setShowAccessModal(false);
      setAccessReason('');
      setSelectedPatient(null);
      fetchAccessRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setRequestingAccess(false);
    }
  };

  const handleMedicineRequestAction = async (requestId, action) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/medicine-requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action,
          notes: action === 'approved' ? 'Verified and approved.' : undefined,
          rejectionReason: action === 'rejected' ? 'Request rejected.' : undefined,
        }),
      });

      if (res.ok) {
        fetchMedicineRequests();
      }
    } catch (err) {
      console.error('Failed to update request:', err);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    return Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBloodGroup = !filterBloodGroup || p.bloodGroup === filterBloodGroup;
    return matchesSearch && matchesBloodGroup;
  });

  if (authLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loader}>Loading...</div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'doctor') {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔒</div>
          <div style={styles.emptyTitle}>Access Restricted</div>
          <div style={styles.emptyText}>This page is only accessible to doctors.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Patient Directory</h1>
        <p style={styles.headerSubtitle}>Manage your patients and medicine verification requests</p>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'patients' ? styles.tabActive : styles.tabInactive),
          }}
          onClick={() => setActiveTab('patients')}
        >
          My Patients ({patients.length})
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'requests' ? styles.tabActive : styles.tabInactive),
          }}
          onClick={() => setActiveTab('requests')}
        >
          Medicine Requests ({medicineRequests.filter((r) => r.status === 'pending').length})
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'access' ? styles.tabActive : styles.tabInactive),
          }}
          onClick={() => setActiveTab('access')}
        >
          Access Requests ({accessRequests.length})
        </button>
      </div>

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <>
          <div style={styles.searchBar}>
            <input
              type="text"
              style={styles.searchInput}
              placeholder="Search patients by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              style={styles.filterSelect}
              value={filterBloodGroup}
              onChange={(e) => setFilterBloodGroup(e.target.value)}
            >
              <option value="">All Blood Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div style={styles.loader}>Loading patients...</div>
          ) : filteredPatients.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>👥</div>
              <div style={styles.emptyTitle}>No Patients Found</div>
              <div style={styles.emptyText}>
                Patients who have appointments with you will appear here.
              </div>
            </div>
          ) : (
            <div style={styles.grid}>
              {filteredPatients.map((patient) => (
                <div key={patient._id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={styles.avatar}>{getInitials(patient.name)}</div>
                    <div>
                      <p style={styles.patientName}>{patient.name}</p>
                      <p style={styles.patientMeta}>
                        {calculateAge(patient.dateOfBirth)} yrs • {patient.gender || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div style={styles.infoGrid}>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Blood Group: </span>
                      <span style={styles.infoValue}>{patient.bloodGroup || 'N/A'}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Phone: </span>
                      <span style={styles.infoValue}>{patient.phone || 'N/A'}</span>
                    </div>
                  </div>

                  {patient.medicalConditions?.length > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      {patient.medicalConditions.slice(0, 3).map((cond, i) => (
                        <span key={i} style={styles.conditionTag}>
                          {cond}
                        </span>
                      ))}
                    </div>
                  )}

                  {patient.allergies?.length > 0 && (
                    <div>
                      {patient.allergies.slice(0, 3).map((allergy, i) => (
                        <span key={i} style={styles.allergyTag}>
                          ⚠️ {allergy}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={styles.cardActions}>
                    <button
                      style={{ ...styles.actionBtn, ...styles.primaryBtn }}
                      onClick={() => navigate(`/pres-doctor?patientId=${patient._id}`)}
                    >
                      Create Prescription
                    </button>
                    <button
                      style={{ ...styles.actionBtn, ...styles.warningBtn }}
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowAccessModal(true);
                      }}
                    >
                      Request Access
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Medicine Requests Tab */}
      {activeTab === 'requests' && (
        <>
          {loading ? (
            <div style={styles.loader}>Loading requests...</div>
          ) : medicineRequests.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📋</div>
              <div style={styles.emptyTitle}>No Medicine Requests</div>
              <div style={styles.emptyText}>
                When patients request your verification, they will appear here.
              </div>
            </div>
          ) : (
            <div style={styles.requestList}>
              {medicineRequests.map((req) => (
                <div key={req._id} style={styles.requestItem}>
                  <div style={styles.requestInfo}>
                    <p style={styles.requestTitle}>
                      {req.patient?.name || req.patientSnapshot?.name || 'Unknown Patient'}
                    </p>
                    <p style={styles.requestMeta}>
                      {req.requestNumber} • {formatDate(req.createdAt)} •{' '}
                      {req.medicines?.length || 0} medicine(s)
                    </p>
                  </div>
                  <span
                    style={{
                      ...styles.statusBadge,
                      ...(req.status === 'pending'
                        ? styles.statusPending
                        : req.status === 'approved'
                        ? styles.statusApproved
                        : styles.statusRejected),
                    }}
                  >
                    {req.status}
                  </span>
                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                      <button
                        style={{
                          ...styles.actionBtn,
                          ...styles.primaryBtn,
                          flex: 'none',
                          padding: '8px 16px',
                        }}
                        onClick={() => handleMedicineRequestAction(req._id, 'approved')}
                      >
                        Approve
                      </button>
                      <button
                        style={{
                          ...styles.actionBtn,
                          ...styles.secondaryBtn,
                          flex: 'none',
                          padding: '8px 16px',
                        }}
                        onClick={() => handleMedicineRequestAction(req._id, 'rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Access Requests Tab */}
      {activeTab === 'access' && (
        <>
          {loading ? (
            <div style={styles.loader}>Loading access requests...</div>
          ) : accessRequests.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🔐</div>
              <div style={styles.emptyTitle}>No Access Requests</div>
              <div style={styles.emptyText}>
                Your data access requests to patients will appear here.
              </div>
            </div>
          ) : (
            <div style={styles.requestList}>
              {accessRequests.map((req) => (
                <div key={req._id} style={styles.requestItem}>
                  <div style={styles.requestInfo}>
                    <p style={styles.requestTitle}>
                      {req.patient?.name || 'Unknown Patient'}
                    </p>
                    <p style={styles.requestMeta}>
                      {formatDate(req.createdAt)} • {req.reason}
                    </p>
                  </div>
                  <span
                    style={{
                      ...styles.statusBadge,
                      ...(req.status === 'pending'
                        ? styles.statusPending
                        : req.status === 'approved'
                        ? styles.statusApproved
                        : styles.statusRejected),
                    }}
                  >
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Access Request Modal */}
      {showAccessModal && (
        <div style={styles.modal} onClick={() => setShowAccessModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>
              Request Access to {selectedPatient?.name}&apos;s Data
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
              The patient will be notified and can approve or deny this request.
            </p>
            <textarea
              style={styles.textarea}
              placeholder="Reason for requesting access (e.g., treatment planning, follow-up consultation)..."
              value={accessReason}
              onChange={(e) => setAccessReason(e.target.value)}
            />
            <div style={styles.modalActions}>
              <button
                style={{ ...styles.actionBtn, ...styles.secondaryBtn, flex: 'none' }}
                onClick={() => setShowAccessModal(false)}
              >
                Cancel
              </button>
              <button
                style={{ ...styles.actionBtn, ...styles.primaryBtn, flex: 'none' }}
                onClick={handleRequestAccess}
                disabled={requestingAccess || !accessReason.trim()}
              >
                {requestingAccess ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientDirectory;
