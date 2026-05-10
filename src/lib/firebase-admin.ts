import * as admin from 'firebase-admin';

let _adminDb: admin.firestore.Firestore | null = null;

function getAdminApp(): admin.app.App {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: 'careerlens-1',
    });
  }
  return admin.app();
}

/** Lazily initialized Firestore Admin instance */
export const adminDb: admin.firestore.Firestore = new Proxy(
  {} as admin.firestore.Firestore,
  {
    get(_target, prop, receiver) {
      if (!_adminDb) _adminDb = getAdminApp().firestore();
      return Reflect.get(_adminDb, prop, receiver);
    },
  }
);
