# OnRamp Marketing Infrastructure & Ad Strategy

*Created: March 10, 2026*

## Overview

The OnRamp marketing website (getonramp.io) has been instrumented with a full analytics and retargeting stack. This document captures what was implemented, the account details, and the go-to-market advertising strategy for reaching automotive service professionals.

---

## Implemented Tracking & Pixels

### PostHog Analytics (Website)
- **Purpose**: Behavioral analytics — understand how visitors browse the site, which pages they visit, what they interact with, session recordings
- **Integration**: `src/lib/analytics.ts` — initialized in `main.tsx`
- **Env var**: `VITE_POSTHOG_KEY` (separate project from the OnRamp app)
- **Custom events tracked**:
  - `contact_form_submitted` (role, hasPhone, hasShopName)
  - `cta_clicked` (location, text, destination)
  - `calculator_tab_switched` (technician/manager)
  - `calculator_interacted` (final slider values + result)
  - `pricing_tab_switched` (individual/service-center)
  - `pricing_configured` (tier, technician count, costs, ROI multiple)
  - `feature_grid_viewed`
- **Features enabled**: Autocapture, session recording, SPA page view tracking, Do Not Track respect
- **Note**: PostHog does NOT replace ad pixels — it's for analytics only. The ad platforms need their own pixels for audience building and retargeting.

### Meta Pixel (Facebook / Instagram)
- **Purpose**: Retarget website visitors on Instagram and Facebook, build lookalike audiences, track lead conversions
- **Pixel ID**: `1487395939476390`
- **Env var**: `VITE_META_PIXEL_ID`
- **Account**: Meta Business Suite, managed via personal Facebook profile with "OnRamp" Business Portfolio
- **Events fired**:
  - `PageView` — automatic on every page load
  - `Lead` — fired on contact form submission via `trackConversion('lead')`
- **What it enables**:
  - Retargeting campaigns on Instagram and Facebook
  - Lookalike audiences (find people similar to your visitors)
  - Conversion optimization (Meta optimizes ad delivery toward people likely to submit the form)

### Google Ads Tag (gtag.js)
- **Purpose**: Retarget across Google Display Network (2M+ websites), YouTube pre-roll ads, Gmail ads, Google Search ads
- **Ads ID**: `AW-18005339871`
- **Env var**: `VITE_GOOGLE_ADS_ID`
- **Conversion label env var**: `VITE_GOOGLE_ADS_CONVERSION_LABEL` (not yet set — retrieve from Google Ads > Goals > Conversions > "Contact Form Lead" action details)
- **Account**: Google Ads, created with @getonramp.io email
- **Conversion action configured**: "Contact Form Lead" (Submit lead form category, count: one per user, 90-day click-through window, enhanced conversions enabled)
- **Events fired**:
  - Page tracking — automatic via `gtag('config', ...)`
  - Conversion — fired on contact form submission (requires conversion label to be set)

### LinkedIn Insight Tag
- **Purpose**: B2B retargeting, target by job title / company size / industry
- **Status**: Code ready, NOT YET ACTIVATED — needs LinkedIn Company Page + Campaign Manager account + Partner ID
- **Env var**: `VITE_LINKEDIN_PARTNER_ID`
- **TODO**: Create OnRamp LinkedIn Company Page, set up Campaign Manager, retrieve Partner ID, add to env vars
- **Why it matters**: Best channel for targeting service center managers, fixed ops directors, and shop owners by job title

### RB2B Visitor Identification
- **Purpose**: Identify anonymous website visitors — resolves to LinkedIn profiles (US visitors only)
- **Site ID**: `9NMMZHR1YQNW`
- **Env var**: `VITE_RB2B_SITE_ID`
- **Account**: Free tier — 150 identifications per month
- **What it provides**: When someone visits getonramp.io, RB2B attempts to resolve their identity and shows you their LinkedIn profile, company, job title — even if they never fill out a form
- **Integration with Apollo**: RB2B has native integrations and Zapier connectors to push identified visitors into Apollo as leads automatically (configuration in their dashboards, no website code needed)

### Apollo.io (CRM)
- **Purpose**: CRM + contact enrichment + outbound sales tools
- **Status**: Account to be created (free tier)
- **No website code needed** — Apollo is a standalone platform
- **Why Apollo over HubSpot**: HubSpot CRM is free but marketing automation jumps to $800+/month. Apollo's growth plan is ~$49/user/month with CRM + enrichment + outbound included
- **Enrichment**: When you get a lead's email (from contact form or RB2B), Apollo enriches it with full name, company, title, social profiles, company size/revenue

---

## Technical Architecture

All pixels are initialized from JavaScript (not raw HTML) so that Vite environment variables work correctly at build time.

```
src/lib/analytics.ts        → PostHog initialization + custom event helpers
src/lib/marketing-pixels.ts → Meta, Google, LinkedIn, RB2B initialization + trackConversion()
src/main.tsx                 → Calls initAnalytics() then initMarketingPixels() at startup
src/pages/ContactPage.tsx    → Fires trackConversion('lead') on form submit
.env.example                 → All env var names with setup instructions
.env                         → Actual values (gitignored, also set in Render)
```

Each pixel checks its own env var and silently skips if not configured — no errors, no broken pages. Pixels can be enabled/disabled independently by adding or removing env vars.

### Render Environment Variables to Set
| Variable | Value | Status |
|----------|-------|--------|
| `VITE_POSTHOG_KEY` | *(from PostHog project)* | Needs setup |
| `VITE_POSTHOG_HOST` | `https://us.i.posthog.com` | Set |
| `VITE_META_PIXEL_ID` | `1487395939476390` | Set |
| `VITE_GOOGLE_ADS_ID` | `AW-18005339871` | Set |
| `VITE_GOOGLE_ADS_CONVERSION_LABEL` | *(from Google Ads conversion action)* | Needs retrieval |
| `VITE_LINKEDIN_PARTNER_ID` | *(from LinkedIn Campaign Manager)* | Needs setup |
| `VITE_RB2B_SITE_ID` | `9NMMZHR1YQNW` | Set |

---

## Ad Strategy: Reaching Automotive Service Professionals

### Two Target Personas

**1. Service Center Managers / Shop Owners (Decision Makers)**
- **Best channels**: LinkedIn (target by title), Google Search (high-intent queries), YouTube (case study videos)
- **Targeting**: Job titles like "Service Manager", "Fixed Ops Director", "Service Advisor", "Shop Owner"; industries: automotive dealerships, independent repair shops
- **Content angle**: ROI-focused — "Reduce comebacks by X%", "Increase tech efficiency by Y hours/week", "Stop losing money on flat rate inefficiency"
- **Google Search keywords**: "auto repair shop management software", "service department efficiency tools", "technician productivity software", "flat rate optimization"

**2. Individual Technicians (End Users / Advocates)**
- **Best channels**: Instagram, TikTok, YouTube, Facebook Groups
- **Targeting**: Interests in automotive repair, ASE certification, specific car brands, tool brands; members of tech communities
- **Content angle**: Hands-free, "stop flipping through 200-page TSBs", voice-first workflow — show it in action on a real job
- **Organic communities**: r/MechanicAdvice, r/Justrolledintotheshop, Facebook automotive tech groups, Instagram automotive accounts

### The Content Funnel (How Pixels Enable Cheap Growth)

```
STAGE 1: COLD AUDIENCE (Awareness)
├── Instagram/TikTok reels showing OnRamp in action (organic or ~$0.01-0.03/view)
├── YouTube shorts — POV of hands-free repair guidance
├── Posts in automotive Facebook groups and subreddits (free)
└── Pixels silently capture everyone who visits the site
         │
         ▼
STAGE 2: WARM AUDIENCE (Interest)
├── Retarget video viewers (>50% watch) with deeper content
├── Retarget site visitors with ROI calculator or demo video
├── Cost: $1-3 CPC (much cheaper than cold traffic)
└── RB2B identifies visitors → feed into Apollo for outreach
         │
         ▼
STAGE 3: HOT AUDIENCE (Decision)
├── Retarget pricing/contact page visitors with direct CTA
├── "Book a demo" or "Start free trial" ads
├── Cost: $5-15 per conversion (vs $50+ for cold traffic)
└── Meta/Google conversion events optimize delivery automatically
```

**Key insight**: The pixels you installed today cost $0 to run. They silently build audience data from every organic visitor. When you're ready to spend even $50 on retargeting, you'll have a warm audience ready to go — and retargeting converts 3-5x better than cold ads.

### Cost Expectations

| Metric | Industry Average (B2B SaaS) | Expected for OnRamp (niche automotive) |
|--------|---------------------------|---------------------------------------|
| CPC (Cost Per Click) | $1.50 - $5.00 | $0.80 - $3.00 (low competition) |
| CPM (Cost Per 1000 Impressions) | $8 - $25 | $5 - $15 (niche audience) |
| Cost Per Lead (form fill) | $15 - $60 | $5 - $25 (retargeting-focused) |
| Cost Per Demo/Trial | $50 - $150 | $20 - $75 (warm traffic) |

**Why OnRamp should be cheaper than average**:
- Almost zero ad competition for "AI voice assistant for auto techs"
- Highly specific niche = sharp lookalike audiences
- Visual demo content (hands-free voice assistant) drives high engagement
- Automotive tech communities are tight-knit — organic word-of-mouth compounds

### Recommended Budget Phases

**Phase 1: Foundation (Now — $0/month)**
- Pixels collecting data from organic traffic
- Create content (demo videos, shop floor footage, testimonials)
- Post organically on Instagram, YouTube, relevant communities
- RB2B identifying visitors → manual outreach via Apollo

**Phase 2: Retargeting Only ($100-200/month)**
- Retarget site visitors on Instagram/Facebook
- Retarget YouTube video viewers with deeper content
- This is the highest ROI spend — warm audiences only

**Phase 3: Expansion ($500-1000/month)**
- Add cold audience campaigns with lookalike audiences
- Google Search ads for high-intent keywords
- YouTube pre-roll on automotive repair channels
- A/B test ad creative and landing pages

**Phase 4: Scale (when unit economics prove out)**
- Increase spend on winning campaigns
- Add LinkedIn for B2B manager targeting
- Consider TikTok for technician reach
- Server-side conversion APIs (Meta CAPI, Google Enhanced Conversions) for better attribution

---

## Remaining TODO

- [ ] Set up PostHog project for the website and add `VITE_POSTHOG_KEY` to Render
- [ ] Retrieve Google Ads conversion label and add `VITE_GOOGLE_ADS_CONVERSION_LABEL` to Render
- [ ] Create OnRamp LinkedIn Company Page
- [ ] Set up LinkedIn Campaign Manager and add `VITE_LINKEDIN_PARTNER_ID`
- [ ] Create Apollo.io account (free tier)
- [ ] Configure RB2B → Apollo integration (Zapier or native)
- [ ] Wire up contact form to actually send submissions (currently frontend-only, TODO in code)
- [ ] Remove `<meta name="robots" content="noindex, nofollow">` from `index.html` when ready to launch
- [ ] Create initial ad creative (demo video, testimonial clips)
