import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { initAnalytics } from './lib/analytics'
import { initMarketingPixels } from './lib/marketing-pixels'
import App from './App.tsx'

// Initialize PostHog analytics (requires VITE_POSTHOG_KEY env var)
initAnalytics();

// Initialize marketing pixels (Meta, Google Ads, LinkedIn, RB2B)
// Each pixel checks its own env var and silently skips if not configured
initMarketingPixels();

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
if (rootEl.hasChildNodes()) {
  hydrateRoot(rootEl, tree);
} else {
  createRoot(rootEl).render(tree);
}
