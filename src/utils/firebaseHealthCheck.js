import { auth, db, usingMockServices } from '../firebase/config';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Checks if Firebase is properly configured and accessible
 * @returns {Promise<Object>} Status of Firebase connection
 */
export const checkFirebaseHealth = async () => {
  // If we're using mock services, flag this as a configuration issue
  if (usingMockServices) {
    return {
      success: false,
      error: "Using mock Firebase services - connection to real Firebase failed",
      details: "Check your Firebase configuration and network connectivity"
    };
  }
  
  try {
    // Try to write to Firestore as a basic connection test
    const testRef = doc(db, "system", "health_check");
    await setDoc(testRef, {
      timestamp: new Date().toISOString(),
      checkTime: serverTimestamp()
    });
    
    return {
      success: true,
      message: "Firebase connection is healthy"
    };
  } catch (error) {
    console.error("Firebase health check failed:", error);
    
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: getErrorSuggestions(error)
    };
  }
};

/**
 * Provides suggestions based on Firebase error codes
 */
const getErrorSuggestions = (error) => {
  switch (error.code) {
    case 'auth/invalid-api-key':
      return "Your Firebase API key appears to be invalid. Check your config.";
    
    case 'auth/configuration-not-found':
      return "Firebase can't find your project configuration. Verify your Firebase project ID and API key.";
      
    case 'permission-denied':
      return "You don't have permission to access Firestore. Check your Firebase rules.";
      
    case 'unavailable':
      return "Firebase services are unavailable. Check your internet connection.";
      
    default:
      return "Verify your Firebase config and ensure your project is properly set up in the Firebase console.";
  }
};
