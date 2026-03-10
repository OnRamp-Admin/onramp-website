/**
 * PostHog Analytics for OnRamp Marketing Website
 *
 * IMPORTANT: This is the WEBSITE analytics instance, separate from the OnRamp app.
 * Uses its own PostHog project key to keep website traffic isolated from app usage data.
 *
 * ## When modifying the website, check:
 * - If you add a new CTA button → add a `data-ph-capture-attribute-cta` attribute
 * - If you add a new page/route → pageviews are auto-tracked via SPA integration
 * - If you add a new form → call `analytics.trackContactFormSubmit()` or equivalent
 * - If you add a new calculator/interactive → consider tracking final values on blur/submit
 * - If you rename a page route → no action needed (auto-captured from URL)
 *
 * ## Event naming convention:
 * - Use past tense: "form_submitted", "cta_clicked", "calculator_interacted"
 * - Include context: { page, section, tier, values }
 * - Don't track every keystroke — track meaningful completion points
 */
import posthog from 'posthog-js';

// PostHog project key — set via VITE_POSTHOG_KEY env var, or falls back to empty (disables tracking)
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || '';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

/**
 * Initialize PostHog. Call once at app startup (main.tsx).
 * If VITE_POSTHOG_KEY is not set, tracking is silently disabled.
 */
export function initAnalytics() {
  if (!POSTHOG_KEY) {
    console.warn('[Analytics] VITE_POSTHOG_KEY not set — PostHog tracking disabled');
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // Auto-capture clicks, form submissions, and page leaves
    autocapture: true,
    // Track SPA page views automatically via react-router navigation
    capture_pageview: true,
    capture_pageleave: true,
    // Session recording — enable for understanding user journeys
    disable_session_recording: false,
    // Respect Do Not Track browser setting
    respect_dnt: true,
    // Mask sensitive form inputs by default
    mask_all_text: false,
    mask_all_element_attributes: false,
    // Persistence
    persistence: 'localStorage+cookie',
  });
}

/**
 * Track SPA page view — call on route change.
 * PostHog autocapture handles initial load, but SPA navigations need manual $pageview.
 */
export function trackPageView(path: string) {
  if (!POSTHOG_KEY) return;
  posthog.capture('$pageview', { $current_url: window.location.origin + path });
}

// ─── Custom Events ───────────────────────────────────────────────────────────

/** Contact form submitted */
export function trackContactFormSubmit(data: {
  role: string;
  hasPhone: boolean;
  hasShopName: boolean;
}) {
  if (!POSTHOG_KEY) return;
  posthog.capture('contact_form_submitted', data);
}

/** CTA button clicked (sticky bar, hero, page CTAs) */
export function trackCTAClick(data: {
  cta_location: string;  // e.g. 'sticky_bar', 'hero', 'pricing_card', 'technicians_page'
  cta_text: string;
  destination?: string;
}) {
  if (!POSTHOG_KEY) return;
  posthog.capture('cta_clicked', data);
}

/** ROI calculator tab switched */
export function trackCalculatorTabSwitch(tab: 'technician' | 'manager') {
  if (!POSTHOG_KEY) return;
  posthog.capture('calculator_tab_switched', { tab });
}

/** ROI calculator values snapshot — track when user finishes interacting */
export function trackCalculatorValues(data: {
  tab: 'technician' | 'manager';
  values: Record<string, number>;
  result: number;
}) {
  if (!POSTHOG_KEY) return;
  posthog.capture('calculator_interacted', data);
}

/** Pricing page tab switched */
export function trackPricingTabSwitch(tab: 'individual' | 'service-center') {
  if (!POSTHOG_KEY) return;
  posthog.capture('pricing_tab_switched', { tab });
}

/** Pricing configurator tier or slider changed */
export function trackPricingConfigured(data: {
  tier: string;
  num_technicians: number;
  monthly_total: number;
  roi_multiple: number;
}) {
  if (!POSTHOG_KEY) return;
  posthog.capture('pricing_configured', data);
}

/** Feature grid expanded/viewed */
export function trackFeatureGridViewed() {
  if (!POSTHOG_KEY) return;
  posthog.capture('feature_grid_viewed');
}
