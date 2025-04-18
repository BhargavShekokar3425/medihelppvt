import { db } from '../firebase/config';
import { doc, collection, addDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

// Add prescription for a user
export const addPrescription = async (userId, prescriptionData) => {
  try {
    const prescriptionRef = collection(db, 'users', userId, 'prescriptions');
    const docRef = await addDoc(prescriptionRef, {
      ...prescriptionData,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding prescription:', error);
    throw error;
  }
};

// Add chat message for a user
export const addChatMessage = async (userId, contactId, messageData) => {
  try {
    const chatRef = doc(db, 'users', userId, 'chats', contactId);
    await updateDoc(chatRef, {
      messages: arrayUnion({
        ...messageData,
        createdAt: serverTimestamp()
      })
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding chat message:', error);
    throw error;
  }
};

import { 
  collection,
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  serverTimestamp,
  limit 
} from "firebase/firestore";
import { db } from "../firebase/config";
import { authService } from "./authService";

// User service for handling user-related operations
const userService = {
  // Get user by ID
  getUserById: async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      
      if (!userDoc.exists()) {
        return null;
      }
      
      return {
        uid: userDoc.id,
        ...userDoc.data()
      };
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  },
  
  // Get users by role (for doctors, pharmacies listing)
  getUsersByRole: async (role, options = {}) => {
    try {
      const { sortBy = "name", sortDirection = "asc", limitCount = 20, filters = {} } = options;
      
      let q = query(
        collection(db, "users"),
        where("userType", "==", role),
        limit(limitCount)
      );
      
      // Apply additional filters
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          q = query(q, where(key, "==", filters[key]));
        }
      });
      
      const querySnapshot = await getDocs(q);
      
      const users = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
      
      // Sort results
      users.sort((a, b) => {
        if (sortDirection === "asc") {
          return a[sortBy] > b[sortBy] ? 1 : -1;
        } else {
          return a[sortBy] < b[sortBy] ? 1 : -1;
        }
      });
      
      return users;
    } catch (error) {
      console.error(`Error getting users by role ${role}:`, error);
      throw error;
    }
  },
  
  // Search for doctors by name or specialization
  searchDoctors: async (searchTerm, limit = 10) => {
    try {
      // This is a simple implementation - for production, consider using Firebase Extensions or Algolia
      const querySnapshot = await getDocs(
        query(
          collection(db, "users"),
          where("userType", "==", "doctor"),
          limit(100) // Fetch more and filter in-memory for simple search
        )
      );
      
      const doctors = querySnapshot.docs
        .map(doc => ({
          uid: doc.id,
          ...doc.data()
        }))
        .filter(doc => 
          doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, limit);
      
      return doctors;
    } catch (error) {
      console.error("Error searching doctors:", error);
      throw error;
    }
  },
  
  // Update emergency contacts for a patient
  updateEmergencyContacts: async (contacts) => {
    try {
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        throw new Error("No authenticated user");
      }
      
      if (currentUser.userType !== "patient") {
        throw new Error("Only patients can update emergency contacts");
      }
      
      await updateDoc(doc(db, "users", currentUser.uid), {
        emergencyContacts: contacts,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error("Error updating emergency contacts:", error);
      throw error;
    }
  },
  
  // Update doctor availability
  updateDoctorAvailability: async (availability) => {
    try {
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        throw new Error("No authenticated user");
      }
      
      if (currentUser.userType !== "doctor") {
        throw new Error("Only doctors can update availability");
      }
      
      await updateDoc(doc(db, "users", currentUser.uid), {
        availability,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error("Error updating doctor availability:", error);
      throw error;
    }
  },
  
  // Update pharmacy inventory
  updatePharmacyInventory: async (inventory) => {
    try {
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        throw new Error("No authenticated user");
      }
      
      if (currentUser.userType !== "pharmacy") {
        throw new Error("Only pharmacies can update inventory");
      }
      
      await updateDoc(doc(db, "users", currentUser.uid), {
        inventory,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error("Error updating pharmacy inventory:", error);
      throw error;
    }
  }
};

export default userService;
