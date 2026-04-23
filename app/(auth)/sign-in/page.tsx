'use client';
import { useState } from 'react';
import AuthButton from '@/components/auth/auth-button/auth-button';
import MainCard from '@/components/cards/main-card/main-card';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { AUTH_BUTTON_OPTION } from '@/models/sign-in.model';
import { useMessageModal } from '@/context/message-modal-context';
import signIn from '@/assets/sign-in-icon.svg';
import googleSignIn from '@/assets/google-sign-in.svg';
import githubSignIn from '@/assets/github-sign-in.svg';
import SignUp from '@/assets/sign-up-icon.svg';
import Link from 'next/link';

const SignInPage = () => {
  const [loadingProvider, setLoadingProvider] =
    useState<null | AUTH_BUTTON_OPTION>(null);
  const router = useRouter();
  const auth = useAuth();
  const modal = useMessageModal();
  const handleGoogleClick = async () => {
    setLoadingProvider(AUTH_BUTTON_OPTION.GOOGLE);
    try {
      await auth?.loginWithGoogle();
      router.refresh();
      router.push('/main');
    } catch (error) {
      const code = (error as { code?: string })?.code;
      // Suppress modal and stop loading if popup closed by user
      if (code === 'auth/popup-closed-by-user') {
        setLoadingProvider(null);
        return;
      }
      modal?.openModal(
        'An error occurred while signing in with Google. Please try again.',
      );
      setLoadingProvider(null);
    }
  };
  const handleGitHubClick = async () => {
    setLoadingProvider(AUTH_BUTTON_OPTION.GITHUB);
    try {
      await auth?.loginWithGitHub();
      router.refresh();
      router.push('/main');
    } catch (error) {
      const code = (error as { code?: string })?.code;
      const email = (error as { customData?: { email?: string } })?.customData?.email;
      // Handle popup closed by user: do not show modal, just stop loading
      if (code === 'auth/popup-closed-by-user') {
        setLoadingProvider(null);
        return;
      }
      if (code === 'auth/account-exists-with-different-credential' && email) {
        modal?.openModal(
          `${email} is already registered via Google. Please sign in with Google instead.`,
        );
      } else {
        modal?.openModal(
          'An error occurred while signing in with GitHub. Please try again.',
        );
      }
      setLoadingProvider(null);
    }
  };
  const onEmailSignIn = () => {
    setLoadingProvider(AUTH_BUTTON_OPTION.EMAIL);
    router.push('/email-sign-in');
  };
  const onSignup = () => {
    setLoadingProvider(AUTH_BUTTON_OPTION.SIGNUP);
    router.push('/sign-up');
  };
  return (
    <MainCard>
      <div className='auth_form_container'>
        <AuthButton
          loading={loadingProvider === AUTH_BUTTON_OPTION.GOOGLE}
          onClick={handleGoogleClick}
          iconSrc={googleSignIn}
          iconAlt='Sign in to Google icon'
        >
          Google
        </AuthButton>
        <AuthButton
          loading={loadingProvider === AUTH_BUTTON_OPTION.GITHUB}
          onClick={handleGitHubClick}
          iconSrc={githubSignIn}
          iconAlt='Sign in with GitHub icon'
        >
          GitHub
        </AuthButton>
        <AuthButton
          loading={loadingProvider === AUTH_BUTTON_OPTION.EMAIL}
          onClick={() => onEmailSignIn()}
          iconSrc={signIn}
          iconAlt='Sign in icon'
        >
          Sign in
        </AuthButton>
        <AuthButton
          loading={loadingProvider === AUTH_BUTTON_OPTION.SIGNUP}
          onClick={() => onSignup()}
          iconSrc={SignUp}
          iconAlt='Sign up icon'
        >
          Sign up
        </AuthButton>
        <div className='auth_disclaimer'>
          <p>
            By creating an account or signing in, you agree to Retinentia’s{' '}
            <Link href='/terms-and-conditions' target='_blank'>
              Terms & Conditions
            </Link>{' '}
            and{' '}
            <Link href='/privacy-policy' target='_blank'>
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </MainCard>
  );
};

export default SignInPage;
