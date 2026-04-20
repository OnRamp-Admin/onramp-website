# Blog Publishing & Scheduling

How to add blog posts and schedule them for future release.

## TL;DR

1. Add a new entry to `postData` in [`src/content/blog/posts.ts`](../src/content/blog/posts.ts)
2. Set the `date` field to whatever future date you want it to go live (`YYYY-MM-DD`)
3. Commit and push — the build runs automatically on Render
4. **On the day you want it to appear in Google's sitemap, trigger a fresh deploy on Render** (the post will appear on the live site automatically the moment its date passes, but the sitemap is built at deploy time)

That's it. No CMS, no admin UI, no separate scheduler service.

---

## How the Scheduling System Works

The scheduling is achieved by three independent layers, all keyed off the `date` field on each post.

### Layer 1 — Client-Side Date Filter (live site UX)

**File:** [`src/content/blog/posts.ts`](../src/content/blog/posts.ts) (bottom of file)

The `blogPosts` export filters out any post whose `date` is in the future:

```ts
export const blogPosts: BlogPost[] = allPosts.filter((post) => {
  const postDate = new Date(post.date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return postDate <= today;
});
```

Both `BlogIndexPage.tsx` and `BlogPostPage.tsx` import `blogPosts` (not `allPosts`), so future-dated posts:
- **Don't appear** on the `/blog` index listing
- **Are not accessible** if a user types the URL directly — `BlogPostPage` will not find them via `getBlogPost(slug)` and redirects to `/blog`

This means as soon as the calendar rolls over to a post's `date`, the next page load will automatically reveal it. **No deploy required for the post to appear on the live site.**

### Layer 2 — Build-Time Sitemap Filter (Google indexing)

**File:** [`scripts/generate-sitemap.mjs`](../scripts/generate-sitemap.mjs)

This script runs as part of `npm run build` (see the `build` script in `package.json`). It parses `posts.ts`, extracts each `(slug, date)` pair, and **only includes posts with `date <= today` in the generated sitemap**. Each blog URL gets a `<lastmod>` tag set to its publish date.

This is critical: if we put future URLs in the sitemap, Google would try to crawl them, find that they don't exist (the BlogPostPage would redirect them), and either log soft-404s or just waste crawl budget.

### Layer 3 — Deploy Trigger (when Google learns about new posts)

The sitemap is generated **at build time**, not at runtime. So even though Layer 1 reveals a post automatically the moment its date arrives, **Google won't see the new URL in the sitemap until you redeploy the site**.

**Currently:** manual redeploy via the Render dashboard (the "Manual Deploy" button on the static site service). Takes 30 seconds, free, gives you a chance to spot-check the post before it goes live to crawlers.

**If you want to automate:** see the "Future automation" section at the bottom.

---

## How to Add a New Blog Post

1. **Open** [`src/content/blog/posts.ts`](../src/content/blog/posts.ts)
2. **Add a new entry** to the `postData` array. Place it in chronological order if you care about how it appears in the file (the actual sort order on the live site is by `date` descending, handled by `BlogIndexPage`)
3. **Use this template:**

```ts
{
  slug: 'your-url-slug-goes-here',                    // becomes /blog/your-url-slug-goes-here
  title: 'Your Blog Post Title',                       // appears as the page H1
  date: '2026-07-15',                                  // YYYY-MM-DD; the day it goes live
  author: 'Alex Littlewood',                           // or whoever
  description:
    `One or two sentence summary used for meta description and the blog index card preview. Keep under ~160 chars for SEO.`,
  tags: ['tag1', 'tag2', 'tag3'],                      // free-form, used for related-post grouping later
  content: `

[Markdown body goes here. Standard markdown — H2/H3 headings, **bold**, *italic*,
bullet lists, [links](/internal-or-external), tables, code blocks, etc.]

[End the post with a CTA link, typically to /contact or /how-it-works.]

`,
},
```

**A few formatting notes:**
- The `content` field is a JavaScript template literal (backticks). Apostrophes are fine. **Do not** include backticks or `${}` in the content unless you escape them — they'll break the template literal.
- The first H1 of the post is set by `title`, so don't include a `# Heading` at the top of `content` (the rendered page will already have one).
- Use `—` (em-dash) directly. If you paste content from a source that has mojibake (`â` characters), find/replace them with `—` before saving.
- Internal links should use relative paths (`/managers`, `/how-it-works`) so they stay on-site and get tracked by the analytics CTA tracker in `BlogPostPage`.

4. **Save the file.** That's it for content.

---

## SEO Description (Required)

The `description` field does triple duty — it's the Google SERP snippet (`<meta name="description">`), the LinkedIn / X / Facebook share card preview, and the dek shown below the title on both the blog index and the post page. It's also the SUMMARY read aloud in the "Listen to article" audio.

Given how much it affects, treat it as real marketing copy rather than a copy-paste of the body's opening sentence.

### Requirements

- **130–155 characters.** Google truncates longer descriptions in SERPs; shorter ones look thin.
- **Distinct from the body's first sentence.** A SERP snippet that matches the body's opening paragraph wastes the preview slot — Google already sees that content. Give the reader a different handle on the article.
- **Captures the specific payoff.** "Recover billable hours" beats "scheduling software is important." Concrete promise, not topic summary.
- **Active voice, present tense.** No filler verbs ("learn", "discover", "find out").
- **One primary keyword**, naturally placed. No stuffing.

### Write it with the review tool

Run `npm run dev` and open `http://localhost:5173/admin/description-review`.

- Every post is graded on the spot. Posts that are missing a description, too long (>165 chars), or just the body's opener are flagged "Needs rewrite".
- Click **Draft** on a card — Gemini 2.5 Flash (text) writes a proposal aligned to the rules above.
- Edit the proposal freely in the textarea. The char counter turns green between 130 and 155.
- Use the revision-feedback box to iterate ("punchier, lead with the billable-hours number") and click **Regenerate with feedback**.
- Click **Approve & save** to write the description into `posts.ts`.

The "Draft all missing" button at the top runs Gemini sequentially against every flagged post (~30 seconds for 24).

### Or use the CLI

```bash
# Show which posts need rewrite and why.
node scripts/generate-article-description.mjs --list

# Print a proposed draft for one post (does NOT write back).
node scripts/generate-article-description.mjs <slug>

# Draft + write back for a single post.
node scripts/generate-article-description.mjs <slug> --write

# Draft proposals (to stdout) for every post that fails the heuristic.
node scripts/generate-article-description.mjs
```

Both paths require `gcloud auth application-default login`. Cost is roughly $0.00005 per description (Gemini 2.5 Flash at ~2500 input tokens).

---

## Cover Image (Optional but Recommended)

Every post should have a `image` field pointing to a 16:9 cover illustration. If unset, the blog renders a branded fallback tile (`BlogCoverFallback`), but a real image always looks better. Covers appear in three places: the post hero, the blog index cards, and the "You may also like" related-posts grid.

### Automatic cover generation

The `scripts/generate-article-cover.mjs` script generates covers in the OnRamp style (angular/geometric, electric blue + safety orange, sound waves + tools + cars) via Gemini 3 Flash Image ("Nano Banana 2") on Vertex AI.

```bash
# Generate covers for all posts missing `image`, review each one interactively.
node scripts/generate-article-cover.mjs

# Target a single post.
node scripts/generate-article-cover.mjs <slug>

# Regenerate even if an image already exists.
node scripts/generate-article-cover.mjs <slug> --force

# Batch mode — skip the interactive review (use only when you trust the output).
node scripts/generate-article-cover.mjs --yes
```

The script saves the generated PNG to a temp directory, prompts you to inspect it before upload, uploads approved images to `gs://onramp-marketing-media/blog/<slug>-cover.png`, and writes the URL back into `posts.ts` under the `image:` field.

Model ID moves fast in image-gen land — if the call 404s, swap `MODEL` in the script to one of the fallbacks listed in the file header (`gemini-2.5-flash-image-preview` or `imagen-4.0-generate-preview-0509`).

---

## Audio Players (Optional)

Each blog post can optionally include up to **three AI-generated audio versions**, each rendered as its own player:

| Format | Field prefix | Visual | Length | Purpose |
|---|---|---|---|---|
| **Listen to article** | `articleAudioUrl`, `articleDurationSec`, `articleTranscript` | Electric blue + orange gradient, pinned in sidebar | matches article length | Verbatim article read via Gemini TTS (Sadaltager voice) |
| **AI Brief Summary** | `briefAudioUrl`, `briefDurationSec` | Safety orange + Zap icon | ~30s–2 min | Quick overview for skimmers |
| **Listen to the Podcast** | `podcastAudioUrl`, `podcastDurationSec` | Electric blue + Headphones icon | ~10–25 min | Deep-dive NotebookLM audio overview |

On desktop, the "Listen to article" player pins to the top of the left-rail table of contents. Brief + podcast stay inline. On mobile, all three stack inline above the article body.

### Automatic article audio generation

The `scripts/generate-article-audio.mjs` script reads each post body through Gemini TTS with the Sadaltager voice, converts the result to m4a, uploads to GCS, and writes `articleAudioUrl` + `articleDurationSec` + `articleTranscript` back into `posts.ts`. Run it before pushing a new post so day-1 readers see the player.

```bash
# Generate for all posts missing articleAudioUrl.
node scripts/generate-article-audio.mjs

# One post only.
node scripts/generate-article-audio.mjs <slug>

# Regenerate.
node scripts/generate-article-audio.mjs <slug> --force
```

Requires `ffmpeg` + `ffprobe` + `gsutil` on PATH, and gcloud ADC (`gcloud auth application-default login`).

Brief + podcast still need to be produced manually — NotebookLM has no public API, so you'll continue to generate those via the NotebookLM UI and the steps below.

Each player has a pulsing inline CTA when not yet played, a sticky floating mini-player that appears when the user scrolls past the inline player, and full PostHog analytics (started, 25/50/75% milestones, completed, seek events). Both formats fire the same set of events but with a `format: 'brief' | 'podcast'` field so you can slice the funnel by format in PostHog.

If a post has only one of the two URLs set, only that player renders. If both are set, both render stacked (brief on top, then podcast). When the user plays one, the other auto-pauses, and only one mini-player can be visible at a time.

### How it works

- Audio files are hosted in **Google Cloud Storage**, NOT in this repo. This keeps deploys fast and the codebase small.
- Each post has up to four new optional fields: `briefAudioUrl` + `briefDurationSec` and `podcastAudioUrl` + `podcastDurationSec`. The duration fields let the player show the correct total time before audio metadata loads (avoiding a "0:00 / —:—" flicker).
- **Updating audio doesn't require a website deploy.** Replace the file in GCS and (subject to the 30-day cache header) it just works.

### One-time GCS bucket setup

Only needs to be done once. Run from `gcloud` CLI authenticated to the OnRamp GCP project.

```bash
# 1. Create the bucket
gsutil mb -p YOUR-GCP-PROJECT-ID -l us-central1 -c STANDARD gs://onramp-public-media

# 2. Make it publicly readable
gsutil iam ch allUsers:objectViewer gs://onramp-public-media

# 3. Apply CORS so HTML5 audio + scrubbing work from getonramp.io
cat > /tmp/cors.json <<'EOF'
[{
  "origin": ["https://getonramp.io", "https://www.getonramp.io", "http://localhost:5173", "http://localhost:4173"],
  "method": ["GET", "HEAD"],
  "responseHeader": ["Content-Type", "Range", "Accept-Ranges", "Content-Length", "Content-Range"],
  "maxAgeSeconds": 3600
}]
EOF
gsutil cors set /tmp/cors.json gs://onramp-public-media
```

The `Range` headers in the CORS config are required — without them, the player can't scrub (browsers use byte-range requests when seeking inside an audio file).

### Per-post audio workflow

For each audio file you want to add to a post:

#### 1. Generate the audio

- **Brief Summary**: generate a short script and run it through your chosen TTS (or use NotebookLM's "Briefing Document" feature, then read it through TTS). Aim for 30 seconds to 2 minutes.
- **Podcast**: open the post in NotebookLM, generate the "Audio Overview", download the resulting WAV file (~100 MB for ~12 minutes of dialogue).

#### 2. Compress to MP3 with ffmpeg

The same compression command works for both formats:

```bash
ffmpeg -i input.wav \
  -c:a libmp3lame \
  -q:a 5 \
  -ac 1 \
  -ar 22050 \
  -metadata title="Post Title Here" \
  -metadata artist="OnRamp" \
  -metadata album="OnRamp Blog" \
  output.mp3
```

What these flags do:
- `-q:a 5` — VBR averaging ~130 kbps. NotebookLM podcasts have two distinct hosts in conversation, so 64 kbps mono (typical for spoken word) sounds noticeably degraded. 130 kbps mono is the right floor for both formats.
- `-ac 1` — mono (halves file size, no perceptual loss for spoken word).
- `-ar 22050` — 22 kHz sample rate (voice has nothing useful above 11 kHz Nyquist; saves another ~30%).

Verify the resulting file size:
- A 12-minute podcast should be roughly 8-12 MB
- A 1-minute brief should be roughly 1 MB

If a podcast is >12 MB, drop to `-q:a 6`. If a brief is so short the size doesn't matter, you can leave it at the default settings.

#### 3. Get the duration in seconds

```bash
ffprobe -i output.mp3 2>&1 | grep Duration
```

Output looks like `Duration: 00:12:34.56, ...`. Convert to total seconds: `(12 * 60) + 34 = 754`. For a brief: `Duration: 00:01:32.10` → `92`.

#### 4. Upload to GCS

Use a path that distinguishes the format from the slug:

```bash
# Podcast
gsutil -h "Cache-Control:public, max-age=2592000" \
  cp podcast.mp3 \
  gs://onramp-public-media/blog/SLUG-HERE-podcast.mp3

# Brief
gsutil -h "Cache-Control:public, max-age=2592000" \
  cp brief.mp3 \
  gs://onramp-public-media/blog/SLUG-HERE-brief.mp3
```

The `Cache-Control` header gives a 30-day cache. Use the post's exact `slug` from `posts.ts` followed by `-podcast` or `-brief`.

The public URLs are then:
- `https://storage.googleapis.com/onramp-public-media/blog/SLUG-HERE-podcast.mp3`
- `https://storage.googleapis.com/onramp-public-media/blog/SLUG-HERE-brief.mp3`

#### 5. Add to the post

In `src/content/blog/posts.ts`, add the relevant fields to the post entry. You can include just one format, or both:

```ts
{
  slug: 'how-ai-is-fixing-the-service-bay-bottleneck',
  title: '...',
  // ...other fields...
  briefAudioUrl: 'https://storage.googleapis.com/onramp-public-media/blog/how-ai-is-fixing-the-service-bay-bottleneck-brief.mp3',
  briefDurationSec: 92,
  podcastAudioUrl: 'https://storage.googleapis.com/onramp-public-media/blog/how-ai-is-fixing-the-service-bay-bottleneck-podcast.mp3',
  podcastDurationSec: 754,
  content: `...`,
}
```

#### 6. Commit and push

The next deploy will render the players for that post.

### To remove an audio version from a post

Delete the relevant `*AudioUrl` and `*DurationSec` fields. The player simply won't render. Optionally delete the file from GCS to save storage (it's pennies, so don't worry about cleanup).

### To replace an audio file

Re-upload to the same GCS path. **No website deploy needed** — but the 30-day Cache-Control means existing listeners may hear the old version for up to 30 days. If you need an immediate cutover, upload to a new path (e.g., `slug-podcast-v2.mp3`) and update the URL in `posts.ts`.

### Hosting cost

At OnRamp's scale this is effectively free. GCS Standard storage is $0.02/GB/month — 50 posts × 2 audio files × ~10 MB average = ~1 GB = $0.02/month. Egress is $0.12/GB after the 1 GB free monthly tier — so you can serve roughly 8,000 listens/month before paying anything noticeable.

### Analytics events fired by the player

All sent to PostHog. Each event has a `format: 'brief' | 'podcast'` field so you can slice the funnel by format:
- `blog_audio_started` — `{ slug, title, format }` — fires once per page load on first play (per format)
- `blog_audio_progress` — `{ slug, format, milestone: 25 | 50 | 75 }` — fires once per milestone per page load (will not re-fire if user seeks backward and re-listens)
- `blog_audio_completed` — `{ slug, format, totalListenTimeSeconds }` — fires when audio reaches the end; the seconds value is actual listen time, excluding any seeks
- `blog_audio_seeked` — `{ slug, format, fromPercent, toPercent }` — fires only for jumps >5 seconds (debounces accidental clicks on the progress bar)

To build a funnel in PostHog: `started → progress(25) → progress(50) → progress(75) → completed`. Filter by `format` to compare brief vs podcast engagement.

### Local testing without uploading to GCS

If you want to validate the player visually before doing the upload dance:

1. Drop your audio files anywhere under `public/audio/blog/` — the entire `public/audio/blog/` directory is gitignored so nothing accidentally gets committed.
2. **Any browser-supported format works** — MP3, WAV, M4A. Don't bother compressing for local testing; that's only for production hosting.
3. Get the durations:
   ```bash
   ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 path/to/file.m4a
   ```
4. Set the URLs to local paths in `posts.ts`:
   ```ts
   briefAudioUrl: '/audio/blog/your-folder/brief.m4a',
   briefDurationSec: 92,
   podcastAudioUrl: '/audio/blog/your-folder/podcast.m4a',
   podcastDurationSec: 754,
   ```
5. Run `npm run dev` and visit `http://localhost:5173/blog/SLUG`

Vite will serve the files from the dev server. Once you've validated the layout, swap the URLs to GCS production URLs and remove the local files (or just leave them — they're gitignored).

---

## How to Schedule a Post for Future Release

Just set the `date` field to a future date. That's literally all you need to do.

The current convention for OnRamp is **Wednesday releases** to match the existing weekly cadence (post 1 was published on Wednesday 2026-04-08, post 2 on 2026-04-15, etc.). You can pick any day, but staying consistent is good for reader habit-building.

**To check what's currently scheduled:**

```bash
grep -E "slug:|date:" src/content/blog/posts.ts
```

This shows every post and its publish date in order.

---

## Deploying a Scheduled Post

Two scenarios:

### Scenario A — You're adding a post that should go live in the future

1. Add the post with a future `date`
2. Commit and push to GitHub
3. Render auto-deploys on push — at this point the post is in the codebase but **not** visible on the live site (Layer 1 filters it out) and **not** in the sitemap (Layer 2 filters it out)
4. **On the publish date**, manually trigger a redeploy on Render (or wait for any other push that triggers a build)
5. The post now appears in the sitemap and Google will start indexing it

### Scenario B — You're adding a post that should go live immediately

1. Add the post with `date` set to today (or any past date)
2. Commit and push
3. Render auto-deploys
4. Done — the post is live and in the sitemap on the next deploy

### What happens if you forget to redeploy on a scheduled post's date?

The post will still appear on the live blog index automatically (Layer 1 is runtime). But Google won't see it in the sitemap until the next deploy. Not catastrophic — Google would eventually discover it via internal links from `/blog` — but you lose a few days of indexing time.

---

## Where Things Live

| Thing | File | Purpose |
|---|---|---|
| Blog post content | `src/content/blog/posts.ts` | All posts in one TypeScript file. Single source of truth. |
| Date filter | `src/content/blog/posts.ts` (bottom) | `blogPosts` filter — hides future posts from the live site |
| Blog index page | `src/pages/BlogIndexPage.tsx` | Lists all published posts |
| Blog post page | `src/pages/BlogPostPage.tsx` | Renders individual posts via React Markdown |
| Sitemap generator | `scripts/generate-sitemap.mjs` | Build-time script that filters future posts |
| Sitemap output | `dist/sitemap.xml` (also `public/sitemap.xml`) | What Google sees |
| Build script | `package.json` → `scripts.build` | Runs `tsc -b && vite build && node scripts/generate-sitemap.mjs` |

---

## Common Tasks

### "I want to see what posts are scheduled and when"

```bash
grep -E "slug:|date:" src/content/blog/posts.ts
```

### "I want to test what the sitemap will look like before deploying"

```bash
npm run build
cat dist/sitemap.xml
```

The sitemap will only include posts with `date <= today`.

### "I want to push a post live earlier than its scheduled date"

Edit the `date` field in `posts.ts` to today's date (or any past date), commit, push.

### "I want to delay a post that's already scheduled"

Edit the `date` field to a later date, commit, push. If the post hasn't gone live yet (Layer 1 was hiding it), nothing changes user-visibly. If the post had already gone live, it will disappear from the live site on the next page load, and disappear from the sitemap on the next deploy.

### "I want to unpublish a post entirely"

Either delete the entry from `postData`, or set its date far in the future (e.g. `9999-01-01`). Future deploys will exclude it from the sitemap and live site. Note that if Google has already indexed the URL, you'll want to also handle the redirect — currently visiting a hidden post's URL redirects to `/blog`, which is a soft-redirect Google may not love. For real unpublishing, deletion is cleaner.

---

## Future Automation (Optional)

If manual redeploys become annoying, automate with one of these:

### Option 1 — GitHub Action on a cron schedule (recommended)

Add `.github/workflows/scheduled-rebuild.yml`:

```yaml
name: Weekly blog rebuild
on:
  schedule:
    - cron: '0 16 * * 3'   # Every Wednesday at 9am Pacific (4pm UTC)
  workflow_dispatch:        # also allow manual trigger from GitHub UI
jobs:
  trigger-render-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Render deploy
        run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_URL }}
```

Then in Render, go to the static site service → Settings → Deploy Hook, copy the URL, and add it to GitHub repo Settings → Secrets → `RENDER_DEPLOY_HOOK_URL`.

### Option 2 — External cron service (cron-job.org, EasyCron, etc.)

Same idea — copy the Render Deploy Hook URL and configure an external service to POST to it on a schedule. No GitHub integration needed.

### Option 3 — Render Cron Jobs

Render supports cron jobs natively, but they're meant for separate worker services (you'd be paying for a tiny container that just curls the deploy hook). Less efficient than Option 1 or 2.

---

## Troubleshooting

**"I added a post but it's not showing up on the live site even though the date has passed."**

- Hard-refresh the page (Cmd+Shift+R) to bypass cached JS
- Check the browser console for errors
- Verify the date is in `YYYY-MM-DD` format and that the year/month/day are what you intended
- Run `grep "slug: 'your-slug'" src/content/blog/posts.ts` to confirm the post is actually in the file

**"I added a post but it's not showing up in the sitemap even though I deployed."**

- Did the build actually run the sitemap script? Check the deploy logs for `Sitemap generated with X static + Y blog URLs`
- Is the date in the past? Run `grep -A1 "slug: 'your-slug'" src/content/blog/posts.ts` to verify
- Check `dist/sitemap.xml` (after build) — does it contain the URL?

**"I want a post to go live but I'm not ready to deploy."**

You can't separate them under the current system — Layer 1 (live site visibility) is automatic and based on the date. If you want to delay live visibility, set a later date. If you want to delay sitemap appearance, just don't redeploy.

**"The build script broke."**

Most likely cause: a syntax error in the new post's `content` template literal. Check for unescaped backticks (`` ` ``) or `${}` in the markdown.

---

## Why This Approach (vs. a CMS)

For a small marketing site with infrequent posts written by one person, this hardcoded approach has real advantages:

- **Zero infrastructure** — no CMS to host, no database, no admin auth
- **Version-controlled content** — every edit is a git commit
- **No runtime dependencies** — the build is fully static, hosting is just a CDN
- **Fast iteration** — adding a post is one file edit
- **Cheap** — Render static site hosting is free at this volume

The tradeoff is that adding posts requires touching code, which means it's not delegate-able to non-technical contributors. If that ever becomes a need, this is when you'd migrate to a headless CMS like Contentful, Sanity, or Notion-as-CMS.
