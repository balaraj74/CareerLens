
// src/lib/firebaseClient.ts
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration from the user
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAZRQLIieXFytt1ztD8uE6TeaqeT4ggBAs",
  authDomain: "careerlens-1.firebaseapp.com",
  projectId: "careerlens-1",
  storageBucket: "careerlens-1.appspot.com",
  messagingSenderId: "202306950137",
  appId: "1:202306950137:web:ed4e91e619dd4cc7dde328",
  measurementId: "G-WEF48JHJF9"
};

// Initialize Firebase for SSR and prevent re-initialization on the client
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics only if it's supported on the client-side
let analytics: any = null;
if (typeof window !== 'undefined') {
    isSupported().then(yes => {
        if (yes) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, auth, db, analytics };
