'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { detectIsMobile, detectIsSafariDesktop } from '@/lib/utils';

const DeviceContext = createContext<{
  isMobile: boolean;
  isSafariDesktop: boolean;
}>({ isMobile: false, isSafariDesktop: false });

/**
 * DeviceProvider component
 *
 * Provides device type context (mobile or not) to the app using React context.
 * Detects device type on mount and updates context value.
 *
 * @param children - React children components.
 */
export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isSafariDesktop, setIsSafariDesktop] = useState(false);
  useEffect(() => {
    setIsMobile(detectIsMobile());
  }, []);

  useEffect(() => {
    setIsSafariDesktop(detectIsSafariDesktop());
  }, []);

  return (
    <DeviceContext.Provider value={{ isMobile, isSafariDesktop }}>
      {children}
    </DeviceContext.Provider>
  );
}

/**
 * Custom hook to access device context (isMobile).
 *
 * @returns Object with isMobile boolean.
 */
export function useDevice() {
  return useContext(DeviceContext);
}
