'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import Image from 'next/image';
import signIn from '@/assets/sign-in.svg';
import styles from './user-avatar.module.scss';
import { useRouter } from 'next/navigation';

export const UserAvatar = () => {
  const auth = useAuth();
  const router = useRouter();
  const [initials, setInitials] = useState('');

  useEffect(() => {
    if (!!auth?.currentUser) {
      const user = auth.currentUser.displayName || auth.currentUser.email;
      const initials =
        user
          ?.match(/(^\S\S?|\b\S)?/g)
          ?.join('')
          ?.match(/(^\S|\S$)?/g)
          ?.join('') || '';
      setInitials(initials);
    }
  }, [auth?.currentUser]);

  return (
    <div
      className={styles.user_avatar}
      onClick={() =>
        !!auth?.currentUser
          ? router.push('/account/main')
          : router.push('/sign-in')
      }
    >
      {!!auth?.currentUser && <span>{initials}</span>}
      {!auth?.currentUser && (
        <Image
          src={signIn}
          alt={'Sign in or sign up'}
          sizes='(max-width: 750px) 24px, 24px'
        />
      )}
    </div>
  );
};
