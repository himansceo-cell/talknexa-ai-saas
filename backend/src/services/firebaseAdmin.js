const admin = require("firebase-admin");
require("dotenv").config();

let serviceAccount;
try {
  // If the key is provided as a stringified JSON in the environment
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    let keyStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
    // Handle potential double quotes from some environment setups
    if (keyStr.startsWith('"') && keyStr.endsWith('"')) {
      keyStr = keyStr.substring(1, keyStr.length - 1);
    }
    serviceAccount = JSON.parse(keyStr);
  } else {
    // Fallback if the user has a local file (for development)
    serviceAccount = require("../../serviceAccountKey.json");
  }
} catch (error) {
  console.error("CRITICAL: Firebase Service Account Key Error:", error.message);
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
