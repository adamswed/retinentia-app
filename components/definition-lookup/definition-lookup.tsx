import { useCallback, useEffect, useRef, useState } from 'react';
import { getAIDefinition, getDefinition } from '../../actions/definition-lookup';
import Image from 'next/image';
import styles from './definition-lookup.module.scss';
import closeLookupDefinition from '@/assets/close-icon.svg';
import { useCard } from '@/context/card-context';
import {
  parseWikipediaDefinition,
  parseWiktionaryDefinition,
} from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import {
  DEFINITION_LOOKUP,
  DEFINITION_LOOKUP_SOURCE,
} from '@/models/definition-lookup.model';
import { useDevice } from '@/context/device-context';
import WikipediaDefinition from './wikipedia-definition/wikipedia-definition';
import WiktionaryDefinition from './wiktionary-definition/wiktionary-definition';
import AiDefinition from './ai-definition/ai-definition';

type DefinitionLookupProps = {
  term: string;
  onClose: (closeHandler: () => void) => void;
};

const DefinitionLookup: React.FC<DefinitionLookupProps> = ({
  term,
  onClose,
}) => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const card = useCard();
  const auth = useAuth();
  const mobileContext = useDevice();
  const isSafariDesktop = mobileContext.isSafariDesktop;
  const lookupRef = useRef<HTMLDivElement | null>(null);
  const [lookupLoading, setLookupLoading] = useState<boolean>(false);
  const [lookupAILoading, setLookupAILoading] = useState<boolean>(false);
  const [wiktionaryParsedSections, setWiktionaryParsedSections] = useState<
    { heading: string; content: string }[]
  >([]);
  const [wikipediaParsedSections, setWikipediaParsedSections] = useState<
    { heading: string; content: string }[]
  >([]);
  const [expandAIDefinition, setExpandAIDefinition] = useState<boolean>(false);
  const [expandWiktionaryDefinition, setExpandWiktionaryDefinition] =
    useState<boolean>(false);
  const [expandWikipediaDefinition, setExpandWikipediaDefinition] =
    useState<boolean>(false);
  const [aiDefinition, setAIDefinition] = useState<string | null>(null);
  const [savedTerm, setSavedTerm] = useState<string | null>(null);
  const [divWidth, setDivWidth] = useState<number>(0);
  const [copiedSource, setCopiedSource] = useState<string | null>(null);

  /**
   * Fetches the classic Wiktionary definition for the given term.
   *
   * @param term - The word to look up.
   */
  const lookupWikimediaDefinition = useCallback(
    async (term: string, source: string) => {
      const token = await auth?.currentUser?.getIdToken();
      if (!token) {
        return;
      }
      setLookupLoading(true);
      const definition = await getDefinition(term, token, source);
      if (!definition) return;
      if (source === DEFINITION_LOOKUP_SOURCE.WIKTIONARY) {
        setWiktionaryParsedSections(parseWiktionaryDefinition(definition));
      } else {
        setWikipediaParsedSections(parseWikipediaDefinition(definition));
      }
      setLookupLoading(false);
    },
    [auth?.currentUser],
  );

  /**
   * Fetches an AI-generated definition for the given term using Gemini AI.
   *
   * @param term - The word to look up.
   */
  const getAiDefinition = useCallback(
    async (term: string) => {
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;
      if (!term) {
        setAIDefinition(null);
        return;
      }

      setLookupAILoading(true);
      setAIDefinition(null);

      const res = await getAIDefinition(term, token);
      if (res) {
        setAIDefinition(res);
      }
      setLookupAILoading(false);
    },
    [auth?.currentUser],
  );

  useEffect(() => {
    const fetchDefinitions = async () => {
      if (card?.lookup && term !== savedTerm) {
        // Start AI definition immediately (doesn't need Wikimedia token)
        getAiDefinition(term);
        // Fetch Wikimedia sources sequentially to ensure token is cached before second call
        await lookupWikimediaDefinition(
          term,
          DEFINITION_LOOKUP_SOURCE.WIKTIONARY,
        );
        await lookupWikimediaDefinition(
          term,
          DEFINITION_LOOKUP_SOURCE.WIKIPEDIA,
        );
        setSavedTerm(term);
      }
    };

    fetchDefinitions();
  }, [
    card?.lookup,
    getAiDefinition,
    lookupWikimediaDefinition,
    term,
    savedTerm,
  ]);

  useEffect(() => {
    if (!card) return;
    if (!card.cardTurnedToDefinition) {
      card.setLookup(false);
      setExpandAIDefinition(false);
      setExpandWiktionaryDefinition(false);
      setExpandWikipediaDefinition(false);
    }
  }, [card]);

  // Update div width when component mounts and when lookup state changes
  useEffect(() => {
    if (divRef.current) {
      setDivWidth(divRef.current.offsetWidth);
    }
  }, [card?.lookup, wiktionaryParsedSections, aiDefinition]);

  const closeLookup = useCallback(() => {
    lookupRef?.current?.classList.add(styles.close_lookup_definition_animation);
    setTimeout(() => {
      lookupRef?.current?.classList.remove(
        styles.close_lookup_definition_animation,
      );
      card?.setLookup(false);
    }, 300);
  }, [card]);

  useEffect(() => {
    onClose(closeLookup);
  }, [closeLookup, onClose]);
  const previewLookup = (def: string, fullLengthDef?: number) => {
    let showMoreButton = true;
    let limit = DEFINITION_LOOKUP.LG_LOOKUP_PREVIEW_LIMIT;
    if (divWidth > 0) {
      if (divWidth < 540) {
        limit = DEFINITION_LOOKUP.MD_LOOKUP_PREVIEW_LIMIT;
      }
      if (divWidth < 500) {
        limit = DEFINITION_LOOKUP.SM_LOOKUP_PREVIEW_LIMIT;
      }
    }

    if (fullLengthDef !== undefined && fullLengthDef <= limit) {
      showMoreButton = false;
    }
    const previewDef = def
      ?.split(' ')
      .reduce((acc: string, word: string, index: number) => {
        const testString = acc + (index > 0 ? ' ' : '') + word;
        return testString.length <= limit ? testString : acc;
      }, '');
    return { previewDef, showMoreButton };
  };
  const copyToClipboard = useCallback(
    async (textToCopy: string, source: string) => {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopiedSource(source);
        setTimeout(() => setCopiedSource(null), 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    },
    [],
  );
  return (
    <div
      ref={lookupRef}
      className={`${styles.definition_lookup_container} ${
        card?.lookup ? styles.definition_lookup_container_active : ''
      }`}
    >
      {card?.lookup && (
        <div
          className={`${styles.definition_lookup_wrapper} ${
            isSafariDesktop ? styles.safari_desktop : ''
          }`}
        >
          <div
            className={styles.definition_lookup_header}
            onClick={() => closeLookup()}
          >
            <Image
              src={closeLookupDefinition}
              className={styles.close_lookup_definition_icon}
              alt={'Close definition lookup definition'}
            />
          </div>

          <div className={styles.definition_lookup_content}>
            <AiDefinition
              divRef={divRef}
              expandAIDefinition={expandAIDefinition}
              aiDefinition={aiDefinition}
              previewLookup={previewLookup}
              setExpandAIDefinition={setExpandAIDefinition}
              lookupAILoading={lookupAILoading}
              copyToClipboard={copyToClipboard}
              isCopied={copiedSource === DEFINITION_LOOKUP_SOURCE.AI}
            />
            <WiktionaryDefinition
              divRef={divRef}
              expandWiktionaryDefinition={expandWiktionaryDefinition}
              wiktionaryParsedSections={wiktionaryParsedSections}
              previewLookup={previewLookup}
              setExpandWiktionaryDefinition={setExpandWiktionaryDefinition}
              lookupLoading={lookupLoading}
              copyToClipboard={copyToClipboard}
              isCopied={copiedSource === DEFINITION_LOOKUP_SOURCE.WIKTIONARY}
            />
            <WikipediaDefinition
              divRef={divRef}
              expandWikipediaDefinition={expandWikipediaDefinition}
              wiktipediaParsedSections={wikipediaParsedSections}
              previewLookup={previewLookup}
              setExpandWikipediaDefinition={setExpandWikipediaDefinition}
              lookupLoading={lookupLoading}
              copyToClipboard={copyToClipboard}
              isCopied={copiedSource === DEFINITION_LOOKUP_SOURCE.WIKIPEDIA}
            />
          </div>
          <div className={styles.definition_lookup_fadeout_footer}></div>
        </div>
      )}
    </div>
  );
};
export default DefinitionLookup;
