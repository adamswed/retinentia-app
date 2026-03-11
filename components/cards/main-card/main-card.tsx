import { LegacyRef } from 'react';
import styles from '@/styles/main-card.module.scss';
import { useSwipeable } from 'react-swipeable';
import { useDevice } from '@/context/device-context';
const MainCard = ({
  cardRef,
  children,
  cardTurnAnimation,
  onSwipe,
  isResetting,
}: Readonly<{
  cardRef?: LegacyRef<HTMLDivElement> | null;
  cardTurnAnimation?: number | undefined;
  children: React.ReactNode;
  onSwipe?: (direction: boolean) => void;
  isResetting?: boolean;
}>) => {
  const mobileContext = useDevice();
  const isMobile = mobileContext.isMobile;
  const handlers = useSwipeable({
    onSwipedRight: () => onSwipe?.(true),
    onSwipedLeft: () => onSwipe?.(false),
    // This is the key option
    preventScrollOnSwipe: true,
    trackMouse: true,
  });
  const swipeHandlers = isMobile ? handlers : {};
  return (
    <div ref={cardRef} className={styles.card}>
      <div
        className={styles.card_content}
        {...swipeHandlers}
        style={{
          transform: `rotateY(${cardTurnAnimation}deg)`,
          transition: isResetting ? 'none' : 'transform 0.5s ease-in-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};
export default MainCard;
