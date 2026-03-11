'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import MainCard from '@/components/cards/main-card/main-card';
import AuthLinks from '@/components/auth/auth-links/auth-links';
import AuthFormButton from '@/components/auth/auth-form-button/auth-form-button';
import { updatePasswordSchema } from '@/validation/account';
import { useAuth } from '@/context/auth-context';
import { useMessageModal } from '@/context/message-modal-context';

const UpdatePasswordClient = () => {
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const modal = useMessageModal();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<z.infer<typeof updatePasswordSchema>>({
    resolver: zodResolver(updatePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof updatePasswordSchema>) => {
    setLoading(true);
    const user = auth?.currentUser;
    if (!user?.email) {
      return;
    }

    try {
      await reauthenticateWithCredential(
        user,
        EmailAuthProvider.credential(user.email, data.currentPassword),
      );
      await updatePassword(user, data.newPassword);
      reset();
      router.push('/main');
    } catch (_error) {
      setLoading(false);
      modal?.openModal(
        'An error occurred while updating the password. Please try again.',
      );
    }
  };

  return (
    <MainCard>
      <div className='auth_form_container' onSubmit={handleSubmit(onSubmit)}>
        <form className='auth_form'>
          <div>
            <input
              autoFocus
              type='password'
              id='current-password'
              autoComplete='off'
              placeholder='Current password'
              {...register('currentPassword')}
            />
            <p> {errors.currentPassword && errors.currentPassword.message}</p>
          </div>
          <div>
            <input
              type='password'
              id='new-password'
              autoComplete='off'
              placeholder='New password'
              {...register('newPassword')}
            />
            <p>{errors.newPassword && errors.newPassword.message}</p>
          </div>
          <div>
            <input
              type='password'
              id='confirm-new-password'
              autoComplete='off'
              placeholder='Confirm new password'
              {...register('newPasswordConfirm')}
            />
            <p>
              {errors.newPasswordConfirm && errors.newPasswordConfirm.message}
            </p>
          </div>
          <section className='submit_auth_form'>
            <AuthLinks updatePasswordLinks />
            <AuthFormButton disabled={!isValid} loading={loading}>
              Update
            </AuthFormButton>
          </section>
        </form>
      </div>
    </MainCard>
  );
};

export default UpdatePasswordClient;
