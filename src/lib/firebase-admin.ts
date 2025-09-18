import * as admin from 'firebase-admin';

// This is a global variable that will hold the initialized Firebase Admin app.
// It's a pattern to ensure we only initialize the app once per server instance.
let app: admin.app.App;

/**
 * Initializes the Firebase Admin SDK.
 * It checks if the app is already initialized to prevent re-initialization on hot reloads in development.
 * It reads the service account credentials from a single environment variable, FIREBASE_SERVICE_ACCOUNT.
 */
function initializeAdminApp() {
  // If the app is already initialized, do nothing.
  if (admin.apps.length > 0) {
    app = admin.apps[0]!;
    return;
  }

  // Retrieve the service account key from environment variables.
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  // If the key is not found, log a clear warning and stop.
  if (!serviceAccountString) {
    console.warn(
      'FIREBASE_SERVICE_ACCOUNT environment variable is not set. Firebase Admin SDK will not be initialized.'
    );
    return;
  }

  try {
    // Parse the JSON string into an object.
    const serviceAccount = JSON.parse(serviceAccountString);

    // Initialize the Firebase Admin app with the provided credentials.
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id, // Explicitly set the project ID from the service account.
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    // If parsing or initialization fails, log a detailed error.
    console.error('Error initializing Firebase Admin SDK:', error.message);
  }
}

// Call the initialization function when this module is first loaded.
initializeAdminApp();

// Export the Firestore database instance.
// If initialization failed, adminDb will be null, which we can check for in our API routes.
const adminDb = app ? admin.firestore() : null;

export { adminDb };
