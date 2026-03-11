'use server';

import { getIndexCardsLength } from '@/actions/card-list';
import { auth, firestore } from '@/firebase/server';
import { MAX_INDEX_CARDS } from '@/lib/constants';
import { indexCardDataSchema } from '@/validation/indexCard';
import {
  sanitizePlainText,
  sanitizeQuillContent,
} from '@/validation/xss-config';

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
 * Adds a new index card for the authenticated user.
 *
 * Sanitizes input, validates data, and stores the card in Firestore.
 *
 * @param data - Card data (term, definition).
 * @param authToken - Firebase auth token for authentication.
 * @returns An object with error and message if creation fails, otherwise empty object.
 */
export const addNewCard = async (
  data: {
    term: string;
    definition: string;
  },
  authToken: string
) => {
  const verifiedToken = await verifyToken(authToken);

  if (!verifiedToken) {
    return {
      error: true,
      message: 'Unauthorized',
    };
  }
  const cardListLength = await getIndexCardsLength();
  if (cardListLength === undefined) {
    return {
      error: true,
      message: 'Could not retrieve current index cards length',
    };
  }
  if (cardListLength >= MAX_INDEX_CARDS) {
    return {
      error: true,
      message: "Sorry, you've reached the maximum number of cards.",
    };
  }
  // Sanitize input to prevent XSS attacks
  const sanitizedData = {
    term: sanitizePlainText(data.term.trim()),
    definition: sanitizeQuillContent(data.definition),
  };
  const validation = indexCardDataSchema.safeParse(sanitizedData);
  if (!validation.success) {
    return {
      error: true,
      message: validation.error.issues[0]?.message ?? 'An error occurred',
    };
  }

  const docRef = await firestore
    .collection('index-cards')
    .doc(verifiedToken.uid)
    .collection('user-cards')
    .add({
      ...sanitizedData,
      created: new Date(),
      updated: new Date(),
    });

  return { id: docRef.id, cardListLength: cardListLength + 1 };
};
/**
 * Updates an existing index card for the authenticated user.
 *
 * Sanitizes input, validates data, and updates the card in Firestore.
 *
 * @param data - Card data (id, term, definition).
 * @param authToken - Firebase auth token for authentication.
 * @returns An object with error and message if update fails, otherwise empty object.
 */
export const updateCard = async (
  data: {
    id: string;
    term: string;
    definition: string;
  },
  authToken: string
) => {
  const verifiedToken = await verifyToken(authToken);

  if (!verifiedToken) {
    return {
      error: true,
      message: 'Unauthorized',
    };
  }
  // Sanitize input to prevent XSS attacks
  const sanitizedData = {
    term: sanitizePlainText(data.term.trim()),
    definition: sanitizeQuillContent(data.definition),
  };
  const validation = indexCardDataSchema.safeParse(sanitizedData);
  if (!validation.success) {
    return {
      error: true,
      message: validation.error.issues[0]?.message ?? 'An error occurred',
    };
  }

  await firestore
    .collection('index-cards')
    .doc(verifiedToken.uid)
    .collection('user-cards')
    .doc(data.id)
    .update({
      ...sanitizedData,
      updated: new Date(),
    });

  return {};
};

/**
 * Deletes an index card for the authenticated user.
 *
 * @param cardId - The ID of the card to delete.
 * @param authToken - Firebase auth token for authentication.
 * @returns An object with error and message if deletion fails, otherwise empty object.
 */
export const deleteCard = async (cardId: string, authToken: string) => {
  const verifiedToken = await auth.verifyIdToken(authToken);

  if (!verifiedToken) {
    return {
      error: true,
      message: 'Unauthorized',
    };
  }

  await firestore
    .collection('index-cards')
    .doc(verifiedToken.uid)
    .collection('user-cards')
    .doc(cardId)
    .delete();
  return {};
};
