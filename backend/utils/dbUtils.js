const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Directory for data storage
const dataDir = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Save a collection to a JSON file
exports.saveCollection = (name, data) => {
  try {
    const filePath = path.join(dataDir, `${name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error saving ${name} collection:`, error);
    return false;
  }
};

// Load a collection from a JSON file
exports.loadCollection = (name, defaultData = []) => {
  const filePath = path.join(dataDir, `${name}.json`);
  try {
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileData);
    }
  } catch (error) {
    console.error(`Error loading ${name} collection:`, error);
  }
  return defaultData;
};

// Connect to MongoDB
exports.connectToMongoDB = async (uri) => {
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    return false;
  }
};

// Get database connection
exports.getConnection = () => {
  return mongoose.connection;
};

// Check if MongoDB is connected
exports.isMongoDBConnected = () => {
  return mongoose.connection && mongoose.connection.readyState === 1;
};

// Seed data to the database
exports.seedData = async (model, data) => {
  try {
    const count = await model.estimatedDocumentCount();
    if (count === 0) {
      await model.insertMany(data);
      console.log(`Seeded initial ${model.collection.name} data`);
    }
  } catch (error) {
    console.error(`Error seeding ${model.collection.name} data:`, error);
  }
};

// Create or update document with fallback to in-memory store
exports.createOrUpdate = async (model, query, data, inMemoryStore) => {
  try {
    // If MongoDB is connected, use it
    if (exports.isMongoDBConnected()) {
      const doc = await model.findOneAndUpdate(
        query,
        { $set: data },
        { new: true, upsert: true }
      );
      return doc;
    }
    
    // Fallback to in-memory store if available
    if (inMemoryStore) {
      const collection = inMemoryStore[model.collection.name.toLowerCase()];
      if (collection) {
        const id = query._id || `gen_${Date.now()}`;
        collection[id] = { ...collection[id], ...data, _id: id };
        return collection[id];
      }
    }
    
    throw new Error('No storage mechanism available');
  } catch (error) {
    console.error('Create/update error:', error);
    throw error;
  }
};
