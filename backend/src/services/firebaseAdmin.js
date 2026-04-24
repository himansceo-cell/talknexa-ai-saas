const admin = require("firebase-admin");
require("dotenv").config();

let serviceAccount;
try {
  // If the key is provided as a stringified JSON in the environment
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    let keyStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
    // 1. Remove wrapping quotes if present
    if (keyStr.startsWith('"') && keyStr.endsWith('"')) {
      keyStr = keyStr.substring(1, keyStr.length - 1);
    }
    // 2. Fix potential broken newlines or spaces caused by pasting
    keyStr = keyStr.replace(/[\n\r]/g, ''); // Remove actual newlines
    
    try {
      serviceAccount = JSON.parse(keyStr);
    } catch (parseError) {
      console.error("❌ Initial JSON Parse failed, trying to fix private key formatting...");
      // 3. Last ditch effort: fix escaped newlines if they got double-escaped
      keyStr = keyStr.replace(/\\\\n/g, '\\n');
      serviceAccount = JSON.parse(keyStr);
    }
  } else {
    // Fallback if the user has a local file (for development)
    serviceAccount = require("../../serviceAccountKey.json");
  }
} catch (error) {
  console.error("CRITICAL: Firebase Service Account Key Error:", error.message);
}

if (serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    console.log("✅ Firebase Admin initialized successfully.");
  } catch (err) {
    console.error("❌ Firebase Initialization Failed:", err.message);
  }
} else {
  console.warn("⚠️ Firebase service account not found. Some features will be disabled.");
}

// Export empty/mock objects if initialization fails to prevent crash elsewhere
const db = admin.apps.length > 0 ? admin.firestore() : null;
const auth = admin.apps.length > 0 ? admin.auth() : null;

module.exports = { db, auth, admin };
