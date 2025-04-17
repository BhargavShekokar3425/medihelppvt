// Import mock services as a fallback
import { 
  mockAuth, 
  mockFirestore, 
  mockStorage, 
  serverTimestamp as mockServerTimestamp,
  arrayUnion as mockArrayUnion
} from './mockServices';

// Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfJyJ7S88N0AxRVF_h4xdaUJLzwH6MOUY",
  authDomain: "medihelppvt.firebaseapp.com",
  projectId: "medihelppvt",
  storageBucket: "medihelppvt.firebasestorage.app",
  messagingSenderId: "969041510083",
  appId: "1:969041510083:web:ba7010c792f5bf6c086c76",
  measurementId: "G-094H11EX0F"
};

let auth, db, storage, serverTimestamp, arrayUnion;
let usingMockServices = false;

try {
  // Try to import Firebase
  const { initializeApp } = require('firebase/app');
  const { getAuth } = require('firebase/auth');
  const { getFirestore } = require('firebase/firestore');
  const { getStorage } = require('firebase/storage');
  const { serverTimestamp: fbServerTimestamp, arrayUnion: fbArrayUnion } = require('firebase/firestore');

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  serverTimestamp = fbServerTimestamp;
  arrayUnion = fbArrayUnion;
  
  console.log("Using actual Firebase services");
} catch (error) {
  console.warn("Firebase not available, using mock services", error);
  
  // Use mocks instead
  auth = mockAuth;
  db = mockFirestore;
  storage = mockStorage;
  serverTimestamp = mockServerTimestamp;
  arrayUnion = mockArrayUnion;
  usingMockServices = true;
}

export { auth, db, storage, serverTimestamp, arrayUnion, usingMockServices };
