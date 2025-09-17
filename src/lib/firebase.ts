'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  projectId: 'studio-7582576382-59101',
  appId: '1:802761149326:web:5aaa5efffb9deda21f32df',
  storageBucket: 'studio-7582576382-59101.firebasestorage.app',
  apiKey: 'AIzaSyDnnoESnM2oIEd-B43Od4ODfhoaaBJZaiQ',
  authDomain: 'studio-7582576382-59101.firebaseapp.com',
  messagingSenderId: '802761149326',
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

export { app, auth, db, functions };
