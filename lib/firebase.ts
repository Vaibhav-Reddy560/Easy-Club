import { initializeApp, getApps, getApp } from "firebase/app";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut 
} from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isConfigured = !!firebaseConfig.apiKey;

// Initialize Firebase only if config is present to avoid build crashes
const app = (getApps().length > 0) 
    ? getApp() 
    : (isConfigured ? initializeApp(firebaseConfig) : null);

const auth = app ? getAuth(app) : null;

// Only enable IndexedDB persistence in the browser environment to avoid SSR crashes
let db: Firestore | null = null;
if (app) {
  if (typeof window !== "undefined") {
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
      });
    } catch (e) {
      console.warn("Failed to set up IndexedDB persistence", e);
      db = getFirestore(app);
    }
  } else {
    // Server-side rendering fallback
    const { getFirestore } = require("firebase/firestore");
    db = getFirestore(app);
  }
}

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    if (!auth) {
        console.error("Firebase Auth is not initialized. Check your environment variables.");
        return;
    }
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Google:", error);
        throw error;
    }
};

export const logout = () => auth && signOut(auth);

export { app, auth, Timestamp };
export const firestore = db as Firestore;
export { firestore as db };
