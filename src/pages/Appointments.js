import React, { useState, useEffect } from 'react';
import AppointmentScheduler from '../components/AppointmentScheduler';
import { useBackendContext } from '../contexts/BackendContext';
import { Link } from 'react-router-dom';

const Appointments = () => {
  const { currentUser, apiService } = useBackendContext();
  const [userAppointments, setUserAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load existing appointments when component mounts
  useEffect(() => {
    const loadAppointments = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const response = await apiService.get('/appointments');
        setUserAppointments(response);
      } catch (err) {
        console.error("Error loading appointments:", err);
        setError("Failed to load your appointments. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    loadAppointments();
  }, [currentUser, apiService]);
  
  return (
    <div className="appointments-page">
      {/* Auth Status Banner */}
      {currentUser ? (
        <div className="auth-info mb-4">
          <div className="alert alert-info">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Welcome, {currentUser.name}!</strong> 
                <p className="mb-0">You can view and schedule your appointments below.</p>
              </div>
              <div className="text-end">
                <span className="badge bg-primary">{currentUser.role}</span>
              </div>
            </div>
          </div>
          
          {/* Existing Appointments */}
          {userAppointments.length > 0 && (
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Your Upcoming Appointments</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Reason</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userAppointments.map(appointment => (
                        <tr key={appointment.id} className={
                          appointment.status === 'cancelled' ? 'table-danger' : 
                          appointment.status === 'completed' ? 'table-success' : ''
                        }>
                          <td>{appointment.doctorName}</td>
                          <td>{new Date(appointment.date).toLocaleDateString()}</td>
                          <td>{appointment.timeSlot}</td>
                          <td>{appointment.reason}</td>
                          <td>
                            <span className={`badge ${
                              appointment.status === 'pending' ? 'bg-warning' :
                              appointment.status === 'confirmed' ? 'bg-success' :
                              appointment.status === 'cancelled' ? 'bg-danger' :
                              appointment.status === 'completed' ? 'bg-info' :
                              'bg-secondary'
                            }`}>
                              {appointment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {loading && (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading appointments...</span>
              </div>
              <p className="mt-2">Loading your appointments...</p>
            </div>
          )}
          
          {error && (
            <div className="alert alert-danger">{error}</div>
          )}
          
          {!loading && userAppointments.length === 0 && !error && (
            <div className="card mb-4">
              <div className="card-body text-center">
                <p className="mb-3">You don&apost have any appointments yet.</p>
                <p>Use the scheduler below to book your first appointment.</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="alert alert-warning mb-4">
          <p className="mb-1">
            <i className="fas fa-exclamation-triangle me-2"></i>
            You need to be logged in to book and view appointments.
          </p>
          <Link to="/signup" className="btn btn-sm btn-primary mt-2">
            Sign in / Register
          </Link>
        </div>
      )}
      
      {/* Appointment Scheduler Component */}
      <div className="scheduler-container">
        <h2 className="mb-4">Schedule a New Appointment</h2>
        <AppointmentScheduler />
      </div>
    </div>
  );
};

export default Appointments;