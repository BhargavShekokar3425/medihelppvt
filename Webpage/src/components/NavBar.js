import React from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <div className="nav-scroller pt-0.5 pb-3 mb-4">
      <nav className="nav d-flex justify-content-between">
        <Link className="p-2 text-dark spl_text" style={{ fontWeight: "bolder" }} to="/">
          <img src="/assets/book-labtest.png" width="47" alt="Home" className="nav-icon"/>
          <div>Home</div> 
        </Link>
        <Link className="p-2 text-dark spl_text" style={{ fontWeight: "bolder" }} to="/doctors">
          <img src="/assets/surgery.svg" width="47" alt="Doctors" className="nav-icon"/>
          <div>Doctors</div>
        </Link>
        <Link className="p-2 spl_text" style={{ fontWeight: "bolder", color: "rgb(136, 38, 38)" }} to="/sos">
          <img src="/assets/diagnostic-center.png" width="47" alt="SOS" className="nav-icon"/>
          <div>SOS</div> 
        </Link>
        <Link className="p-2 text-dark spl_text" style={{ fontWeight: "bolder" }} to="/appointments">
          <img src="/assets/radiology.png" width="44" alt="Appointments" className="nav-icon"/>
          <div>Appointments</div> 
        </Link>
        <Link className="p-2 text-dark spl_text" style={{ fontWeight: "bolder" }} to="/docanswers">
          <img src="/assets/talkdoc.svg" width="62" alt="DocAnswers" className="nav-icon"/>
          <div>DocAnswers</div>
        </Link>
        <Link className="p-2 text-dark spl_text" style={{ fontWeight: "bolder" }} to="/prescription-hub">
          <img src="/assets/medicine.svg" width="47" alt="Prescription Hub" className="nav-icon"/>
          <div>Prescription Hub</div> 
        </Link>
        <Link className="p-2 text-dark spl_text" style={{ fontWeight: "bolder" }} to="/reviews">
          <img src="/assets/popular-hc.png" width="47" alt="Reviews" className="nav-icon"/>
          <div>Reviews</div> 
        </Link>
      </nav>
    </div>
  );
};

export default NavBar;

// import React from "react";
// import { Link } from "react-router-dom";

// const NavBar = () => {
//   return (
//     <div className="nav-scroller pt-0.5 pb-3 mb-4">
//         <nav className="nav d-flex justify-content-between">
//           <a className="p-2 text-dark spl_text" style={{ fontWeight: "bolder" }}  href="https://example.com">
//             <img src="/assets/book-labtest.png" width="47" alt="Home" className="nav-icon"/>
//             <div>Home</div> 
//           </a>
//           <a className="p-2 text-dark spl_text" style={{ fontWeight: "bolder" }} href="https://example.com">
//             <img src="/assets/surgery.svg" width="47" alt="Home" className="nav-icon"/>
//             <div>Doctors</div>
//           </a>
//           <a className="p-2 spl_text" href="https://example.com" style={{ fontWeight: "bolder", color: "rgb(136, 38, 38)" }}>
//             <img src="/assets/diagnostic-center.png" width="47" alt="Home" className="nav-icon"/>
//             <div>SOS</div> 
//           </a>
//           <a className="p-2 text-dark spl_text" style={{ fontWeight: "bolder" }}  href="https://example.com">
//             <img src="/assets/radiology.png" width="44" alt="Home" className="nav-icon"/>
//             <div>Appointments</div> 
//           </a>
//           <a className="p-2 text-dark spl_text" style={{ fontWeight: "bolder" }} href="https://example.com">
//             <img src="/assets/talkdoc.svg" width="62" alt="Home" className="nav-icon"/>
//             <div>DocAnswers</div>
//           </a>
//           <a className="p-2 text-dark spl_text" style={{ fontWeight: "bolder" }} href="/prescription_hub/main/index.html">
//             <img src="/assets/medicine.svg" width="47" alt="Home" className="nav-icon"/>
//             <div>Prescription Hub</div> 
//           </a>
//           <a className="p-2 text-dark spl_text" style={{ fontWeight: "bolder" }} href="/reviews/index.html">
//             <img src="/assets/popular-hc.png" width="47" alt="Home" className="nav-icon"/>
//             <div>Reviews</div> 
//           </a>
//         </nav>
//       </div>
  
//   );
// };

// export default NavBar;
