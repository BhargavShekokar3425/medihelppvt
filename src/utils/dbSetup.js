import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

// Function to ensure basic database structure is set up
export const setupDatabase = async () => {
  try {
    // Check if the users collection exists and has a default admin
    const adminRef = doc(db, "users", "admin");
    const adminDoc = await getDoc(adminRef);
    
    if (!adminDoc.exists()) {
      // Create admin user if it doesn't exist
      await setDoc(adminRef, {
        name: "System Administrator",
        email: "admin@medihelp.com",
        userType: "admin",
        createdAt: new Date().toISOString(),
        isActive: true
      });
      console.log("Created admin user");
    }
    
    console.log("Database setup complete");
    return true;
  } catch (error) {
    console.error("Database setup error:", error);
    return false;
  }
};

// Initialize any necessary fields on a user document
export const initializeUserData = async (userId, userData) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // User exists, check if they have the necessary fields
      const existingData = userDoc.data();
      
      // Fields that should be initialized if they don't exist
      const fieldsToInitialize = {
        conversations: existingData.conversations || [],
        online: existingData.online || false,
        lastSeen: existingData.lastSeen || new Date().toISOString(),
        unreadMessages: existingData.unreadMessages || 0,
        ...userData
      };
      
      // Update the user document
      await setDoc(userRef, fieldsToInitialize, { merge: true });
      console.log("Initialized user data for:", userId);
    }
    
    return true;
  } catch (error) {
    console.error("User initialization error:", error);
    return false;
  }
};

export default { setupDatabase, initializeUserData };
