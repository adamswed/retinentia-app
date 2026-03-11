import { ReactElement } from 'react';

export interface IndexCard {
  id: string;
  term: string;
  definition: string;
  created?: unknown;
  updated?: unknown;
}
export interface ErrorMessage {
  error: boolean;
  message: string;
}
type Payload = IndexCard | IndexCard[];

export interface ReducerAction {
  type: string;
  payload: Payload | number | boolean;
}

export interface InitialState {
  indexCards: IndexCard[];
  indexCardsLength?: number;
  indexCardListMode: boolean;
  preventScroll: boolean;
}

export interface Children {
  children?: ReactElement | ReactElement[];
}

export interface CardContext {
  state: InitialState;
  addIndexCard: (payload: IndexCard) => void;
  updateIndexCard: (payload: IndexCard) => void;
  deleteIndexCard: (payload: IndexCard) => void;
  addIndexCardList: (payload: IndexCard[]) => void;
  emptyIndexCardList: (payload: IndexCard[]) => void;
  setIndexCardListMode: (payload: boolean) => void;
  addIndexCardListLength: (payload: number) => void;
  preventCardListScroll: (payload: boolean) => void;
}
