'use server';

import { auth } from '@/firebase/server';
import { cookies } from 'next/headers';

/**
 * Removes authentication tokens from cookies.
 * Deletes both firebaseAuthToken and firebaseAuthRefreshToken.
 */
export const removeToken = async () => {
  const cookieStore = await cookies();
  cookieStore.delete('firebaseAuthToken');
  cookieStore.delete('firebaseAuthRefreshToken');
};
/**
 * Verifies a Firebase authentication token.
 *
 * @param authToken - The Firebase auth token to verify.
 * @returns The verified token object, or null if verification fails.
 */
const verifyToken = async (authToken: string) => {
  try {
    const verifiedToken = await auth.verifyIdToken(authToken);
    return verifiedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

/**
 * Sets authentication tokens in cookies after verifying the token.
 *
 * @param token - The Firebase auth token to set.
 * @param refreshToken - The Firebase refresh token to set.
 */
export const setToken = async ({
  token,
  refreshToken,
}: {
  token: string;
  refreshToken: string;
}) => {
  try {
    const verifiedToken = await verifyToken(token);
    if (!verifiedToken) {
      return;
    }

    /* Optionally add customClaims logic here */

    const cookieStore = await cookies();
    cookieStore.set('firebaseAuthToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60,
    });
    cookieStore.set('firebaseAuthRefreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });
  } catch (_error) {
    return;
  }
};
