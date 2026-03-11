'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import React from 'react';

interface RecaptchaProviderProps {
  children: React.ReactNode;
}

/**
 * RecaptchaProvider component
 *
 * Wraps children with GoogleReCaptchaProvider for reCAPTCHA v3 integration.
 * Uses the site key from environment variables and sets script props for async loading.
 *
 * @param children - React children components.
 */
const RecaptchaProvider: React.FC<RecaptchaProviderProps> = ({ children }) => {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
        nonce: undefined, // Content Security Policy (CSP)
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
};

export default RecaptchaProvider;
