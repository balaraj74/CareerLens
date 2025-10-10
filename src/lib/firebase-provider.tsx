'use client';

import React, { createContext, useEffect, useState } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, type Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZRQLIieXFytt1ztD8uE6TeaqeT4ggBAs",
  authDomain: "careerlens-1.firebaseapp.com",
  projectId: "careerlens-1",
  storageBucket: "careerlens-1.appspot.com",
  messagingSenderId: "202306950137",
  appId: "1:202306950137:web:ed4e91e619dd4cc7dde328",
  measurementId: "G-WEF48JHJF9"
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

  }, []);

  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
}
