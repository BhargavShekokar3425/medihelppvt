import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useBackendContext } from "../contexts/BackendContext";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { apiService } = useBackendContext();
  
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        
        // Try to load doctors from API
        let doctorsList = [];
        if (apiService) {
          doctorsList = await apiService.get('/users/doctors');
        } else {
          // Fallback to hardcoded doctors if API fails
          doctorsList = [
            { id: 'd1', name: 'Dr. Neha Sharma', specialization: 'Cardiology', experience: '10 years', avatar: '/assets/femme.jpeg' },
            { id: 'd2', name: 'Dr. Shikha Chibber', specialization: 'Neurology', experience: '8 years', avatar: '/assets/fem.jpeg' },
            { id: 'd3', name: 'Dr. Ayurvedic Specialists', specialization: 'Ayurveda', experience: '15 years', avatar: '/assets/doctorman.avif' },
            { id: 'd4', name: 'Dr. Vibha Dubey', specialization: 'Dermatology', experience: '12 years', avatar: '/assets/femmedocie.jpg' },
            { id: 'd5', name: 'Dr. Shweta Singh', specialization: 'Pediatrics', experience: '7 years', avatar: '/assets/cutu.jpeg' },
            { id: 'd6', name: 'Dr. Misha Goyal', specialization: 'Gynecology', experience: '9 years', avatar: '/assets/vcutu.jpg' }
          ];
        }
        
        setDoctors(doctorsList);
      } catch (error) {
        console.error("Error loading doctors:", error);
        setError("Could not load doctors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    loadDoctors();
  }, [apiService]);

  // Render doctors
  return (
    <div className="doctors-page py-4">
      <div className="jumbotron gradient-background p-4 p-md-5 text-white rounded bg-dark mb-4">
        <div className="col-md-6 px-0" style={{ color: "black" }}>
          <h1 className="display-4 font-italic">Our Specialist Doctors</h1>
          <p className="lead my-3">
            Meet our team of experienced healthcare professionals who are ready to help you with your medical needs.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading doctors...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {doctors.map((doctor) => (
            <div className="col" key={doctor.id}>
              <div className="card h-100 shadow-sm doctor-card">
                <div className="card-img-wrapper">
                  <img 
                    src={doctor.avatar || '/assets/default-avatar.png'} 
                    className="card-img-top" 
                    alt={doctor.name} 
                    style={{ height: '240px', objectFit: 'cover' }}
                  />
                  <div className="doctor-overlay">
                    <Link 
                      to="/appointments" 
                      state={{ selectedDoctorId: doctor.id }}
                      className="btn btn-sm btn-primary"
                    >
                      Book Appointment
                    </Link>
                  </div>
                </div>
                <div className="card-body">
                  <h5 className="card-title">{doctor.name}</h5>
                  <p className="card-text text-muted">{doctor.specialization}</p>
                  <p className="card-text">
                    <small className="text-muted">Experience: {doctor.experience}</small>
                  </p>
                </div>
                <div className="card-footer bg-white border-top-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-success">
                      <i className="fas fa-circle me-1"></i> Available
                    </span>
                    <Link to={`/reviews/doctor/${doctor.id}`} className="text-decoration-none">
                      Reviews <i className="fas fa-chevron-right ms-1 small"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;