import LookupSkeletonLoading from '@/components/shared/skeleton-loading/lookup-skeleton-loading/lookup-skeleton-loading';
import styles from '../definition-lookup.module.scss';
import { DEFINITION_LOOKUP_SOURCE } from '@/models/definition-lookup.model';
import Image from 'next/image';
import copy from '@/assets/copy.svg';
import copied from '@/assets/copied.svg';
type WiktionaryDefinitionProps = {
  divRef: React.RefObject<HTMLDivElement>;
  expandWiktionaryDefinition: boolean;
  wiktionaryParsedSections: { heading: string; content: string }[];
  previewLookup: (
    def: string,
    fullLengthDef?: number,
  ) => {
    previewDef: string;
    showMoreButton: boolean;
  };
  setExpandWiktionaryDefinition: React.Dispatch<React.SetStateAction<boolean>>;
  lookupLoading: boolean;
  copyToClipboard: (textToCopy: string, source: string) => Promise<void>;
  isCopied: boolean;
};
const WiktionaryDefinition: React.FC<WiktionaryDefinitionProps> = ({
  divRef,
  expandWiktionaryDefinition,
  wiktionaryParsedSections,
  previewLookup,
  setExpandWiktionaryDefinition,
  lookupLoading,
  copyToClipboard,
  isCopied,
}) => {
  const { previewDef, showMoreButton } = previewLookup(
    wiktionaryParsedSections[0]?.content,
    wiktionaryParsedSections
      .map((section) =>
        section.heading
          ? `${section.heading}\n${section.content}`
          : section.content,
      )
      .join('\n').length,
  );
  const showButtonElem = (
    <span
      onClick={() => setExpandWiktionaryDefinition(true)}
      className={styles.expand_definition}
    >
      ...More
    </span>
  );
  return (
    <>
      {(wiktionaryParsedSections.length > 0 || lookupLoading) && (
        <div className={styles.definition_divider}></div>
      )}
      <div
        ref={divRef}
        className={`${styles.definition_container} ${
          expandWiktionaryDefinition ? styles.definition_container_expanded : ''
        }`}
      >
        {lookupLoading ? (
          <LookupSkeletonLoading />
        ) : (
          wiktionaryParsedSections.length > 0 && (
            <>
              <div className={styles.definition_main_heading}>
                <span>Wiktionary</span>
                <div className={styles.copy_icon_wrapper}>
                  <Image
                    className={`${styles.copy_icon} ${
                      isCopied
                        ? styles.copy_icon_hidden
                        : styles.copy_icon_visible
                    }`}
                    onClick={() =>
                      copyToClipboard(
                        wiktionaryParsedSections
                          .map((section) =>
                            section.heading
                              ? `${section.heading}\n${section.content}`
                              : section.content,
                          )
                          .join('\n'),
                        DEFINITION_LOOKUP_SOURCE.WIKTIONARY,
                      )
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
              {!expandWiktionaryDefinition ? (
                <div className={styles.definition_section}>
                  {wiktionaryParsedSections[0].heading && (
                    <div className={styles.definition_heading}>
                      {wiktionaryParsedSections[0].heading}
                    </div>
                  )}
                  <>{previewDef}</>
                </div>
              ) : (
                wiktionaryParsedSections.map(
                  (
                    section: { heading: string; content: string },
                    idx: number,
                  ) => (
                    <div key={idx} className={styles.definition_section}>
                      {section.heading && (
                        <div className={styles.definition_heading}>
                          {section.heading}
                        </div>
                      )}
                      <>{section.content}</>
                    </div>
                  ),
                )
              )}
              {wiktionaryParsedSections.length > 0 &&
                !expandWiktionaryDefinition &&
                showMoreButton &&
                showButtonElem}
            </>
          )
        )}
      </div>
    </>
  );
};

export default WiktionaryDefinition;
