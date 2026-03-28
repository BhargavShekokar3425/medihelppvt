import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBackendContext } from '../contexts/BackendContext';

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  header: {
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '24px',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    fontSize: '120px',
    opacity: 0.1,
    transform: 'rotate(15deg)',
  },
  headerTitle: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 700,
    position: 'relative',
    zIndex: 2,
  },
  headerSubtitle: {
    margin: '8px 0 0',
    fontSize: '14px',
    opacity: 0.9,
    position: 'relative',
    zIndex: 2,
  },
  disclaimer: {
    background: '#fef3c7',
    border: '2px solid #f59e0b',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '24px',
    color: '#92400e',
  },
  disclaimerTitle: {
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  disclaimerText: {
    fontSize: '13px',
    lineHeight: 1.5,
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '20px',
    border: '1px solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '2px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sectionIcon: {
    fontSize: '18px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  formGroupFull: {
    gridColumn: 'span 2',
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '6px',
  },
  requiredLabel: {
    color: '#dc2626',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    background: '#fff',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    minHeight: '100px',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  medicationCard: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    position: 'relative',
  },
  medicationHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  medicationTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  removeBtn: {
    padding: '8px 12px',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500,
  },
  medicationGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: '12px',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '16px 20px',
    background: '#f1f5f9',
    border: '2px dashed #94a3b8',
    borderRadius: '12px',
    color: '#475569',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  doctorSection: {
    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    border: '1px solid #3b82f6',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
  },
  doctorTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e40af',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  doctorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
  },
  doctorCard: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
  },
  doctorCardSelected: {
    borderColor: '#3b82f6',
    background: '#eff6ff',
  },
  doctorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  doctorAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 600,
    fontSize: '16px',
  },
  doctorName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
  },
  doctorSpec: {
    fontSize: '12px',
    color: '#64748b',
    margin: '2px 0 0',
  },
  checkmark: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    color: '#3b82f6',
    fontSize: '16px',
  },
  submitBtn: {
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    marginTop: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'transform 0.2s',
  },
  submitBtnDisabled: {
    background: '#94a3b8',
    cursor: 'not-allowed',
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
  successBox: {
    padding: '16px 20px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '12px',
    color: '#166534',
    marginBottom: '16px',
    fontSize: '14px',
    textAlign: 'center',
  },
  loader: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    marginBottom: '16px',
  },
};

const emptyMedication = {
  name: '',
  dosage: '',
  frequency: '',
  duration: '',
  instructions: '',
};

function PatientPrescription() {
  const { currentUser, loading: authLoading } = useBackendContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Patient info (auto-filled)
    patientName: '',
    patientPhone: '',
    patientAddress: '',
    patientBloodGroup: '',

    // Medical information
    symptoms: '',
    urgency: 'normal',
    additionalNotes: '',

    // Medications
    medications: [{ ...emptyMedication }],

    // Doctor selection
    selectedDoctorId: '',
  });

  const [doctors, setDoctors] = useState([]);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Auto-fill patient data
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        patientName: currentUser.name || '',
        patientPhone: currentUser.phone || '',
        patientAddress: currentUser.address || '',
        patientBloodGroup: currentUser.bloodGroup || '',
      }));
    }
  }, [currentUser]);

  // Fetch doctors
  const fetchDoctors = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/doctors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDoctors(Array.isArray(data) ? data : data.doctors || []);
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMedicationChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      ),
    }));
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { ...emptyMedication }],
    }));
  };

  const removeMedication = (index) => {
    if (formData.medications.length > 1) {
      setFormData(prev => ({
        ...prev,
        medications: prev.medications.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.selectedDoctorId) {
        throw new Error('Please select a doctor to review your prescription request.');
      }

      const validMedications = formData.medications.filter(med => med.name.trim());
      if (validMedications.length === 0) {
        throw new Error('Please add at least one medication.');
      }

      if (!formData.symptoms.trim()) {
        throw new Error('Please describe your symptoms or medical condition.');
      }

      const token = localStorage.getItem('token');

      // Build patient snapshot
      const patientSnapshot = {
        name: formData.patientName,
        email: currentUser?.email,
        phone: formData.patientPhone,
        address: formData.patientAddress,
        dateOfBirth: currentUser?.dateOfBirth,
        gender: currentUser?.gender,
        bloodGroup: formData.patientBloodGroup,
        allergies: currentUser?.allergies || [],
        medicalConditions: currentUser?.medicalConditions || [],
      };

      // Build request data
      const requestData = {
        requestType: 'doctor_verification',
        doctorId: formData.selectedDoctorId,
        patientSnapshot: JSON.stringify(patientSnapshot),
        medicines: JSON.stringify(validMedications),
        patientNotes: `SYMPTOMS/CONDITION: ${formData.symptoms}\n\nURGENCY: ${formData.urgency.toUpperCase()}\n\nADDITIONAL NOTES: ${formData.additionalNotes}`,
        newlyFilledFields: JSON.stringify([]),
      };

      const formDataToSend = new FormData();
      Object.entries(requestData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      const res = await fetch('/api/medicine-requests', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to submit prescription request.');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/pres-patient');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = (Array.isArray(doctors) ? doctors : []).filter(
    doc =>
      doc.name?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const getInitials = (name) => {
    if (!name) return 'Dr';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (authLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loader}>Loading...</div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'patient') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={{ textAlign: 'center', color: '#64748b' }}>
            This page is only accessible to patients.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.successBox}>
          <p style={{ fontSize: '24px', marginBottom: '8px' }}>✅</p>
          <p style={{ fontWeight: 600, marginBottom: '4px' }}>Prescription Request Submitted!</p>
          <p style={{ fontSize: '13px' }}>A doctor will review your request and create an official prescription.</p>
          <p style={{ fontSize: '13px' }}>Redirecting to your requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerPattern}>⚕️</div>
        <h1 style={styles.headerTitle}>Create Prescription Request</h1>
        <p style={styles.headerSubtitle}>
          Submit a detailed prescription request for doctor review and approval
        </p>
      </div>

      {/* Disclaimer */}
      <div style={styles.disclaimer}>
        <div style={styles.disclaimerTitle}>
          <span>⚠️</span>
          Important Medical Notice
        </div>
        <div style={styles.disclaimerText}>
          This creates a prescription request that must be reviewed and approved by a licensed doctor.
          Only approved requests become valid prescriptions. This is not a substitute for professional medical advice.
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Patient Information */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>
            <span style={styles.sectionIcon}>👤</span>
            Patient Information
          </h3>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Full Name <span style={styles.requiredLabel}>*</span>
              </label>
              <input
                type="text"
                style={styles.input}
                value={formData.patientName}
                onChange={(e) => handleInputChange('patientName', e.target.value)}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone</label>
              <input
                type="tel"
                style={styles.input}
                value={formData.patientPhone}
                onChange={(e) => handleInputChange('patientPhone', e.target.value)}
              />
            </div>
            <div style={styles.formGroupFull}>
              <label style={styles.label}>Address</label>
              <input
                type="text"
                style={styles.input}
                value={formData.patientAddress}
                onChange={(e) => handleInputChange('patientAddress', e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Blood Group</label>
              <select
                style={styles.select}
                value={formData.patientBloodGroup}
                onChange={(e) => handleInputChange('patientBloodGroup', e.target.value)}
              >
                <option value="">Select...</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>
            <span style={styles.sectionIcon}>🩺</span>
            Medical Information
          </h3>
          <div style={styles.formGroupFull}>
            <label style={styles.label}>
              Symptoms / Medical Condition <span style={styles.requiredLabel}>*</span>
            </label>
            <textarea
              style={styles.textarea}
              placeholder="Describe your symptoms, medical condition, or reason for requesting these medications..."
              value={formData.symptoms}
              onChange={(e) => handleInputChange('symptoms', e.target.value)}
              required
            />
          </div>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Urgency Level</label>
              <select
                style={styles.select}
                value={formData.urgency}
                onChange={(e) => handleInputChange('urgency', e.target.value)}
              >
                <option value="low">Low - Routine care</option>
                <option value="normal">Normal - Standard appointment</option>
                <option value="high">High - Need attention soon</option>
                <option value="urgent">Urgent - Same day if possible</option>
              </select>
            </div>
          </div>
          <div style={styles.formGroupFull}>
            <label style={styles.label}>Additional Notes</label>
            <textarea
              style={styles.textarea}
              placeholder="Any additional information about your condition, allergies, current medications, etc..."
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
            />
          </div>
        </div>

        {/* Medications */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>
            <span style={styles.sectionIcon}>💊</span>
            Requested Medications
          </h3>
          {formData.medications.map((med, index) => (
            <div key={index} style={styles.medicationCard}>
              <div style={styles.medicationHeader}>
                <div style={styles.medicationTitle}>
                  <span>💊</span>
                  Medication {index + 1}
                </div>
                {formData.medications.length > 1 && (
                  <button
                    type="button"
                    style={styles.removeBtn}
                    onClick={() => removeMedication(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
              <div style={styles.medicationGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Medicine Name <span style={styles.requiredLabel}>*</span>
                  </label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="e.g., Paracetamol, Amoxicillin"
                    value={med.name}
                    onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Dosage</label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="e.g., 500mg"
                    value={med.dosage}
                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Frequency</label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="e.g., Twice daily"
                    value={med.frequency}
                    onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Duration</label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="e.g., 7 days"
                    value={med.duration}
                    onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                  />
                </div>
              </div>
              <div style={styles.formGroupFull}>
                <label style={styles.label}>Instructions</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="e.g., Take after meals, with water"
                  value={med.instructions}
                  onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                />
              </div>
            </div>
          ))}
          <button type="button" style={styles.addBtn} onClick={addMedication}>
            <span>+</span> Add Another Medication
          </button>
        </div>

        {/* Doctor Selection */}
        <div style={styles.doctorSection}>
          <h3 style={styles.doctorTitle}>
            <span>👨‍⚕️</span>
            Select Doctor for Review
          </h3>
          <input
            type="text"
            style={styles.searchInput}
            placeholder="Search doctors by name or specialization..."
            value={doctorSearch}
            onChange={(e) => setDoctorSearch(e.target.value)}
          />
          <div style={styles.doctorGrid}>
            {filteredDoctors.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', gridColumn: 'span 2' }}>
                No doctors found.
              </p>
            ) : (
              filteredDoctors.map(doctor => (
                <div
                  key={doctor._id}
                  style={{
                    ...styles.doctorCard,
                    ...(formData.selectedDoctorId === doctor._id ? styles.doctorCardSelected : {}),
                  }}
                  onClick={() => handleInputChange('selectedDoctorId', doctor._id)}
                >
                  {formData.selectedDoctorId === doctor._id && (
                    <span style={styles.checkmark}>✓</span>
                  )}
                  <div style={styles.doctorInfo}>
                    <div style={styles.doctorAvatar}>{getInitials(doctor.name)}</div>
                    <div>
                      <p style={styles.doctorName}>Dr. {doctor.name}</p>
                      <p style={styles.doctorSpec}>{doctor.specialization || 'General Physician'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          style={{
            ...styles.submitBtn,
            ...(loading ? styles.submitBtnDisabled : {}),
          }}
          disabled={loading}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {loading ? (
            <>
              <span>⏳</span> Submitting Request...
            </>
          ) : (
            <>
              <span>📋</span> Submit Prescription Request
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default PatientPrescription;