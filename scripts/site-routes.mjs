/**
 * site-routes.mjs
 *
 * Single source of truth for every public URL on getonramp.io.
 * Consumed by:
 *   - scripts/generate-sitemap.mjs  (writes public/sitemap.xml + dist/sitemap.xml)
 *   - scripts/prerender.mjs         (writes dist/<route>/index.html per route)
 *
 * ────────────────────────────────────────────────────────────────────────────
 * TO ADD A NEW PAGE:
 *   1. Add the <Route> in src/App.tsx.
 *   2. Add an entry to `staticRoutes` below.
 *   3. That's it — next `npm run build` prerenders it and puts it in the sitemap.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const SITE_URL = 'https://getonramp.io';

export const staticRoutes = [
  { path: '/',            changefreq: 'weekly',  priority: '1.0' },
  { path: '/technicians', changefreq: 'weekly',  priority: '0.9' },
  { path: '/managers',    changefreq: 'weekly',  priority: '0.9' },
  { path: '/how-it-works',changefreq: 'weekly',  priority: '0.9' },
  { path: '/pricing',     changefreq: 'weekly',  priority: '0.9' },
  { path: '/faq',         changefreq: 'monthly', priority: '0.7' },
  { path: '/blog',        changefreq: 'weekly',  priority: '0.8' },
  { path: '/about',       changefreq: 'monthly', priority: '0.6' },
  { path: '/contact',     changefreq: 'monthly', priority: '0.6' },
  { path: '/mobileapp',   changefreq: 'monthly', priority: '0.5' },
  { path: '/privacy',     changefreq: 'yearly',  priority: '0.3' },
  { path: '/terms',       changefreq: 'yearly',  priority: '0.3' },
];

/**
 * Extract { slug, date } for every blog post from src/content/blog/posts.ts.
 * Future-dated posts are excluded so Google doesn't try to crawl URLs that
 * haven't gone live yet (they're gated by a runtime filter in posts.ts too).
 */
export function getBlogRoutes() {
  const postsFile = readFileSync(
    resolve(__dirname, '../src/content/blog/posts.ts'),
    'utf-8'
  );
  const postBlockRegex = /slug:\s*'([^']+)'[\s\S]*?date:\s*'([^']+)'/g;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const routes = [];
  let match;
  while ((match = postBlockRegex.exec(postsFile)) !== null) {
    const slug = match[1];
    const dateStr = match[2];
    const postDate = new Date(dateStr + 'T00:00:00');
    if (postDate <= today) {
      routes.push({
        path: `/blog/${slug}`,
        lastmod: dateStr,
        changefreq: 'monthly',
        priority: '0.7',
      });
    }
  }
  return routes;
}

export function getAllRoutes() {
  return [...staticRoutes, ...getBlogRoutes()];
}
