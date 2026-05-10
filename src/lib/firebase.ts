/**
 * Firebase initialization for server-side and client-side use.
 *
 * IMPORTANT: Initialization is lazy to prevent build-time crashes
 * in CI environments (GitHub Actions) where Firebase env vars
 * are not configured.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    if (getApps().length > 0) {
      _app = getApp();
    } else {
      _app = initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      });
    }
  }
  return _app;
}

/** Lazily initialized Firestore instance */
export const db: Firestore = new Proxy({} as Firestore, {
  get(_target, prop, receiver) {
    if (!_db) _db = getFirestore(getFirebaseApp());
    return Reflect.get(_db, prop, receiver);
  },
});

/** Lazily initialized Auth instance */
export const auth: Auth = new Proxy({} as Auth, {
  get(_target, prop, receiver) {
    if (!_auth) _auth = getAuth(getFirebaseApp());
    return Reflect.get(_auth, prop, receiver);
  },
});

/** Lazily initialized Firebase app */
export const app: FirebaseApp = new Proxy({} as FirebaseApp, {
  get(_target, prop, receiver) {
    return Reflect.get(getFirebaseApp(), prop, receiver);
  },
});
