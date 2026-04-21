/**
 * generate-og-image.mjs
 *
 * Renders public/og-image.html with headless Chromium at 1200x630 and writes
 * the screenshot to public/og-image.png. Re-run whenever the logo or og-image.html
 * changes.
 *
 * Usage: node scripts/generate-og-image.mjs
 */

import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');
const htmlPath = resolve(publicDir, 'og-image.html');
const outPath = resolve(publicDir, 'og-image.png');

const browser = await puppeteer.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: outPath, type: 'png', omitBackground: false });
  console.log(`Wrote ${outPath}`);
} finally {
  await browser.close();
}
