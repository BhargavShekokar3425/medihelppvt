import React from 'react';
import { Link } from 'react-router-dom';
// Only import useBackendContext if we actually need currentUser
// import { useBackendContext } from '../contexts/BackendContext';

function PrescriptionMain() {
  // Remove this if not needed
  // const { currentUser } = useBackendContext();
  
  return (
    <div>
      <div className="container">
        <div className="jumbotron gradient-background p-4 p-md-5 text-white rounded bg-dark" style={{marginBottom: "32px"}} >
          <div className="col-md-6 px-0" style={{color: "black"}}>
            <h1 className="display-4 font-italic">Prescription Portal</h1>
            <p className="lead my-3">Your go-to Prescription Portal—fast, easy, and hassle-free! Doctors prescribe, patients order, and medications arrive at your doorstep.</p>
          </div>
        </div>
    
        <div className="row mb-2">
          <div className="col-md-6">
            <div className="hover-card row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative custom-card" style={{backgroundColor: "rgb(243, 243, 243)"}}>
              <div className="col p-4 d-flex flex-column position-static">
                <strong className="d-inline-block mb-2 text-primary">Doctors</strong>
                <h3 className="mb-0">Doctors Prescribe Request Bar</h3>
                <div className="mb-1 text-muted">Manage Patients Request</div>
                <p className="card-text mb-auto">Access and manage patient prescription requests, review medical histories, and issue digital prescriptions securely.</p>
                <ul className="d-flex list-unstyled mt-auto">
                  <li className="d-flex align-items-stretch me-3">
                    <Link to="/pres-doctor" className="view-more">  
                      View More  
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                      </svg>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="col-auto d-none d-lg-block">
                <img src="/assets/doc.jpeg" alt="Doctors Thumbnail" className="img-fluid" style={{width: "200px", height: "250px", objectFit: "cover"}}/>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="hover-card row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative custom-card" style={{backgroundColor: "rgb(243, 243, 243)"}}>
              <div className="col p-4 d-flex flex-column position-static">
                <strong className="d-inline-block mb-2 text-success">Patients</strong>
                <h3 className="mb-0">Patients Medicine Request Bar</h3>
                <div className="mb-1 text-muted">Order your Medication online</div>
                <p className="mb-auto">Request prescriptions from your doctor, track order status, and get medications delivered to your doorstep.</p>
                <ul className="d-flex list-unstyled mt-auto">
                  <li className="d-flex align-items-stretch me-3">
                    <Link to="/pres-patient" className="view-more">  
                      View More  
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                      </svg>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="col-auto d-none d-lg-block">
                <img src="/assets/patient.jpeg" alt="Patients Thumbnail" width="200" height="250" className="img-fluid"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrescriptionMain;
