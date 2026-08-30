import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_CARS_FIREBASE_API_KEY || 'AIzaSyAWQ20xw0QoVwCSXLa1Mq-cJeiTIebEwnk',
  authDomain: import.meta.env.VITE_CARS_FIREBASE_AUTH_DOMAIN || 'maurione-cars.firebaseapp.com',
  projectId: import.meta.env.VITE_CARS_FIREBASE_PROJECT_ID || 'maurione-cars',
  storageBucket: import.meta.env.VITE_CARS_FIREBASE_STORAGE_BUCKET || 'maurione-cars.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_CARS_FIREBASE_MESSAGING_SENDER_ID || '656825164378',
  appId: import.meta.env.VITE_CARS_FIREBASE_APP_ID || '1:656825164378:web:bdf9b24253b6c851d12e63',
};

export const firebaseReady = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId
);

const app = firebaseReady ? (getApps()[0] || initializeApp(firebaseConfig)) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
