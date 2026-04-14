#!/usr/bin/env node
/**
 * trigger-redeploy.mjs
 *
 * Fires a Render Deploy Hook to rebuild the marketing site. Executed by the
 * `onramp-website-weekly-rebuild` Render cron_job on a weekly schedule so that
 * future-dated blog posts whose `date` has just passed get refreshed into the
 * sitemap for Google crawling.
 *
 * Layer 1 (runtime date filter in src/content/blog/posts.ts) reveals new
 * posts on the live site automatically — this rebuild only exists to refresh
 * the build-time sitemap (Layer 2).
 *
 * Requires DEPLOY_HOOK_URL env var. The URL is generated from the Render
 * dashboard: onramp-website → Settings → Deploy Hook.
 */

const url = process.env.DEPLOY_HOOK_URL;
if (!url) {
  console.error('DEPLOY_HOOK_URL env var is not set.');
  process.exit(1);
}

const res = await fetch(url, { method: 'POST' });
const body = await res.text();

if (!res.ok) {
  console.error(`Deploy hook failed: HTTP ${res.status}`);
  console.error(body);
  process.exit(1);
}

console.log(`Deploy hook triggered: HTTP ${res.status}`);
console.log(body);
