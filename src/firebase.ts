import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

console.log('Initializing Firebase with project:', firebaseConfig.projectId);

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with settings to improve connectivity in restricted environments
let dbInstance;
try {
  // First try to get existing instance
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
} catch (e) {
  console.log('getFirestore failed, trying initializeFirestore', e);
  try {
    dbInstance = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    }, firebaseConfig.firestoreDatabaseId || '(default)');
  } catch (e2) {
    console.error('initializeFirestore also failed', e2);
    // Fallback to getFirestore again just in case it was already initialized
    dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
  }
}

export const db = dbInstance;
export const storage = getStorage(app);
export const auth = getAuth(app);

console.log('Firebase services initialized');
