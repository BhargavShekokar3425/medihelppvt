import React from "react";

const UserProfile = () => {
  return (
     <div>
      <div className="jumbotron gradient-background p-4 p-md-5 text-white rounded bg-dark" style={{marginBottom: "32px"}} >
            <div className="col px-0 " style={{color:"black"}}>
              <h1 className="display-4 font-italic" >Welcome!!</h1>
            </div>
          </div>
        
     <main role="main" className="container">
     <div className="row">
       <div className="col-md-8 blog-main">
         <h3 className="pb-4 mb-4 font-italic border-bottom">Getting You Help from:
         </h3>
         <ul className="list-unstyled mt-2 hospital">

           <li >📍 <strong>PHC (IIT Jodhpur)</strong> –
           <a target="_blank" rel="noopener noreferrer"
                 onMouseOver={(e) => {
                   e.target.style.color = "#007bff";
                   e.target.parentElement.style.transform = "translateY(-5px)";
                   e.target.parentElement.style.fontWeight = "bold";
                 }}
                 onMouseOut={(e) => {
                   e.target.style.color = "black";
                   e.target.parentElement.style.transform = "translateY(0px)";
                   e.target.parentElement.style.fontWeight = "normal";
                 }}
                 style={{ textDecoration: "none", color: "black", transition: "color 0.3s ease-in-out" }}
             href="https://www.google.com/maps?sca_esv=4fe20b8700bc3141&uact=5&gs_lp=Egxnd3Mtd2l6LXNlcnAiCHBoYyBpaXRqMg4QLhiABBjHARiOBRivATICECYyCxAAGIAEGIYDGIoFMgsQABiABBiGAxiKBTIIEAAYgAQYogQyBRAAGO8FMgUQABjvBTIdEC4YgAQYxwEYjgUYrwEYlwUY3AQY3gQY4ATYAQJI-A9QrAVYlg5wAXgAkAEAmAHjAaAB0QqqAQUwLjcuMbgBA8gBAPgBAZgCCaACiQuoAhTCAhQQLhiABBiRAhi0AhiKBRjqAtgBAcICFBAAGIAEGJECGLQCGIoFGOoC2AEBwgIaEC4YgAQYkQIYtAIYxwEYigUY6gIYrwHYAQHCAhQQABiABBjjBBi0AhjpBBjqAtgBAcICEBAAGAMYtAIY6gIYjwHYAQLCAhAQLhgDGLQCGOoCGI8B2AECwgILEC4YgAQYkQIYigXCAg4QABiABBixAxiDARiKBcICCBAAGIAEGLEDwgILEAAYgAQYsQMYgwHCAgUQLhiABMICGhAuGIAEGJECGIoFGJcFGNwEGN4EGOAE2AECwgILEAAYgAQYkQIYigXCAgoQABiABBhDGIoFwgIOEC4YgAQYsQMY0QMYxwHCAgUQABiABMICFBAuGIAEGJECGMcBGIoFGI4FGK8BwgINEAAYgAQYsQMYgwEYCsICDRAAGIAEGEMYyQMYigXCAgsQABiABBiSAxiKBcICIxAuGIAEGJECGMcBGIoFGI4FGK8BGJcFGNwEGN4EGOAE2AECwgIOEAAYgAQYkQIYsQMYigXCAgYQABgWGB6YAwfxBVFJapm7eZVFugYECAEYB7oGBggCEAEYCpIHBTEuNy4xoAevRLIHBTAuNy4xuAeCCw&um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KV-AAHqF60E5McGDd5AvH_5I&daddr=F4J9%2BFR8,+Unnamed+Road,+Jheepasani,+Vinayakpura,+Rajasthan+342027">F4J9+FR8, Unnamed Road, Jheepasani, Vinayakpura, Rajasthan 342027 
               </a>
           </li>

           
           <li>📍 <strong>AIIMS Jodhpur</strong> – 
           <a target="_blank" rel="noopener noreferrer"
             onMouseOver={(e) => {
               e.target.style.color = "#007bff";
               e.target.parentElement.style.transform = "translateY(-5px)";
               e.target.parentElement.style.fontWeight = "bold";
             }}
             onMouseOut={(e) => {
               e.target.style.color = "black";
               e.target.parentElement.style.transform = "translateY(0px)";
               e.target.parentElement.style.fontWeight = "normal";
             }}
             style={{ textDecoration: "none", color: "black", transition: "color 0.3s ease-in-out" }}
           href="https://www.google.com/maps?s=web&sca_esv=4fe20b8700bc3141&lqi=ChJhaWltcyBqZGggbG9jYXRpb25I9eep78atgIAIWhEQABABGAAiCWFpaW1zIGpkaJIBE2dvdmVybm1lbnRfaG9zcGl0YWyqAT0QASoJIgVhaWltcygAMh8QASIbvr7gi9gzG-dyigZ9BJXs3Dz-wPt8pYh0VWKVMg0QAiIJYWlpbXMgamRo&vet=12ahUKEwi6m4D5tZ2MAxVGxTgGHQ1qEpkQ1YkKegQIJRAB..i&cs=1&um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KeNFx_9ii0E5MTRkfDnDT4td&daddr=marudar+hi+industrial+area+second+phase,+Basni,+Jodhpur,+Rajasthan+342005">Marudar hi industrial area second phase, Basni, Jodhpur, Rajasthan 342005 </a></li>

           <li >📍 <strong>MediPulse</strong> –
                       <a target="_blank" rel="noopener noreferrer"
             onMouseOver={(e) => {
               e.target.style.color = "#007bff";
               e.target.parentElement.style.transform = "translateY(-5px)";
               e.target.parentElement.style.fontWeight = "bold";
             }}
             onMouseOut={(e) => {
               e.target.style.color = "black";
               e.target.parentElement.style.transform = "translateY(0px)";
               e.target.parentElement.style.fontWeight = "normal";
             }}
             style={{ textDecoration: "none", color: "black", transition: "color 0.3s ease-in-out" }}
              href="https://www.google.com/maps?s=web&lqi=ChFqb2RocHVyIGhvc3BpdGFsc0ip1qCYq6qAgAhaHRABGAAYASIRam9kaHB1ciBob3NwaXRhbHMqAggDkgEQZ2VuZXJhbF9ob3NwaXRhbKoBUwoIL20vMGhwbnIQASoNIglob3NwaXRhbHMoADIfEAEiG-3TXt6EU4h8pujoe6W4EXS1NOY6p962ZhXdujIVEAIiEWpvZGhwdXIgaG9zcGl0YWxz&vet=12ahUKEwjt3pPPtJ2MAxV-zDgGHVwYLZEQ1YkKegQIKhAB..i&cs=1&um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KVEz8Szxi0E5Mc2642P9Ekse&daddr=E4,+MIA+,+Basni+II+Phase,Opposite,+AIIMS+Link+Rd,+Jodhpur,+Rajasthan+342005">E4, MIA , Basni II Phase,Opposite, AIIMS Link Rd, Jodhpur, Rajasthan 342005</a>
             </li>

           <li >📍 <strong>Goyal Hospital</strong> – 
           <a target="_blank" rel="noopener noreferrer"
           onMouseOver={(e) => {
             e.target.style.color = "#007bff";
             e.target.parentElement.style.transform = "translateY(-5px)";
             e.target.parentElement.style.fontWeight = "bold";
           }}
           onMouseOut={(e) => {
             e.target.style.color = "black";
             e.target.parentElement.style.transform = "translateY(0px)";
             e.target.parentElement.style.fontWeight = "normal";
           }}
           style={{ textDecoration: "none", color: "black", transition: "color 0.3s ease-in-out" }}
           href="https://www.google.com/maps/dir//961%2F3,+Residency+Rd,+Sardarpura,+Jodhpur,+Rajasthan+342001/@26.2723621,72.9257105,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x39418c3a67373709:0xd98f730ae41514ee!2m2!1d73.008112!2d26.2723856?entry=ttu&g_ep=EgoyMDI1MDMxOS4yIKXMDSoASAFQAw%3D%3D">961/3, Residency Rd, Sardarpura, Jodhpur, Rajasthan 342001 </a></li>
          
         </ul>
          
   
   
   
       </div>
       {/* <!-- /.blog-main --> */}
   
       <aside className="col-md-4 blog-sidebar">
         <div className="p-4 mb-3 bg-light rounded gradient-bg">
           <h4 className="font-italic text-black">About</h4>
           <p className="mb-0">MediHelp is your all-in-one medical companion, making healthcare access seamless and convenient.  
             Schedule doctor appointments, request prescriptions, and manage your health effortlessly with Google Calendar integration.  
             In emergencies, send out SOS requests instantly. Stay connected with the right medical help—anytime, anywhere.</p>
         </div>
   
   
       </aside>
       {/* <!-- /.blog-sidebar --> */}
   
     </div> 
     {/* <!-- /.row --> */}
   
   </main>
   {/* <!-- /.container --> */}

   </div>
  
  );
};

export default UserProfile;


/* ACTUAL CODE ONCE FIREBASE SETUP */
/*
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { auth } from "../firebase/config";

const db = getFirestore();

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.log("No such document!");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  if (!userData) {
    return <div className="container mt-5"><h3>Loading profile...</h3></div>;
  }

  return (
    <div>
     
      <div className="jumbotron gradient-background p-4 p-md-5 text-white rounded bg-dark" style={{ marginBottom: "32px" }}>
        <div className="col px-0" style={{ color: "black" }}>
          <h1 className="display-4 font-italic">Welcome, {userData.username}!</h1>
          <p className="lead my-3">Here's your health profile overview.</p>
        </div>
      </div>

  
      <main role="main" className="container">
        <div className="row">
          
          <div className="col-md-8 blog-main">
            <h3 className="pb-4 mb-4 font-italic border-bottom">Your Information</h3>
            <ul className="list-group list-group-flush">
              <li className="list-group-item"><strong>Email:</strong> {user.email}</li>
              <li className="list-group-item"><strong>Role:</strong> {userData.role}</li>
              <li className="list-group-item"><strong>Username:</strong> {userData.username}</li>
              <li className="list-group-item"><strong>Date of Birth:</strong> {userData.dob}</li>
              <li className="list-group-item"><strong>Address:</strong> {userData.address}</li>
              <li className="list-group-item"><strong>Contact Number:</strong> {userData.contact}</li>
              <li className="list-group-item"><strong>Blood Group:</strong> {userData.bloodGroup}</li>
              <li className="list-group-item"><strong>Gender:</strong> {userData.gender}</li>
              <li className="list-group-item"><strong>Existing Allergies:</strong> {userData.allergies}</li>
            </ul>
          </div>

          
          <aside className="col-md-4 blog-sidebar">
            <div className="p-4 mb-3 bg-light rounded gradient-bg">
              <h4 className="font-italic text-black">About</h4>
              <p className="mb-0">
                MediHelp is your all-in-one medical companion, making healthcare access seamless and convenient. 
                Schedule doctor appointments, request prescriptions, and manage your health effortlessly with Google Calendar integration. 
                In emergencies, send out SOS requests instantly. Stay connected with the right medical help—anytime, anywhere.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;

*/



// import React, { useEffect, useState } from "react";


// import { auth } from "../firebase/config";
// import { onAuthStateChanged } from "firebase/auth";

// const UserProfile = () => {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//     });
//     return () => unsubscribe();
//   }, []);

//   if (!user) return <h3>Loading user data...</h3>;

//   return (
//     <div className="container mt-5">
//       <h2>User Profile</h2>
//       <hr />
//       <p><strong>Email:</strong> {user.email}</p>
//       {/* Add more info if you store it elsewhere */}
//     </div>
//   );
// };

// export default UserProfile;
