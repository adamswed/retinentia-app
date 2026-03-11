import LandingPageCard from '@/components/landing-page-card/landing-page-card';
import styles from '@/styles/page.module.scss';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Retinentia - Index Cards',
  description:
    'The ultimate index card app for mastering your personal vocabulary. Free, private, and ad-free. Powered by AI and Wikimedia.',
};

export default function LandingPageHome() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <LandingPageCard />
      </main>
    </div>
  );
}
