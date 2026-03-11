'use server';

import { auth, firestore } from '@/firebase/server';
import { TERMS_VERSION } from '@/lib/constants';
import { registerUserSchema } from '@/validation/registerUser';
import { sanitizePlainText } from '@/validation/xss-config';

/**
 * Registers a new user with email, password, and name, including reCAPTCHA verification and XSS sanitization.
 *
 * @param data - User registration data (email, password, passwordConfirm, name).
 * @param recaptchaToken - reCAPTCHA token for server-side verification.
 * @returns An object with error and message if registration fails, otherwise undefined.
 */
export const registerUser = async (
  data: {
    email: string;
    password: string;
    passwordConfirm: string;
    name: string;
    terms: boolean;
    agreedAt?: string;
    agreedVersion?: string;
  },
  recaptchaToken: string
) => {
  // Sanitize the display name to prevent XSS
  const sanitizedName = sanitizePlainText(data.name.trim());
  const validation = registerUserSchema.safeParse({
    ...data,
    name: sanitizedName,
  });

  if (!validation.success) {
    return {
      error: true,
      message: validation.error.issues[0]?.message ?? 'An error occurred',
    };
  }

  // Server-side reCAPTCHA verification
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.error('RECAPTCHA_SECRET_KEY is not set in environment variables.');
    return {
      error: true,
      message: 'Server configuration error: reCAPTCHA secret key missing.',
    };
  }

  try {
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
    const recaptchaRes = await fetch(verificationUrl, { method: 'POST' });
    const recaptchaData = await recaptchaRes.json();

    // Adjust reCAPTCHA score threshold as needed
    if (!recaptchaData.success || recaptchaData.score < 0.5) {
      console.warn('reCAPTCHA verification failed:', recaptchaData);
      return {
        error: true,
        message: 'reCAPTCHA verification failed. Please try again.',
      };
    }

    // Log reCAPTCHA score and action for monitoring
    // eslint-disable-next-line no-console
    console.log(
      `reCAPTCHA score for action '${recaptchaData.action}': ${recaptchaData.score}`
    );

    // Proceed with user creation if reCAPTCHA passed
    const userRecord = await auth.createUser({
      displayName: sanitizedName,
      email: data.email,
      password: data.password,
    });

    // Store consent data in Firestore for audit trail
    if (data.agreedAt && data.agreedVersion) {
      await firestore
        .collection('users')
        .doc(userRecord.uid)
        .set({
          email: data.email,
          displayName: sanitizedName,
          createdAt: new Date().toISOString(),
          consent: {
            agreedAt: data.agreedAt,
            agreedVersion: data.agreedVersion,
          },
        });
    }
  } catch (error: Error | unknown) {
    return {
      error: true,
      message: (error as Error).message ?? 'Could not register user',
    };
  }
};

export const createUserConsent = async (uid: string, agreedAt: string) => {
  try {
    const userRecord = await auth.getUser(uid);
    const userDoc = await firestore.collection('users').doc(uid).get();

    if (userDoc.exists && userDoc.data()?.consent?.agreedAt) {
      return { success: true };
    }

    await firestore
      .collection('users')
      .doc(uid)
      .set(
        {
          email: userRecord.email,
          displayName: userRecord.displayName,
          createdAt: new Date().toISOString(),
          consent: {
            agreedAt,
            agreedVersion: TERMS_VERSION,
          },
        },
        { merge: true }
      );

    return { success: true };
  } catch (error) {
    console.error('[createUserConsent] Error:', error);
    return { success: false, error: String(error) };
  }
};
