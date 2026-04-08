/**
 * Mobile-aware viewport settings for framer-motion whileInView.
 * On touch devices, triggers animations 300px before entering the viewport
 * so content is already visible by the time you scroll to it.
 * On desktop, uses default behavior (triggers when element enters viewport).
 */

const isTouchDevice =
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: none) and (pointer: coarse)').matches;

/** Use this as the `viewport` prop on any motion element with whileInView */
export const mobileViewport = {
  once: true,
  margin: isTouchDevice ? '300px 0px' : '-50px',
} as const;
