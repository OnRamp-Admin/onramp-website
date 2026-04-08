# Handoff: Getting Started Sections — Technicians & Managers Pages

## Overview
Add "Getting Started" / "Day One" sections to both the For Technicians and For Service Managers pages on the ONRAMP marketing website (`~/OnRamp Website/onramp-landing/`). These sections show how fast and simple it is to go from signup to first job — with time estimates for each step.

The website is built with React, Vite, Tailwind CSS, and Framer Motion. It uses a dark theme with the `carbon` color system (carbon-950 backgrounds, carbon-300 body text, white headings) and `electric` (blue) / `safety` (orange) accent colors.

---

## Technician Getting Started (For Technicians page)

### Placement
In `src/pages/TechniciansPage.tsx` — add after the "What You Need" hardware section, before the ROI Calculator section. Search for `{/* ── ROI Calculator` to find the insertion point.

### Content

**Title**: "From Sign-Up to First Job in Under 10 Minutes"

**Pre-note** (subtitle text): "When you sign up, you'll choose a start date. This gives us time to ship your Brain Button. From your start date, you'll be up and running in under 10 minutes."

**Steps (vertical timeline):**

| # | Step | Time | Description |
|---|------|------|-------------|
| 1 | Download the App | 2 min | Install ONRAMP on your iPhone or Android |
| 2 | Set Up Your Profile | 5 min | Name your AI, choose your voice, set your preferences |
| 3 | Connect Brain Button & Permissions | 1 min | Pair via Bluetooth, accept mic and camera permissions |
| 4 | Start Your First Job | 15 sec | Enter an RO number and go |

**Footer text**: "Under 10 minutes to your first AI-guided repair."

### Visual Design
- Vertical stepped timeline with numbered circles on the left
- Time badges on the right side of each step (e.g., "2 min" in a small pill/badge)
- Timeline connector line runs vertically, gradient from electric-400 (blue) at top to green-400 at bottom
- Each step has a small icon (Smartphone for download, UserCog for profile, CircleDot for Brain Button, Zap for start)
- Final step has a celebratory glow treatment
- On mobile: same vertical layout, works naturally
- Use `motion` from framer-motion for staggered entrance animations (whileInView)
- Match the site's card styling: `bg-carbon-800/50 border border-carbon-700/50 rounded-2xl`

---

## Service Manager Getting Started (For Service Managers page)

### Placement
In `src/pages/ManagersPage.tsx` — add after the ROI Calculator section, before the bottom CTA ("Choose Your Plan"). Search for `{/* ── Pricing CTA` to find the insertion point.

### Content

**Title**: "Your Entire Team, Up and Running in Under 20 Minutes"

**Pre-note** (subtitle text): "When you sign up, you'll choose a start date. This gives us time to ship Brain Buttons for your team. From your start date, your entire service department will be up and running in under 20 minutes."

**Phase 1: Manager Setup (~5 minutes)**

| # | Step | Time | Description |
|---|------|------|-------------|
| 1 | Create Your Admin Account | 2 min | Sign up and set up your service center |
| 2 | Invite Your Technicians | 3 min | Enter email addresses — invites go out by email and SMS |
| 3 | Hand Out Brain Buttons | — | Distribute Brain Buttons to your team |

**Phase 2: Each Technician (~8 minutes, done in parallel)**

| # | Step | Time | Description |
|---|------|------|-------------|
| 4 | Download the App | 2 min | Install from invite link on iPhone or Android |
| 5 | Set Up Their Profile | 5 min | Name their AI, choose their voice, set preferences |
| 6 | Connect Brain Button & Permissions | 1 min | Pair Bluetooth, accept mic/camera permissions |
| 7 | Start First Job | 15 sec | Enter an RO number and go |

**Key messaging**: "Your technicians do steps 4-7 in parallel — while one tech is setting up, the others are too. The whole team is live in under 20 minutes."

**Footer text**: "Admin setup in 5 minutes. Each tech ready in 8 minutes. Whole team live in under 20 minutes."

### Visual Design
- Same vertical timeline style as technicians page but with a **fork**
- Manager steps (1-3) flow down in a single column with safety-400 (orange) accent
- After step 3, the timeline branches into 3-4 parallel lines representing multiple techs setting up simultaneously
- Each parallel branch shows steps 4-7 with electric-400 (blue) accent
- The parallel branches reconverge at "Start First Job" with a celebration element
- On mobile: show the fork as a visual callout ("All techs set up simultaneously") rather than actual branching lines
- Use `motion` for staggered entrance animations

---

## Technical Notes

### Existing patterns to follow
- Look at how the "What You Need" hardware section is built in both pages for card/section styling
- The phase cards on both pages use `motion.div` with `whileInView` for scroll-triggered animations
- Color system: `text-electric-400` for blue accents, `text-safety-400` for orange, `text-green-400` for green
- Background cards: `bg-carbon-800/50 border border-carbon-700/50 rounded-2xl p-6`
- Section wrapper: `<section className="py-20 px-4 bg-carbon-900/30">` or `carbon-fiber-bg`

### Icons (from lucide-react, already available in both files)
- Smartphone (download), UserCog (profile), CircleDot (brain button), Zap (start), Users (invite), Building2 (admin), Mail (invite)

### Responsive
- Both timelines should work on mobile as a simple vertical stack
- Time badges should be visible and not cut off on narrow screens

## Verification
1. Run `npm run dev` in `~/OnRamp Website/onramp-landing/`
2. Check localhost:5173/technicians — Getting Started section visible with 4-step timeline
3. Check localhost:5173/managers — Getting Started section visible with 7-step forked timeline
4. Both responsive on mobile (test at 375px)
5. Animations trigger on scroll
