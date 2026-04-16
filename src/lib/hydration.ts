// When true, framer-motion components use `initial={false}` to skip entrance
// animations. Set during:
//   1. Prerender — so Puppeteer captures elements at their final `animate`
//      state (opacity: 1) instead of mid-animation (opacity: 0).
//   2. Hydration — so React doesn't see a mismatch between the prerendered
//      DOM (opacity: 1) and framer-motion's `initial` (opacity: 0).
// Cleared by App's first useEffect, so subsequent SPA navigations animate.
export let skipInitialAnimations = false;

export function setSkipInitialAnimations(value: boolean) {
  skipInitialAnimations = value;
}
