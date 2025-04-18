import { auth, db } from '../firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Store the current user data in memory
let currentUserData = null;
const observers = [];

// Notify observers when auth state changes
const notifyObservers = (user) => {
  observers.forEach(callback => callback(user));
};

// Initialize the auth listener
const initAuthListener = () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          currentUserData = {
            uid: user.uid,
            email: user.email,
            ...userDoc.data()
          };
        } else {
          currentUserData = {
            uid: user.uid,
            email: user.email
          };
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        currentUserData = {
          uid: user.uid,
          email: user.email
        };
      }
    } else {
      currentUserData = null;
    }
    
    notifyObservers(currentUserData);
  });
};

// Initialize auth listener
initAuthListener();

const authService = {
  // Login with email and password
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Log successful login
        console.log(`User logged in: ${email} (${userData.userType})`);
        
        // Store last login timestamp
        await setDoc(doc(db, 'users', user.uid), 
          { lastLogin: new Date().toISOString() }, 
          { merge: true }
        );
        
        return { ...userData, uid: user.uid };
      }
      
      return { uid: user.uid, email: user.email };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Register a new user
  register: async (email, password, userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Add user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return { uid: user.uid, email, ...userData };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Logout current user
  logout: async () => {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  // Get current authenticated user
  getCurrentUser: () => {
    return currentUserData;
  },
  
  // Subscribe to auth state changes
  subscribe: (callback) => {
    observers.push(callback);
    callback(currentUserData);
    
    // Return unsubscribe function
    return () => {
      const index = observers.indexOf(callback);
      if (index > -1) {
        observers.splice(index, 1);
      }
    };
  }
};

export default authService;
