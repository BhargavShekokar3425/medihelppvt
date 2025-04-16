// import { Link } from "react-router-dom";  // Import Link from React Router

function Doctors(){
    return(
        <div>
        <div className="container">
          
            <div className="jumbotron gradient-background p-4 p-md-5 text-white rounded bg-dark" style={{ marginBottom: "32px" }}>
                <div className="col-md-6 px-0" style={{ color: "black" }}>
                    <h1 className="display-4 font-italic">Get to Know Your Doctors!</h1>
                    <p className="lead my-3">Explore a diverse panel of experienced medical professionals across various specialties, ready to provide expert care.</p>
                    <p className="lead my-3">Check their qualifications, areas of expertise, and availability to make informed healthcare decisions with confidence.</p>
                    <p className="lead mb-0 text-white font-weight-bold" style={{ fontWeight: "bolder" }}>Explore Our Panel of Doctors Below...</p>
                </div>
            </div>

      
    <div class="row text-center">
      <div class="col-lg-4 d-flex flex-column align-items-center">
        <svg class="bd-placeholder-img rounded-circle " width="140" height="140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="var(--bs-secondary-color)"></rect></svg>
       
        <h2 class="fw-normal mt-3">Dr. Neha Sharma</h2>
  
            <p class="mb-1"><strong>Degree:</strong> MBBS, PGDMT, PGDMC</p>
            <p class="mb-1"><strong>Email:</strong> nehasharma@iitj.ac.in</p>
      </div>
      <div class="col-lg-4">

            <svg class="bd-placeholder-img rounded-circle" width="140" height="140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder" preserveAspectRatio="xMidYMid slice" focusable="false">
            <title>Dr. Shikha Chibber</title>
            <rect width="100%" height="100%" fill="var(--bs-secondary-color)"></rect>
            </svg>
            <h2 class="fw-normal">Dr. Shikha Chibber</h2>
            <p class="mb-1"><strong>Specialization:</strong> MD Psychiatry</p>
            <p class="mb-1"><strong>Availability:</strong> Tuesday & Friday</p>
            <p class="mb-1"><strong>From:</strong> Goyal Hospital (Saturdays)</p>
        </div>
      <div class="col-lg-4">
      <svg class="bd-placeholder-img rounded-circle" width="140" height="140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder" preserveAspectRatio="xMidYMid slice" focusable="false">
      <title>Ayurvedic Specialists</title>
      <rect width="100%" height="100%" fill="var(--bs-secondary-color)"></rect>
    </svg>
    <h2 class="fw-normal">Ayurvedic Specialists</h2>
    <p><strong>Specializations:</strong> Swasthavritta Naturopathy, Homeopathy, Ayurveda & Yogic Science</p>
    <p><strong>Availability:</strong> Thursday & Saturday, 03:00 PM - 05:00 PM</p>
  </div>
           

      
    </div>

    <div class="row text-center " >
      <div class="col-lg-4 d-flex flex-column align-items-center">
      <svg class="bd-placeholder-img rounded-circle" width="140" height="140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder" preserveAspectRatio="xMidYMid slice" focusable="false">
      <title>Dr. Vibha Dubey</title>
      <rect width="100%" height="100%" fill="var(--bs-secondary-color)"></rect>
    </svg>
    <h2 class="fw-normal">Dr. Vibha Dubey</h2>
    <p><strong>Degree:</strong> MBBS, DCh Pediatrics</p>
    <p><strong>Availability:</strong>Saturday, 10:00 AM - 12:00 PM</p>
  </div>

     
      <div class="col-lg-4 d-flex flex-column align-items-center text-center">
    <svg class="bd-placeholder-img rounded-circle" width="140" height="140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder" preserveAspectRatio="xMidYMid slice" focusable="false">
      <title>Dr. Shweta Singh</title>
      <rect width="100%" height="100%" fill="var(--bs-secondary-color)"></rect>
    </svg>
    <h2 class="fw-normal">Dr. Shweta Singh</h2>
    <p><strong>Degree:</strong> MBBS, MD Psychiatry</p>
    <p><strong>Availability:</strong> Saturday, 10:00 AM - 12:00 PM</p>
  </div>

      <div class="col-lg-4">
      <svg class="bd-placeholder-img rounded-circle" width="140" height="140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder" preserveAspectRatio="xMidYMid slice" focusable="false">
            <title>Dr. Misha Goyal</title>
            <rect width="100%" height="100%" fill="var(--bs-secondary-color)"></rect>
            </svg>
            <h2 class="fw-normal">Dr. Misha Goyal</h2>
            <p class="mb-1"><strong>Degree:</strong> MBBS, MS OBG</p>
            <p class="mb-1"><strong>Availability:</strong> Saturday, 10:00 AM - 12:00 PM</p>
        </div>

      
    </div>

    

    </div>
    
 
    
</div>
    );
}
export default Doctors;