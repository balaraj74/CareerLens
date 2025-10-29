
'use client';

import React, { createContext, useEffect, useState, useContext } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, type Auth, type User } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  user: User | null;
  loading: boolean; // Unified loading state
  signUp: (email: string, pass: string) => Promise<any>;
  signIn: (email: string, pass: string) => Promise<any>;
  googleSignIn: () => Promise<any>;
  logOut: () => Promise<any>;
}

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  auth: null,
  db: null,
  user: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  googleSignIn: async () => {},
  logOut: async () => {},
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [app, setApp] = useState<FirebaseApp | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let _app: FirebaseApp;
    if (!getApps().length) {
      if (firebaseConfig.projectId) {
        _app = initializeApp(firebaseConfig);
      } else {
        console.error("Firebase config is missing Project ID. App cannot be initialized.");
        setFirebaseLoading(false);
        setAuthLoading(false);
        return;
      }
    } else {
      _app = getApp();
    }

    const _auth = getAuth(_app);
    const _db = getFirestore(_app);

    enableIndexedDbPersistence(_db).catch((err) => {
      if (err.code == 'failed-precondition') {
        console.warn('Firestore persistence failed: Multiple tabs open.');
      } else if (err.code == 'unimplemented') {
        console.warn('Firestore persistence is not available in this browser.');
      }
    });

    setApp(_app);
    setAuth(_auth);
    setDb(_db);
    setFirebaseLoading(false); // Firebase services are initialized

    const unsubscribe = onAuthStateChanged(_auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false); // Auth state is resolved
    });

    return () => unsubscribe();
  }, []);

  const signUp = (email: string, pass: string) => {
    if (!auth) throw new Error("Auth service not available");
    return createUserWithEmailAndPassword(auth, email, pass);
  };

  const signIn = (email: string, pass: string) => {
    if (!auth) throw new Error("Auth service not available");
    return signInWithEmailAndPassword(auth, email, pass);
  };
  
  const googleSignIn = async () => {
    if (!auth) throw new Error("Auth service not available");
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  const logOut = () => {
    if (!auth) throw new Error("Auth service not available");
    return signOut(auth);
  };

  const value = {
    app,
    auth,
    db,
    user,
    loading: firebaseLoading || authLoading, // Combined loading state
    signUp,
    signIn,
    googleSignIn,
    logOut
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

// Renamed from useFirebase to useFirebaseContext to avoid confusion
export const useFirebaseContext = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useFirebaseContext must be used within a FirebaseProvider');
    }
    return context;
};

// Kept this hook for backward compatibility in other components.
export const useAuth = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a FirebaseProvider');
    }
    const { user, loading, signUp, signIn, googleSignIn, logOut } = context;
    return { user, loading, signUp, signIn, googleSignIn, logOut };
};

// New hook to provide all firebase services including db.
export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useFirebase must be used within a FirebaseProvider');
    }
    return context;
}
