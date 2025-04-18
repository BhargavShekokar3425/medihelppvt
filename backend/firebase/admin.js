const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Replace with your Firebase service account key

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://medihelppvt.firebaseio.com"
});

const db = admin.firestore();

module.exports = { admin, db };
