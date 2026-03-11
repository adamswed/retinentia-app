'use client';

import { auth } from '@/firebase/client';
import {
  GoogleAuthProvider,
  ParsedToken,
  signInWithEmailAndPassword,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { removeToken, setToken } from '@/actions/user-auth';

type AuthContextType = {
  currentUser: User | null;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  customClaims: ParsedToken | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);
// Create a promise to handle login state and make sure the token is set before resolving:
let loginPromise: Promise<void> | null = null;
let resolveLoginPromise: (() => void) | null = null;

const createLoginPromise = () => {
  if (!loginPromise) {
    loginPromise = new Promise<void>((resolve) => {
      resolveLoginPromise = () => {
        resolve();
        loginPromise = null;
        resolveLoginPromise = null;
      };
    });
  }
};

const waitForLoginPromise = (): Promise<void> => {
  return loginPromise ?? Promise.resolve();
};

/**
 * AuthProvider component
 *
 * Provides authentication context for the app, including user state, login/logout, and custom claims.
 * Handles token management and integrates with Firebase Auth.
 *
 * @param children - React children components.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [customClaims, setCustomClaims] = useState<ParsedToken | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user ?? null);
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        const token = tokenResult.token;
        const refreshToken = user.refreshToken;
        const claims = tokenResult.claims;
        setCustomClaims(claims ?? null);
        if (token && refreshToken) {
          await setToken({
            token,
            refreshToken,
          });
        }
        const agreedAt = new Date().toISOString();
        await fetch('/api/consent', {
          method: 'POST',
          body: JSON.stringify({ userId: user.uid, agreedAt }),
        });
        resolveLoginPromise?.();
      } else {
        await removeToken();
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Signs out the current user.
   */
  const logout = async () => {
    await auth.signOut();
  };

  /**
   * Signs in the user with Google authentication.
   */
  const loginWithGoogle = async () => {
    createLoginPromise();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    await waitForLoginPromise();
  };

  /**
   * Signs in the user with email and password authentication.
   *
   * @param email - User's email address.
   * @param password - User's password.
   */
  const loginWithEmail = async (email: string, password: string) => {
    createLoginPromise();
    await signInWithEmailAndPassword(auth, email, password);
    await waitForLoginPromise();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        logout,
        loginWithGoogle,
        customClaims,
        loginWithEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context.
 *
 * @returns The authentication context value.
 */
export const useAuth = () => useContext(AuthContext);
