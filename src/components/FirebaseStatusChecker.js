import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

const FirebaseStatusChecker = () => {
  const [authStatus, setAuthStatus] = useState({ isChecking: true });
  const [firestoreStatus, setFirestoreStatus] = useState({ isChecking: true });
  
  useEffect(() => {
    const checkFirebase = async () => {
      // Check Firebase Authentication
      const authResult = await authService.checkFirebaseAuth();
      setAuthStatus({ ...authResult, isChecking: false });
      
      // Check Firebase Firestore
      const firestoreResult = await authService.checkFirestore();
      setFirestoreStatus({ ...firestoreResult, isChecking: false });
    };
    
    checkFirebase();
  }, []);
  
  return (
    <div className="firebase-status-checker p-4 mb-4 bg-light border rounded">
      <h3>Firebase Connection Status</h3>
      
      <div className="mt-3">
        <h5>Authentication</h5>
        {authStatus.isChecking ? (
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Checking...</span>
          </div>
        ) : (
          <div className={`alert ${authStatus.isWorking ? 'alert-success' : 'alert-danger'} py-2`}>
            {authStatus.message}
            {authStatus.error && <div className="mt-2 small">{authStatus.error}</div>}
          </div>
        )}
      </div>
      
      <div className="mt-3">
        <h5>Firestore Database</h5>
        {firestoreStatus.isChecking ? (
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Checking...</span>
          </div>
        ) : (
          <div className={`alert ${firestoreStatus.isWorking ? 'alert-success' : 'alert-danger'} py-2`}>
            {firestoreStatus.message}
            {firestoreStatus.error && <div className="mt-2 small">{firestoreStatus.error}</div>}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>
          Re-check Firebase Status
        </button>
      </div>
    </div>
  );
};

export default FirebaseStatusChecker;
