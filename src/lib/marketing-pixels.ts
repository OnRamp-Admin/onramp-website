/**
 * Marketing Pixels & Retargeting Tags for OnRamp Marketing Website
 *
 * Initializes: Meta Pixel, Google Ads Tag, LinkedIn Insight Tag, RB2B, Apollo
 * Each pixel gracefully no-ops if its env var is not set.
 *
 * ## When adding a new pixel:
 * 1. Add VITE_* env var to .env.example
 * 2. Add init function here
 * 3. Call it from initMarketingPixels()
 * 4. If it supports conversion events, add to trackConversion()
 */

// Extend window for pixel globals
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    _linkedin_partner_id?: string;
    _linkedin_data_partner_ids?: string[];
    lintrk?: (...args: unknown[]) => void;
    trackingFunctions?: { onLoad: (config: { appId: string }) => void };
  }
}

// ─── Meta Pixel (Facebook/Instagram) ────────────────────────────────────────

function initMetaPixel() {
  const pixelId = import.meta.env.VITE_META_PIXEL_ID;
  if (!pixelId) {
    console.debug('[Marketing] Meta Pixel: VITE_META_PIXEL_ID not set — skipped');
    return;
  }

  // Meta Pixel base code (standard snippet from Meta Business Suite)
  const f = window;
  const b = document;
  const e = 'script';
  if (f.fbq) return; // Already loaded
  const n: any = (f.fbq = function (...args: unknown[]) {
    n.callMethod ? n.callMethod(...args) : n.queue.push(args);
  });
  if (!f._fbq) f._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];
  const t = b.createElement(e) as HTMLScriptElement;
  t.async = true;
  t.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const s = b.getElementsByTagName(e)[0];
  s?.parentNode?.insertBefore(t, s);

  window.fbq!('init', pixelId);
  window.fbq!('track', 'PageView');
  console.debug(`[Marketing] Meta Pixel initialized: ${pixelId}`);
}

// ─── Google Ads Tag (gtag.js) ───────────────────────────────────────────────

function initGoogleAds() {
  const adsId = import.meta.env.VITE_GOOGLE_ADS_ID;
  if (!adsId) {
    console.debug('[Marketing] Google Ads: VITE_GOOGLE_ADS_ID not set — skipped');
    return;
  }

  // Load gtag.js dynamically
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${adsId}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag function
  const dataLayer: unknown[] = window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: unknown[]) {
    dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', adsId);
  console.debug(`[Marketing] Google Ads Tag initialized: ${adsId}`);
}

// ─── LinkedIn Insight Tag ───────────────────────────────────────────────────

function initLinkedIn() {
  const partnerId = import.meta.env.VITE_LINKEDIN_PARTNER_ID;
  if (!partnerId) {
    console.debug('[Marketing] LinkedIn: VITE_LINKEDIN_PARTNER_ID not set — skipped');
    return;
  }

  window._linkedin_partner_id = partnerId;
  window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
  window._linkedin_data_partner_ids.push(partnerId);

  // Load LinkedIn Insight script
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
  document.head.appendChild(script);

  // LinkedIn noscript pixel (for non-JS tracking)
  const noscript = document.createElement('noscript');
  const img = document.createElement('img');
  img.height = 1;
  img.width = 1;
  img.style.display = 'none';
  img.alt = '';
  img.src = `https://px.ads.linkedin.com/collect/?pid=${partnerId}&fmt=gif`;
  noscript.appendChild(img);
  document.body.appendChild(noscript);

  console.debug(`[Marketing] LinkedIn Insight Tag initialized: ${partnerId}`);
}

// ─── RB2B Visitor Identification ────────────────────────────────────────────

function initRB2B() {
  const siteId = import.meta.env.VITE_RB2B_SITE_ID;
  if (!siteId) {
    console.debug('[Marketing] RB2B: VITE_RB2B_SITE_ID not set — skipped');
    return;
  }

  // RB2B standard install snippet (matches their official embed code)
  if ((window as any).reb2b) return; // Already loaded
  (window as any).reb2b = { loaded: true };
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://ddwl4m2hdecbv.cloudfront.net/b/${siteId}/${siteId}.js.gz`;
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript?.parentNode?.insertBefore(script, firstScript);

  console.debug(`[Marketing] RB2B initialized: ${siteId}`);
}

// ─── Apollo Website Tracker ─────────────────────────────────────────────────

function initApollo() {
  const appId = import.meta.env.VITE_APOLLO_APP_ID;
  if (!appId) {
    console.debug('[Marketing] Apollo: VITE_APOLLO_APP_ID not set — skipped');
    return;
  }

  const cacheBuster = Math.random().toString(36).substring(7);
  const script = document.createElement('script');
  script.src = `https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache=${cacheBuster}`;
  script.async = true;
  script.defer = true;
  script.onload = function () {
    window.trackingFunctions?.onLoad({ appId });
  };
  document.head.appendChild(script);

  console.debug(`[Marketing] Apollo tracker initialized: ${appId}`);
}

// ─── Master Initialization ─────────────────────────────────────────────────

/**
 * Initialize all marketing pixels. Call once at app startup (main.tsx).
 * Each pixel checks its own env var and silently skips if not configured.
 */
export function initMarketingPixels() {
  initMetaPixel();
  initGoogleAds();
  initLinkedIn();
  initRB2B();
  initApollo();
}

// ─── Conversion Events ─────────────────────────────────────────────────────

/**
 * Fire conversion events across all active pixels.
 * Call on high-value actions (form submit, demo request, etc.)
 */
export function trackConversion(event: 'lead' | 'contact') {
  // Meta: Standard "Lead" event
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Lead');
  }

  // Google Ads: Conversion event
  // Note: For specific conversion tracking, you'll need a conversion label
  // from Google Ads (format: AW-XXXXXXXXX/XXXXXXXXXXXX). For now we fire
  // a generic conversion. Update VITE_GOOGLE_ADS_CONVERSION_LABEL when available.
  if (typeof window.gtag === 'function') {
    const adsId = import.meta.env.VITE_GOOGLE_ADS_ID;
    const conversionLabel = import.meta.env.VITE_GOOGLE_ADS_CONVERSION_LABEL;
    if (adsId && conversionLabel) {
      window.gtag('event', 'conversion', {
        send_to: `${adsId}/${conversionLabel}`,
      });
    }
  }

  // LinkedIn: Track conversion (requires conversion ID set up in Campaign Manager)
  // Auto page-view tracking is built into the Insight Tag
  if (typeof window.lintrk === 'function') {
    window.lintrk('track', { conversion_id: event });
  }
}
