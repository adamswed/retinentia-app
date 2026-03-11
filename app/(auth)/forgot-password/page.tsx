'use client';
import { useState } from 'react';
import MainCard from '@/components/cards/main-card/main-card';
import AuthLinks from '@/components/auth/auth-links/auth-links';
import { auth } from '@/firebase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import AuthFormButton from '@/components/auth/auth-form-button/auth-form-button';
import { z } from 'zod';
import { useMessageModal } from '@/context/message-modal-context';

const formSchema = z.object({
  email: z.string().email(),
});

const ForgotPassword = () => {
  const modal = useMessageModal();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, formSchema.parse(data).email);
      router.push('/email-sign-in');
    } catch (_error) {
      setLoading(false);
      modal?.openModal(
        'An error occurred while sending the reset email. Please try again.'
      );
    }
  };
  return (
    <MainCard>
      <div className='auth_form_container'>
        <form
          className='auth_form'
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div>
            <input
              autoFocus
              type='email'
              id='email'
              placeholder='Email'
              {...register('email')}
            />
            <p> {errors.email && errors.email.message}</p>
          </div>
          <section className='submit_auth_form'>
            <AuthLinks forgotPasswordLinks />
            <AuthFormButton disabled={!isValid} loading={loading}>
              Reset
            </AuthFormButton>
          </section>
        </form>
      </div>
    </MainCard>
  );
};
export default ForgotPassword;
