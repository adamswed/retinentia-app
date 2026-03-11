'use server';
import { auth, firestore } from '@/firebase/server';
import { ErrorMessage, IndexCard } from '@/models/index-cards.model';
import { cookies } from 'next/headers';

/**
 * Validates the Firebase Auth token from cookies.
 *
 * @returns The verified user ID object or an error message.
 */
const validateToken = async (): Promise<{ uid: string } | ErrorMessage> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('firebaseAuthToken')?.value;

  if (!token) {
    return {
      error: true,
      message: 'Unauthorized --> Cookie not found',
    };
  }

  const verifiedToken = await verifyToken(token);

  if (!verifiedToken) {
    return {
      error: true,
      message: 'Unauthorized',
    };
  }

  return verifiedToken;
};

/**
 * Verifies a Firebase Auth ID token.
 *
 * @param authToken - The Firebase Auth ID token to verify.
 * @returns The verified token object or null if verification fails.
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
 * Fetches a paginated list of index cards for the authenticated user.
 *
 * @param limit - Maximum number of cards to fetch.
 * @param offset - Number of cards to skip (for pagination).
 * @returns Array of IndexCard objects or an error message.
 */
export const getIndexCards = async (
  limit: number,
  offset: number
): Promise<IndexCard[] | ErrorMessage> => {
  const validationResult = await validateToken();

  if ('error' in validationResult) {
    return validationResult;
  }

  const indexCardsSnapshot = await firestore
    .collection('index-cards')
    .doc(validationResult.uid)
    .collection('user-cards')
    .orderBy('updated', 'desc')
    .offset(offset)
    .limit(limit)
    .get();

  const indexCardsData: IndexCard[] = indexCardsSnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        created: doc.data().created.toString(),
        updated: doc.data().updated.toString(),
        term: doc.data().term,
        definition: doc.data().definition,
      } as IndexCard)
  );
  return indexCardsData || {};
};
/**
 * Fetches the total number of index cards for the authenticated user.
 *
 * @returns The number of user cards or an error message.
 */
export const getIndexCardsLength = async (): Promise<number | void> => {
  const validationResult = await validateToken();

  if ('error' in validationResult) {
    return;
  }

  const indexCardsSnapshot = await firestore
    .collection('index-cards')
    .doc(validationResult.uid)
    .collection('user-cards')
    .get();

  const length = indexCardsSnapshot.size;
  return length;
};
