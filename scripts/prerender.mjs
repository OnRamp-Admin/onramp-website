/**
 * prerender.mjs
 *
 * Generates a static HTML file per route so Google (and non-JS social crawlers
 * like LinkedIn / X / Slack) see fully-rendered pages with correct <title>,
 * <meta name="description">, canonical, and Open Graph tags in the source.
 *
 * Pipeline:
 *   1. Spin up a tiny static file server over dist/ with SPA fallback.
 *   2. Launch headless Chromium via Puppeteer.
 *   3. For each route from site-routes.mjs:
 *        - page.goto(route), wait for React + useSEO() to finish.
 *        - Snapshot document.documentElement.outerHTML.
 *        - Write to dist/<route>/index.html.
 *   4. Close browser + server.
 *
 * The prerendered HTML still contains the same <script type="module"> bundle,
 * so React hydrates on top. See src/main.tsx — it uses hydrateRoot() when the
 * #root element has prerendered children and createRoot() otherwise.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { resolve, dirname, join, extname } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import puppeteer from 'puppeteer';
import Beasties from 'beasties';
import { getAllRoutes } from './site-routes.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = resolve(__dirname, '../dist');
const PORT = 47321;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.wav':  'audio/wav',
  '.mp3':  'audio/mpeg',
  '.m4a':  'audio/mp4',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.txt':  'text/plain; charset=utf-8',
  '.xml':  'application/xml; charset=utf-8',
};

// Snapshot of the raw un-prerendered index.html, used as the SPA fallback
// during the prerender pass. We capture it BEFORE any route is written so
// that rendering /pricing doesn't accidentally hydrate on top of a previously-
// prerendered /homepage.
let spaShellHtml = '';

// Minimal static file server — serves real asset files when they exist,
// otherwise returns the captured SPA shell so React Router can render any
// route during the prerender pass.
function handleRequest(req, res) {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = decodeURIComponent(url.pathname);

    // Only serve real files if they're under /assets/ or have a non-HTML
    // extension. This prevents previously-written dist/<route>/index.html
    // from being served while we're still prerendering other routes.
    const ext = extname(pathname);
    const isAsset = pathname.startsWith('/assets/') || (ext && ext !== '.html');

    if (isAsset) {
      const filePath = join(DIST_DIR, pathname);
      if (existsSync(filePath) && statSync(filePath).isFile()) {
        const type = MIME[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': type });
        res.end(readFileSync(filePath));
        return;
      }
    }

    // SPA fallback for every HTML request — always serves the shell.
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(spaShellHtml);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Server error: ${err.message}`);
  }
}

async function prerender() {
  const routes = getAllRoutes();
  console.log(`Prerendering ${routes.length} routes...`);

  // Capture the raw Vite-built index.html as our SPA shell BEFORE we start
  // overwriting routes. Used for in-memory SPA fallback during the prerender
  // pass AND written to disk as 200.html for the production SPA fallback.
  spaShellHtml = readFileSync(join(DIST_DIR, 'index.html'), 'utf-8');
  writeFileSync(join(DIST_DIR, '200.html'), spaShellHtml);

  // Beasties (Google's critical-CSS extractor) — processes each page's HTML
  // to inline the CSS rules that match above-the-fold elements. The external
  // <link rel="stylesheet"> is converted to a <link rel="preload" as="style">
  // with a JS-based onload swap, so the full stylesheet still loads but doesn't
  // block initial paint.
  const beasties = new Beasties({
    path: DIST_DIR,
    publicPath: '/',
    // "swap" keeps the original <link> but converts it to preload + onload,
    // plus adds a <noscript> fallback so CSS still works without JS.
    preload: 'swap',
    // Inline any font-face rules used above the fold — avoids FOIT.
    inlineFonts: true,
    // Don't prune the source CSS file from dist/ — it's needed for
    // below-the-fold content after async load.
    pruneSource: false,
    // Log level: only errors (skip info about inlined bytes per page).
    logLevel: 'error',
  });

  const server = createServer(handleRequest);
  await new Promise((r) => server.listen(PORT, r));

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let failures = 0;

  try {
    const page = await browser.newPage();
    await page.setUserAgent('OnRampPrerender/1.0');

    page.on('pageerror', (err) => {
      console.warn(`  [pageerror]:`, err.message);
    });

    for (const route of routes) {
      const url = `http://localhost:${PORT}${route.path}`;
      process.stdout.write(`  → ${route.path.padEnd(60)}`);

      try {
        await page.goto(url, {
          waitUntil: 'networkidle0',
          timeout: 60_000,
        });

        // Wait until React has mounted content AND useSEO has set a
        // non-default document.title. Fallback to a short timeout if a route
        // legitimately keeps the default (e.g. the homepage title matches).
        await page.waitForFunction(
          () => {
            const root = document.getElementById('root');
            return root && root.children.length > 0 && document.title.length > 0;
          },
          { timeout: 30_000 }
        );

        let html = await page.content();

        // Inline critical above-the-fold CSS for this specific page.
        // Beasties reads the referenced CSS file from dist/, matches selectors
        // against the HTML, and inlines only the matching rules as <style> in
        // <head>. The external stylesheet becomes a preload that applies after
        // paint, so first contentful paint doesn't wait for the network.
        try {
          html = await beasties.process(html);
        } catch (critErr) {
          console.warn(`  [beasties]: ${critErr.message}`);
        }

        const outputDir =
          route.path === '/' ? DIST_DIR : join(DIST_DIR, route.path);
        mkdirSync(outputDir, { recursive: true });
        writeFileSync(join(outputDir, 'index.html'), html);

        console.log('✓');
      } catch (err) {
        failures++;
        console.log(`✗ ${err.message}`);
      }
    }
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }

  if (failures > 0) {
    console.error(`Prerender finished with ${failures} failure(s).`);
    process.exit(1);
  }
  console.log(`Prerendered ${routes.length} routes to ${DIST_DIR}/`);
}

prerender().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
