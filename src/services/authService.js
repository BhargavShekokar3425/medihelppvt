import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../firebase/config";

export const authService = {
  // Register a new user
  register: async (email, password, userType, userData) => {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Add profile data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        email,
        userType,
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Update profile display name
      await updateProfile(user, {
        displayName: userData.name || email.split('@')[0]
      });
      
      return user;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },
  
  // Log in an existing user
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      
      return { user, userData };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  
  // Log out the current user
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },
  
  // Reset password
  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  },
  
  // Get current user
  getCurrentUser: () => {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        
        if (user) {
          // Get additional user data from Firestore
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              resolve({ ...user, ...userDoc.data() });
            } else {
              resolve(user);
            }
          } catch (error) {
            console.error("Error getting user data:", error);
            resolve(user);
          }
        } else {
          resolve(null);
        }
      }, reject);
    });
  },
  
  // Update user profile
  updateUserProfile: async (userId, data) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        ...data,
        updatedAt: new Date().toISOString()
      });
      
      // Update display name if provided
      if (data.name && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: data.name
        });
      }
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  },
  
  // Upload profile picture
  uploadProfilePicture: async (userId, file) => {
    try {
      const storageRef = ref(storage, `profiles/${userId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update user profile with new photo URL
      await updateDoc(doc(db, "users", userId), {
        photoURL: downloadURL,
        updatedAt: new Date().toISOString()
      });
      
      // Update auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          photoURL: downloadURL
        });
      }
      
      return downloadURL;
    } catch (error) {
      console.error("Profile picture upload error:", error);
      throw error;
    }
  }
};

export default authService;
