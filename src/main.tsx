import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
