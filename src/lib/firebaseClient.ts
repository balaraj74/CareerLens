
// src/lib/firebaseClient.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED, enableIndexedDbPersistence, type Firestore } from "firebase/firestore";

// Your web app's Firebase configuration from the user
const firebaseConfig = {
  apiKey: "AIzaSyAZRQLIieXFytt1ztD8uE6TeaqeT4ggBAs",
  authDomain: "careerlens-1.firebaseapp.com",
  projectId: "careerlens-1",
  storageBucket: "careerlens-1.appspot.com",
  messagingSenderId: "202306950137",
  appId: "1:202306950137:web:ed4e91e619dd4cc7dde328",
  measurementId: "G-WEF48JHJF9"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn("Firestore persistence failed: Multiple tabs open. Persistence can only be enabled in one tab at a time.");
    } else if (err.code == 'unimplemented') {
      console.error("Firestore persistence is not available in this browser.");
    }
  });


auth = getAuth(app);

export { app, auth, db };
