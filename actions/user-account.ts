'use server';

import { auth, firestore } from '@/firebase/server';
import { cookies } from 'next/headers';
import admin from 'firebase-admin';

/**
 * Deletes all user data from Firestore for the authenticated user.
 *
 * Retrieves the user's auth token from cookies, verifies it, and deletes all index cards for the user.
 * Logs errors if deletion fails or token is missing.
 */
export const deleteUserData = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('firebaseAuthToken')?.value;

  if (!token) {
    return;
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const ref = firestore.collection('index-cards').doc(decodedToken.uid);
    await admin.firestore().recursiveDelete(ref);
    const refUser = firestore.collection('users').doc(decodedToken.uid);
    await admin.firestore().recursiveDelete(refUser);
  } catch (error) {
    return {
      error: true,
      message: (error as Error).message ?? 'Could not register user',
    };
  }
};
