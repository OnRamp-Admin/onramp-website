/**
 * generate-sitemap.mjs
 *
 * Writes sitemap.xml from the shared route list in site-routes.mjs.
 * Writes to BOTH dist/ (for production serving) and public/ (so dev/preview
 * serves the same file). Add new routes in site-routes.mjs, not here.
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getAllRoutes, SITE_URL } from './site-routes.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const routes = getAllRoutes();

const urlBlocks = routes.map((r) => {
  const lines = [
    `    <loc>${SITE_URL}${r.path}</loc>`,
    r.lastmod ? `    <lastmod>${r.lastmod}</lastmod>` : null,
    `    <changefreq>${r.changefreq}</changefreq>`,
    `    <priority>${r.priority}</priority>`,
  ].filter(Boolean);
  return `  <url>\n${lines.join('\n')}\n  </url>`;
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlBlocks.join('\n')}
</urlset>
`;

writeFileSync(resolve(__dirname, '../dist/sitemap.xml'), sitemap);
writeFileSync(resolve(__dirname, '../public/sitemap.xml'), sitemap);

const staticCount = routes.filter((r) => !r.path.startsWith('/blog/')).length;
const blogCount = routes.length - staticCount;
console.log(`Sitemap generated with ${staticCount} static + ${blogCount} blog URLs`);
