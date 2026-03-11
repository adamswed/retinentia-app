import cardStyles from '@/styles/card-container.module.scss';
import mainCardStyles from '@/styles/main-card.module.scss';
import styles from './card-skeleton-loading.module.scss';
type Props = {
  scrollLoading: boolean;
};

const CardSkeletonLoading: React.FC<Props> = ({ scrollLoading }) => {
  const skeletonCard = (
    <div className={cardStyles.card_container}>
      <div className={cardStyles.card_wrapper}>
        <div className={mainCardStyles.card}>
          <div className={mainCardStyles.card_content}>
            <div className={`${styles.skeleton_card_content} `}>
              <div className={styles.skeleton}>
                <div className={styles.skeleton_buttons}>
                  <div className={styles.skeleton_button}></div>
                  <div className={styles.skeleton_button}></div>
                </div>
                <div className={styles.skeleton_text}></div>
                <div className={styles.skeleton_text}></div>
                <div className={styles.skeleton_text}></div>
                <div className={styles.skeleton_text}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <>
      {scrollLoading ? (
        <div
          className={`${styles.skeleton_loading} ${styles.skeleton_loading_scroll}`}
        >
          {skeletonCard}
        </div>
      ) : (
        <div className={styles.skeleton_loading}>
          {skeletonCard}
          {skeletonCard}
        </div>
      )}
    </>
  );
};

export default CardSkeletonLoading;
