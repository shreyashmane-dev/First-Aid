import { initializeApp, getApps, getApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';

// Firebase configuration for healthcare-ai-90b80
export const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "AIzaSyBGCDvsqEYkYKRcm9kHcFug9j5DbUE_GrI",
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || "healthcare-ai-90b80.firebaseapp.com",
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "healthcare-ai-90b80",
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || "healthcare-ai-90b80.firebasestorage.app",
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "1079509718949",
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || "1:1079509718949:web:66487f39fd1ff0db477a4c",
  measurementId: (import.meta as any).env?.VITE_FIREBASE_MEASUREMENT_ID || "G-FEM69SHYV5"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | null = null;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);

  if (typeof window !== 'undefined') {
    isSupported().then(supported => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  }
} catch (error) {
  console.warn('Firebase initialization note:', error);
}

export { app, auth, db, analytics };
