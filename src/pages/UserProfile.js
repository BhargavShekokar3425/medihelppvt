import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBackendContext } from "../contexts/BackendContext";
import apiService from "../services/apiService";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const UserProfile = () => {
  const { currentUser, logout, updateProfile } = useBackendContext();
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const isDoctor = profileData.role === 'doctor';
  const isPatient = !profileData.role || profileData.role === 'patient';

  useEffect(() => {
    if (!currentUser) {
      navigate('/signup');
      return;
    }
    setProfileData(currentUser);
    setLoading(false);
  }, [currentUser, navigate]);

  // Clear messages after 4 seconds
  useEffect(() => {
    if (successMsg || errorMsg) {
      const t = setTimeout(() => { setSuccessMsg(''); setErrorMsg(''); }, 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg, errorMsg]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return dateString; }
  };

  const toInputDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch { return ''; }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  /* ---- Edit mode ---- */
  const startEditing = () => {
    setFormData({
      name: profileData.name || '',
      phone: profileData.phone || '',
      gender: profileData.gender || '',
      dateOfBirth: toInputDate(profileData.dateOfBirth),
      address: profileData.address || '',
      // Patient fields
      bloodGroup: profileData.bloodGroup || '',
      allergies: Array.isArray(profileData.allergies) ? profileData.allergies.join(', ') : (profileData.allergies || ''),
      medicalConditions: Array.isArray(profileData.medicalConditions) ? profileData.medicalConditions.join(', ') : (profileData.medicalConditions || ''),
      // Doctor fields
      bio: profileData.bio || '',
      specialization: profileData.specialization || '',
      qualifications: Array.isArray(profileData.qualifications) ? profileData.qualifications.join(', ') : (profileData.qualifications || ''),
      experience: profileData.experience || '',
      consultationFee: profileData.consultationFee || '',
      languages: Array.isArray(profileData.languages) ? profileData.languages.join(', ') : (profileData.languages || ''),
      clinicName: profileData.clinic?.name || '',
      clinicAddress: profileData.clinic?.address || '',
      clinicPhone: profileData.clinic?.phone || '',
      clinicTimings: profileData.clinic?.timings || '',
    });
    setEditing(true);
    setActiveTab('profile');
    setPhotoPreview(null);
  };

  const cancelEditing = () => { setEditing(false); setPhotoPreview(null); };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg('');
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || undefined,
        address: formData.address,
      };

      if (isPatient) {
        payload.bloodGroup = formData.bloodGroup;
        payload.allergies = formData.allergies ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean) : [];
        payload.medicalConditions = formData.medicalConditions ? formData.medicalConditions.split(',').map(s => s.trim()).filter(Boolean) : [];
      }

      if (isDoctor) {
        payload.bio = formData.bio;
        payload.specialization = formData.specialization;
        payload.qualifications = formData.qualifications ? formData.qualifications.split(',').map(s => s.trim()).filter(Boolean) : [];
        payload.experience = formData.experience ? Number(formData.experience) : undefined;
        payload.consultationFee = formData.consultationFee ? Number(formData.consultationFee) : undefined;
        payload.languages = formData.languages ? formData.languages.split(',').map(s => s.trim()).filter(Boolean) : [];
        payload.clinic = {
          name: formData.clinicName,
          address: formData.clinicAddress,
          phone: formData.clinicPhone,
          timings: formData.clinicTimings,
        };
      }

      await updateProfile(payload);
      setEditing(false);
      setSuccessMsg('Profile updated successfully!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  /* ---- Photo upload ---- */
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Photo must be smaller than 5 MB.');
      return;
    }
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handlePhotoUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setErrorMsg('');
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const result = await apiService.upload('/users/profile/photo', fd);
      // Update local state + storage
      const fullUrl = result.photoUrl.startsWith('http') ? result.photoUrl : `${API_URL}${result.photoUrl}`;
      const updated = { ...profileData, avatar: fullUrl, profileImage: fullUrl };
      setProfileData(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setPhotoPreview(null);
      setSuccessMsg('Profile photo updated!');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setErrorMsg(err.message || 'Photo upload failed.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const avatarUrl = photoPreview || profileData.avatar || profileData.profileImage
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&background=random&color=fff&size=200`;

  /* ---- Render helpers ---- */
  const renderField = (label, value) => (
    <div className="col-md-6 mb-3">
      <h6 className="text-muted">{label}</h6>
      <p>{value || 'Not provided'}</p>
    </div>
  );

  const renderInput = (label, name, type = 'text', placeholder = '') => (
    <div className="col-md-6 mb-3">
      <label className="form-label fw-semibold">{label}</label>
      <input
        type={type}
        name={name}
        className="form-control"
        value={formData[name] || ''}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  );

  const renderTextarea = (label, name, placeholder = '', rows = 3) => (
    <div className="col-12 mb-3">
      <label className="form-label fw-semibold">{label}</label>
      <textarea
        name={name}
        className="form-control"
        rows={rows}
        value={formData[name] || ''}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  );

  const renderSelect = (label, name, options) => (
    <div className="col-md-6 mb-3">
      <label className="form-label fw-semibold">{label}</label>
      <select name={name} className="form-select" value={formData[name] || ''} onChange={handleChange}>
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
      </select>
    </div>
  );

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Hero banner */}
      <div className="jumbotron gradient-background p-4 p-md-5 text-white rounded bg-dark mb-4">
        <div className="row align-items-center">
          <div className="col-md-8 px-0" style={{ color: "black" }}>
            <h1 className="display-4">Welcome, {profileData.name || 'User'}!</h1>
            <p className="lead my-3">Manage your health profile and medical records in one place.</p>
          </div>
          <div className="col-md-4 text-md-end">
            <button onClick={handleLogout} className="btn btn-outline-dark">
              <i className="fas fa-sign-out-alt me-2"></i> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && <div className="alert alert-success alert-dismissible fade show">{successMsg}<button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button></div>}
      {errorMsg && <div className="alert alert-danger alert-dismissible fade show">{errorMsg}<button type="button" className="btn-close" onClick={() => setErrorMsg('')}></button></div>}

      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 mb-4">
          <div className="card">
            <div className="card-body text-center">
              <div className="position-relative d-inline-block">
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="rounded-circle img-fluid mb-2"
                  style={{ width: '150px', height: '150px', objectFit: 'cover', border: '3px solid #dee2e6' }}
                />
                {/* Camera overlay */}
                <button
                  type="button"
                  className="btn btn-sm btn-primary rounded-circle position-absolute"
                  style={{ bottom: '10px', right: '5px', width: '36px', height: '36px' }}
                  title="Change photo"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <i className="fas fa-camera"></i>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="d-none"
                  onChange={handlePhotoSelect}
                />
              </div>

              {/* Upload button appears when a new photo is selected */}
              {photoPreview && (
                <div className="mt-2">
                  <button className="btn btn-success btn-sm me-1" onClick={handlePhotoUpload} disabled={uploadingPhoto}>
                    {uploadingPhoto ? <><span className="spinner-border spinner-border-sm me-1"></span>Uploading...</> : <><i className="fas fa-check me-1"></i>Save Photo</>}
                  </button>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => { setPhotoPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>Cancel</button>
                </div>
              )}

              <h5 className="card-title mt-2">{profileData.name}</h5>
              <p className="text-muted mb-0">{profileData.role?.charAt(0).toUpperCase() + profileData.role?.slice(1) || 'User'}</p>
              {isDoctor && profileData.specialization && <small className="text-primary">{profileData.specialization}</small>}
            </div>

            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <button className={`btn btn-link text-decoration-none w-100 text-start ${activeTab === 'profile' ? 'text-primary fw-bold' : 'text-dark'}`} onClick={() => setActiveTab('profile')}>
                  <i className="fas fa-user me-2"></i> Profile Information
                </button>
              </li>
              <li className="list-group-item">
                <button className={`btn btn-link text-decoration-none w-100 text-start ${activeTab === 'medical' ? 'text-primary fw-bold' : 'text-dark'}`} onClick={() => setActiveTab('medical')}>
                  <i className={`fas ${isDoctor ? 'fa-stethoscope' : 'fa-notes-medical'} me-2`}></i> {isDoctor ? 'Professional Info' : 'Medical Information'}
                </button>
              </li>
              {isDoctor && (
                <li className="list-group-item">
                  <button className={`btn btn-link text-decoration-none w-100 text-start ${activeTab === 'clinic' ? 'text-primary fw-bold' : 'text-dark'}`} onClick={() => setActiveTab('clinic')}>
                    <i className="fas fa-hospital me-2"></i> Clinic Details
                  </button>
                </li>
              )}
              <li className="list-group-item">
                <button className={`btn btn-link text-decoration-none w-100 text-start ${activeTab === 'appointments' ? 'text-primary fw-bold' : 'text-dark'}`} onClick={() => setActiveTab('appointments')}>
                  <i className="fas fa-calendar-check me-2"></i> Appointments
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Main content */}
        <div className="col-md-9">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                {activeTab === 'profile' && 'Profile Information'}
                {activeTab === 'medical' && (isDoctor ? 'Professional Information' : 'Medical Information')}
                {activeTab === 'clinic' && 'Clinic Details'}
                {activeTab === 'appointments' && 'Your Appointments'}
              </h4>
              {activeTab !== 'appointments' && !editing && (
                <button className="btn btn-outline-primary btn-sm" onClick={startEditing}>
                  <i className="fas fa-edit me-1"></i> Edit Profile
                </button>
              )}
            </div>

            <div className="card-body">
              {/* ===== VIEW MODE ===== */}
              {!editing && (
                <>
                  {activeTab === 'profile' && (
                    <div className="row">
                      {renderField('Full Name', profileData.name)}
                      {renderField('Email', profileData.email)}
                      {renderField('Username', profileData.username)}
                      {renderField('Contact Number', profileData.phone)}
                      {renderField('Date of Birth', formatDate(profileData.dateOfBirth))}
                      {renderField('Gender', profileData.gender ? profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1) : null)}
                      <div className="col-12 mb-3">
                        <h6 className="text-muted">Address</h6>
                        <p>{profileData.address || 'Not provided'}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'medical' && isPatient && (
                    <div className="row">
                      {renderField('Blood Group', profileData.bloodGroup)}
                      {renderField('Allergies', Array.isArray(profileData.allergies) ? profileData.allergies.join(', ') : profileData.allergies || 'None reported')}
                      {renderField('Medical Conditions', Array.isArray(profileData.medicalConditions) ? profileData.medicalConditions.join(', ') : profileData.medicalConditions || 'None reported')}
                      <div className="col-12 mt-3">
                        <h5>Medical Records</h5>
                        <p className="text-muted">No medical records available yet.</p>
                        <Link to="/prescription-hub" className="btn btn-outline-primary me-2">
                          <i className="fas fa-prescription me-1"></i> View Prescriptions
                        </Link>
                      </div>
                    </div>
                  )}

                  {activeTab === 'medical' && isDoctor && (
                    <div className="row">
                      {renderField('Specialization', profileData.specialization)}
                      {renderField('Experience', profileData.experience ? `${profileData.experience} years` : null)}
                      {renderField('Consultation Fee', profileData.consultationFee ? `\u20B9${profileData.consultationFee}` : null)}
                      {renderField('Languages', Array.isArray(profileData.languages) ? profileData.languages.join(', ') : profileData.languages)}
                      <div className="col-12 mb-3">
                        <h6 className="text-muted">Bio</h6>
                        <p>{profileData.bio || 'Not provided'}</p>
                      </div>
                      <div className="col-12 mb-3">
                        <h6 className="text-muted">Qualifications</h6>
                        <p>{Array.isArray(profileData.qualifications) ? profileData.qualifications.join(', ') : profileData.qualifications || 'Not provided'}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'clinic' && isDoctor && (
                    <div className="row">
                      {renderField('Clinic Name', profileData.clinic?.name)}
                      {renderField('Clinic Phone', profileData.clinic?.phone)}
                      <div className="col-12 mb-3">
                        <h6 className="text-muted">Clinic Address</h6>
                        <p>{profileData.clinic?.address || 'Not provided'}</p>
                      </div>
                      <div className="col-12 mb-3">
                        <h6 className="text-muted">Timings</h6>
                        <p>{profileData.clinic?.timings || 'Not provided'}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'appointments' && (
                    <div className="text-center my-4">
                      <p className="text-muted">No upcoming appointments found.</p>
                      {isPatient && (
                        <Link to="/appointments" className="btn btn-primary">
                          <i className="fas fa-calendar-plus me-2"></i> Book an Appointment
                        </Link>
                      )}
                      {isDoctor && (
                        <Link to="/doctor-dashboard" className="btn btn-primary">
                          <i className="fas fa-calendar-alt me-2"></i> Go to Dashboard
                        </Link>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ===== EDIT MODE ===== */}
              {editing && (
                <div className="row">
                  {/* Common fields */}
                  {renderInput('Full Name', 'name', 'text', 'Your full name')}
                  {renderInput('Contact Number', 'phone', 'tel', '+91 XXXXXXXXXX')}
                  {renderSelect('Gender', 'gender', ['male', 'female', 'other'])}
                  {renderInput('Date of Birth', 'dateOfBirth', 'date')}
                  <div className="col-12 mb-3">
                    <label className="form-label fw-semibold">Address</label>
                    <textarea name="address" className="form-control" rows="2" value={formData.address || ''} onChange={handleChange} placeholder="Enter your address" />
                  </div>

                  {/* Patient-specific edit fields */}
                  {isPatient && (
                    <>
                      <div className="col-12"><hr /><h5 className="text-primary mb-3"><i className="fas fa-notes-medical me-2"></i>Medical Information</h5></div>
                      {renderSelect('Blood Group', 'bloodGroup', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])}
                      {renderInput('Allergies', 'allergies', 'text', 'Comma separated: Peanuts, Penicillin')}
                      {renderInput('Medical Conditions', 'medicalConditions', 'text', 'Comma separated: Diabetes, Asthma')}
                    </>
                  )}

                  {/* Doctor-specific edit fields */}
                  {isDoctor && (
                    <>
                      <div className="col-12"><hr /><h5 className="text-primary mb-3"><i className="fas fa-stethoscope me-2"></i>Professional Information</h5></div>
                      {renderInput('Specialization', 'specialization', 'text', 'e.g. Cardiology')}
                      {renderInput('Experience (years)', 'experience', 'number', 'e.g. 10')}
                      {renderInput('Consultation Fee (\u20B9)', 'consultationFee', 'number', 'e.g. 500')}
                      {renderInput('Languages', 'languages', 'text', 'Comma separated: English, Hindi')}
                      {renderInput('Qualifications', 'qualifications', 'text', 'Comma separated: MBBS, MD')}
                      {renderTextarea('Bio', 'bio', 'A short description about yourself...', 3)}

                      <div className="col-12"><hr /><h5 className="text-primary mb-3"><i className="fas fa-hospital me-2"></i>Clinic Details</h5></div>
                      {renderInput('Clinic Name', 'clinicName', 'text', 'e.g. City Health Clinic')}
                      {renderInput('Clinic Phone', 'clinicPhone', 'tel', '+91 XXXXXXXXXX')}
                      <div className="col-12 mb-3">
                        <label className="form-label fw-semibold">Clinic Address</label>
                        <textarea name="clinicAddress" className="form-control" rows="2" value={formData.clinicAddress || ''} onChange={handleChange} placeholder="Full clinic address" />
                      </div>
                      {renderInput('Clinic Timings', 'clinicTimings', 'text', 'e.g. Mon-Fri 9AM-6PM')}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer with action buttons */}
            {editing && (
              <div className="card-footer d-flex gap-2">
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Saving...</> : <><i className="fas fa-save me-1"></i>Save Changes</>}
                </button>
                <button className="btn btn-outline-secondary" onClick={cancelEditing} disabled={saving}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
