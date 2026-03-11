'use client';
import { useState } from 'react';
import MainCard from '@/components/cards/main-card/main-card';
import AuthLinks from '@/components/auth/auth-links/auth-links';
import { registerUserSchema } from '@/validation/registerUser';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { registerUser } from '../../../actions/register';
import { useRouter } from 'next/navigation';
import AuthFormButton from '@/components/auth/auth-form-button/auth-form-button';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useMessageModal } from '@/context/message-modal-context';
import Link from 'next/link';
import { TERMS_VERSION } from '@/lib/constants';

const SignUp = () => {
  const modal = useMessageModal();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha(); // Get the reCAPTCHA execution function from context

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<z.infer<typeof registerUserSchema>>({
    resolver: zodResolver(registerUserSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
      name: '',
      terms: false,
      agreedAt: undefined,
      agreedVersion: undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof registerUserSchema>) => {
    setLoading(true);

    // Execute reCAPTCHA to get a token
    if (!executeRecaptcha) {
      console.error('reCAPTCHA not loaded yet!');
      setLoading(false);
      modal?.openModal('reCAPTCHA not loaded yet. Please try again.');
      return;
    }

    let recaptchaToken: string | null = null;
    try {
      recaptchaToken = await executeRecaptcha('signup_form_submit'); // 'signup_form_submit' is an action name for reCAPTCHA analytics
    } catch (recaptchaError) {
      console.error('reCAPTCHA execution failed:', recaptchaError);
      setLoading(false);
      return;
    }

    if (!recaptchaToken) {
      console.error('reCAPTCHA token was not generated.');
      setLoading(false);
      return;
    }

    // Pass the reCAPTCHA token along with your form data to the server action
    const response = await registerUser(data, recaptchaToken);

    if (!!response?.error) {
      setLoading(false);
      modal?.openModal(
        response.message ||
          'An error occurred while registering. Please try again.'
      );
      return;
    }
    router.push('/email-sign-in');
  };

  // Handle terms checkbox change to capture consent timestamp
  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setValue('terms', isChecked, {
      shouldValidate: true,
    });
    if (isChecked) {
      // Capture the exact timestamp when user agrees
      setValue('agreedAt', new Date().toISOString());
      setValue('agreedVersion', TERMS_VERSION);
    } else {
      // Clear consent data if unchecked
      setValue('agreedAt', undefined);
      setValue('agreedVersion', undefined);
    }
  };

  return (
    <MainCard>
      <div className='auth_form_container' onSubmit={handleSubmit(onSubmit)}>
        <form className='auth_form'>
          <div>
            <input
              autoFocus
              type='text'
              id='name'
              maxLength={50}
              autoComplete='off'
              placeholder='Name'
              {...register('name')}
            />
            <p> {errors.name && errors.name.message}</p>
          </div>
          <div>
            <input
              type='email'
              id='email'
              maxLength={100}
              autoComplete='off'
              placeholder='Email'
              {...register('email')}
            />
            <p>{errors.email && errors.email.message}</p>
          </div>
          <div>
            <input
              type='password'
              id='password'
              maxLength={30}
              autoComplete='off'
              placeholder='Password'
              {...register('password')}
            />
            <p>{errors.password && errors.password.message}</p>
          </div>
          <div>
            <input
              type='password'
              id='confirm-password'
              maxLength={30}
              autoComplete='off'
              placeholder='Confirm Password'
              {...register('passwordConfirm')}
            />
            <p>{errors.passwordConfirm && errors.passwordConfirm.message}</p>
          </div>
          <div className='auth_form_footer'>
            <div className='terms_checkbox_container'>
              <input
                type='checkbox'
                id='terms'
                {...register('terms')}
                onChange={handleTermsChange}
              />
              <label htmlFor='terms'>
                By signing up, you agree with Retinentia’s{' '}
                <Link href='/terms-and-conditions' target='_blank'>
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link href='/privacy-policy' target='_blank'>
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
            <p>{errors.terms && errors.terms.message}</p>
          </div>

          <section className='submit_auth_form'>
            <AuthLinks emailSignUpLinks />
            <AuthFormButton disabled={!isValid} loading={loading}>
              Sign Up
            </AuthFormButton>
          </section>
        </form>
      </div>
    </MainCard>
  );
};
export default SignUp;
