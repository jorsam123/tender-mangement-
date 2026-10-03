import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, testConnection } from './config';

interface FirebaseContextType {
  user: User | null;
  authReady: boolean;
  dbConnected: boolean;
  isLoggingIn: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Validate connection to Firestore on initial boot
    testConnection().then((connected) => {
      setDbConnected(connected);
    });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      console.error('Google Sign-In Error:', err);
      // Fallback: If popup was closed or blocked, notify via error
      throw err;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (err: unknown) {
      console.error('Sign-Out Error:', err);
    }
  };

  const value = useMemo(
    () => ({
      user,
      authReady,
      dbConnected,
      isLoggingIn,
      signInWithGoogle,
      signOutUser,
    }),
    [user, authReady, dbConnected, isLoggingIn]
  );

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
};

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
