import React from 'react';
import './UserProfileDrawer.css';

const UserProfileDrawer = ({ isOpen, user, onClose }) => {
  if (!isOpen || !user) return null;

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className={`profile-drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <h3>Profile Info</h3>
        <button className="close-button" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="drawer-content">
        <div className="profile-header">
          <div className="profile-avatar">
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=200`} 
              alt={user.name}
            />
          </div>
          
          <h2 className="profile-name">{user.name}</h2>
          
          {user.type === 'doctor' && (
            <div className="profile-badge doctor">
              <i className="fas fa-user-md"></i>
              <span>Doctor</span>
            </div>
          )}
          
          {user.type === 'patient' && (
            <div className="profile-badge patient">
              <i className="fas fa-user"></i>
              <span>Patient</span>
            </div>
          )}
          
          {user.type === 'pharmacy' && (
            <div className="profile-badge pharmacy">
              <i className="fas fa-prescription-bottle-alt"></i>
              <span>Pharmacy</span>
            </div>
          )}
          
          <div className={`profile-status ${user.status || 'offline'}`}>
            {user.status === 'online' ? 'Online' : 'Offline'}
          </div>
        </div>
        
        <div className="profile-section">
          <h4 className="section-title">Contact Information</h4>
          
          <div className="profile-field">
            <div className="field-label">
              <i className="fas fa-envelope"></i>
              <span>Email</span>
            </div>
            <div className="field-value">{user.email || 'Not available'}</div>
          </div>
          
          <div className="profile-field">
            <div className="field-label">
              <i className="fas fa-phone-alt"></i>
              <span>Phone</span>
            </div>
            <div className="field-value">{user.contact || 'Not available'}</div>
          </div>
        </div>
        
        {user.type === 'doctor' && (
          <div className="profile-section">
            <h4 className="section-title">Professional Details</h4>
            
            <div className="profile-field">
              <div className="field-label">
                <i className="fas fa-stethoscope"></i>
                <span>Specialization</span>
              </div>
              <div className="field-value">{user.specialization || 'General Physician'}</div>
            </div>
            
            <div className="profile-field">
              <div className="field-label">
                <i className="fas fa-briefcase"></i>
                <span>Experience</span>
              </div>
              <div className="field-value">{user.experience || 'Not specified'}</div>
            </div>
            
            <div className="profile-field">
              <div className="field-label">
                <i className="fas fa-graduation-cap"></i>
                <span>Qualifications</span>
              </div>
              <div className="field-value">{user.qualifications || 'Not specified'}</div>
            </div>
          </div>
        )}
        
        {user.type === 'patient' && (
          <div className="profile-section">
            <h4 className="section-title">Medical Information</h4>
            
            <div className="profile-field">
              <div className="field-label">
                <i className="fas fa-calendar-alt"></i>
                <span>Date of Birth</span>
              </div>
              <div className="field-value">{formatDate(user.dob)}</div>
            </div>
            
            <div className="profile-field">
              <div className="field-label">
                <i className="fas fa-tint"></i>
                <span>Blood Group</span>
              </div>
              <div className="field-value">{user.bloodGroup || 'Not specified'}</div>
            </div>
            
            <div className="profile-field">
              <div className="field-label">
                <i className="fas fa-allergies"></i>
                <span>Allergies</span>
              </div>
              <div className="field-value">{user.allergies || 'None'}</div>
            </div>
          </div>
        )}
        
        {user.type === 'pharmacy' && (
          <div className="profile-section">
            <h4 className="section-title">Pharmacy Details</h4>
            
            <div className="profile-field">
              <div className="field-label">
                <i className="fas fa-map-marker-alt"></i>
                <span>Address</span>
              </div>
              <div className="field-value">{user.address || 'Not available'}</div>
            </div>
            
            <div className="profile-field">
              <div className="field-label">
                <i className="fas fa-clock"></i>
                <span>Opening Hours</span>
              </div>
              <div className="field-value">{user.openingHours || 'Not specified'}</div>
            </div>
          </div>
        )}
        
        <div className="profile-actions">
          {user.type === 'doctor' && (
            <button className="action-button book">
              <i className="fas fa-calendar-plus"></i>
              <span>Book Appointment</span>
            </button>
          )}
          
          {user.type === 'pharmacy' && (
            <button className="action-button order">
              <i className="fas fa-prescription-bottle-alt"></i>
              <span>Order Medications</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileDrawer;
