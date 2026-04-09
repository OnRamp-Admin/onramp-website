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
