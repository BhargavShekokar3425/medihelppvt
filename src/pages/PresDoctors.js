import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBackendContext } from '../contexts/BackendContext';

// Color scheme
const COLORS = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
  white: '#FFFFFF',
};

// Inline styles following DoctorDashboard.jsx pattern
const styles = {
  pageContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#F9FAFB',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: COLORS.gray500,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: `1px solid ${COLORS.gray200}`,
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },
  formGroup: {
    marginBottom: '12px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: COLORS.gray700,
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: `1px solid ${COLORS.gray300}`,
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    border: `1px solid ${COLORS.gray300}`,
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: COLORS.white,
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    border: `1px solid ${COLORS.gray300}`,
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    minHeight: '100px',
    resize: 'vertical',
  },
  chipList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '500',
  },
  chipBlue: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
  },
  // Medication section
  medicationItem: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr auto',
    gap: '12px',
    alignItems: 'end',
    padding: '16px',
    backgroundColor: COLORS.gray100,
    borderRadius: '8px',
    marginBottom: '12px',
  },
  medicationItemMobile: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px',
    backgroundColor: COLORS.gray100,
    borderRadius: '8px',
    marginBottom: '12px',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: COLORS.white,
    border: `2px dashed ${COLORS.gray300}`,
    borderRadius: '8px',
    color: COLORS.gray500,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  removeButton: {
    padding: '8px 12px',
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '14px 24px',
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray300,
    cursor: 'not-allowed',
  },
  alert: {
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  alertSuccess: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    border: '1px solid #10B981',
  },
  alertError: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    border: '1px solid #EF4444',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    color: COLORS.gray500,
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: `3px solid ${COLORS.gray200}`,
    borderTopColor: COLORS.primary,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  testItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'end',
    marginBottom: '12px',
  },
  // Request Bar styles
  requestBarSection: {
    backgroundColor: COLORS.white,
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: `1px solid ${COLORS.gray200}`,
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
    fontWeight: '600',
    color: COLORS.gray900,
    margin: 0,
  },
  requestBarSubtitle: {
    fontSize: '13px',
    color: COLORS.gray500,
    margin: '4px 0 0',
    lineHeight: 1.4,
  },
  patientDirectoryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
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
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: '12px',
  },
  roleCheckMessage: {
    fontSize: '15px',
    color: COLORS.gray500,
    lineHeight: 1.6,
    marginBottom: '24px',
  },
  roleCheckBtn: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
};

// Inject keyframes
const injectStyles = () => {
  if (document.getElementById('pres-doctor-styles')) return;
  const style = document.createElement('style');
  style.id = 'pres-doctor-styles';
  style.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    input:focus, select:focus, textarea:focus { border-color: #2563eb !important; }
  `;
  document.head.appendChild(style);
};

const PresDoctors = () => {
  const { currentUser, apiService } = useBackendContext();
  const navigate = useNavigate();

  // State
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientData, setPatientData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    allergies: [],
    medicalConditions: [],
    address: '',
  });
  const [doctorData, setDoctorData] = useState({
    name: '',
    specialization: '',
    qualifications: [],
    phone: '',
    clinic: { name: '', address: '', phone: '' },
  });
  const [prescription, setPrescription] = useState({
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    tests: [{ name: '', instructions: '' }],
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  // Role check dialog
  const [showRoleCheckDialog, setShowRoleCheckDialog] = useState(false);

  // Check role on mount
  useEffect(() => {
    if (currentUser && currentUser.role === 'patient') {
      setShowRoleCheckDialog(true);
    }
  }, [currentUser]);

  // Inject CSS
  useEffect(() => {
    injectStyles();
  }, []);

  // Fetch doctor's patients on mount
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/users/patients');
      setPatients(response || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setAlert({ type: 'error', message: 'Failed to load patients list' });
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Autofill doctor data from currentUser
  useEffect(() => {
    if (currentUser) {
      setDoctorData({
        name: currentUser.name || '',
        specialization: currentUser.specialization || '',
        qualifications: currentUser.qualifications || [],
        phone: currentUser.phone || '',
        clinic: currentUser.clinic || { name: '', address: '', phone: '' },
      });
    }
  }, [currentUser]);

  // Handle patient selection - autofill patient data
  const handlePatientSelect = (patientId) => {
    setSelectedPatientId(patientId);
    setAlert(null);

    if (patientId) {
      const patient = patients.find((p) => (p._id || p.id) === patientId);
      if (patient) {
        setPatientData({
          name: patient.name || '',
          email: patient.email || '',
          phone: patient.phone || '',
          dateOfBirth: patient.dateOfBirth
            ? new Date(patient.dateOfBirth).toISOString().split('T')[0]
            : '',
          gender: patient.gender || '',
          bloodGroup: patient.bloodGroup || '',
          allergies: patient.allergies || [],
          medicalConditions: patient.medicalConditions || [],
          address: patient.address || patient.location?.formattedAddress || '',
        });
      }
    } else {
      setPatientData({
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        bloodGroup: '',
        allergies: [],
        medicalConditions: [],
        address: '',
      });
    }
  };

  // Medication handlers
  const addMedication = () => {
    setPrescription((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        { name: '', dosage: '', frequency: '', duration: '', instructions: '' },
      ],
    }));
  };

  const removeMedication = (index) => {
    setPrescription((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const updateMedication = (index, field, value) => {
    setPrescription((prev) => ({
      ...prev,
      medications: prev.medications.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      ),
    }));
  };

  // Test handlers
  const addTest = () => {
    setPrescription((prev) => ({
      ...prev,
      tests: [...prev.tests, { name: '', instructions: '' }],
    }));
  };

  const removeTest = (index) => {
    setPrescription((prev) => ({
      ...prev,
      tests: prev.tests.filter((_, i) => i !== index),
    }));
  };

  const updateTest = (index, field, value) => {
    setPrescription((prev) => ({
      ...prev,
      tests: prev.tests.map((test, i) => (i === index ? { ...test, [field]: value } : test)),
    }));
  };

  // Navigate to patient directory
  const handlePatientDirectory = () => {
    navigate('/patient-directory');
  };

  // Handle role check dialog redirect
  const handleRoleCheckRedirect = () => {
    setShowRoleCheckDialog(false);
    navigate('/pres-patient');
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPatientId) {
      setAlert({ type: 'error', message: 'Please select a patient' });
      return;
    }

    const validMedications = prescription.medications.filter((med) => med.name.trim());
    if (validMedications.length === 0) {
      setAlert({ type: 'error', message: 'Please add at least one medication' });
      return;
    }

    setSubmitting(true);
    setAlert(null);

    try {
      const prescriptionData = {
        patientId: selectedPatientId,
        diagnosis: prescription.diagnosis,
        medications: validMedications,
        tests: prescription.tests.filter((t) => t.name.trim()),
        notes: prescription.notes,
        patientSnapshot: patientData,
        doctorSnapshot: doctorData,
      };

      const result = await apiService.post('/prescriptions', prescriptionData);

      setAlert({
        type: 'success',
        message: `Prescription created successfully! Rx No: ${result.prescriptionNumber || result._id}`,
      });

      // Reset form
      setSelectedPatientId('');
      setPatientData({
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        bloodGroup: '',
        allergies: [],
        medicalConditions: [],
        address: '',
      });
      setPrescription({
        diagnosis: '',
        medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
        tests: [{ name: '', instructions: '' }],
        notes: '',
      });
    } catch (err) {
      console.error('Prescription error:', err);
      setAlert({ type: 'error', message: err.message || 'Failed to create prescription' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p style={{ marginTop: '16px' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Role Check Dialog for Patients */}
      {showRoleCheckDialog && (
        <div style={styles.roleCheckOverlay}>
          <div style={styles.roleCheckModal}>
            <div style={styles.roleCheckIcon}>👤</div>
            <h2 style={styles.roleCheckTitle}>Access Restricted</h2>
            <p style={styles.roleCheckMessage}>
              You are logged in as a <strong>Patient</strong>. This page is for doctors to create prescriptions.
              <br /><br />
              Please use the <strong>Patients Medicine Request Bar</strong> to view your prescriptions and request medicines.
            </p>
            <button style={styles.roleCheckBtn} onClick={handleRoleCheckRedirect}>
              Go to Patient&apos;s Prescription Page
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Create Prescription</h1>
        <p style={styles.subtitle}>
          Select a patient and fill in the prescription details. Patient data will be auto-filled.
        </p>
      </div>

      {/* Request Bar Section */}
      <div style={styles.requestBarSection}>
        <div style={styles.requestBarContainer}>
          <div>
            <p style={styles.requestBarTitle}>Patient Directory &amp; Access Requests</p>
            <p style={styles.requestBarSubtitle}>
              View all patients, manage access requests, and send new requests for patient information
            </p>
          </div>
          <button
            style={styles.patientDirectoryBtn}
            onClick={handlePatientDirectory}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
            }}
          >
            <span style={{ fontSize: '18px' }}>👥</span>
            View Patient Directory
          </button>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <div
          style={{
            ...styles.alert,
            ...(alert.type === 'success' ? styles.alertSuccess : styles.alertError),
          }}
        >
          {alert.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Patient Selection */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Patient Information</h3>

          <div style={styles.formGroup}>
            <label style={styles.label}>Select Patient *</label>
            <select
              style={styles.select}
              value={selectedPatientId}
              onChange={(e) => handlePatientSelect(e.target.value)}
              required
            >
              <option value="">-- Select a patient --</option>
              {patients.map((patient) => (
                <option key={patient._id || patient.id} value={patient._id || patient.id}>
                  {patient.name} ({patient.email})
                </option>
              ))}
            </select>
          </div>

          {selectedPatientId && (
            <>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Patient Name</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={patientData.name}
                    onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    style={styles.input}
                    value={patientData.email}
                    onChange={(e) => setPatientData({ ...patientData, email: e.target.value })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone</label>
                  <input
                    type="tel"
                    style={styles.input}
                    value={patientData.phone}
                    onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Date of Birth</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={patientData.dateOfBirth}
                    onChange={(e) => setPatientData({ ...patientData, dateOfBirth: e.target.value })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Gender</label>
                  <select
                    style={styles.select}
                    value={patientData.gender}
                    onChange={(e) => setPatientData({ ...patientData, gender: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Blood Group</label>
                  <select
                    style={styles.select}
                    value={patientData.bloodGroup}
                    onChange={(e) => setPatientData({ ...patientData, bloodGroup: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              {/* Allergies */}
              {patientData.allergies?.length > 0 && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Known Allergies</label>
                  <div style={styles.chipList}>
                    {patientData.allergies.map((allergy, i) => (
                      <span key={i} style={styles.chip}>
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Medical Conditions */}
              {patientData.medicalConditions?.length > 0 && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Medical Conditions</label>
                  <div style={styles.chipList}>
                    {patientData.medicalConditions.map((condition, i) => (
                      <span key={i} style={{ ...styles.chip, ...styles.chipBlue }}>
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Doctor Information (Auto-filled, Editable) */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Doctor Information</h3>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Doctor Name</label>
              <input
                type="text"
                style={styles.input}
                value={doctorData.name}
                onChange={(e) => setDoctorData({ ...doctorData, name: e.target.value })}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Specialization</label>
              <input
                type="text"
                style={styles.input}
                value={doctorData.specialization}
                onChange={(e) => setDoctorData({ ...doctorData, specialization: e.target.value })}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone</label>
              <input
                type="tel"
                style={styles.input}
                value={doctorData.phone}
                onChange={(e) => setDoctorData({ ...doctorData, phone: e.target.value })}
              />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Clinic Name</label>
              <input
                type="text"
                style={styles.input}
                value={doctorData.clinic?.name || ''}
                onChange={(e) =>
                  setDoctorData({ ...doctorData, clinic: { ...doctorData.clinic, name: e.target.value } })
                }
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Clinic Address</label>
              <input
                type="text"
                style={styles.input}
                value={doctorData.clinic?.address || ''}
                onChange={(e) =>
                  setDoctorData({ ...doctorData, clinic: { ...doctorData.clinic, address: e.target.value } })
                }
              />
            </div>
          </div>
        </div>

        {/* Diagnosis */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Diagnosis</h3>
          <div style={styles.formGroup}>
            <textarea
              style={styles.textarea}
              placeholder="Enter diagnosis..."
              value={prescription.diagnosis}
              onChange={(e) => setPrescription({ ...prescription, diagnosis: e.target.value })}
            />
          </div>
        </div>

        {/* Medications */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Medications</h3>

          {prescription.medications.map((med, index) => (
            <div key={index} style={styles.medicationItemMobile}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Medicine Name *</label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="e.g., Paracetamol"
                    value={med.name}
                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Dosage</label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="e.g., 500mg"
                    value={med.dosage}
                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Frequency</label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="e.g., Twice daily"
                    value={med.frequency}
                    onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                  />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Duration</label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="e.g., 7 days"
                    value={med.duration}
                    onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Instructions</label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="e.g., After meals"
                    value={med.instructions}
                    onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                  />
                </div>
                {prescription.medications.length > 1 && (
                  <div style={{ display: 'flex', alignItems: 'end' }}>
                    <button type="button" style={styles.removeButton} onClick={() => removeMedication(index)}>
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <button type="button" style={styles.addButton} onClick={addMedication}>
            + Add Medication
          </button>
        </div>

        {/* Tests */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Recommended Tests (Optional)</h3>

          {prescription.tests.map((test, index) => (
            <div key={index} style={styles.testItem}>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>Test Name</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="e.g., Blood Sugar Test"
                  value={test.name}
                  onChange={(e) => updateTest(index, 'name', e.target.value)}
                />
              </div>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>Instructions</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="e.g., Fasting required"
                  value={test.instructions}
                  onChange={(e) => updateTest(index, 'instructions', e.target.value)}
                />
              </div>
              {prescription.tests.length > 1 && (
                <button type="button" style={styles.removeButton} onClick={() => removeTest(index)}>
                  ×
                </button>
              )}
            </div>
          ))}

          <button type="button" style={styles.addButton} onClick={addTest}>
            + Add Test
          </button>
        </div>

        {/* Notes */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Additional Notes (Optional)</h3>
          <textarea
            style={styles.textarea}
            placeholder="Any additional instructions or notes for the patient..."
            value={prescription.notes}
            onChange={(e) => setPrescription({ ...prescription, notes: e.target.value })}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          style={{
            ...styles.submitButton,
            ...(submitting ? styles.submitButtonDisabled : {}),
          }}
          disabled={submitting}
        >
          {submitting ? 'Creating Prescription...' : 'Create Prescription'}
        </button>
      </form>
    </div>
  );
};

export default PresDoctors;
