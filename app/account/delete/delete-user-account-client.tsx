'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  deleteUser,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import MainCard from '@/components/cards/main-card/main-card';
import AuthLinks from '@/components/auth/auth-links/auth-links';
import AuthFormButton from '@/components/auth/auth-form-button/auth-form-button';
import AuthButton from '@/components/auth/auth-button/auth-button';
import { deleteAccountSchema } from '@/validation/account';
import { useAuth } from '@/context/auth-context';
import { removeToken } from '@/actions/user-auth';
import { deleteUserData } from '../../../actions/user-account';
import { useMessageModal } from '@/context/message-modal-context';
import { MessageModalMode } from '@/models/message-modal.model';
import { AUTH_BUTTON_OPTION } from '@/models/sign-in.model';

const DeleteUserAccountClient = () => {
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const modal = useMessageModal();
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] =
    useState<null | AUTH_BUTTON_OPTION>(null);
  const user = auth?.currentUser;
  const isPasswordProvider = user?.providerData.find(
    (provider) => provider.providerId === 'password',
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<z.infer<typeof deleteAccountSchema>>({
    resolver: zodResolver(deleteAccountSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
    },
  });

  const deleteUserAndRemoveToken = async () => {
    if (!auth?.currentUser) return;
    try {
      await deleteUser(auth.currentUser);
      await removeToken();
      router.push('/');
    } catch (error: Error | unknown) {
      setLoading(false);
      const errorMessage = (error as Error)?.message.includes(
        'invalid-credential',
      )
        ? 'The password is incorrect.'
        : 'An error occurred while deleting your account. Please try again.';
      modal?.openModal(errorMessage);
    }
  };

  const handleDeleteGoogleUser = async () => {
    if (!auth?.currentUser) return;
    setLoadingProvider(AUTH_BUTTON_OPTION.GOOGLE);
    try {
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(auth.currentUser, provider);

      const response = await deleteUserData();
      if (response?.error) {
        setLoadingProvider(null);
        modal?.openModal(response.message || 'Error deleting account data.');
        return;
      }
      deleteUserAndRemoveToken();
    } catch (error) {
      setLoadingProvider(null);
      console.error('Error deleting Google user:', error);
      modal?.openModal('Could not delete your account. Please try again.');
    }
  };

  const deleteUserAccount = async (
    data: z.infer<typeof deleteAccountSchema>,
  ) => {
    setLoading(true);
    if (auth?.currentUser?.email) {
      try {
        await reauthenticateWithCredential(
          auth.currentUser,
          EmailAuthProvider.credential(auth.currentUser.email, data.password),
        );

        const response = await deleteUserData();

        if (!!response?.error) {
          setLoading(false);
          modal?.openModal(
            response.message ||
              'An error occurred while deleting your account data. Please try again.',
          );
          return;
        }
        deleteUserAndRemoveToken();
      } catch (error) {
        console.error('Error deleting user account:', error);
        setLoading(false);
        modal?.openModal(
          'The user credentials are incorrect. Please try again.',
        );
      }
    }
  };

  const onSubmit = async (data: z.infer<typeof deleteAccountSchema>) => {
    modal?.openModal(
      'Are you sure you want to delete your user account?',
      MessageModalMode.DeleteUser,
      () => {
        if (isPasswordProvider) {
          deleteUserAccount(data);
        } else {
          handleDeleteGoogleUser();
        }
      },
    );
  };

  return (
    <MainCard>
      <div className='auth_form_container'>
        <form
          className='auth_form'
          onSubmit={
            isPasswordProvider
              ? handleSubmit(onSubmit)
              : (e) => {
                  e.preventDefault();
                  onSubmit({ password: '' });
                }
          }
        >
          <div>
            {isPasswordProvider && (
              <input
                autoFocus
                type='password'
                id='current-password'
                autoComplete='off'
                placeholder='Enter password'
                {...register('password')}
              />
            )}
            <p> {errors.password && errors.password.message}</p>
          </div>
          {isPasswordProvider ? (
            <section className='submit_auth_form'>
              <AuthLinks deleteAccountLinks />
              <AuthFormButton disabled={!isValid} loading={loading}>
                Delete Account
              </AuthFormButton>
            </section>
          ) : (
            <>
              <section className='submit_auth_form'>
                <AuthLinks deleteAccountLinks />
              </section>
              <div className='google-delete-button-container'>
                <AuthButton
                  loading={loadingProvider === AUTH_BUTTON_OPTION.GOOGLE}
                >
                  Delete Account
                </AuthButton>
              </div>
            </>
          )}
        </form>
      </div>
    </MainCard>
  );
};

export default DeleteUserAccountClient;
