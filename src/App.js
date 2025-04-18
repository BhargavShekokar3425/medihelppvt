import React, { useEffect } from "react";
import { initializeApp } from "firebase/app";
import firebaseConfig from "./firebase/config";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserProfile from "./pages/UserProfile";
import Appointments from './pages/Appointments';


import Reviews from "./pages/Reviews";
import PrescriptionMain from "./pages/Prescription_Hub";
import PrescDoc from "./pages/PresDoctors";
import PrescPatient from "./pages/PresPatients";
import Doctors from "./pages/Doctors";
import SignUp from "./pages/SignUp";
import DocAnswers from "./pages/DocAnswers";
// import DocExchange from './pages/DocExchange';
import CommunityForums from "./pages/CommunityForums";

import NavBar from "./components/NavBar"; 
import Header from "./components/Header"; 
import Footer from "./components/Footer"; 

import './App.css';
import { BackendProvider } from './contexts/BackendContext';
import { initializeFirebase } from './firebase/init';

function App() { 
  // Initialize Firebase when the app loads
  useEffect(() => {
    initializeApp(firebaseConfig);
    initializeFirebase();
  }, []);

  return (
    <Router>
      <BackendProvider>
        <div className="container">
          <Header/>
          <NavBar/>
          <Routes>
            <Route path="/" element={<h1>Home Page</h1>} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/sos" element={<h1>SOS Page</h1>} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/docanswers" element={<DocAnswers />} />
            <Route path="/prescription-hub" element={<PrescriptionMain />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/pres-doctor" element={<PrescDoc />} />
            <Route path="/pres-patient" element={<PrescPatient />} />
            {/* <Route path="/doc-exchange" element={<DocExchange />} /> */}
            <Route path="/community-forum" element={<CommunityForums />} />

            {/* existing routes */}
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
          <Footer/>
        </div>
      </BackendProvider>
    </Router>
  );
}

export default App;



