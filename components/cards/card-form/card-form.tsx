import { IndexCard } from '@/models/index-cards.model';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import styles from '@/styles/card-container.module.scss';
import CardControls from '../card-controls/card-controls';
import { useAuth } from '@/context/auth-context';
import { addNewCard, updateCard } from '@/actions/index-card';
import { indexCardDataSchema } from '@/validation/indexCard';
import { useRouter } from 'next/navigation';
import { CardListContext } from '@/context/card-list-context';
import { getIndexCardsLength } from '../../../actions/card-list';
import LoadingSpinner from '../../shared/loading-spinner/loading-spinner';
import { useMessageModal } from '@/context/message-modal-context';
import { useCard, useCardActions } from '@/context/card-context';
import CardDefinition from '../card-definition/card-definition';
import { CardFormFields } from '@/models/card-form.model';

interface Props {
  indexCard?: IndexCard;
  cardList: boolean;
}

const CardForm: React.FC<Props> = ({ indexCard, cardList }) => {
  const { setShowFlipIcon } = useCardActions();
  const card = useCard();
  const {
    state,
    addIndexCardListLength,
    addIndexCard,
    updateIndexCard,
    preventCardListScroll,
    /**
     * CardForm for creating and editing index cards.
     *
     * @param indexCard - The card data to display/edit.
     * @param cardList - If true, renders in card list mode.
     */
  } = useContext(CardListContext);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const modal = useMessageModal();
  const inputEl = useRef<HTMLInputElement | null>(null);
  const [definitionLetterCount, setDefinitionLetterCount] = useState(0);
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [disableCardFields, setDisableCardFields] = useState(true);
  const [focusOnInput, setFocusOnInput] = useState(false);
  const initialized = useRef(false);

  const onTermChange = useCallback(
    (cardTerm: string) => {
      setShowFlipIcon(cardTerm.length > 0);
    },
    [setShowFlipIcon]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTerm(e.target.value);
    onTermChange(e.target.value);
    if (e.target.value.length > 0) {
      card?.notifyTermTyping();
    }
  };

  /**
   * Determines whether the term input should be focused based on card state and edit mode.
   *
   * @effect Runs when card turn state, edit mode, or card list mode changes.
   */
  useEffect(() => {
    const shouldFocus =
      (!state.indexCardListMode && !card?.cardTurnedToDefinition) ||
      (card?.cardEditMode && !card?.cardTurnedToDefinition);
    setFocusOnInput(shouldFocus as boolean);
  }, [
    card?.cardTurnedToDefinition,
    card?.cardEditMode,
    state.indexCardListMode,
  ]);

  /**
   * Focuses the term input element when focusOnInput is true.
   * Adds a slight delay for smoother UX and to ensure DOM is ready.
   *
   * @effect Runs when focusOnInput changes.
   */
  useEffect(() => {
    if (focusOnInput && inputEl?.current) {
      setTimeout(() => {
        inputEl.current?.focus();
      }, 200);
    }
  }, [focusOnInput]);

  /**
   * Syncs card edit mode and input fields.
   *
   * - Disables/enables input fields based on edit mode.
   * - Updates definition letter count.
   * - Resets term and definition fields when exiting edit mode.
   *
   * @effect Runs when card edit mode or index card data changes.
   */
  useEffect(() => {
    setDisableCardFields(!card?.cardEditMode);
    setDefinitionLetterCount(indexCard?.definition.length || 0);
    if (!card?.cardEditMode) {
      setTerm(indexCard?.term || '');
      setDefinition(indexCard?.definition || '');
    }
  }, [
    card?.cardEditMode,
    indexCard?.definition,
    indexCard?.definition.length,
    indexCard?.term,
  ]);
  /**
   * Handles touch events on the term input field to prevent unwanted swipe gestures.
   *
   * @param isTouching - Whether the term input field is being touched.
   */
  const onTouchTextEditor = (isTouching: boolean) => {
    if (card?.keyboardOpen) {
      card?.setStopSwipe(isTouching);
    }
  };
  const getIndexCardsDataLength = async () => {
    const length = await getIndexCardsLength();
    if (!length) return;
    addIndexCardListLength(length);
  };
  // Initialize the card form with data from localStorage if available
  useEffect(() => {
    const checkIfCardIsStored = async () => {
      const token = await auth?.currentUser?.getIdToken();
      if (!token) {
        return;
      }
      if (!initialized.current) {
        initialized.current = true;
        if (localStorage.getItem('card')) {
          const card = localStorage.getItem('card');
          if (card) {
            const { term, definition } = JSON.parse(card);
            handleAddIndexCard(term, definition).then(() => {
              localStorage.removeItem('card');
              getIndexCardsDataLength();
            });
          }
        }
      }
    };
    checkIfCardIsStored();
  });

  useEffect(() => {
    if (indexCard?.term) {
      onTermChange(indexCard?.term);
      setTerm(indexCard?.term);
    }
    if (indexCard?.definition) {
      setDefinition(indexCard?.definition);
    }
  }, [indexCard?.definition, indexCard?.term, onTermChange]);

  const handleUpdateIndexCard = () => {
    onUpdateIndexCard(indexCard?.id ?? '', term, definition);
  };

  const storeCardData = () => {
    const validation = indexCardDataSchema.safeParse({
      term: String(term),
      definition: String(definition),
    });
    if (!validation.success) {
      return;
    }
    localStorage.setItem(
      /**
       * Stores card data in localStorage and redirects to sign-in if not authenticated.
       */
      'card',
      JSON.stringify({ term: String(term), definition: String(definition) })
    );
    router.push('/sign-in');
  };

  const handleAddIndexCard = async (
    cardTerm: string,
    cardDefinition: string
  ) => {
    setLoading(true);
    const token = await auth?.currentUser?.getIdToken();
    if (!token) {
      storeCardData();
      return;
    }
    if (typeof cardTerm !== 'string' || typeof cardDefinition !== 'string') {
      setLoading(false);
      return;
    }
    /**
     * Adds a new index card for the user, or stores locally if not authenticated.
     *
     * @param cardTerm - The card term.
     * @param cardDefinition - The card definition.
     */
    const response = await addNewCard(
      { term: String(cardTerm), definition: String(cardDefinition) },
      token
    );

    if (!!response.error) {
      setLoading(false);
      modal?.openModal(
        response.message ||
          'An error occurred while adding the card. Please try again.'
      );
      return;
    }

    if (state.indexCards.length > 0 && response.id) {
      const payload: IndexCard = {
        id: response.id,
        term: cardTerm,
        definition: cardDefinition,
      };
      addIndexCard(payload as IndexCard);
    }
    if (card?.onAddIndexCardComplete) {
      setLoading(false);
      card.onAddIndexCardComplete();
      setTerm('');
      setDefinition('');
      if (response.cardListLength !== undefined) {
        addIndexCardListLength(response.cardListLength);
      }
      setTimeout(() => {
        inputEl?.current?.focus();
      }, 200);
    }
  };
  const onUpdateIndexCard = async (
    id: string,
    term: string,
    definition: string
  ) => {
    setLoading(true);
    const token = await auth?.currentUser?.getIdToken();
    if (!token) {
      setLoading(false);
      return;
    }
    if (typeof term !== 'string' || typeof definition !== 'string') {
      setLoading(false);
      return;
    }
    /**
     * Updates an existing index card for the user.
     *
     * @param id - Card ID.
     * @param term - Card term.
     * @param definition - Card definition.
     */
    const response = await updateCard(
      { id, term: String(term), definition: String(definition) },
      token
    );

    if (!!response.error) {
      setLoading(false);
      modal?.openModal(
        response.message ||
          'An error occurred while adding the card. Please try again.'
      );
      return;
    }
    const payload: IndexCard = { id, term, definition };
    updateIndexCard(payload);
    setDisableCardFields(true);
    setLoading(false);
    card?.setCardEditMode(false);
    preventCardListScroll(false);
  };
  const handleDefinitionLetterCountChange = (count: number) => {
    setDefinitionLetterCount(count);
  };
  const getFontSizeClass = (textLength: number) => {
    if (textLength > 26) return styles.card_input_small;
    if (textLength > 14) return styles.card_input_medium;
    return styles.card_input_normal;
  };
  return (
    <>
      <div className={styles.card_term_side}>
        {cardList && <CardControls indexCard={indexCard} />}
        <div
          className={styles.card_term_input_wrapper}
          onTouchStart={() => onTouchTextEditor(true)}
          onTouchMove={() => onTouchTextEditor(true)}
          onTouchEnd={() => onTouchTextEditor(false)}
        >
          <input
            className={`${styles.card_input} ${getFontSizeClass(term.length)}`}
            value={term}
            onChange={handleChange}
            type='text'
            ref={inputEl}
            maxLength={CardFormFields.TERM_MAX_LENGTH}
            minLength={1}
            placeholder='Type term'
            readOnly={cardList && disableCardFields}
          />
        </div>
      </div>

      <div className={styles.card_definition_side}>
        {cardList && <CardControls indexCard={indexCard} />}
        <div className={styles.definition_card_header}></div>

        <div className={styles.definition_container}>
          <CardDefinition
            term={term}
            definition={definition}
            setDefinition={setDefinition}
            cardList={cardList}
            disableCardFields={disableCardFields}
            setDefinitionLetterCount={handleDefinitionLetterCountChange}
          />
        </div>

        <div className={styles.definition_card_footer}>
          {(!cardList || (cardList && card?.cardEditMode)) && !card?.lookup && (
            // TODO: Use CardButton component her
            <button
              disabled={definitionLetterCount < 2 || loading}
              className={styles.save_card}
              onClick={
                !card?.cardEditMode
                  ? () => handleAddIndexCard(term, definition)
                  : handleUpdateIndexCard
              }
            >
              {loading ? (
                <LoadingSpinner />
              ) : !card?.cardEditMode ? (
                'Save'
              ) : (
                'Update'
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default CardForm;
