'use server';
import { auth, firestore } from '@/firebase/server';
import { getAccessToken } from '../lib/wikimedia/auth';
import { vertex } from '@/firebase/vertex';
import { DEFINITION_LOOKUP_SOURCE } from '@/models/definition-lookup.model';
import { FieldValue } from 'firebase-admin/firestore';
import { MAX_DAILY_AI_DEFINITION_QUOTA } from '@/lib/constants';
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
 * Fetches the definition for a given term from Wiktionary.
 *
 * @param term - The word to look up.
 * @returns The plain text definition or an error message.
 */
/**
 * Fetches the definition for a given term from Wikimedia sources.
 * (The logic below uses the cached token)
 */
export async function getDefinition(
  term: string,
  authToken: string,
  source: string
): Promise<string | void> {
  const verifiedToken = await verifyToken(authToken);
  if (!verifiedToken) {
    return;
  }

  // This call now retrieves the token from cache if valid
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return 'Failed to authenticate with Wikimedia. Cannot fetch definition.';
  }

  const queryTerm = term.trim().toLocaleLowerCase();
  let url: string;

  if (source === DEFINITION_LOOKUP_SOURCE.WIKIPEDIA) {
    url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      queryTerm
    )}`;
  } else {
    // Correct Wiktionary endpoint for structured definitions
    url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(
      queryTerm
    )}`;
  }

  try {
    const response = await fetch(url, {
      headers: {
        // Use the cached Access Token
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'Retinentia/1.0 (https://retinentia.com)',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return 'Definition not found.';
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return JSON.stringify(data);
  } catch (error) {
    console.error('Error fetching definition:', error);
    return 'Failed to fetch definition.';
  }
}

/**
 * Fetches the AI definition for a given term.
 *
 * @param term - The word to look up.
 * @returns The plain text definition or an error message.
 */
/**
 * Fetches the definition for a given term from AI sources.
 * (The logic below uses the cached token)
 */

export async function getAIDefinition(
  term: string,
  authToken: string
): Promise<string | void> {
  const verifiedToken = await verifyToken(authToken);
  if (!verifiedToken) {
    return;
  }
  if (!term) return '';
  const user = await firestore.collection('users').doc(verifiedToken.uid).get();
  // 1. Fetch user data
  const userData = user.data();
  const lastDefinitionDate = userData?.quota?.aiDefinition?.lastDefinitionDate;
  const today = new Date().toDateString();

  // 2. Determine if reset is needed
  let currentCount = userData?.quota?.aiDefinition?.aiDefinitionsUsed ?? 0;
  let needsReset = false;

  if (lastDefinitionDate) {
    const lastDate = lastDefinitionDate.toDate().toDateString();
    needsReset = today !== lastDate;
  } else {
    needsReset = true; // First time using the feature
  }

  if (needsReset) {
    currentCount = 0;
  }

  if (currentCount >= MAX_DAILY_AI_DEFINITION_QUOTA) {
    return 'You have reached your daily limit of AI definitions.';
  }

  try {
    const model = vertex.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const requestedTerm = term.trim().toLocaleLowerCase();
    const prompt = `Using plain text only, define "${requestedTerm}" in one or two sentences, and up to three synonyms.`;

    const result = await model.generateContent(prompt);
    const text =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    await firestore
      .collection('users')
      .doc(verifiedToken.uid)
      .update({
        'quota.aiDefinition.aiDefinitionsUsed': needsReset
          ? 1
          : FieldValue.increment(1),
        'quota.aiDefinition.lastDefinitionDate': new Date(),
      });
    return text;
  } catch (err) {
    console.error('AI error:', err);
    throw new Error('Failed to fetch AI definition');
  }
}
