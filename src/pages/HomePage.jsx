import React from 'react';
import { Link } from 'react-router-dom';
import { useBackendContext } from '../contexts/BackendContext';
import About from '../components/About';

const HomePage = () => {
  const { currentUser } = useBackendContext();
  
  return (
    <div className="home-page py-4 animate-fade-in">
      <div className="jumbotron gradient-background p-4 p-md-5 text-white rounded bg-dark mb-4">
        <div className="row align-items-center">
          <div className="col-md-8 px-0" style={{ color: "black" }}>
            <h1 className="display-4 font-italic">Welcome to MediHelp</h1>
            <p className="lead my-3">
              Your one-stop healthcare platform for booking appointments, 
              connecting with doctors, and managing your medical needs online.
            </p>
            
            {!currentUser && (
              <p className="lead mb-0">
                <Link to="/signup" className="btn btn-lg btn-primary">
                  Get Started
                </Link>
              </p>
            )}
          </div>
          <div className="col-md-4">
            <div className="auth-status-banner text-center p-3 bg-white rounded shadow-sm">
              {currentUser ? (
                <>
                  <h5 className="mb-3">Welcome back, {currentUser.name}!</h5>
                  <div className="d-grid gap-2">
                    <Link to="/appointments" className="btn btn-outline-primary btn-sm">
                      <i className="fas fa-calendar-plus me-2"></i> Book Appointment
                    </Link>
                    <Link to="/profile" className="btn btn-outline-secondary btn-sm">
                      <i className="fas fa-user me-2"></i> View Profile
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h5 className="mb-3">Not logged in</h5>
                  <p className="text-muted mb-3">Sign in to access all features</p>
                  <div className="d-grid gap-2">
                    <Link to="/signup" className="btn btn-primary">Sign In</Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Service Cards */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Find Doctors</h5>
              <p className="card-text">Connect with specialized healthcare professionals tailored to your needs.</p>
              <Link to="/doctors" className="btn btn-sm btn-outline-primary">Browse Doctors</Link>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Book Appointments</h5>
              <p className="card-text">Schedule appointments with doctors at your convenience.</p>
              <Link to="/appointments" className="btn btn-sm btn-outline-primary">Book Now</Link>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Chat with Doctors</h5>
              <p className="card-text">Get quick answers to your medical queries through our chat service.</p>
              <Link to="/docanswers" className="btn btn-sm btn-outline-primary">Start Chat</Link>
            </div>
          </div>
        </div>
      </div>

      {/* About MediHelp section using the About component */}
      <div className="row my-4">
        <div className="col-md-8">
          <h2>About MediHelp</h2>
          <p>
            MediHelp is your all-in-one medical companion, making healthcare access seamless and convenient. Schedule appointments, get emergency help, and manage prescriptions all in one place.
          </p>
        </div>
        <div className="col-md-4">
          <About
            title="About MediHelp"
            content="MediHelp is your all-in-one medical companion, making healthcare access seamless and convenient. Schedule appointments, get emergency help, and manage prescriptions all in one place."
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
