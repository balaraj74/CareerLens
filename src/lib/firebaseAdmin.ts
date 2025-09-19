import * as admin from "firebase-admin";

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

// Initialize Firebase Admin SDK only if it hasn't been initialized yet
if (!admin.apps.length) {
  // Use the service account credentials if available, otherwise rely on application default credentials.
  // The error indicates application default credentials are not working in this environment.
  // Explicitly using the service account key is more reliable.
  if (serviceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      console.error("Firebase Admin initialization error:", error);
    }
  } else {
    // This path is likely what is failing in the cloud environment.
    // We log an error if the service account is missing.
    console.error("FIREBASE_SERVICE_ACCOUNT environment variable not set.");
    // Attempt to initialize without credentials for local emulator environments, for example.
    try {
        admin.initializeApp();
    } catch(e) {
        console.error("Fallback Firebase Admin initialization failed:", e);
    }
  }
}

export const adminDb = admin.firestore();
