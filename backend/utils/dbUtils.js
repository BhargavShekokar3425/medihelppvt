const fs = require('fs');
const path = require('path');

// Define the data directory
const DATA_DIR = path.join(__dirname, '..', 'data', 'db');

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`Created data directory: ${DATA_DIR}`);
}

// Save collection to disk
const saveCollection = (collectionName, data) => {
  try {
    const filePath = path.join(DATA_DIR, `${collectionName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`[DB] Saved ${collectionName} collection to disk`);
    return true;
  } catch (error) {
    console.error(`[DB] Error saving ${collectionName} collection:`, error);
    return false;
  }
};

// Load collection from disk
const loadCollection = (collectionName, defaultData = []) => {
  try {
    const filePath = path.join(DATA_DIR, `${collectionName}.json`);
    
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath, 'utf8');
      const parsedData = JSON.parse(rawData);
      console.log(`[DB] Loaded ${collectionName} collection from disk`);
      return parsedData;
    } else {
      console.log(`[DB] Collection file not found for ${collectionName}, using default data`);
      // Save default data if file doesn't exist
      saveCollection(collectionName, defaultData);
      return defaultData;
    }
  } catch (error) {
    console.error(`[DB] Error loading ${collectionName} collection:`, error);
    return defaultData;
  }
};

module.exports = {
  saveCollection,
  loadCollection,
  DATA_DIR
};
