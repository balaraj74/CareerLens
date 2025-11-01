'use client';

import React, { createContext, useEffect, useState, useContext } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, type Auth, type User } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, type Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Debug: Log config to ensure environment variables are loaded
console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? '***' : 'MISSING',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId ? '***' : 'MISSING',
  appId: firebaseConfig.appId ? '***' : 'MISSING',
  measurementId: firebaseConfig.measurementId
});


interface FirebaseContextValue {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  loading: boolean; // Is Firebase initializing?
}

const FirebaseContext = createContext<FirebaseContextValue>({
  app: null,
  auth: null,
  db: null,
  loading: true,
});

interface AuthContextValue {
  user: User | null;
  loading: boolean; // Is the auth state being checked?
  signUp: (email: string, pass: string) => Promise<any>;
  signIn: (email: string, pass: string) => Promise<any>;
  googleSignIn: () => Promise<any>;
  logOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextValue>({
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
  const [firebaseLoading, setFirebaseLoading] = useState(true);

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    try {
      console.log('Initializing Firebase...');
      const _app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      console.log('Firebase app initialized');
      
      const _auth = getAuth(_app);
      console.log('Firebase Auth initialized');
      
      const _db = getFirestore(_app);
      console.log('Firestore initialized');

      // Optional: Enable offline persistence (can cause issues in some browsers)
      enableIndexedDbPersistence(_db).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Firestore persistence failed: Multiple tabs open.');
        } else if (err.code === 'unimplemented') {
          console.warn('Firestore persistence is not available in this browser.');
        } else {
          console.warn('Firestore persistence error:', err);
        }
      });
      
      isSupported().then(supported => {
          if(supported) {
              console.log('Analytics supported, initializing...');
              getAnalytics(_app);
          } else {
              console.log('Analytics not supported in this environment');
          }
      });

      setApp(_app);
      setAuth(_auth);
      setDb(_db);
      setFirebaseLoading(false);
      console.log('Firebase initialization complete');

      const unsubscribe = onAuthStateChanged(_auth, (currentUser) => {
        console.log('Auth state changed:', currentUser ? `User: ${currentUser.uid}` : 'No user');
        setUser(currentUser);
        setAuthLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Firebase initialization error:', error);
      setFirebaseLoading(false);
      setAuthLoading(false);
    }
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

  const firebaseValue = { app, auth, db, loading: firebaseLoading };
  const authValue = { user, loading: authLoading, signUp, signIn, googleSignIn, logOut };

  return (
    <FirebaseContext.Provider value={firebaseValue}>
      <AuthContext.Provider value={authValue}>
        {children}
      </AuthContext.Provider>
    </FirebaseContext.Provider>
  );
}

// Custom hook to use the Firebase context
export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useFirebase must be used within a FirebaseProvider');
    }
    return context;
};

// Custom hook specifically for authentication
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a FirebaseProvider');
    }
    return context;
};
