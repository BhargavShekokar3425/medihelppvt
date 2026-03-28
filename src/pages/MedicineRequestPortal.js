import { useState, useEffect, useCallback, useRef } from 'react';
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
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '2px solid #e2e8f0',
  },
  typeSelector: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
  },
  typeOption: {
    flex: 1,
    padding: '20px',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
  },
  typeOptionSelected: {
    borderColor: '#2563eb',
    background: '#eff6ff',
  },
  typeIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  typeLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
  },
  typeDesc: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px',
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
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    background: '#fff',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    minHeight: '80px',
    resize: 'vertical',
  },
  syncCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '6px',
    fontSize: '12px',
    color: '#2563eb',
    cursor: 'pointer',
  },
  medicineRow: {
    background: '#f8fafc',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '12px',
    border: '1px solid #e2e8f0',
  },
  medicineRowTop: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
    gap: '10px',
    alignItems: 'center',
  },
  medicineRowBottom: {
    marginTop: '10px',
  },
  medicineInput: {
    padding: '8px 10px',
    fontSize: '13px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    width: '100%',
    boxSizing: 'border-box',
  },
  instructionsInput: {
    padding: '8px 10px',
    fontSize: '13px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    width: '100%',
    boxSizing: 'border-box',
  },
  addBtn: {
    padding: '8px 16px',
    background: '#f1f5f9',
    color: '#475569',
    border: '1px dashed #94a3b8',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    marginTop: '8px',
  },
  removeBtn: {
    padding: '8px 12px',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  fileUpload: {
    border: '2px dashed #d1d5db',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  fileUploadActive: {
    borderColor: '#2563eb',
    background: '#eff6ff',
  },
  fileIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  fileText: {
    fontSize: '14px',
    color: '#64748b',
  },
  fileName: {
    marginTop: '12px',
    padding: '8px 12px',
    background: '#f1f5f9',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#1e293b',
  },
  doctorCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '8px',
  },
  doctorCardSelected: {
    borderColor: '#2563eb',
    background: '#eff6ff',
  },
  doctorAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 600,
    fontSize: '18px',
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
  submitBtn: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    marginTop: '24px',
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
    borderRadius: '8px',
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
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    marginBottom: '16px',
  },
};

const emptyMedicine = { name: '', dosage: '', frequency: '', duration: '', instructions: '' };

function MedicineRequestPortal() {
  const { currentUser, loading: authLoading, updateProfile } = useBackendContext();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [requestType, setRequestType] = useState('manual_upload');
  const [patientData, setPatientData] = useState({
    name: '',
    phone: '',
    address: '',
    bloodGroup: '',
    allergies: '',
    medicalConditions: '',
  });
  const [medicines, setMedicines] = useState([{ ...emptyMedicine }]);
  const [patientNotes, setPatientNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [fieldsToSync, setFieldsToSync] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Auto-fill patient data from current user
  useEffect(() => {
    if (currentUser) {
      setPatientData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        bloodGroup: currentUser.bloodGroup || '',
        allergies: Array.isArray(currentUser.allergies) ? currentUser.allergies.join(', ') : '',
        medicalConditions: Array.isArray(currentUser.medicalConditions)
          ? currentUser.medicalConditions.join(', ')
          : '',
      });
    }
  }, [currentUser]);

  // Fetch doctors for doctor verification type
  const fetchDoctors = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/doctors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Ensure data is an array
        if (Array.isArray(data)) {
          setDoctors(data);
        } else if (data && Array.isArray(data.doctors)) {
          setDoctors(data.doctors);
        } else if (data && Array.isArray(data.data)) {
          setDoctors(data.data);
        } else {
          setDoctors([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
      setDoctors([]);
    }
  }, []);

  useEffect(() => {
    if (requestType === 'doctor_verification') {
      fetchDoctors();
    }
  }, [requestType, fetchDoctors]);

  const handlePatientDataChange = (field, value) => {
    setPatientData((prev) => ({ ...prev, [field]: value }));

    // Track newly filled fields for profile sync
    if (currentUser && !currentUser[field] && value) {
      setFieldsToSync((prev) => ({ ...prev, [field]: true }));
    } else if (!value) {
      setFieldsToSync((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleMedicineChange = (index, field, value) => {
    setMedicines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addMedicine = () => {
    setMedicines((prev) => [...prev, { ...emptyMedicine }]);
  };

  const removeMedicine = (index) => {
    if (medicines.length > 1) {
      setMedicines((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate
      if (requestType === 'manual_upload' && !uploadedFile) {
        throw new Error('Please upload a prescription file.');
      }
      if (requestType === 'doctor_verification' && !selectedDoctor) {
        throw new Error('Please select a doctor for verification.');
      }

      const token = localStorage.getItem('token');

      // Build patient snapshot
      const patientSnapshot = {
        name: patientData.name,
        email: currentUser?.email,
        phone: patientData.phone,
        address: patientData.address,
        dateOfBirth: currentUser?.dateOfBirth,
        gender: currentUser?.gender,
        bloodGroup: patientData.bloodGroup,
        allergies: patientData.allergies
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        medicalConditions: patientData.medicalConditions
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      // Filter out empty medicines
      const validMedicines = medicines.filter((m) => m.name.trim());

      // Build FormData
      const formData = new FormData();
      formData.append('requestType', requestType);
      formData.append('patientSnapshot', JSON.stringify(patientSnapshot));
      formData.append('medicines', JSON.stringify(validMedicines));
      formData.append('patientNotes', patientNotes);
      formData.append('newlyFilledFields', JSON.stringify(Object.keys(fieldsToSync)));

      if (requestType === 'doctor_verification') {
        formData.append('doctorId', selectedDoctor._id);
      }

      if (uploadedFile) {
        formData.append('prescription', uploadedFile);
      }

      const res = await fetch('/api/medicine-requests', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to submit request.');
      }

      // Sync profile fields if requested
      const fieldsToUpdate = Object.entries(fieldsToSync)
        .filter(([, checked]) => checked)
        .reduce((acc, [field]) => {
          if (field === 'allergies' || field === 'medicalConditions') {
            acc[field] = patientData[field]
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
          } else {
            acc[field] = patientData[field];
          }
          return acc;
        }, {});

      if (Object.keys(fieldsToUpdate).length > 0 && updateProfile) {
        try {
          await updateProfile(fieldsToUpdate);
        } catch (syncErr) {
          console.error('Profile sync error:', syncErr);
        }
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

  const filteredDoctors = Array.isArray(doctors)
    ? doctors.filter(
        (doc) =>
          doc.name?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
          doc.specialization?.toLowerCase().includes(doctorSearch.toLowerCase())
      )
    : [];

  const getInitials = (name) => {
    if (!name) return 'Dr';
    return name
      .split(' ')
      .map((n) => n[0])
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
          <p style={{ fontWeight: 600, marginBottom: '4px' }}>Request Submitted Successfully!</p>
          <p style={{ fontSize: '13px' }}>Redirecting to your prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Request Medicine</h1>
        <p style={styles.headerSubtitle}>
          Upload an existing prescription or request verification from a doctor
        </p>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Request Type Selection */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Choose Request Type</h3>
          <div style={styles.typeSelector}>
            <div
              style={{
                ...styles.typeOption,
                ...(requestType === 'manual_upload' ? styles.typeOptionSelected : {}),
              }}
              onClick={() => setRequestType('manual_upload')}
            >
              <div style={styles.typeIcon}>📄</div>
              <p style={styles.typeLabel}>Upload Prescription</p>
              <p style={styles.typeDesc}>I have an existing prescription from a doctor</p>
            </div>
            <div
              style={{
                ...styles.typeOption,
                ...(requestType === 'doctor_verification' ? styles.typeOptionSelected : {}),
              }}
              onClick={() => setRequestType('doctor_verification')}
            >
              <div style={styles.typeIcon}>👨‍⚕️</div>
              <p style={styles.typeLabel}>Doctor Verification</p>
              <p style={styles.typeDesc}>Request a doctor to verify and approve my medicines</p>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Your Information</h3>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                style={styles.input}
                value={patientData.name}
                onChange={(e) => handlePatientDataChange('name', e.target.value)}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone</label>
              <input
                type="tel"
                style={styles.input}
                value={patientData.phone}
                onChange={(e) => handlePatientDataChange('phone', e.target.value)}
              />
              {!currentUser?.phone && patientData.phone && (
                <label style={styles.syncCheckbox}>
                  <input
                    type="checkbox"
                    checked={fieldsToSync.phone || false}
                    onChange={(e) =>
                      setFieldsToSync((prev) => ({ ...prev, phone: e.target.checked }))
                    }
                  />
                  Save to my profile
                </label>
              )}
            </div>
            <div style={styles.formGroupFull}>
              <label style={styles.label}>Address</label>
              <input
                type="text"
                style={styles.input}
                value={patientData.address}
                onChange={(e) => handlePatientDataChange('address', e.target.value)}
              />
              {!currentUser?.address && patientData.address && (
                <label style={styles.syncCheckbox}>
                  <input
                    type="checkbox"
                    checked={fieldsToSync.address || false}
                    onChange={(e) =>
                      setFieldsToSync((prev) => ({ ...prev, address: e.target.checked }))
                    }
                  />
                  Save to my profile
                </label>
              )}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Blood Group</label>
              <select
                style={styles.select}
                value={patientData.bloodGroup}
                onChange={(e) => handlePatientDataChange('bloodGroup', e.target.value)}
              >
                <option value="">Select...</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
              {!currentUser?.bloodGroup && patientData.bloodGroup && (
                <label style={styles.syncCheckbox}>
                  <input
                    type="checkbox"
                    checked={fieldsToSync.bloodGroup || false}
                    onChange={(e) =>
                      setFieldsToSync((prev) => ({ ...prev, bloodGroup: e.target.checked }))
                    }
                  />
                  Save to my profile
                </label>
              )}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Allergies (comma-separated)</label>
              <input
                type="text"
                style={styles.input}
                value={patientData.allergies}
                onChange={(e) => handlePatientDataChange('allergies', e.target.value)}
                placeholder="e.g., Penicillin, Peanuts"
              />
            </div>
            <div style={styles.formGroupFull}>
              <label style={styles.label}>Medical Conditions (comma-separated)</label>
              <input
                type="text"
                style={styles.input}
                value={patientData.medicalConditions}
                onChange={(e) => handlePatientDataChange('medicalConditions', e.target.value)}
                placeholder="e.g., Diabetes, Hypertension"
              />
            </div>
          </div>
        </div>

        {/* Medicines */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Medicines Requested</h3>
          {medicines.map((med, index) => (
            <div key={index} style={styles.medicineRow}>
              <div style={styles.medicineRowTop}>
                <input
                  type="text"
                  style={styles.medicineInput}
                  placeholder="Medicine Name *"
                  value={med.name}
                  onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                  required
                />
                <input
                  type="text"
                  style={styles.medicineInput}
                  placeholder="Dosage"
                  value={med.dosage}
                  onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                />
                <input
                  type="text"
                  style={styles.medicineInput}
                  placeholder="Frequency"
                  value={med.frequency}
                  onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                />
                <input
                  type="text"
                  style={styles.medicineInput}
                  placeholder="Duration"
                  value={med.duration}
                  onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                />
                <button type="button" style={styles.removeBtn} onClick={() => removeMedicine(index)}>
                  ✕
                </button>
              </div>
              <div style={styles.medicineRowBottom}>
                <input
                  type="text"
                  style={styles.instructionsInput}
                  placeholder="Instructions (e.g., Take after meals, before bed, etc.)"
                  value={med.instructions}
                  onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                />
              </div>
            </div>
          ))}
          <button type="button" style={styles.addBtn} onClick={addMedicine}>
            + Add Another Medicine
          </button>
        </div>

        {/* File Upload (for manual_upload) */}
        {requestType === 'manual_upload' && (
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Upload Prescription</h3>
            <div
              style={{
                ...styles.fileUpload,
                ...(uploadedFile ? styles.fileUploadActive : {}),
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={styles.fileIcon}>{uploadedFile ? '✅' : '📁'}</div>
              <p style={styles.fileText}>
                {uploadedFile
                  ? 'File selected. Click to change.'
                  : 'Click to upload prescription (PDF, JPG, PNG)'}
              </p>
              {uploadedFile && <div style={styles.fileName}>{uploadedFile.name}</div>}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
            />
          </div>
        )}

        {/* Doctor Selection (for doctor_verification) */}
        {requestType === 'doctor_verification' && (
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Select Doctor for Verification</h3>
            <input
              type="text"
              style={styles.searchInput}
              placeholder="Search doctors by name or specialization..."
              value={doctorSearch}
              onChange={(e) => setDoctorSearch(e.target.value)}
            />
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
              {filteredDoctors.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                  No doctors found.
                </p>
              ) : (
                filteredDoctors.map((doc) => (
                  <div
                    key={doc._id}
                    style={{
                      ...styles.doctorCard,
                      ...(selectedDoctor?._id === doc._id ? styles.doctorCardSelected : {}),
                    }}
                    onClick={() => setSelectedDoctor(doc)}
                  >
                    <div style={styles.doctorAvatar}>{getInitials(doc.name)}</div>
                    <div>
                      <p style={styles.doctorName}>Dr. {doc.name}</p>
                      <p style={styles.doctorSpec}>{doc.specialization || 'General Physician'}</p>
                    </div>
                    {selectedDoctor?._id === doc._id && (
                      <span style={{ marginLeft: 'auto', color: '#2563eb' }}>✓</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Additional Notes (Optional)</h3>
          <textarea
            style={styles.textarea}
            placeholder="Any additional information about your request..."
            value={patientNotes}
            onChange={(e) => setPatientNotes(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <button type="submit" style={styles.submitBtn} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}

export default MedicineRequestPortal;
