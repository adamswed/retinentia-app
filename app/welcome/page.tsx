import styles from '@/styles/page.module.scss';
import MainCardSection from '@/components/cards/main-card-section/main-card-section';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Add your first index card | Retinentia',
  description:
    'Get started with Retinentia by adding your first index card to begin your learning journey.',
};

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <MainCardSection />
      </main>
    </div>
  );
}
