'use client';
import { useState } from 'react';
import MainCard from '@/components/cards/main-card/main-card';
import AuthLinks from '@/components/auth/auth-links/auth-links';
import AuthFormButton from '@/components/auth/auth-form-button/auth-form-button';
import { useAuth } from '@/context/auth-context';
import { passwordValidation } from '@/validation/registerUser';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMessageModal } from '@/context/message-modal-context';

const formSchema = z.object({
  email: z.string().email(),
  password: passwordValidation,
});

const SignInWithEmail = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const modal = useMessageModal();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await auth?.loginWithEmail(data.email, data.password);
      router.push('/main');
    } catch (e: unknown) {
      const errorMessage = (e as { message?: string }).message?.includes(
        'invalid-credential'
      )
        ? 'User or password is incorrect.'
        : 'An error occurred while signing in. Please try again.';
      modal?.openModal(errorMessage);
      setLoading(false);
    }
  };
  return (
    <MainCard>
      <div className='auth_form_container'>
        <form className='auth_form' onSubmit={handleSubmit(onSubmit)}>
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
          <div>
            <input
              type='password'
              id='password'
              autoComplete='off'
              placeholder='Password'
              {...register('password')}
            />
            <p> {errors.password && errors.password.message}</p>
          </div>
          <section className='submit_auth_form'>
            <AuthLinks emailSignInLinks />
            <AuthFormButton disabled={!isValid} loading={loading}>
              Sign In
            </AuthFormButton>
          </section>
        </form>
      </div>
    </MainCard>
  );
};
export default SignInWithEmail;
