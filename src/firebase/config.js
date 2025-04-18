// This file now provides mock services instead of Firebase
import { mockAuth, mockFirestore, mockStorage } from './mockServices';

// Export mock services
export const auth = mockAuth;
export const db = mockFirestore;
export const storage = mockStorage;
export const serverTimestamp = () => new Date();
export const arrayUnion = (element) => [element];
export const usingMockServices = true;

const firebaseConfig = {
  apiKey: "mock-api-key",
  projectId: "mock-project-id",
};

export default firebaseConfig;
