import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { initAnalytics } from './lib/analytics'
import { initMarketingPixels } from './lib/marketing-pixels'
import { setSkipInitialAnimations } from './lib/hydration'
import App from './App.tsx'

// Defer PostHog + marketing pixels (Meta, LinkedIn, RB2B, Apollo) until the
// browser is idle. Each of these pulls a ~30-140KB script that contends with
// the LCP image and critical JS bundle on mobile. requestIdleCallback fires
// as soon as the main thread is free; the 1500ms timeout is a hard ceiling
// so analytics still kick in on busy pages. Events fired before init no-op
// cleanly (every tracker guards with a typeof check), so early clicks just
// don't show up in pixel data — an accepted trade for lower TBT. GA4's
// gtag.js stays in index.html so initial pageviews still land in Analytics.
function initDeferredTelemetry() {
  initAnalytics();
  initMarketingPixels();
}

// Skip telemetry entirely when the page is being rendered by scripts/prerender.mjs
// (user agent set by page.setUserAgent). If we didn't, `networkidle0` would wait
// for pixel scripts to inject, and they'd end up baked into every prerendered
// index.html — undoing this whole TBT optimization on first real page load.
const isPrerender = navigator.userAgent.includes('OnRampPrerender');

if (!isPrerender) {
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  };
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(initDeferredTelemetry, { timeout: 1500 });
  } else {
    setTimeout(initDeferredTelemetry, 1000);
  }
}

const rootEl = document.getElementById('root')!;

const tree = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// When #root has prerendered children (scripts/prerender.mjs), hydrate on top
// of them. When it's an empty SPA shell (dev, or unknown-route fallback),
// render from scratch.
// Skip framer-motion entrance animations during prerender (captures final
// state) and hydration (prevents mismatch with prerendered DOM).
if (rootEl.hasChildNodes() || isPrerender) {
  setSkipInitialAnimations(true);
}

if (rootEl.hasChildNodes()) {
  hydrateRoot(rootEl, tree);
} else {
  createRoot(rootEl).render(tree);
}
