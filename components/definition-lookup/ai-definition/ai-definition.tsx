import LookupSkeletonLoading from '@/components/shared/skeleton-loading/lookup-skeleton-loading/lookup-skeleton-loading';
import styles from '../definition-lookup.module.scss';
import {
  DEFINITION_LOOKUP,
  DEFINITION_LOOKUP_SOURCE,
} from '@/models/definition-lookup.model';
import Image from 'next/image';
import geminiIcon from '@/assets/gemini-icon-logo.svg';
import copy from '@/assets/copy.svg';
import copied from '@/assets/copied.svg';
type AiDefinitionProps = {
  divRef: React.RefObject<HTMLDivElement>;
  expandAIDefinition: boolean;
  aiDefinition: string | null;
  previewLookup: (def: string) => {
    previewDef: string;
    showMoreButton: boolean;
  };
  setExpandAIDefinition: React.Dispatch<React.SetStateAction<boolean>>;
  lookupAILoading: boolean;
  copyToClipboard: (textToCopy: string, source: string) => Promise<void>;
  isCopied: boolean;
};

const AiDefinition: React.FC<AiDefinitionProps> = ({
  divRef,
  expandAIDefinition,
  aiDefinition,
  previewLookup,
  setExpandAIDefinition,
  lookupAILoading,
  copyToClipboard,
  isCopied,
}) => {
  const { previewDef, showMoreButton } = previewLookup(aiDefinition || '');
  const showMoreButtonElm = (
    <span
      onClick={() => setExpandAIDefinition(true)}
      className={styles.expand_definition}
    >
      ...More
    </span>
  );
  return (
    <div
      ref={divRef}
      className={`${styles.definition_container} ${styles.ai_definition_container} ${
        expandAIDefinition ? styles.definition_container_expanded : ''
      }`}
    >
      {lookupAILoading ? (
        <LookupSkeletonLoading />
      ) : (
        <>
          {aiDefinition && aiDefinition.length > 0 && (
            <div className={`${styles.definition_section}`}>
              <div className={styles.definition_main_heading}>
                <Image
                  className={styles.gemini_icon}
                  src={geminiIcon}
                  alt={'Gemini AI icon'}
                />
                <div className={styles.copy_icon_wrapper}>
                  <Image
                    className={`${styles.copy_icon} ${
                      isCopied
                        ? styles.copy_icon_hidden
                        : styles.copy_icon_visible
                    }`}
                    onClick={() =>
                      copyToClipboard(aiDefinition, DEFINITION_LOOKUP_SOURCE.AI)
                    }
                    src={copy}
                    alt={'Copy to clipboard'}
                  />
                  <Image
                    className={`${styles.copy_icon} ${styles.copied_icon} ${
                      isCopied
                        ? styles.copy_icon_visible
                        : styles.copy_icon_hidden
                    }`}
                    src={copied}
                    alt={'Copied to clipboard'}
                  />
                </div>
              </div>
              <>
                {aiDefinition &&
                aiDefinition.length >
                  DEFINITION_LOOKUP.LG_LOOKUP_PREVIEW_LIMIT &&
                !expandAIDefinition
                  ? previewDef
                  : aiDefinition}
              </>
            </div>
          )}
          {aiDefinition &&
            aiDefinition.length > 0 &&
            aiDefinition.length > DEFINITION_LOOKUP.LG_LOOKUP_PREVIEW_LIMIT &&
            showMoreButton &&
            !expandAIDefinition &&
            showMoreButtonElm}
        </>
      )}
    </div>
  );
};

export default AiDefinition;
