import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';

type CardContextType = {
  showFlipIcon: boolean;
  cardTurnedToDefinition: boolean;
  cardEditMode: boolean | null;
  cardTurnAnimation: number;
  cardDeleting: boolean | null;
  cardButtonDeleteActive: boolean | null;
  stopSwipe: boolean;
  lookup: boolean;
  speechInProgress: boolean;
  keyboardOpen: boolean;
  cardRef: React.RefObject<HTMLDivElement> | undefined;
  onAddIndexCardComplete: () => void;
  setShowFlipIcon: (value: boolean) => void;
  setCardTurn: (value: boolean) => void;
  setCardEditMode: (value: boolean | null) => void;
  setCardButtonDeleteActive: (value: boolean | null) => void;
  setCardDeleting: (value: boolean | null) => void;
  setCardTurnAnimation: (value: number) => void;
  setLookup: (value: boolean) => void;
  setStopSwipe: (value: boolean) => void;
  setSpeechInProgress: (value: boolean) => void;
  setKeyboardOpen: (value: boolean) => void;
  showOrientationTour: boolean;
  notifyTermTyping: () => void;
};

const CardContext = createContext<CardContextType | null>(null);

/**
 * CardProvider component
 *
 * Provides card state and actions for index card interactions, including flip, edit, delete, swipe, and lookup.
 * Integrates with React context and exposes state setters and helpers.
 *
 * @param children - React children components.
 */
export const CardProvider = ({ children }: { children: React.ReactNode }) => {
  const [showFlipIcon, setShowFlipIcon] = useState(false);
  const [cardTurnedToDefinition, setCardTurn] = useState(false);
  const [cardEditMode, setCardEditMode] = useState<boolean | null>(null);
  const [cardButtonDeleteActive, setCardButtonDeleteActive] = useState<
    boolean | null
  >(null);
  const [cardDeleting, setCardDeleting] = useState<boolean | null>(null);
  const [cardTurnAnimation, setCardTurnAnimation] = useState(0);
  const [stopSwipe, setStopSwipe] = useState(false);
  const [lookup, setLookup] = useState<boolean>(false);
  const [speechInProgress, setSpeechInProgress] = useState<boolean>(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [showOrientationTour, setShowOrientationTour] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  // Orientation tour
  const orientationTourTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const tourDone = useRef(false);
  const tourInitialized = useRef(false);
  useEffect(() => {
    tourDone.current = localStorage.getItem('firstLoggedIn') === 'false';
  }, []);

  /**
   * Debounced handler called on every term keystroke.
   * Once the user stops typing, shows the orientation tour if this is the user's first login.
   */
  const notifyTermTyping = useCallback(() => {
    if (tourDone.current) return;
    if (!tourInitialized.current) {
      tourInitialized.current = true;
      localStorage.setItem('firstLoggedIn', 'true');
    }
    if (orientationTourTimeout.current) {
      clearTimeout(orientationTourTimeout.current);
    }
    orientationTourTimeout.current = setTimeout(() => {
      setShowOrientationTour(true);
      setTimeout(() => {
        setShowOrientationTour(false);
        tourDone.current = true;
        localStorage.setItem('firstLoggedIn', 'false');
      }, 2200);
    }, 2000);
  }, []);
  // If the user flips the card on their own, they don't need the hints — cancel and suppress them
  useEffect(() => {
    if (cardTurnedToDefinition && !tourDone.current) {
      tourDone.current = true;
      localStorage.setItem('firstLoggedIn', 'false');
      if (orientationTourTimeout.current) {
        clearTimeout(orientationTourTimeout.current);
        orientationTourTimeout.current = null;
      }
      setShowOrientationTour(false);
    }
  }, [cardTurnedToDefinition]);
  /**
   * Handles completion of adding a new index card.
   * Resets card state and flip icon if card was turned to definition.
   */
  const onAddIndexCardComplete = () => {
    if (cardTurnedToDefinition) {
      const newRotation = cardTurnAnimation - 180;
      setCardTurnAnimation(newRotation);
      setCardTurn(false);
      setShowFlipIcon(false);
    }
  };
  // Detect if keyboard is open on mobile devices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const threshold = window.screen.height * 0.7;

    const handleResize = () => {
      const viewportHeight =
        window.visualViewport?.height ?? window.innerHeight;
      setKeyboardOpen(viewportHeight < threshold);
    };

    window.visualViewport.addEventListener('resize', handleResize);
    window.visualViewport.addEventListener('scroll', handleResize); // sometimes needed on iOS

    // Run once on mount
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

  return (
    <CardContext.Provider
      value={{
        showFlipIcon,
        cardTurnedToDefinition,
        cardEditMode,
        cardTurnAnimation,
        cardDeleting,
        cardButtonDeleteActive,
        stopSwipe,
        lookup,
        speechInProgress,
        keyboardOpen,
        cardRef, // Pass the ref in the context value
        onAddIndexCardComplete,
        setShowFlipIcon,
        setCardTurn,
        setCardEditMode,
        setCardDeleting,
        setCardButtonDeleteActive,
        setCardTurnAnimation,
        setStopSwipe,
        setLookup,
        setSpeechInProgress,
        setKeyboardOpen,
        showOrientationTour,
        notifyTermTyping,
      }}
    >
      {children}
    </CardContext.Provider>
  );
};

/**
 * Custom hook to access card context state and actions.
 *
 * @returns The card context value.
 */
export const useCard = () => useContext(CardContext);
/**
 * Custom hook to access card actions, specifically flip icon state.
 * Throws if used outside CardProvider.
 *
 * @returns Object with setShowFlipIcon function.
 */
export const useCardActions = () => {
  const ctx = useContext(CardContext);
  if (!ctx) throw new Error('useCardActions must be used inside CardProvider');
  return {
    setShowFlipIcon: ctx.setShowFlipIcon,
  };
};
