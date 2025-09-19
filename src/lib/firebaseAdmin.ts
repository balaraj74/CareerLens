
import * as admin from "firebase-admin";

// Construct the service account object from individual environment variables.
// This is a more robust method than parsing a JSON string, especially in cloud environments.
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // The private key must have its newline characters correctly escaped.
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin SDK only if it hasn't been initialized yet.
// This prevents re-initialization errors in hot-reloading environments.
if (!admin.apps.length) {
  // Check if all necessary environment variables are present.
  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
      console.log("Firebase Admin SDK initialized successfully.");
    } catch (error) {
      console.error("Firebase Admin initialization error from service account object:", error);
    }
  } else {
      console.error("Firebase Admin initialization failed: One or more required environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are missing.");
  }
}

export const adminDb = admin.firestore();
