
import 'dotenv/config'; // Make sure environment variables are loaded
import * as admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore | undefined;

/**
 * Initializes the Firebase Admin SDK as a singleton.
 * This ensures the SDK is initialized only once across the application.
 */
function initializeAdminApp() {
  if (admin.apps.length > 0) {
    // If already initialized, use the existing app instance
    if (admin.apps[0]) {
      adminDb = admin.apps[0].firestore();
    }
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
    const serviceAccount = JSON.parse(serviceAccountString);

    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    adminDb = app.firestore();
    console.log('Firebase Admin SDK initialized successfully.');

  } catch (error: any) {
    console.error(
      'CRITICAL: Error initializing Firebase Admin SDK. This is likely due to a malformed or missing FIREBASE_SERVICE_ACCOUNT JSON in your .env file.'
    );
    console.error('Detailed Error:', error.message);
  }
}

// Initialize the app when this module is first loaded.
initializeAdminApp();

// Export the initialized firestore instance. It will be undefined if initialization failed.
export { adminDb };
