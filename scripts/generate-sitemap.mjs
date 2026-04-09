import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://getonramp.io';

// Extract blog post slug + date pairs from posts.ts
// Each post has the structure: { slug: '...', title: '...', date: '...', ... }
// We pair the slug with the FIRST date that follows it (the post's own date field).
// Future-dated posts are excluded so Google doesn't try to crawl URLs that don't yet exist.
const postsFile = readFileSync(resolve(__dirname, '../src/content/blog/posts.ts'), 'utf-8');
const postBlockRegex = /slug:\s*'([^']+)'[\s\S]*?date:\s*'([^']+)'/g;
const today = new Date();
today.setHours(0, 0, 0, 0);

const blogSlugs = [];
let match;
while ((match = postBlockRegex.exec(postsFile)) !== null) {
  const slug = match[1];
  const dateStr = match[2];
  const postDate = new Date(dateStr + 'T00:00:00');
  if (postDate <= today) {
    blogSlugs.push({ slug, date: dateStr });
  }
}

// Static routes with priority and changefreq
const staticRoutes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/technicians', changefreq: 'weekly', priority: '0.9' },
  { path: '/managers', changefreq: 'weekly', priority: '0.9' },
  { path: '/how-it-works', changefreq: 'weekly', priority: '0.9' },
  { path: '/pricing', changefreq: 'weekly', priority: '0.9' },
  { path: '/faq', changefreq: 'monthly', priority: '0.7' },
  { path: '/blog', changefreq: 'weekly', priority: '0.8' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
  { path: '/mobileapp', changefreq: 'monthly', priority: '0.5' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
];

// Build XML
const urls = [
  ...staticRoutes.map(
    (r) => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  ),
  ...blogSlugs.map(
    ({ slug, date }) => `  <url>
    <loc>${SITE_URL}/blog/${slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
  ),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

// Write to dist/ (post-build) and public/ (for dev)
const distPath = resolve(__dirname, '../dist/sitemap.xml');
const publicPath = resolve(__dirname, '../public/sitemap.xml');

writeFileSync(distPath, sitemap);
writeFileSync(publicPath, sitemap);

console.log(`Sitemap generated with ${staticRoutes.length} static + ${blogSlugs.length} blog URLs`);
