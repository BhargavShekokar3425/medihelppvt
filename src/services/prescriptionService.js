import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase/config";

export const prescriptionService = {
  // Upload a new prescription
  uploadPrescription: async (patientId, doctorId, prescriptionData, file) => {
    try {
      // Upload file to Firebase Storage
      let fileUrl = null;
      if (file) {
        const storageRef = ref(storage, `prescriptions/${patientId}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(storageRef);
      }
      
      // Create prescription document in Firestore
      const prescriptionDoc = {
        patientId,
        doctorId,
        fileUrl,
        ...prescriptionData,
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, "prescriptions"), prescriptionDoc);
      
      return {
        id: docRef.id,
        ...prescriptionDoc
      };
    } catch (error) {
      console.error("Upload prescription error:", error);
      throw error;
    }
  },
  
  // Get a patient's prescriptions
  getPatientPrescriptions: async (patientId) => {
    try {
      const q = query(
        collection(db, "prescriptions"),
        where("patientId", "==", patientId),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const prescriptions = [];
      
      for (const prescriptionDoc of querySnapshot.docs) {
        const prescriptionData = prescriptionDoc.data();
        
        // Get doctor information
        const doctorDoc = await getDoc(doc(db, "users", prescriptionData.doctorId));
        
        prescriptions.push({
          id: prescriptionDoc.id,
          ...prescriptionData,
          doctor: doctorDoc.exists() ? {
            id: doctorDoc.id,
            name: doctorDoc.data().name,
            specialization: doctorDoc.data().specialization
          } : null
        });
      }
      
      return prescriptions;
    } catch (error) {
      console.error("Get patient prescriptions error:", error);
      throw error;
    }
  },
  
  // Get prescriptions created by a doctor
  getDoctorPrescriptions: async (doctorId) => {
    try {
      const q = query(
        collection(db, "prescriptions"),
        where("doctorId", "==", doctorId),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const prescriptions = [];
      
      for (const prescriptionDoc of querySnapshot.docs) {
        const prescriptionData = prescriptionDoc.data();
        
        // Get patient information
        const patientDoc = await getDoc(doc(db, "users", prescriptionData.patientId));
        
        prescriptions.push({
          id: prescriptionDoc.id,
          ...prescriptionData,
          patient: patientDoc.exists() ? {
            id: patientDoc.id,
            name: patientDoc.data().name,
            age: patientDoc.data().age
          } : null
        });
      }
      
      return prescriptions;
    } catch (error) {
      console.error("Get doctor prescriptions error:", error);
      throw error;
    }
  },
  
  // Get a single prescription by ID
  getPrescription: async (prescriptionId) => {
    try {
      const prescriptionDoc = await getDoc(doc(db, "prescriptions", prescriptionId));
      
      if (!prescriptionDoc.exists()) {
        throw new Error("Prescription not found");
      }
      
      const prescriptionData = prescriptionDoc.data();
      
      // Get patient and doctor information
      const patientDoc = await getDoc(doc(db, "users", prescriptionData.patientId));
      const doctorDoc = await getDoc(doc(db, "users", prescriptionData.doctorId));
      
      return {
        id: prescriptionDoc.id,
        ...prescriptionData,
        patient: patientDoc.exists() ? {
          id: patientDoc.id,
          name: patientDoc.data().name,
          age: patientDoc.data().age
        } : null,
        doctor: doctorDoc.exists() ? {
          id: doctorDoc.id,
          name: doctorDoc.data().name,
          specialization: doctorDoc.data().specialization
        } : null
      };
    } catch (error) {
      console.error("Get prescription error:", error);
      throw error;
    }
  },
  
  // Update prescription status
  updatePrescriptionStatus: async (prescriptionId, status) => {
    try {
      await updateDoc(doc(db, "prescriptions", prescriptionId), {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Update prescription status error:", error);
      throw error;
    }
  },
  
  // Delete a prescription
  deletePrescription: async (prescriptionId) => {
    try {
      // Get prescription data
      const prescriptionDoc = await getDoc(doc(db, "prescriptions", prescriptionId));
      
      if (!prescriptionDoc.exists()) {
        throw new Error("Prescription not found");
      }
      
      const prescriptionData = prescriptionDoc.data();
      
      // Delete file from storage if it exists
      if (prescriptionData.fileUrl) {
        const fileRef = ref(storage, prescriptionData.fileUrl);
        await deleteObject(fileRef);
      }
      
      // Delete document from Firestore
      await deleteDoc(doc(db, "prescriptions", prescriptionId));
    } catch (error) {
      console.error("Delete prescription error:", error);
      throw error;
    }
  }
};

export default prescriptionService;
