import { useState, useEffect, useMemo } from 'react';

/**
 * Mobile-aware viewport settings for framer-motion whileInView.
 * On touch devices, triggers animations 300px before entering the viewport
 * so content is already visible by the time you scroll to it.
 * On desktop, uses default behavior (triggers when element enters viewport).
 *
 * Returns a stable object via hook to avoid hydration mismatch —
 * server/prerender always sees the desktop default, then the client
 * updates after mount if it detects a touch device.
 */

/** Static default used during SSR/prerender and desktop clients */
export const mobileViewport = {
  once: true,
  margin: '-50px',
} as const;

/** Hook that returns touch-aware viewport settings (safe for hydration) */
export function useMobileViewport() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(
      window.matchMedia('(hover: none) and (pointer: coarse)').matches
    );
  }, []);

  return useMemo(
    () => ({
      once: true,
      margin: isTouchDevice ? '300px 0px' : '-50px',
    }),
    [isTouchDevice]
  );
}
