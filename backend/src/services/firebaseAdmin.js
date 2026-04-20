const admin = require("firebase-admin");
require("dotenv").config();

let serviceAccount;
try {
  // If the key is provided as a stringified JSON in the environment
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } else {
    // Fallback if the user has a local file (for development)
    serviceAccount = require("../../serviceAccountKey.json");
  }
} catch (error) {
  console.warn("Firebase Service Account Key not found or invalid. Make sure to provide it via environment variables or serviceAccountKey.json.");
}

if (serviceAccount || process.env.FIREBASE_DATABASE_URL) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth, admin };
