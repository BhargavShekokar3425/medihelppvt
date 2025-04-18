import { auth } from "./config";
import { setupDatabase, initializeUserData } from "../utils/dbSetup";
import { onAuthStateChanged } from "firebase/auth";

export const initializeFirebase = () => {
  // Set up authentication listener
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log("User is signed in:", user.uid);
      
      // Initialize user data if needed
      await initializeUserData(user.uid, {
        email: user.email,
        name: user.displayName || user.email?.split('@')[0] || "User",
        photoURL: user.photoURL
      });
    } else {
      console.log("User is signed out");
    }
  });
  
  // Ensure database structure
  setupDatabase().then(success => {
    if (success) {
      console.log("Firebase initialized successfully");
    } else {
      console.error("Firebase initialization had issues");
    }
  });
};

export default initializeFirebase;
