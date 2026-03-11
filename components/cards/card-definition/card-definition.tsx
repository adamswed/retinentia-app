'use client';

import { forwardRef, useContext, useEffect, useRef } from 'react';
import Image from 'next/image';
import lookupDefinitionIcon from '@/assets/lookup-definition-icon.svg';
import textToSpeechIcon from '@/assets/text-to-speech-icon.svg';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import styles from './card-definition.module.scss';
import cardContainerStyles from '@/styles/card-container.module.scss';
import { useCard } from '@/context/card-context';
import { useAuth } from '@/context/auth-context';
import { CardFormFields } from '@/models/card-form.model';
import { CardListContext } from '@/context/card-list-context';
import DefinitionLookup from '../../definition-lookup/definition-lookup';
import { useDevice } from '@/context/device-context';

// Dynamically import with forwardRef support
const ReactQuill = dynamic(
  () =>
    import('react-quill-new').then((mod) => {
      const QuillComponent = mod.default;
      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        default: forwardRef<any, any>((props: Record<string, unknown>, ref) => (
          <QuillComponent ref={ref} {...props} />
        )),
      };
    }),
  { ssr: false },
);

type CardDefinitionProps = {
  term: string;
  definition: string;
  setDefinition: (value: string) => void;
  cardList?: boolean;
  disableCardFields?: boolean;
  setDefinitionLetterCount?: (count: number) => void;
};

const CardDefinition: React.FC<CardDefinitionProps> = ({
  term,
  definition,
  setDefinition,
  cardList,
  disableCardFields,
  setDefinitionLetterCount,
}) => {
  const { state } = useContext(CardListContext);
  const card = useCard();
  const auth = useAuth();
  const mobileContext = useDevice();
  const isSafariDesktop = mobileContext.isSafariDesktop;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reactQuillRef = useRef<any>(null);
  // TODO: Update the naming of the cardList property as it is very confusing at the moment
  // cardList is passed from the CardContainer component to indicate if the card is the primary card or part of a list
  // So perhaps primaryCard or mainCard would be better names
  const isReadOnly =
    (!cardList && state.indexCardListMode) || (cardList && disableCardFields);
  const closeLookupRef = useRef<(() => void) | null>(null);
  useEffect(() => {}, [isReadOnly]);

  useEffect(() => {
    if (!isReadOnly && card?.cardTurnedToDefinition && reactQuillRef.current) {
      const timer = setTimeout(() => {
        const quillEditor = reactQuillRef.current?.getEditor();
        if (quillEditor) {
          quillEditor.focus();
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isReadOnly, card?.cardTurnedToDefinition]);

  /**
   * Handles changes to the definition editor and updates character count.
   *
   * @param value - The new definition value.
   */
  const handleChange = (value: string) => {
    const plainText = reactQuillRef.current?.getEditor().getText() ?? '';
    if (setDefinitionLetterCount) {
      setDefinitionLetterCount(plainText.length);
    }
    if (
      plainText.length <= CardFormFields.DEFINITION_MAX_LENGTH &&
      plainText.length >= 1
    ) {
      setDefinition(value);
    }
  };
  /**
   * Returns the appropriate font size class for the term based on its length.
   *
   * @param textLength - The length of the term text.
   * @returns The font size class name.
   */
  const getFontSizeClass = (textLength: number) => {
    if (textLength > 26) return cardContainerStyles.definition_side_term_small;
    if (textLength > 16) return cardContainerStyles.definition_side_term_medium;
    return cardContainerStyles.definition_side_term_normal;
  };
  const getContainerPositionClass = (textLength: number) => {
    if (textLength > 26) return cardContainerStyles.definition_container_raised;
  };
  /**
   * Handles touch events on the text editor to prevent unwanted swipe gestures.
   *
   * @param isTouching - Whether the editor is being touched.
   */
  const onTouchTextEditor = (isTouching: boolean) => {
    if ((!isReadOnly && card?.keyboardOpen) || card?.lookup) {
      card?.setStopSwipe(isTouching);
    }
  };
  const toggleDefLookup = () => {
    if (card?.lookup) {
      closeLookupRef.current?.();
    } else {
      card?.setLookup(true);
    }
  };
  const speakDefinition = () => {
    card?.setSpeechInProgress(true);
    const utterance = new SpeechSynthesisUtterance(term);
    utterance.onend = () => {
      card?.setSpeechInProgress(false);
    };
    window.speechSynthesis.speak(utterance);
  };
  return (
    <>
      <div
        className={`${
          cardContainerStyles.definition_term_container
        } ${getContainerPositionClass(term.length)}`}
      >
        <h2
          className={`${
            cardContainerStyles.definition_side_term
          } ${getFontSizeClass(term.length)}`}
        >
          {term}
        </h2>

        {!!auth?.currentUser && (
          <div className={cardContainerStyles.definition_side_term_icons}>
            <Image
              onClick={speakDefinition}
              className={`${cardContainerStyles.definition_side_term_icon} ${
                card?.speechInProgress && 'index-card-button-active'
              }`}
              src={textToSpeechIcon}
              alt={'Speak term'}
            />
            <Image
              onClick={toggleDefLookup}
              className={`${cardContainerStyles.definition_side_term_icon} ${
                card?.lookup && 'index-card-button-active'
              } `}
              src={lookupDefinitionIcon}
              alt={'Look up definition'}
            />
          </div>
        )}
      </div>

      {!!auth?.currentUser && (
        <div
          className={`${styles.card_definition_lookup}`}
          onTouchStart={() => onTouchTextEditor(true)}
          onTouchMove={() => onTouchTextEditor(true)}
          onTouchEnd={() => onTouchTextEditor(false)}
        >
          <DefinitionLookup
            term={term}
            onClose={(closeHandler) => (closeLookupRef.current = closeHandler)}
          />
        </div>
      )}
      <div
        className={`${styles.card_textarea}`}
        onTouchStart={() => onTouchTextEditor(true)}
        onTouchMove={() => onTouchTextEditor(true)}
        onTouchEnd={() => onTouchTextEditor(false)}
      >
        <ReactQuill
          className={`${styles.card_textarea_inner} ${
            card?.lookup && styles.text_editor_hidden
          } ${isReadOnly ? styles.card_textarea_inner_read_only : ''}  ${
            isSafariDesktop ? styles.safari_desktop : ''
          }`}
          ref={reactQuillRef}
          value={definition}
          onChange={handleChange}
          readOnly={isReadOnly}
          theme='snow'
          placeholder='Type Definition...'
          modules={{
            toolbar: isReadOnly
              ? false
              : [
                  ['bold', 'italic'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                ],
          }}
        />
        {isReadOnly && <div className={styles.definition_fadeout_footer}></div>}
      </div>
    </>
  );
};

export default CardDefinition;
