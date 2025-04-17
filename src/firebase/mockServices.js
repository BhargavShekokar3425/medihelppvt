// Mock Firebase implementations to use when actual Firebase isn't available

// Mock data store
const mockData = {
  users: {
    'p1': {
      _id: 'p1',
      name: 'Anisha Gupta',
      email: 'anisha@example.com',
      type: 'patient',
      avatar: '/assets/patient1.png',
      age: 28,
      gender: 'Female'
    },
    'd1': {
      _id: 'd1',
      name: 'Dr. Neha Sharma', 
      type: 'doctor',
      avatar: '/assets/doc1.png',
      specialization: 'Cardiologist'
    }
  },
  conversations: {},
  messages: {},
  prescriptions: {},
  reviews: {},
  forums: {
    medical: [],
    pharmacy: []
  },
  threads: {},
  comments: {}
};

// Mock authentication
export const mockAuth = {
  currentUser: { uid: 'p1', email: 'anisha@example.com' },
  onAuthStateChanged: (callback) => {
    setTimeout(() => callback(mockAuth.currentUser), 500);
    return () => {};
  },
  signInWithEmailAndPassword: async () => ({ user: mockAuth.currentUser }),
  createUserWithEmailAndPassword: async () => ({ user: mockAuth.currentUser }),
  signOut: async () => { mockAuth.currentUser = null; }
};

// Mock firestore
export const mockFirestore = {
  collection: (collectionName) => ({
    doc: (docId) => ({
      get: async () => ({
        exists: mockData[collectionName]?.[docId] ? true : false,
        data: () => mockData[collectionName]?.[docId] || {},
        id: docId
      }),
      set: async (data) => {
        if (!mockData[collectionName]) mockData[collectionName] = {};
        mockData[collectionName][docId] = { ...mockData[collectionName][docId], ...data };
      },
      update: async (data) => {
        if (!mockData[collectionName]) mockData[collectionName] = {};
        if (!mockData[collectionName][docId]) mockData[collectionName][docId] = {};
        mockData[collectionName][docId] = { ...mockData[collectionName][docId], ...data };
      }
    }),
    add: async (data) => {
      const id = `doc_${Date.now()}`;
      if (!mockData[collectionName]) mockData[collectionName] = {};
      mockData[collectionName][id] = { id, ...data, createdAt: new Date() };
      return { id };
    },
    where: (field, operator, value) => ({
      get: async () => ({
        docs: Object.entries(mockData[collectionName] || {})
          .filter(([_, doc]) => doc[field] === value)
          .map(([id, doc]) => ({
            id,
            data: () => doc,
            exists: true
          })),
        empty: Object.keys(mockData[collectionName] || {}).length === 0
      })
    })
  })
};

// Mock storage
export const mockStorage = {
  ref: (path) => ({
    put: async (file) => ({ 
      ref: { getDownloadURL: async () => `https://mock-url.com/${path}` }
    }),
    getDownloadURL: async () => `https://mock-url.com/${path}`,
    delete: async () => {}
  })
};

// Mock Firebase functions
export const serverTimestamp = () => new Date();
export const arrayUnion = (element) => [element];
export const arrayRemove = (element) => [];

export default {
  auth: mockAuth,
  firestore: mockFirestore,
  storage: mockStorage,
  serverTimestamp,
  arrayUnion,
  arrayRemove
};
