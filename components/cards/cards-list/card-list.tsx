'use client';
import { CardListContext } from '@/context/card-list-context';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import styles from './card-list.module.scss';
import CardContainer from '../card-container/card-container';
import { ErrorMessage, IndexCard } from '@/models/index-cards.model';
import { getIndexCards, getIndexCardsLength } from '../../../actions/card-list';
import { CARD_LIST_QUERY } from '@/models/index-card-list.model';
import { useAuth } from '@/context/auth-context';
import CardListButton from '../card-list-button/card-list-button';
import { CardProvider } from '@/context/card-context';
import CardSkeletonLoading from '../../shared/skeleton-loading/card-skeleton-loading/card-skeleton-loading';
import { useMessageModal } from '@/context/message-modal-context';

const CardList = () => {
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const canLoadRef = useRef(true);
  const [loading, setLoading] = useState(false);
  const [scrollLoading, setScrollLoading] = useState(false);
  const {
    state,
    addIndexCardList,
    addIndexCardListLength,
    setIndexCardListMode,
    preventCardListScroll,
  } = useContext(CardListContext);
  const auth = useAuth();
  const modal = useMessageModal();
  const getIndexCardsData = useCallback(
    async (cardLimit: number) => {
      if (!canLoadRef.current) {
        return;
      }
      canLoadRef.current = false;
      let offset =
        state.indexCards.length > 0
          ? state.indexCards.length - CARD_LIST_QUERY.CARD_LIMIT
          : 0;
      if (offset < 0) {
        offset = 0;
      }
      const response: IndexCard[] | ErrorMessage =
        (await getIndexCards(cardLimit, offset)) || [];
      if (!Array.isArray(response) && response.error) {
        setLoading(false);
        modal?.openModal('Unable to fetch cards. Please try again.');
        return;
      }

      if (Object.keys(response).length === 0) {
        return;
      }

      addIndexCardList(response as IndexCard[]);
      setTimeout(() => {
        setLoading(false);
        setScrollLoading(false);
      }, 110);
      // Make sure the card list fetch is called only once per scroll
      setTimeout(() => {
        canLoadRef.current = true;
      }, 1000);
    },
    [addIndexCardList, modal, state.indexCards.length]
  );

  const handleScroll = useCallback(() => {
    const divElement = drawerRef.current;
    if (divElement) {
      if (
        divElement.scrollTop + divElement.clientHeight >=
          divElement.scrollHeight - 100 &&
        state.indexCardListMode === true
      ) {
        if (state.indexCards.length < (state.indexCardsLength ?? 0)) {
          if (canLoadRef.current) {
            setLoading(true);
            setScrollLoading(true);
            getIndexCardsData(CARD_LIST_QUERY.CARD_LIMIT * 2);
          }
        }
      }
    }
  }, [
    getIndexCardsData,
    state.indexCardListMode,
    state.indexCards.length,
    state.indexCardsLength,
  ]);

  useEffect(() => {
    const scrollableDiv = drawerRef?.current;
    if (scrollableDiv) {
      if (state.indexCardListMode) {
        // Delay when drawer is opening
        const timeoutId = setTimeout(() => {
          scrollableDiv.addEventListener('scroll', handleScroll);
        }, 300);

        return () => {
          clearTimeout(timeoutId);
          scrollableDiv.removeEventListener('scroll', handleScroll);
        };
      } else {
        // Remove listener immediately when closing
        scrollableDiv.removeEventListener('scroll', handleScroll);
      }
    }
  }, [handleScroll, state.indexCardListMode, state.indexCards.length]);

  const getIndexCardsDataLength = useCallback(async () => {
    const length = await getIndexCardsLength();
    if (!length) return;
    addIndexCardListLength(length);
  }, [addIndexCardListLength]);

  useEffect(() => {
    if (auth?.currentUser) {
      getIndexCardsDataLength();
    }
  }, [auth?.currentUser, getIndexCardsDataLength]);

  // When the list is empty and the drawer is open, fetch card length and cards
  useEffect(() => {
    const fetchCardsAndLength = async () => {
      if (
        canLoadRef.current &&
        state.indexCardListMode &&
        // When only one card is present, fetch again to avoid empty list after deletion
        (state.indexCards.length === 0 || state.indexCards.length === 1)
      ) {
        setLoading(true);
        await getIndexCardsDataLength();
        await getIndexCardsData(CARD_LIST_QUERY.CARD_LIMIT);
      }
    };
    fetchCardsAndLength();
  }, [
    getIndexCardsData,
    getIndexCardsDataLength,
    state.indexCardListMode,
    state.indexCards.length,
  ]);

  useEffect(() => {
    if (state.indexCardListMode === true && state.preventScroll) {
      drawerRef?.current?.classList.add(styles.card_drawer_open_no_scroll);
    } else {
      drawerRef?.current?.classList.remove(styles.card_drawer_open_no_scroll);
    }
  }, [state.indexCardListMode, state.preventScroll]);

  useEffect(() => {
    if (state.indexCardListMode) {
      drawerRef?.current?.classList.remove(styles.card_drawer_closed);
      drawerRef?.current?.classList.add(styles.card_drawer_open);
    } else {
      // Delay removing open class to allow close animation
      setTimeout(() => {
        drawerRef?.current?.classList.remove(styles.card_drawer_open);
      }, 150);
      drawerRef?.current?.classList.add(styles.card_drawer_closed);
    }
  }, [state.indexCardListMode]);

  const showCardList = () => {
    preventCardListScroll(false);
    drawerRef?.current?.classList.remove(styles.card_drawer_open_no_scroll);
    setIndexCardListMode(!state.indexCardListMode);
  };
  return (
    <>
      <div ref={drawerRef} className={styles.card_list_drawer}>
        {loading && <CardSkeletonLoading scrollLoading={scrollLoading} />}
        {state.indexCards.map((indexCard: IndexCard) => {
          return (
            <div className={styles.card_list_container} key={indexCard.id}>
              <CardProvider>
                <CardContainer indexCard={indexCard} cardList={true} />
              </CardProvider>
            </div>
          );
        })}
        <div className={styles.drawer_divider} onClick={() => showCardList()}>
          <div className={styles.drawer_divider_border} />
        </div>
      </div>
      <CardListButton
        indexCardsLength={state.indexCardsLength}
        indexCardListMode={state.indexCardListMode}
        showCardList={showCardList}
      />
    </>
  );
};

export default CardList;
