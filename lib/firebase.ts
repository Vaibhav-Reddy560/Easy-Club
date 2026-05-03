import { initializeApp, getApps, getApp } from "firebase/app";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut,
    setPersistence,
    browserLocalPersistence
} from "firebase/auth";
import { getFirestore, Firestore, Timestamp } from "firebase/firestore";

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

// Enable local persistence so user stays logged in across refreshes
if (auth) {
  setPersistence(auth, browserLocalPersistence).catch(console.error);
}

// Initialize Firestore with IRON-CLAD Persistent Local Cache
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const db = app ? initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
}) : null;



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

// Add a safe export for the connection status and recovery
export const isOnline = async () => {
    try {
        const response = await fetch("https://www.google.com/favicon.ico", { mode: "no-cors", cache: "no-store" });
        return true;
    } catch {
        return false;
    }
};

/**
 * Emergency recovery for auth/internal-error
 * Clears local storage and reloads if the auth state is corrupted
 */
export const resetAuth = async () => {
    try {
        await auth.signOut();
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.location.reload();
    } catch (e) {
        console.error("Auth reset failed:", e);
    }
};

export { app, auth, Timestamp };
export const firestore = db as Firestore;
export const db_safe = db;
export { firestore as db };


