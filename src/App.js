import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserProfile from "./pages/UserProfile";
import Appointments from './pages/Appointments';
import AppointmentScheduler from "./components/AppointmentScheduler";
import Reviews from "./pages/Reviews";
import PrescriptionMain from "./pages/Prescription_Hub";
import PrescDoc from "./pages/PresDoctors";
import PrescPatient from "./pages/PresPatients";
import Doctors from "./pages/Doctors";
import SignUp from "./pages/SignUp";
import DocAnswers from "./pages/DocAnswers";
import CommunityForums from "./pages/CommunityForums";
import HomePage from "./pages/HomePage";
import AuthWrapper from "./components/AuthWrapper";

import NavBar from "./components/NavBar"; 
import Header from "./components/Header"; 
import Footer from "./components/Footer"; 

import './App.css';
import { BackendProvider } from './contexts/BackendContext';
import SOS from './pages/SOS';

function App() { 
  return (
    <BackendProvider>
      <div className="container">
        <Header/>
        <NavBar/>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reviews" element={<Reviews />} />
          
          {/* Protected routes */}
          <Route path="/sos" element={
            <AuthWrapper>
              <SOS />
            </AuthWrapper>
          } />
          <Route path="/appointments" element={
            <AuthWrapper>
              <Appointments />
            </AuthWrapper>
          } />
          <Route path="/scheduler" element={
            <AuthWrapper>
              <AppointmentScheduler />
            </AuthWrapper>
          } />
          <Route path="/docanswers" element={
            <AuthWrapper>
              <DocAnswers />
            </AuthWrapper>
          } />
          <Route path="/prescription-hub" element={
            <AuthWrapper>
              <PrescriptionMain />
            </AuthWrapper>
          } />
          <Route path="/pres-doctor" element={
            <AuthWrapper requiredRole="doctor">
              <PrescDoc />
            </AuthWrapper>
          } />
          <Route path="/pres-patient" element={
            <AuthWrapper>
              <PrescPatient />
            </AuthWrapper>
          } />
          <Route path="/community-forum" element={
            <AuthWrapper>
              <CommunityForums />
            </AuthWrapper>
          } />
          <Route path="/profile" element={
            <AuthWrapper>
              <UserProfile />
            </AuthWrapper>
          } />
          
          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer/>
      </div>
    </BackendProvider>
  );
}

export default App;



