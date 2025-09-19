
// src/lib/firebaseClient.ts
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAZRQLIieXFytt1ztD8uE6TeaqeT4ggBAs",
  authDomain: "careerlens-1.firebaseapp.com",
  projectId: "careerlens-1",
  storageBucket: "careerlens-1.appspot.com",
  messagingSenderId: "202306950137",
  appId: "1:202306950137:web:ed4e91e619dd4cc7dde328",
  measurementId: "G-WEF48JHJF9"
};

// Check for missing environment variables during build or server-side render
if (!firebaseConfig.projectId) {
  console.error("Firebase config is not set. Please check your .env file and ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID is set.");
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
// Use initializeFirestore with long polling to avoid intermittent network issues in some environments
const db = initializeFirestore(app, { experimentalForceLongPolling: true });

// Initialize Analytics only if it's supported on the client
let analytics: any;
if (typeof window !== 'undefined') {
    isSupported().then(yes => {
        if (yes) {
            analytics = getAnalytics(app);
        }
    });
}


export { app, auth, db, analytics };
