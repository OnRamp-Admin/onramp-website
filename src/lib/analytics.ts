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

/** Audio sample played (phase samples, AI stack sample) */
export function trackAudioPlayed(data: { sample: string; page: string }) {
  if (!POSTHOG_KEY) return;
  posthog.capture('audio_sample_played', data);
}

/** Voice explorer opened */
export function trackVoiceExplorerOpened() {
  if (!POSTHOG_KEY) return;
  posthog.capture('voice_explorer_opened');
}

/** Individual voice sample played */
export function trackVoiceSamplePlayed(data: { voice: string; gender: string }) {
  if (!POSTHOG_KEY) return;
  posthog.capture('voice_sample_played', data);
}

/** FAQ question expanded */
export function trackFAQExpanded(data: { question: string; category: string }) {
  if (!POSTHOG_KEY) return;
  posthog.capture('faq_expanded', data);
}

/** Signup/waitlist modal opened */
export function trackSignupModalOpened(data: { mode: string; plan: string }) {
  if (!POSTHOG_KEY) return;
  posthog.capture('signup_modal_opened', data);
}

/** Pricing tier selected (Individual cards) */
export function trackPricingTierSelected(data: { tier: string }) {
  if (!POSTHOG_KEY) return;
  posthog.capture('pricing_tier_selected', data);
}

/** Blog post viewed — fires when a blog post page loads */
export function trackBlogPostViewed(data: { slug: string; title: string; tags: string[]; readTime: number }) {
  if (!POSTHOG_KEY) return;
  posthog.capture('blog_post_viewed', data);
}

/** Blog CTA clicked — fires when reader clicks a CTA link within a blog post */
export function trackBlogCTAClicked(data: { slug: string; destination: string }) {
  if (!POSTHOG_KEY) return;
  posthog.capture('blog_cta_clicked', data);
}

/** Blog index viewed */
export function trackBlogIndexViewed() {
  if (!POSTHOG_KEY) return;
  posthog.capture('blog_index_viewed');
}

/** Blog share button clicked — LinkedIn, Twitter/X, or copy-link */
export function trackBlogShareClicked(data: {
  slug: string;
  channel: 'linkedin' | 'twitter' | 'copy_link';
}) {
  if (!POSTHOG_KEY) return;
  posthog.capture('blog_share_clicked', data);
}

/** Inline blog lead form successfully submitted — fires alongside the generic
 *  contact_form_submitted event so we can build blog-specific funnels later */
export function trackBlogLeadCaptured(data: { slug: string; role: string }) {
  if (!POSTHOG_KEY) return;
  posthog.capture('blog_lead_captured', data);
}

/** Set blog entry point — tags the user's session with their blog entry so we can
 *  track blog → site navigation in funnels and user paths */
export function setBlogEntryPoint(slug: string) {
  if (!POSTHOG_KEY) return;
  // Set a person property so we can filter/segment users who entered via blog
  posthog.people.set({ last_blog_entry: slug, entered_via_blog: true });
  // Also set a session-level super property
  posthog.register({ blog_entry_slug: slug });
}

/** Audio format on a blog post: long-form podcast or short AI brief summary. */
export type BlogAudioFormat = 'podcast' | 'brief';

/** Blog audio — first play of a session (per format). Filter on `format` in PostHog to slice the funnel. */
export function trackBlogAudioStarted(data: {
  slug: string;
  title: string;
  format: BlogAudioFormat;
}) {
  if (!POSTHOG_KEY) return;
  posthog.capture('blog_audio_started', data);
}

/** Blog audio — listener crossed a 25/50/75% milestone (fires once per page load per format) */
export function trackBlogAudioProgress(data: {
  slug: string;
  format: BlogAudioFormat;
  milestone: 25 | 50 | 75;
}) {
  if (!POSTHOG_KEY) return;
  posthog.capture('blog_audio_progress', data);
}

/** Blog audio — listener reached the end */
export function trackBlogAudioCompleted(data: {
  slug: string;
  format: BlogAudioFormat;
  totalListenTimeSeconds: number;
}) {
  if (!POSTHOG_KEY) return;
  posthog.capture('blog_audio_completed', data);
}

/** Blog audio — listener scrubbed by more than 5 seconds (debounces accidental clicks) */
export function trackBlogAudioSeeked(data: {
  slug: string;
  format: BlogAudioFormat;
  fromPercent: number;
  toPercent: number;
}) {
  if (!POSTHOG_KEY) return;
  posthog.capture('blog_audio_seeked', data);
}
