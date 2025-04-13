import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Reviews from "./pages/Reviews";
import PrescriptionMain from "./pages/Prescription_Hub";
import PrescDoc from "./pages/PresDoctors";
import PrescPatient from "./pages/PresPatients";
import Doctors from "./pages/Doctors";

import NavBar from "./components/NavBar"; 
import Header from "./components/Header"; 
import Footer from "./components/Footer"; 

import './App.css';

function App() { 
  return (
    <Router>
    <div className="container">
   
      <Header/>
      <NavBar/>
      <Routes>
        <Route path="/" element={<h1>Home Page</h1>} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/sos" element={<h1>SOS Page</h1>} />
        <Route path="/appointments" element={<h1>Appointments Page</h1>} />
        <Route path="/docanswers" element={<h1>DocAnswers Page</h1>} />
        <Route path="/prescription-hub" element={<PrescriptionMain />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/pres-doctor" element={<PrescDoc />} />
        <Route path="/pres-patient" element={<PrescPatient />} />
      </Routes>
      <Footer/>
    
    </div>
    </Router>
  );
}

export default App;





//   const [reviews, setReviews] = useState([]);

//   const handleSubmit = (event) => {
//     event.preventDefault();

//     const name = event.target.name.value;
//     const reviewText = event.target.review.value;
//     const rating = event.target.rating.value;

//     if (!rating) {
//       alert("Please select a star rating");
//       return;
//     }

//     const newReview = {
//       name,
//       rating,
//       reviewText,
//     };

//     setReviews([newReview, ...reviews]);
//     event.target.reset(); // Reset the form
//   };

//   return (
   
//       <div className="container">
//          <header className="blog-header py-3">
//         <div className="row flex-nowrap justify-content-between align-items-center">
//           <div className="col-4 pt-1">
//              <a className="btn btn-sm btn-outline-secondary spl_text" href="https://example.com">Sign up</a>
//           </div>
//           <div className="col-4 text-center">
//           <a className="blog-header-logo text-dark" href="https://example.com">
//             <span style={{ color: "#5aa3e7" }}>Medi</span>
//             <span style={{ color: "#d73434" }}>Help</span>
//          </a>

//           </div>
//           <div className="col-4 d-flex justify-content-end align-items-center ">
           
            
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="50" height="30" ><path d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z"/><a className="text-muted" href="https://example.com" aria-label="User Profile"></a></svg>
          
           
//           </div>
//         </div>
//       </header>
      
    
//       <div className="nav-scroller pt-0.5 pb-3 mb-4">
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
    
//       <div className="jumbotron gradient-background p-4 p-md-5 text-white rounded bg-dark" style={{marginBottom: "32px"}} >
//         <div className="col-md-6 px-0 " style={{color: "black"}}>
//           <h1 className="display-4 font-italic" >Reviews</h1>
//           <p className="lead my-3">We'd love to hear about your experience! Your feedback helps us enhance our services and create a better experience for you and others. Share your thoughts with us!</p>
//         </div>
//       </div>
//       {/* <!-- COMMENT SECTION--> */}
//       <div className="container mt-5">
//         <h2>Leave  a Review</h2>
//         <hr/>
//         <form id="review-form" onSubmit={handleSubmit}>
//             <div className="mb-3">
//                 <h5><label htmlFor="name" className="form-label">Name</label></h5>
//                 <input type="text" className="form-control" id="name" required/>
//             </div>
//             <div className="mb-3">
//                 <h5><label htmlFor="review" className="form-label">Review</label></h5>
//                 <textarea className="form-control" id="review" rows="3" required></textarea>
//             </div>
//             <b><span><h5> Stars:</h5> </span></b>
//             <div className="mb-3 star-rating">
                
//                 <input type="radio" name="rating" id="star5" value="5"/><label htmlFor="star5">★</label>
//                 <input type="radio" name="rating" id="star4" value="4"/><label htmlFor="star4">★</label>
//                 <input type="radio" name="rating" id="star3" value="3"/><label htmlFor="star3">★</label>
//                 <input type="radio" name="rating" id="star2" value="2"/><label htmlFor="star2">★</label>
//                 <input type="radio" name="rating" id="star1" value="1"/><label htmlFor="star1">★</label>
               
//             </div>
//             <br/>
//         <button  type="submit" className="btn btn-primary gradient-bg">Submit</button>   
//         </form>

//         <h3 className="mt-4">User Reviews</h3>
//         <div id="reviews">
//         {reviews.map((review, index) => (
//           <div key={index} className="review-card">
//             <strong>{review.name}</strong>
//             <br />
//             {"★".repeat(review.rating)}
//             <br />
//             {review.reviewText}
//           </div>
//         ))}

//         </div>
//         <hr/>
         
//      </div>
     
   
    
//     {/* <!-- HELP SECTION--> */}
//     <main role="main" className="container">
//       <div className="row">
//         <div className="col-md-8 blog-main">
//           <h3 className="pb-4 mb-4 font-italic border-bottom">Getting You Help from:
//           </h3>
//           <ul className="list-unstyled mt-2 hospital">

//             <li >📍 <strong>PHC (IIT Jodhpur)</strong> –
//             <a target="_blank" rel="noopener noreferrer"
//                   onMouseOver={(e) => {
//                     e.target.style.color = "#007bff";
//                     e.target.parentElement.style.transform = "translateY(-5px)";
//                     e.target.parentElement.style.fontWeight = "bold";
//                   }}
//                   onMouseOut={(e) => {
//                     e.target.style.color = "black";
//                     e.target.parentElement.style.transform = "translateY(0px)";
//                     e.target.parentElement.style.fontWeight = "normal";
//                   }}
//                   style={{ textDecoration: "none", color: "black", transition: "color 0.3s ease-in-out" }}
//               href="https://www.google.com/maps?sca_esv=4fe20b8700bc3141&uact=5&gs_lp=Egxnd3Mtd2l6LXNlcnAiCHBoYyBpaXRqMg4QLhiABBjHARiOBRivATICECYyCxAAGIAEGIYDGIoFMgsQABiABBiGAxiKBTIIEAAYgAQYogQyBRAAGO8FMgUQABjvBTIdEC4YgAQYxwEYjgUYrwEYlwUY3AQY3gQY4ATYAQJI-A9QrAVYlg5wAXgAkAEAmAHjAaAB0QqqAQUwLjcuMbgBA8gBAPgBAZgCCaACiQuoAhTCAhQQLhiABBiRAhi0AhiKBRjqAtgBAcICFBAAGIAEGJECGLQCGIoFGOoC2AEBwgIaEC4YgAQYkQIYtAIYxwEYigUY6gIYrwHYAQHCAhQQABiABBjjBBi0AhjpBBjqAtgBAcICEBAAGAMYtAIY6gIYjwHYAQLCAhAQLhgDGLQCGOoCGI8B2AECwgILEC4YgAQYkQIYigXCAg4QABiABBixAxiDARiKBcICCBAAGIAEGLEDwgILEAAYgAQYsQMYgwHCAgUQLhiABMICGhAuGIAEGJECGIoFGJcFGNwEGN4EGOAE2AECwgILEAAYgAQYkQIYigXCAgoQABiABBhDGIoFwgIOEC4YgAQYsQMY0QMYxwHCAgUQABiABMICFBAuGIAEGJECGMcBGIoFGI4FGK8BwgINEAAYgAQYsQMYgwEYCsICDRAAGIAEGEMYyQMYigXCAgsQABiABBiSAxiKBcICIxAuGIAEGJECGMcBGIoFGI4FGK8BGJcFGNwEGN4EGOAE2AECwgIOEAAYgAQYkQIYsQMYigXCAgYQABgWGB6YAwfxBVFJapm7eZVFugYECAEYB7oGBggCEAEYCpIHBTEuNy4xoAevRLIHBTAuNy4xuAeCCw&um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KV-AAHqF60E5McGDd5AvH_5I&daddr=F4J9%2BFR8,+Unnamed+Road,+Jheepasani,+Vinayakpura,+Rajasthan+342027">F4J9+FR8, Unnamed Road, Jheepasani, Vinayakpura, Rajasthan 342027 
//                 </a>
//             </li>

            
//             <li>📍 <strong>AIIMS Jodhpur</strong> – 
//             <a target="_blank" rel="noopener noreferrer"
//               onMouseOver={(e) => {
//                 e.target.style.color = "#007bff";
//                 e.target.parentElement.style.transform = "translateY(-5px)";
//                 e.target.parentElement.style.fontWeight = "bold";
//               }}
//               onMouseOut={(e) => {
//                 e.target.style.color = "black";
//                 e.target.parentElement.style.transform = "translateY(0px)";
//                 e.target.parentElement.style.fontWeight = "normal";
//               }}
//               style={{ textDecoration: "none", color: "black", transition: "color 0.3s ease-in-out" }}
//             href="https://www.google.com/maps?s=web&sca_esv=4fe20b8700bc3141&lqi=ChJhaWltcyBqZGggbG9jYXRpb25I9eep78atgIAIWhEQABABGAAiCWFpaW1zIGpkaJIBE2dvdmVybm1lbnRfaG9zcGl0YWyqAT0QASoJIgVhaWltcygAMh8QASIbvr7gi9gzG-dyigZ9BJXs3Dz-wPt8pYh0VWKVMg0QAiIJYWlpbXMgamRo&vet=12ahUKEwi6m4D5tZ2MAxVGxTgGHQ1qEpkQ1YkKegQIJRAB..i&cs=1&um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KeNFx_9ii0E5MTRkfDnDT4td&daddr=marudar+hi+industrial+area+second+phase,+Basni,+Jodhpur,+Rajasthan+342005">Marudar hi industrial area second phase, Basni, Jodhpur, Rajasthan 342005 </a></li>

//             <li >📍 <strong>MediPulse</strong> –
//                         <a target="_blank" rel="noopener noreferrer"
//               onMouseOver={(e) => {
//                 e.target.style.color = "#007bff";
//                 e.target.parentElement.style.transform = "translateY(-5px)";
//                 e.target.parentElement.style.fontWeight = "bold";
//               }}
//               onMouseOut={(e) => {
//                 e.target.style.color = "black";
//                 e.target.parentElement.style.transform = "translateY(0px)";
//                 e.target.parentElement.style.fontWeight = "normal";
//               }}
//               style={{ textDecoration: "none", color: "black", transition: "color 0.3s ease-in-out" }}
//                href="https://www.google.com/maps?s=web&lqi=ChFqb2RocHVyIGhvc3BpdGFsc0ip1qCYq6qAgAhaHRABGAAYASIRam9kaHB1ciBob3NwaXRhbHMqAggDkgEQZ2VuZXJhbF9ob3NwaXRhbKoBUwoIL20vMGhwbnIQASoNIglob3NwaXRhbHMoADIfEAEiG-3TXt6EU4h8pujoe6W4EXS1NOY6p962ZhXdujIVEAIiEWpvZGhwdXIgaG9zcGl0YWxz&vet=12ahUKEwjt3pPPtJ2MAxV-zDgGHVwYLZEQ1YkKegQIKhAB..i&cs=1&um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KVEz8Szxi0E5Mc2642P9Ekse&daddr=E4,+MIA+,+Basni+II+Phase,Opposite,+AIIMS+Link+Rd,+Jodhpur,+Rajasthan+342005">E4, MIA , Basni II Phase,Opposite, AIIMS Link Rd, Jodhpur, Rajasthan 342005</a>
//               </li>

//             <li >📍 <strong>Goyal Hospital</strong> – 
//             <a target="_blank" rel="noopener noreferrer"
//             onMouseOver={(e) => {
//               e.target.style.color = "#007bff";
//               e.target.parentElement.style.transform = "translateY(-5px)";
//               e.target.parentElement.style.fontWeight = "bold";
//             }}
//             onMouseOut={(e) => {
//               e.target.style.color = "black";
//               e.target.parentElement.style.transform = "translateY(0px)";
//               e.target.parentElement.style.fontWeight = "normal";
//             }}
//             style={{ textDecoration: "none", color: "black", transition: "color 0.3s ease-in-out" }}
//             href="https://www.google.com/maps/dir//961%2F3,+Residency+Rd,+Sardarpura,+Jodhpur,+Rajasthan+342001/@26.2723621,72.9257105,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x39418c3a67373709:0xd98f730ae41514ee!2m2!1d73.008112!2d26.2723856?entry=ttu&g_ep=EgoyMDI1MDMxOS4yIKXMDSoASAFQAw%3D%3D">961/3, Residency Rd, Sardarpura, Jodhpur, Rajasthan 342001 </a></li>
           
//           </ul>
           
    
    
    
//         </div>
//         {/* <!-- /.blog-main --> */}
    
//         <aside className="col-md-4 blog-sidebar">
//           <div className="p-4 mb-3 bg-light rounded gradient-bg">
//             <h4 className="font-italic text-black">About</h4>
//             <p className="mb-0">MediHelp is your all-in-one medical companion, making healthcare access seamless and convenient.  
//               Schedule doctor appointments, request prescriptions, and manage your health effortlessly with Google Calendar integration.  
//               In emergencies, send out SOS requests instantly. Stay connected with the right medical help—anytime, anywhere.</p>
//           </div>
    
    
//         </aside>
//         {/* <!-- /.blog-sidebar --> */}
    
//       </div> 
//       {/* <!-- /.row --> */}
    
//     </main>
//     {/* <!-- /.container --> */}


//     {/* <!-- FontAwesome for Icons --> */}

//     <section id="footer" className="blog-footer">
//         <div className="container">
//           <footer className="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top"> 
//             <span className="mb-3 mb-md-0 text-body-secondary">© 2025, MediHelp</span>
//             <ul className="nav col-md-4 justify-content-end list-unstyled d-flex">
//               <li className="ms-3"><a className="text-body-secondary" href="mailto:b23cs1059@iitj.ac.in"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-google" viewBox="0 0 16 16">
//                 <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z"></path>
//               </svg></a></li>
//               <li className="ms-3"><a className="text-body-secondary" target="_blank" rel="noopener noreferrer" href="https://github.com/BhargavShekokar3425/medihelppvt"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-github" viewBox="0 0 16 16">
//                 <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"></path>
//               </svg></a></li>

//               <li className="ms-3">
//                 <a className="text-body-secondary" target="_blank" rel="noopener noreferrer" href="https://docs.google.com/document/d/1kaEMZjOea6FUKPANczPBNMTDgAuQ4OVyQXSo27-YeuU/edit?usp=sharing">
//                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-file-earmark-text" viewBox="0 0 16 16">
//                         <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h6.5L14 4.5zM9.5 1.5V5h3l-3-3.5zM3 6h10v1H3V6zm0 2h10v1H3V8zm0 2h7v1H3v-1z"></path>
//                     </svg>
//                 </a>
//             </li>
//             </ul>
//           </footer>
//         </div>
//       </section>
// </div>
  // );
