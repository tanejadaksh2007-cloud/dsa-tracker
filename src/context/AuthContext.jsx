import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  auth,
  googleProvider,
  isFirebaseConfigured,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  signOut,
  onAuthStateChanged,
  formatAuthError,
} from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Subscribe to Firebase onAuthStateChanged
  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setIsLoading(false);
      },
      (error) => {
        console.error('[AlgoForge Auth] onAuthStateChanged error:', error);
        setAuthError(formatAuthError(error));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Register with email and password
  const registerWithEmail = useCallback(async (email, password, displayName = '') => {
    setAuthError(null);
    if (!auth) {
      const err = new Error(
        'Firebase Authentication is not configured. Please provide your VITE_FIREBASE_API_KEY in .env.'
      );
      setAuthError(err.message);
      throw err;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (displayName && displayName.trim()) {
        await updateProfile(userCredential.user, {
          displayName: displayName.trim(),
        });
        // Update local user state with new displayName
        setUser({ ...userCredential.user, displayName: displayName.trim() });
      }
      return userCredential.user;
    } catch (error) {
      const formatted = formatAuthError(error);
      setAuthError(formatted);
      throw new Error(formatted);
    }
  }, []);

  // Login with email and password
  const loginWithEmail = useCallback(async (email, password) => {
    setAuthError(null);
    if (!auth) {
      const err = new Error(
        'Firebase Authentication is not configured. Please provide your VITE_FIREBASE_API_KEY in .env.'
      );
      setAuthError(err.message);
      throw err;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      return userCredential.user;
    } catch (error) {
      const formatted = formatAuthError(error);
      setAuthError(formatted);
      throw new Error(formatted);
    }
  }, []);

  // Login with Google Popup
  const loginWithGoogle = useCallback(async () => {
    setAuthError(null);
    if (!auth) {
      const err = new Error(
        'Firebase Authentication is not configured. Please provide your VITE_FIREBASE_API_KEY in .env.'
      );
      setAuthError(err.message);
      throw err;
    }

    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      return userCredential.user;
    } catch (error) {
      const formatted = formatAuthError(error);
      setAuthError(formatted);
      throw new Error(formatted);
    }
  }, []);

  // Sign out
  const logout = useCallback(async () => {
    setAuthError(null);
    if (!auth) {
      setUser(null);
      return;
    }

    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('[AlgoForge Auth] Logout error:', error);
      const formatted = formatAuthError(error);
      setAuthError(formatted);
      throw new Error(formatted);
    }
  }, []);

  // Clear any existing error message
  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      isLoading,
      authError,
      isFirebaseConfigured,
      registerWithEmail,
      loginWithEmail,
      loginWithGoogle,
      logout,
      clearAuthError,
      // Fallback for legacy demo login call
      login: () => {},
    }),
    [
      user,
      isLoading,
      authError,
      registerWithEmail,
      loginWithEmail,
      loginWithGoogle,
      logout,
      clearAuthError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}
