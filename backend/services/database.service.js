/**
 * Database Service
 * Provides modular functions for interacting with Firebase Firestore
 */

const { db, fieldValue, timestamp } = require('../config/firebase.config');

// Generic database operations
const dbService = {
  // Create a document with optional ID
  addDocument: async (collection, data, docId = null) => {
    try {
      // Add timestamp fields
      const docData = {
        ...data,
        createdAt: timestamp.now(),
        updatedAt: timestamp.now()
      };
      
      let docRef;
      
      // Use provided ID or let Firestore generate one
      if (docId) {
        docRef = db.collection(collection).doc(docId);
        await docRef.set(docData);
      } else {
        docRef = await db.collection(collection).add(docData);
      }
      
      // Return the document with its ID
      return {
        id: docRef.id,
        ...docData
      };
    } catch (error) {
      console.error(`Error adding document to ${collection}:`, error);
      throw error;
    }
  },
  
  // Get a document by ID
  getDocument: async (collection, docId) => {
    try {
      const docRef = db.collection(collection).doc(docId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return null;
      }
      
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error(`Error getting document from ${collection}:`, error);
      throw error;
    }
  },
  
  // Update a document
  updateDocument: async (collection, docId, data) => {
    try {
      const docRef = db.collection(collection).doc(docId);
      
      // Add updated timestamp
      const updateData = {
        ...data,
        updatedAt: timestamp.now()
      };
      
      await docRef.update(updateData);
      
      return {
        id: docId,
        ...updateData
      };
    } catch (error) {
      console.error(`Error updating document in ${collection}:`, error);
      throw error;
    }
  },
  
  // Delete a document
  deleteDocument: async (collection, docId) => {
    try {
      await db.collection(collection).doc(docId).delete();
      return { id: docId, deleted: true };
    } catch (error) {
      console.error(`Error deleting document from ${collection}:`, error);
      throw error;
    }
  },
  
  // Query documents
  queryDocuments: async (collection, queryOptions = {}) => {
    try {
      let query = db.collection(collection);
      
      // Apply filters
      if (queryOptions.filters) {
        queryOptions.filters.forEach(filter => {
          query = query.where(filter.field, filter.operator, filter.value);
        });
      }
      
      // Apply ordering
      if (queryOptions.orderBy) {
        query = query.orderBy(
          queryOptions.orderBy.field, 
          queryOptions.orderBy.direction || 'asc'
        );
      }
      
      // Apply pagination
      if (queryOptions.limit) {
        query = query.limit(queryOptions.limit);
      }
      
      if (queryOptions.startAfter) {
        query = query.startAfter(queryOptions.startAfter);
      }
      
      // Execute query
      const querySnapshot = await query.get();
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error querying documents in ${collection}:`, error);
      throw error;
    }
  },
  
  // Transaction support
  runTransaction: async (transactionFn) => {
    return db.runTransaction(transactionFn);
  },
  
  // Batch operations
  createBatch: () => {
    return db.batch();
  },
  
  // Get a collection reference
  collection: (path) => {
    return db.collection(path);
  },
  
  // Get a document reference
  doc: (path) => {
    return db.doc(path);
  },
  
  // Field values for special operations
  fieldValues: {
    serverTimestamp: fieldValue.serverTimestamp,
    arrayUnion: fieldValue.arrayUnion,
    arrayRemove: fieldValue.arrayRemove,
    increment: fieldValue.increment,
    delete: fieldValue.delete
  }
};

module.exports = dbService;
