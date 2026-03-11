import { useAuth } from '@/context/auth-context';
import { IndexCard } from '@/models/index-cards.model';
import { deleteCard } from '@/actions/index-card';
import styles from './card-controls.module.scss';
import { CardListContext } from '@/context/card-list-context';
import { useContext } from 'react';
import Image from 'next/image';
import deleteCardImg from '@/assets/delete-card.svg';
import cancelCardEdit from '@/assets/cancel-edit.svg';
import editCard from '@/assets/edit-card.svg';
import { useMessageModal } from '@/context/message-modal-context';
import { MessageModalMode } from '@/models/message-modal.model';
import { getIndexCardsLength } from '../../../actions/card-list';
import { useCard } from '@/context/card-context';
interface Props {
  indexCard?: IndexCard;
}
/**
 * CardControls component
 *
 * Renders edit and delete controls for an index card, including modal confirmation and state management.
 *
 * @param indexCard - The card to control.
 */
const CardControls: React.FC<Props> = ({ indexCard }) => {
  const { addIndexCardListLength, deleteIndexCard, preventCardListScroll } =
    useContext(CardListContext);
  const card = useCard();
  const auth = useAuth();
  const modal = useMessageModal();
  /**
   * Opens a modal to confirm deletion of the index card.
   */
  const onDeleteCard = () => {
    card?.setCardButtonDeleteActive(true);
    modal?.openModal(
      'Are you sure you want to delete this index card?',
      MessageModalMode.DeleteCard,
      () => {
        confirmDeleteCard();
      },
      () => {
        card?.setCardButtonDeleteActive(false);
      }
    );
  };
  /**
   * Gets the current number of index cards for the user.
   *
   * @returns The number of index cards.
   */
  const getIndexCardsDataLength = async () => {
    const length = await getIndexCardsLength();
    if (!length) return;
    addIndexCardListLength(length);
    return length;
  };

  /**
   * Confirms and deletes the index card, updates state and reloads if needed.
   */
  const confirmDeleteCard = async () => {
    const tokenResult = await auth?.currentUser?.getIdTokenResult();
    if (!tokenResult || !indexCard) {
      card?.setCardButtonDeleteActive(false);
      return;
    }

    const deleteResponse = await deleteCard(indexCard.id, tokenResult.token);
    if (!!deleteResponse.error) {
      card?.setCardButtonDeleteActive(false);
      modal?.openModal(
        deleteResponse.message ||
          'An error occurred while deleting the card. Please try again.'
      );
      return;
    }
    card?.setCardButtonDeleteActive(false);
    card?.setCardDeleting(true);
    setTimeout(async () => {
      deleteIndexCard(indexCard);
      card?.setCardDeleting(false);
      const newLength = await getIndexCardsDataLength();
      if (!newLength || newLength === 0) {
        window.location.reload();
      }
    }, 200);
  };
  /**
   * Handles toggling edit mode for the card and updates state/context.
   */
  const handleonEditCard = () => {
    card?.setCardEditMode(!card?.cardEditMode);
    preventCardListScroll(!card?.cardEditMode);
  };
  return (
    <div className={styles.card_controls_container}>
      <span onClick={handleonEditCard}>
        {card?.cardEditMode ? (
          <Image
            className={`${styles.card_control} index-card-button-active`}
            src={cancelCardEdit}
            alt={'Cancel card edit'}
          />
        ) : (
          <Image
            className={styles.card_control}
            src={editCard}
            alt={'Edit card'}
          />
        )}
      </span>
      <Image
        className={`${styles.card_control} ${
          card?.cardButtonDeleteActive ? 'index-card-button-active' : ''
        } ${card?.cardEditMode ? styles.hide_delete_card_icon : ''}`}
        src={deleteCardImg}
        alt={'Delete card'}
        onClick={onDeleteCard}
      />
    </div>
  );
};

export default CardControls;
