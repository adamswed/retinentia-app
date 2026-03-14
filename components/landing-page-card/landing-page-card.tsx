'use client';
import Image from 'next/image';
import MainCard from '../cards/main-card/main-card';
import '@/styles/auth-style.css';
import logo from '@/assets/tagline-logo.svg';
import { useRouter } from 'next/navigation';
import AuthButton from '../auth/auth-button/auth-button';
import Link from 'next/link';
import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';

const LandingPageCard = () => {
  const auth = useAuth();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('clear_client_session')) {
      auth?.logout();
    }
  }, []);
  const router = useRouter();
  const onStart = () => {
    router.push('/welcome');
  };
  return (
    <>
      <div className='card_container'>
        <div className='card_wrapper'>
          <MainCard>
            <div className='tagline_card_container'>
              <Image
                className='tagline_card_logo'
                width={277}
                height={31.01}
                src={logo}
                alt={'Retinentia Logo'}
              />
              <h2>master your personal vocabulary</h2>
              <section className='tagline_card-action'>
                <AuthButton loading={false} onClick={() => onStart()} glow>
                  Begin
                </AuthButton>
                <div className='tagline_card_terms'>
                  <Link href='/privacy-policy' target='_blank'>
                    Privacy
                  </Link>
                  <span> | </span>
                  <Link href='/terms-and-conditions' target='_blank'>
                    Terms
                  </Link>
                </div>
              </section>
            </div>
          </MainCard>
        </div>
      </div>
    </>
  );
};

export default LandingPageCard;
