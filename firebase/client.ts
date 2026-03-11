import { initializeApp, getApps } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const currentApps = getApps();
let auth: Auth;
let app; // Declare app variable

if (!currentApps.length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} else {
  app = currentApps[0]; // Get existing app
  auth = getAuth(app);
}

// Initialize Firebase App Check on the client-side
// This will automatically attach App Check tokens to client-side Firebase SDK calls.
if (
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
) {
  // For local development, enable the debug token.
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN =
      process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN || true;
  }

  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    ),
    isTokenAutoRefreshEnabled: true, // Automatically refresh App Check tokens
  });
}

export { auth };
