import Image from 'next/image';
import flipRight from '@/assets/flip-right.svg';
import flipLeft from '@/assets/flip-left.svg';
import swipe from '@/assets/swipe.gif';
import styles from '@/styles/card-container.module.scss';
import { IndexCard } from '@/models/index-cards.model';
import MainCard from '../main-card/main-card';
import CardForm from '../card-form/card-form';
import { useCard } from '@/context/card-context';
import { useCallback, useState } from 'react';
import { useDevice } from '@/context/device-context';
interface Props {
  indexCard?: IndexCard;
  cardList: boolean;
}
const CardContainer: React.FC<Props> = ({ indexCard, cardList }) => {
  const card = useCard();
  const device = useDevice();
  const [isResetting, setIsResetting] = useState(false);

  const flipCard = (right: boolean) => {
    if (device.isMobile) {
      flipCardMobile(right);
    } else {
      flipCardDesktop(right);
    }
  };
  /**
   * flipCardMobile function
   *
   * Handle index cards flip logic.
   *
   * @param right - Indicates the direction to flip the card (right or left).
   */
  const flipCardDesktop = useCallback(
    (right: boolean) => {
      if (card?.stopSwipe) return; // Prevent flipping if stopSwipe is true
      if (!card) return;
      const newRotation = card.cardTurnAnimation + (right ? 180 : -180);
      card.setCardTurnAnimation(newRotation);
      card.setCardTurn(!card.cardTurnedToDefinition);
    },
    [card],
  );
  /**
   * flipCardMobile function
   *
   * Customized logic to handle normalizing rotation on iOS mobile devices.
   *
   * @param right - Indicates the direction to flip the card (right or left).
   */
  const flipCardMobile = useCallback(
    (right: boolean) => {
      if (!card || card.stopSwipe) return;
      const delta = right ? 180 : -180;
      let newRotation = card.cardTurnAnimation + delta;
      // If rotation grows too large, reset it back into safe range
      if (Math.abs(newRotation) >= 1440) {
        const normalized = ((newRotation % 360) + 360) % 360;
        card.setStopSwipe(true);
        setTimeout(() => {
          // Step 1: disable transition
          setIsResetting(true);
          // Step 2: snap instantly to normalized equivalent
          card.setCardTurnAnimation(normalized);
          newRotation = normalized;
          card.setStopSwipe(false);
        }, 800);
      } else {
        setIsResetting(false);
      }
      // Apply normal rotation
      card.setCardTurnAnimation(newRotation);
      card.setCardTurn(!card.cardTurnedToDefinition);
    },
    [card],
  );

  return (
    <>
      {device.isMobile && card?.showOrientationTour && (
        <Image
          className={styles.card_swipe_hint}
          src={swipe}
          alt={'Swipe card'}
          unoptimized
        />
      )}
      {/* Add overlay as separate element when in edit mode */}
      {card?.cardEditMode && <div className={styles.card_edit_overlay} />}
      <div
        className={`${styles.card_container} ${
          card?.cardEditMode ? styles.card_container_edit : ''
        }`}
      >
        <div
          className={`${styles.card_wrapper} ${
            card?.cardDeleting ? styles.card_deleting : ''
          }`}
        >
          <MainCard
            cardRef={card?.cardRef}
            cardTurnAnimation={card?.cardTurnAnimation}
            isResetting={isResetting}
            onSwipe={(right: boolean) => {
              if (card?.showFlipIcon || (cardList && !card?.cardEditMode))
                flipCard(right);
            }}
          >
            <CardForm indexCard={indexCard} cardList={cardList} />
          </MainCard>
          {(card?.showFlipIcon || (cardList && !card?.cardEditMode)) &&
            !device.isMobile && (
              <div className={styles.flip_card_container}>
                <div
                  className={`${styles.flip_card_icon_container} ${styles.flip_card_icon_container_left} ${card?.showOrientationTour ? styles.flip_card_pulse : ''}`}
                  onClick={() => flipCard(false)}
                >
                  <Image
                    className={styles.flip_card}
                    src={flipLeft}
                    alt={'Flip index card'}
                    sizes='(max-width: 750px) 16px, 16px'
                  />
                </div>
                <div
                  className={`${styles.flip_card_icon_container} ${styles.flip_card_icon_container_right} ${card?.showOrientationTour ? styles.flip_card_pulse : ''}`}
                  onClick={() => flipCard(true)}
                >
                  <Image
                    className={styles.flip_card}
                    src={flipRight}
                    alt={'Flip index card'}
                    sizes='(max-width: 750px) 16px, 16px'
                  />
                </div>
              </div>
            )}
        </div>
      </div>
    </>
  );
};

export default CardContainer;
