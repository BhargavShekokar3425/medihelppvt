import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase/config";
import { authService } from "./authService";

// Appointment statuses
const APPOINTMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELED: "canceled",
  COMPLETED: "completed",
  MISSED: "missed"
};

const appointmentService = {
  // Create a new appointment request
  createAppointment: async (doctorId, dateTime, reason) => {
    try {
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        throw new Error("No authenticated user");
      }
      
      if (currentUser.userType !== "patient") {
        throw new Error("Only patients can request appointments");
      }
      
      // Get doctor info to include in appointment
      const doctorDoc = await getDoc(doc(db, "users", doctorId));
      
      if (!doctorDoc.exists()) {
        throw new Error("Doctor not found");
      }
      
      const doctorData = doctorDoc.data();
      
      const appointmentData = {
        patientId: currentUser.uid,
        patientName: currentUser.name,
        patientEmail: currentUser.email,
        doctorId,
        doctorName: doctorData.name,
        doctorSpecialization: doctorData.specialization || "",
        dateTime,
        reason,
        status: APPOINTMENT_STATUS.PENDING,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const appointmentRef = await addDoc(collection(db, "appointments"), appointmentData);
      
      return {
        id: appointmentRef.id,
        ...appointmentData
      };
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },
  
  // Get appointments for current user (patient or doctor)
  getAppointments: async (status = null) => {
    try {
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        throw new Error("No authenticated user");
      }
      
      // Determine which field to query based on user type
      const fieldName = currentUser.userType === "doctor" ? "doctorId" : "patientId";
      
      // Build query
      let q = query(
        collection(db, "appointments"),
        where(fieldName, "==", currentUser.uid)
      );
      
      // Add status filter if provided
      if (status) {
        q = query(q, where("status", "==", status));
      }
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting appointments:", error);
      throw error;
    }
  },
  
  // Update appointment status (confirm, cancel, complete)
  updateAppointmentStatus: async (appointmentId, status) => {
    try {
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        throw new Error("No authenticated user");
      }
      
      // Verify appointment exists and current user has permission
      const appointmentRef = doc(db, "appointments", appointmentId);
      const appointmentDoc = await getDoc(appointmentRef);
      
      if (!appointmentDoc.exists()) {
        throw new Error("Appointment not found");
      }
      
      const appointmentData = appointmentDoc.data();
      
      // Check permission based on user role
      if (currentUser.userType === "doctor" && appointmentData.doctorId !== currentUser.uid) {
        throw new Error("You don't have permission to update this appointment");
      } else if (currentUser.userType === "patient" && appointmentData.patientId !== currentUser.uid) {
        throw new Error("You don't have permission to update this appointment");
      }
      
      // Check allowed status transitions
      if (currentUser.userType === "doctor") {
        // Doctors can confirm, cancel, complete, or mark as missed
        if (![APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.CANCELED, 
               APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.MISSED].includes(status)) {
          throw new Error("Invalid status update for doctor");
        }
      } else {
        // Patients can only cancel their appointments
        if (status !== APPOINTMENT_STATUS.CANCELED) {
          throw new Error("Patients can only cancel appointments");
        }
      }
      
      // Update appointment
      await updateDoc(appointmentRef, {
        status,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid
      });
      
      return true;
    } catch (error) {
      console.error("Error updating appointment status:", error);
      throw error;
    }
  },
  
  // Get appointment details
  getAppointmentById: async (appointmentId) => {
    try {
      const appointmentDoc = await getDoc(doc(db, "appointments", appointmentId));
      
      if (!appointmentDoc.exists()) {
        return null;
      }
      
      return {
        id: appointmentDoc.id,
        ...appointmentDoc.data()
      };
    } catch (error) {
      console.error("Error getting appointment:", error);
      throw error;
    }
  }
};

export { appointmentService, APPOINTMENT_STATUS };
export default appointmentService;
