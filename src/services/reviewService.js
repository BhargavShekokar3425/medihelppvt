import { 
  collection, 
  addDoc, 
  getDocs,
  getDoc,
  doc,
  query,
  where, 
  orderBy,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  limit
} from "firebase/firestore";
import { db } from "../firebase/config";

export const reviewService = {
  // Add a new review
  addReview: async (patientId, doctorId, reviewData) => {
    try {
      const reviewDoc = {
        patientId,
        doctorId,
        ...reviewData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, "reviews"), reviewDoc);
      
      // Update doctor's average rating
      await updateDoctorRating(doctorId);
      
      return {
        id: docRef.id,
        ...reviewDoc
      };
    } catch (error) {
      console.error("Add review error:", error);
      throw error;
    }
  },
  
  // Get reviews for a doctor
  getDoctorReviews: async (doctorId) => {
    try {
      const q = query(
        collection(db, "reviews"),
        where("doctorId", "==", doctorId),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const reviews = [];
      
      for (const reviewDoc of querySnapshot.docs) {
        const reviewData = reviewDoc.data();
        
        // Get patient information
        const patientDoc = await getDoc(doc(db, "users", reviewData.patientId));
        
        reviews.push({
          id: reviewDoc.id,
          ...reviewData,
          patient: patientDoc.exists() ? {
            id: patientDoc.id,
            name: patientDoc.data().name,
            photoURL: patientDoc.data().photoURL
          } : null
        });
      }
      
      return reviews;
    } catch (error) {
      console.error("Get doctor reviews error:", error);
      throw error;
    }
  },
  
  // Get reviews by a patient
  getPatientReviews: async (patientId) => {
    try {
      const q = query(
        collection(db, "reviews"),
        where("patientId", "==", patientId),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const reviews = [];
      
      for (const reviewDoc of querySnapshot.docs) {
        const reviewData = reviewDoc.data();
        
        // Get doctor information
        const doctorDoc = await getDoc(doc(db, "users", reviewData.doctorId));
        
        reviews.push({
          id: reviewDoc.id,
          ...reviewData,
          doctor: doctorDoc.exists() ? {
            id: doctorDoc.id,
            name: doctorDoc.data().name,
            specialization: doctorDoc.data().specialization,
            photoURL: doctorDoc.data().photoURL
          } : null
        });
      }
      
      return reviews;
    } catch (error) {
      console.error("Get patient reviews error:", error);
      throw error;
    }
  },
  
  // Get top rated doctors
  getTopRatedDoctors: async (limit = 10) => {
    try {
      const q = query(
        collection(db, "users"),
        where("userType", "==", "doctor"),
        where("averageRating", ">=", 4),
        orderBy("averageRating", "desc"),
        limit(limit)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Get top rated doctors error:", error);
      throw error;
    }
  },
  
  // Update a review
  updateReview: async (reviewId, reviewData) => {
    try {
      const reviewRef = doc(db, "reviews", reviewId);
      const reviewDoc = await getDoc(reviewRef);
      
      if (!reviewDoc.exists()) {
        throw new Error("Review not found");
      }
      
      await updateDoc(reviewRef, {
        ...reviewData,
        updatedAt: serverTimestamp()
      });
      
      // Update doctor's average rating
      const doctorId = reviewDoc.data().doctorId;
      await updateDoctorRating(doctorId);
      
      return {
        id: reviewId,
        ...reviewDoc.data(),
        ...reviewData
      };
    } catch (error) {
      console.error("Update review error:", error);
      throw error;
    }
  },
  
  // Delete a review
  deleteReview: async (reviewId) => {
    try {
      const reviewRef = doc(db, "reviews", reviewId);
      const reviewDoc = await getDoc(reviewRef);
      
      if (!reviewDoc.exists()) {
        throw new Error("Review not found");
      }
      
      const doctorId = reviewDoc.data().doctorId;
      
      // Delete the review
      await deleteDoc(reviewRef);
      
      // Update doctor's average rating
      await updateDoctorRating(doctorId);
    } catch (error) {
      console.error("Delete review error:", error);
      throw error;
    }
  }
};

// Helper function to update doctor's average rating
async function updateDoctorRating(doctorId) {
  try {
    const q = query(
      collection(db, "reviews"),
      where("doctorId", "==", doctorId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // No reviews, reset rating to 0
      await updateDoc(doc(db, "users", doctorId), {
        averageRating: 0,
        totalReviews: 0
      });
      return;
    }
    
    // Calculate new average
    let totalRating = 0;
    querySnapshot.docs.forEach(doc => {
      totalRating += doc.data().rating;
    });
    
    const averageRating = totalRating / querySnapshot.docs.length;
    
    // Update doctor document
    await updateDoc(doc(db, "users", doctorId), {
      averageRating,
      totalReviews: querySnapshot.docs.length
    });
  } catch (error) {
    console.error("Update doctor rating error:", error);
    throw error;
  }
}

export default reviewService;
