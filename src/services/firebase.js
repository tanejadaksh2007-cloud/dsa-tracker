import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCFdSNAZP1rWhmBmXuYEXXjUTU8V9bx514',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'algoforge-12831.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'algoforge-12831',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'algoforge-12831.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '691184768539',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:691184768539:web:cc71cf1ad253b59cf8cabe',
};

// Check if critical Firebase config keys are supplied
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'your_api_key_here' &&
  firebaseConfig.projectId &&
  firebaseConfig.authDomain
);

let app = null;
let auth = null;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

if (isFirebaseConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (error) {
    console.error('[AlgoForge] Error initializing Firebase:', error);
  }
} else {
  console.warn(
    '[AlgoForge] Firebase configuration is incomplete. Please set VITE_FIREBASE_API_KEY in your .env file.'
  );
}

/**
 * Format Firebase Auth error codes into human-friendly messages
 */
export function formatAuthError(error) {
  if (!error) return '';
  const code = error.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password. Please verify your credentials.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please log in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was closed before completing.';
    case 'auth/popup-blocked':
      return 'Google sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Access temporarily blocked due to unusual activity. Please try again later.';
    case 'auth/operation-not-allowed':
      return 'This sign-in provider is not enabled in the Firebase Console.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    default:
      return error.message || 'An unexpected authentication error occurred.';
  }
}

export {
  app,
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
};
export default app;
