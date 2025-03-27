const admin = require("firebase-admin");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config(); // Load environment variables

const serviceAccount = require(path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

console.log("🔥 Firebase Connected Successfully!");
