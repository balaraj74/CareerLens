'use client';

import React, { createContext, useEffect, useState } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, type Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration is now sourced from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
}

export const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  auth: null,
  db: null,
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [firebase, setFirebase] = useState<FirebaseContextType>({ app: null, auth: null, db: null });

  useEffect(() => {
    // Basic validation to ensure Firebase can be initialized
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
      let app: FirebaseApp;
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApp();
      }

      const auth = getAuth(app);
      const db = getFirestore(app);

      // Enable offline persistence
      enableIndexedDbPersistence(db)
        .catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn("Firestore persistence failed: Multiple tabs open.");
          } else if (err.code === 'unimplemented') {
            console.error("Firestore persistence is not available in this browser.");
          }
        });
        
      setFirebase({ app, auth, db });
    } else {
      console.error("Firebase configuration variables are missing. Please check your .env file.");
    }
  }, []);

  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
}
