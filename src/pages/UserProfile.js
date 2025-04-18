import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBackendContext } from "../contexts/BackendContext";

const UserProfile = () => {
  const { currentUser, logout } = useBackendContext();
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/signup');
      return;
    }
    
    setProfileData(currentUser);
    setLoading(false);
  }, [currentUser, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Error</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="jumbotron gradient-background p-4 p-md-5 text-white rounded bg-dark mb-4">
        <div className="row align-items-center">
          <div className="col-md-8 px-0" style={{ color: "black" }}>
            <h1 className="display-4">Welcome, {profileData.name || 'User'}!</h1>
            <p className="lead my-3">Manage your health profile and medical records in one place.</p>
          </div>
          <div className="col-md-4 text-md-end">
            <button 
              onClick={handleLogout}
              className="btn btn-outline-dark"
            >
              <i className="fas fa-sign-out-alt me-2"></i> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card">
            <div className="card-body text-center">
              <img 
                src={profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&background=random&color=fff&size=200`} 
                alt="Profile" 
                className="rounded-circle img-fluid mb-3"
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
              />
              <h5 className="card-title">{profileData.name}</h5>
              <p className="text-muted">{profileData.role?.charAt(0).toUpperCase() + profileData.role?.slice(1) || 'User'}</p>
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <button 
                  className={`btn btn-link text-decoration-none w-100 text-start ${activeTab === 'profile' ? 'text-primary' : 'text-dark'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="fas fa-user me-2"></i> Profile Information
                </button>
              </li>
              <li className="list-group-item">
                <button 
                  className={`btn btn-link text-decoration-none w-100 text-start ${activeTab === 'medical' ? 'text-primary' : 'text-dark'}`}
                  onClick={() => setActiveTab('medical')}
                >
                  <i className="fas fa-notes-medical me-2"></i> Medical Information
                </button>
              </li>
              <li className="list-group-item">
                <button 
                  className={`btn btn-link text-decoration-none w-100 text-start ${activeTab === 'appointments' ? 'text-primary' : 'text-dark'}`}
                  onClick={() => setActiveTab('appointments')}
                >
                  <i className="fas fa-calendar-check me-2"></i> Appointments
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="col-md-9">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">
                {activeTab === 'profile' && 'Profile Information'}
                {activeTab === 'medical' && 'Medical Information'}
                {activeTab === 'appointments' && 'Your Appointments'}
              </h4>
            </div>
            <div className="card-body">
              {activeTab === 'profile' && (
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Full Name</h6>
                    <p>{profileData.name || 'Not provided'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Email</h6>
                    <p>{profileData.email || 'Not provided'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Username</h6>
                    <p>{profileData.username || 'Not provided'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Contact Number</h6>
                    <p>{profileData.contact || 'Not provided'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Date of Birth</h6>
                    <p>{formatDate(profileData.dob)}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Gender</h6>
                    <p>{profileData.gender || 'Not provided'}</p>
                  </div>
                  <div className="col-12 mb-3">
                    <h6 className="text-muted">Address</h6>
                    <p>{profileData.address || 'Not provided'}</p>
                  </div>
                </div>
              )}

              {activeTab === 'medical' && (
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Blood Group</h6>
                    <p>{profileData.bloodGroup || 'Not provided'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Allergies</h6>
                    <p>{profileData.allergies || 'None reported'}</p>
                  </div>
                  
                  {profileData.role === 'doctor' && (
                    <div className="col-12">
                      <h6 className="text-muted">Specialization</h6>
                      <p>{profileData.specialization || 'Not provided'}</p>
                    </div>
                  )}

                  {/* Additional info based on role */}
                  {!profileData.role || profileData.role === 'patient' ? (
                    <div className="col-12 mt-3">
                      <h5>Medical Records</h5>
                      <p className="text-muted">No medical records available yet.</p>
                      
                      <div className="mt-3">
                        <Link to="/prescription-hub" className="btn btn-outline-primary me-2">
                          <i className="fas fa-prescription me-1"></i> View Prescriptions
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {activeTab === 'appointments' && (
                <div>
                  <div className="text-center my-4">
                    <p className="text-muted">No upcoming appointments found.</p>
                    <Link to="/appointments" className="btn btn-primary">
                      <i className="fas fa-calendar-plus me-2"></i> Book an Appointment
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <div className="card-footer">
              <Link to="#" className="btn btn-outline-primary">
                <i className="fas fa-edit me-2"></i> Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
