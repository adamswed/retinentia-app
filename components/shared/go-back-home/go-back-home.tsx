'use client';
import Image from 'next/image';
import goBackIcon from '@/assets/back-home.svg';
import goBackMobileIcon from '@/assets/back-home-mobile.svg';
import styles from './go-back-home.module.scss';
import { useRouter } from 'next/navigation';

const GoBackButton = () => {
  const router = useRouter();
  const goBack = () => {
    router.back();
  };
  return (
    <>
      <Image
        className={styles.go_back}
        src={goBackIcon}
        alt={'Go back home'}
        onClick={goBack}
      />
      <Image
        className={styles.go_back_mobile}
        src={goBackMobileIcon}
        alt={'Go back home'}
        onClick={goBack}
      />
    </>
  );
};

export default GoBackButton;
