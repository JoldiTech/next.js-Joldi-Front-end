import * as admin from 'firebase-admin';

function getAdminApp() {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0580932337';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!clientEmail || !privateKey) {
      console.warn('Firebase Admin credentials missing. Server-side Firebase operations will fail.');
      // Return null or a dummy app if needed, but for now we'll just let it fail at runtime if used.
      // During build, we want to avoid crashing.
      return null;
    }

    try {
      return admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        databaseURL: `https://${projectId}.firebaseio.com`,
      });
    } catch (error) {
      console.error('Firebase admin initialization error', error);
      return null;
    }
  }
  return admin.apps[0];
}

export const getAdminDb = () => {
  const app = getAdminApp();
  if (!app) throw new Error('Firebase Admin not initialized');
  return admin.firestore(app);
};

export const getAdminAuth = () => {
  const app = getAdminApp();
  if (!app) throw new Error('Firebase Admin not initialized');
  return admin.auth(app);
};

export const getAdminStorage = () => {
  const app = getAdminApp();
  if (!app) throw new Error('Firebase Admin not initialized');
  return admin.storage(app);
};
