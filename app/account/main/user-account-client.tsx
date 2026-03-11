'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthButton from '@/components/auth/auth-button/auth-button';
import MainCard from '@/components/cards/main-card/main-card';
import { useAuth } from '@/context/auth-context';
import { AUTH_BUTTON_OPTION } from '@/models/sign-in.model';

const UserAccountClient = () => {
  const [loadingProvider, setLoadingProvider] =
    useState<null | AUTH_BUTTON_OPTION>(null);
  const auth = useAuth();

  const user = auth?.currentUser;
  const isPasswordProvider = user?.providerData.find(
    (provider) => provider.providerId === 'password',
  );
  const router = useRouter();
  const handleLogOut = async () => {
    setLoadingProvider(AUTH_BUTTON_OPTION.SIGN_OUT);
    await auth?.logout();
    router.push('/');
  };
  const onUpdatePassword = () => {
    setLoadingProvider(AUTH_BUTTON_OPTION.UPDATE_PASSWORD);
    router.push('update-password');
  };
  const onDeleteAccount = () => {
    setLoadingProvider(AUTH_BUTTON_OPTION.DELETE_ACCOUNT);
    router.push('delete');
  };

  return (
    <MainCard>
      <div className='auth_form_container'>
        {user?.displayName && user?.email && (
          <div className='auth_user_info'>
            <h3 title={user.displayName.length > 27 ? user?.displayName : ''}>
              {user.displayName}
            </h3>
            <h3 title={user.email.length > 27 ? user?.email : ''}>
              {user?.email}
            </h3>
          </div>
        )}

        {!!isPasswordProvider && (
          <AuthButton
            loading={loadingProvider === AUTH_BUTTON_OPTION.UPDATE_PASSWORD}
            onClick={() => onUpdatePassword()}
          >
            Update Password
          </AuthButton>
        )}
        <AuthButton
          loading={loadingProvider === AUTH_BUTTON_OPTION.EMAIL}
          onClick={handleLogOut}
        >
          Sign Out
        </AuthButton>
        <AuthButton
          loading={loadingProvider === AUTH_BUTTON_OPTION.DELETE_ACCOUNT}
          onClick={() => onDeleteAccount()}
        >
          Delete Account
        </AuthButton>
      </div>
    </MainCard>
  );
};

export default UserAccountClient;
