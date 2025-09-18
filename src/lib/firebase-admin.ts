
import * as admin from 'firebase-admin';
import { config } from 'dotenv';

// Force load environment variables from .env file
config();

let app: admin.app.App;

/**
 * Initializes the Firebase Admin SDK.
 * This function is designed to be a robust singleton, ensuring the SDK is initialized only once.
 * It provides detailed error logging if initialization fails for any reason.
 */
function initializeAdminApp() {
  // If the app is already initialized, return the existing app.
  if (admin.apps.length > 0 && admin.apps[0]) {
    app = admin.apps[0];
    return;
  }

  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (!serviceAccountString) {
    console.error(
      'CRITICAL: FIREBASE_SERVICE_ACCOUNT environment variable is not set. Firebase Admin SDK will not be initialized.'
    );
    return;
  }

  try {
    // It's crucial that the environment variable is a single-line JSON string.
    const serviceAccount = JSON.parse(serviceAccountString);

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('CRITICAL: Error initializing Firebase Admin SDK. This is likely due to a malformed FIREBASE_SERVICE_ACCOUNT JSON in your .env file.');
    console.error('Detailed Error:', error.message);
  }
}

// Initialize the app when this module is first loaded.
initializeAdminApp();

// Export the Firestore database instance.
// If initialization failed, adminDb will be undefined, and our API routes will handle this defensively.
const adminDb = app ? admin.firestore() : undefined;

export { adminDb };
