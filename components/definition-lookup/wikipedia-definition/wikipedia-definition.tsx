import LookupSkeletonLoading from '@/components/shared/skeleton-loading/lookup-skeleton-loading/lookup-skeleton-loading';
import styles from '../definition-lookup.module.scss';
import { DEFINITION_LOOKUP_SOURCE } from '@/models/definition-lookup.model';
import Image from 'next/image';
import copy from '@/assets/copy.svg';
import copied from '@/assets/copied.svg';
type WikipediaDefinitionProps = {
  divRef: React.RefObject<HTMLDivElement>;
  expandWikipediaDefinition: boolean;
  wiktipediaParsedSections: { heading: string; content: string }[];
  previewLookup: (
    def: string,
    fullLengthDef?: number,
  ) => {
    previewDef: string;
    showMoreButton: boolean;
  };
  setExpandWikipediaDefinition: React.Dispatch<React.SetStateAction<boolean>>;
  lookupLoading: boolean;
  copyToClipboard: (textToCopy: string, source: string) => Promise<void>;
  isCopied: boolean;
};
const WikipediaDefinition: React.FC<WikipediaDefinitionProps> = ({
  divRef,
  expandWikipediaDefinition,
  wiktipediaParsedSections,
  previewLookup,
  setExpandWikipediaDefinition,
  lookupLoading,
  copyToClipboard,
  isCopied,
}) => {
  const { previewDef, showMoreButton } = previewLookup(
    wiktipediaParsedSections[0]?.content,
    wiktipediaParsedSections
      .map((section) =>
        section.heading
          ? `${section.heading}\n${section.content}`
          : section.content,
      )
      .join('\n').length,
  );
  const showMoreButtonElm = (
    <span
      onClick={() => setExpandWikipediaDefinition(true)}
      className={styles.expand_definition}
    >
      ...More
    </span>
  );
  return (
    <>
      {(wiktipediaParsedSections.length > 0 || lookupLoading) && (
        <div className={styles.definition_divider}></div>
      )}
      <div
        ref={divRef}
        className={`${styles.definition_container} ${
          expandWikipediaDefinition ? styles.definition_container_expanded : ''
        }`}
      >
        {lookupLoading ? (
          <LookupSkeletonLoading />
        ) : (
          wiktipediaParsedSections.length > 0 && (
            <>
              <div className={styles.definition_main_heading}>
                <span>Wikipedia</span>
                <div className={styles.copy_icon_wrapper}>
                  <Image
                    className={`${styles.copy_icon} ${
                      isCopied
                        ? styles.copy_icon_hidden
                        : styles.copy_icon_visible
                    }`}
                    onClick={() =>
                      copyToClipboard(
                        wiktipediaParsedSections
                          .map((section) =>
                            section.heading
                              ? `${section.heading}\n${section.content}`
                              : section.content,
                          )
                          .join('\n'),
                        DEFINITION_LOOKUP_SOURCE.WIKIPEDIA,
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
              {!expandWikipediaDefinition ? (
                <div className={styles.definition_section}>
                  {wiktipediaParsedSections[0].heading && (
                    <div className={styles.definition_heading}>
                      {wiktipediaParsedSections[0].heading}
                    </div>
                  )}
                  <>{previewDef}</>
                </div>
              ) : (
                wiktipediaParsedSections.map(
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
              {!expandWikipediaDefinition &&
                showMoreButton &&
                showMoreButtonElm}
            </>
          )
        )}
      </div>
    </>
  );
};

export default WikipediaDefinition;
