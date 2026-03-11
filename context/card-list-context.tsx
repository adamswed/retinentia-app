import { CARD_ACTIONS } from '@/models/actions.model';
import {
  CardContext,
  Children,
  IndexCard,
  InitialState,
  ReducerAction,
} from '@/models/index-cards.model';
import { createContext, useCallback, useReducer } from 'react';

const initialState: InitialState = {
  indexCards: [],
  indexCardsLength: 0,
  indexCardListMode: false,
  preventScroll: false,
};

export const CardListContext = createContext<CardContext>({
  state: initialState,
  addIndexCard: (_payload: IndexCard) => {},
  updateIndexCard: (_payload: IndexCard) => {},
  deleteIndexCard: (_payload: IndexCard) => {},
  addIndexCardList: (_payload: IndexCard[]) => {},
  addIndexCardListLength: (_payload: number) => {},
  emptyIndexCardList: (_payload: IndexCard[]) => {},
  setIndexCardListMode: (_payload: boolean) => {},
  preventCardListScroll: (_payload: boolean) => {},
});

/**
 * Reducer for index card list state management.
 * Handles actions for updating, adding, deleting, and managing card list state.
 *
 * @param state - Current state of the card list.
 * @param action - Action to perform on the state.
 * @returns Updated state after applying the action.
 */
const IndexCardReducer = (state: InitialState, action: ReducerAction) => {
  const { type, payload } = action;
  if (type === CARD_ACTIONS.ADD_CARD) {
    const newCard = payload as IndexCard;
    return {
      ...state,
      indexCards: [newCard, ...state.indexCards],
    };
  }
  if (type === CARD_ACTIONS.UPDATE_CARD) {
    if (typeof payload === 'object' && 'id' in payload) {
      const updatedList = state.indexCards.map((card) =>
        card.id === payload.id
          ? { ...card, term: payload.term, definition: payload.definition }
          : card
      );
      return {
        ...state,
        indexCards: updatedList,
      };
    }
  }
  if (type === CARD_ACTIONS.ADD_CARD_LIST_LENGTH) {
    const cardListLength = payload as number;
    return {
      ...state,
      indexCardsLength: cardListLength,
    };
  }
  if (type === CARD_ACTIONS.DELETE_CARD) {
    const indexCardArr = [...state.indexCards];
    if (typeof payload === 'object' && 'id' in payload) {
      const filteredItems = indexCardArr.filter(
        (item: IndexCard) => item.id !== payload.id
      );
      return {
        ...state,
        indexCards: filteredItems,
      };
    }
  }
  if (type === CARD_ACTIONS.ADD_CARD_LIST) {
    const newItems = Array.isArray(payload) ? payload : [];
    const existingIds = new Set(state.indexCards.map((item) => item.id));
    const filteredNewItems = newItems.filter(
      (item) => !existingIds.has(item.id)
    );
    const addedItems: IndexCard[] = [...state.indexCards, ...filteredNewItems]; // Add only unique items
    return {
      ...state,
      indexCards: addedItems,
    };
  }
  if (type === CARD_ACTIONS.SET_CARD_LIST_MODE) {
    return {
      ...state,
      indexCardListMode: payload as boolean,
    };
  }
  if (type === CARD_ACTIONS.EMPTY_CARD_LIST) {
    return {
      ...state,
      indexCards: [],
    };
  }
  if (type === CARD_ACTIONS.PREVENT_SCROLL) {
    return {
      ...state,
      preventScroll: payload as boolean,
    };
  }
  return state;
};

/**
 * CardListProvider component
 *
 * Provides context for managing the index card list, including CRUD operations and scroll/mode state.
 * Wraps children with CardListContext.Provider.
 *
 * @param children - React children components.
 */
const CardListProvider = ({ children }: Children) => {
  const [indexCardState, indexCardDispatch] = useReducer(
    IndexCardReducer,
    initialState
  );
  /**
   * Dispatches add action for a card in the list.
   * @param payload - Card to add.
   */
  const handleAddCard = (payload: IndexCard) => {
    indexCardDispatch({
      type: CARD_ACTIONS.ADD_CARD,
      payload,
    });
  };
  /**
   * Dispatches update action for a card in the list.
   * @param payload - Card to update.
   */
  const handleUpdateCard = (payload: IndexCard) => {
    indexCardDispatch({
      type: CARD_ACTIONS.UPDATE_CARD,
      payload,
    });
  };
  /**
   * Dispatches action to update the card list length.
   * @param payload - New card list length.
   */
  const handleIndexCardListLength = useCallback((payload: number) => {
    indexCardDispatch({
      type: CARD_ACTIONS.ADD_CARD_LIST_LENGTH,
      payload,
    });
  }, []);
  /**
   * Dispatches delete action for a card in the list.
   * @param payload - Card to delete.
   */
  const handleDeleteIndexCard = (payload: IndexCard) => {
    indexCardDispatch({
      type: CARD_ACTIONS.DELETE_CARD,
      payload,
    });
  };
  /**
   * Dispatches action to add cards to the list.
   * @param payload - Array of cards to add.
   */
  const handleAddToCardList = (payload: IndexCard[]) => {
    indexCardDispatch({
      type: CARD_ACTIONS.ADD_CARD_LIST,
      payload,
    });
  };
  /**
   * Dispatches action to set card list mode.
   * @param payload - Boolean for card list mode.
   */
  const handleCardListMode = (payload: boolean) => {
    indexCardDispatch({
      type: CARD_ACTIONS.SET_CARD_LIST_MODE,
      payload,
    });
  };
  /**
   * Dispatches action to empty the card list.
   * @param payload - Array of cards (should be empty).
   */
  const handleEmptyToCardList = useCallback((payload: IndexCard[]) => {
    indexCardDispatch({
      type: CARD_ACTIONS.EMPTY_CARD_LIST,
      payload,
    });
  }, []);
  /**
   * Dispatches action to prevent or allow card list scroll.
   * @param payload - Boolean to prevent scroll.
   */
  const handlePreventCardListScroll = (payload: boolean) => {
    indexCardDispatch({
      type: CARD_ACTIONS.PREVENT_SCROLL,
      payload,
    });
  };

  const cardValue: CardContext = {
    state: indexCardState,
    addIndexCard: handleAddCard,
    updateIndexCard: handleUpdateCard,
    deleteIndexCard: handleDeleteIndexCard,
    addIndexCardList: handleAddToCardList,
    emptyIndexCardList: handleEmptyToCardList,
    setIndexCardListMode: handleCardListMode,
    addIndexCardListLength: handleIndexCardListLength,
    preventCardListScroll: handlePreventCardListScroll,
  };

  return (
    <CardListContext.Provider value={cardValue}>
      {children}
    </CardListContext.Provider>
  );
};

export default CardListProvider;
