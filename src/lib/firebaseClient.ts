
// src/lib/firebaseClient.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator, type Firestore } from "firebase/firestore";

// ADD THIS LOG
console.log(`Firebase client module loaded. Hostname: ${typeof window !== 'undefined' ? window.location.hostname : 'SERVER'}`);

// Your web app's Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_public_firebase_app_id,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};


let app: FirebaseApp;
let auth: Auth;
let db: Firestore;


if (getApps().length === 0) {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
  } else {
    throw new Error("Firebase config variables are missing. Check your .env file.");
  }
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);

// Check if we are in a browser environment before enabling features
if (typeof window !== 'undefined') {
  // Enable offline persistence
  enableIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code == 'failed-precondition') {
        console.warn("Firestore persistence failed: Multiple tabs open. Persistence can only be enabled in one tab at a time.");
      } else if (err.code == 'unimplemented') {
        console.error("Firestore persistence is not available in this browser.");
      }
    });

  // Connect to the emulator only in a local development environment
  if (window.location.hostname === "localhost") {
    console.log("NOW DISCONNECTED FROM EMULATOR. Will save to the CLOUD.");
    // connectFirestoreEmulator(db, 'localhost', 8080);
  }
}

export { app, auth, db };
