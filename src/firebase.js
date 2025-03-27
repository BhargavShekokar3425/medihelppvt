require("dotenv").config();  // Load environment variables
const admin = require("firebase-admin");

// Parse the JSON string stored in the environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
module.exports = db;
