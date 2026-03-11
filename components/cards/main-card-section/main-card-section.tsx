'use client';
import CardListProvider from '@/context/card-list-context';
import styles from './main-card-section.module.scss';
import CardContainer from '../card-container/card-container';
import CardList from '../cards-list/card-list';
import { CardProvider } from '@/context/card-context';

const MainCardSection = () => {
  return (
    <CardListProvider>
      <div className={styles.main_card}>
        <CardProvider>
          <CardContainer cardList={false} />
        </CardProvider>
        <CardList />
      </div>
    </CardListProvider>
  );
};

export default MainCardSection;
