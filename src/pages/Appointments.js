// Appointments.js under pages


import AppointmentScheduler from '../components/AppointmentScheduler';
function Appointments() {
    return (
      <div>
         <div className="jumbotron gradient-bg p-4 p-md-5 text-white rounded bg-dark" style={{marginBottom: "32px"}} >
            <div className="col px-0 " style={{color:"black"}}>
              <h1 className="display-4 font-italic" >Appointments Page</h1>
            </div>
          </div>
        <AppointmentScheduler />
      </div>
    );
  }
  
  export default Appointments;