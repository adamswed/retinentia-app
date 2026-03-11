import styles from '@/styles/page.module.scss';
import MainCardSection from '@/components/cards/main-card-section/main-card-section';
import { Metadata } from 'next';
import { NO_INDEX_METADATA } from '@/lib/constants';
export const metadata: Metadata = {
  title: 'Your index cards | Retinentia',
  ...NO_INDEX_METADATA,
};
export default function Main() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <MainCardSection />
      </main>
    </div>
  );
}
