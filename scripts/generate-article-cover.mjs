#!/usr/bin/env node
/**
 * generate-article-cover.mjs
 *
 * CLI wrapper for cover-image generation. For iterative visual review across
 * many posts, prefer the dev-only review page at /admin/cover-review — it
 * supports prompt-based revisions against an existing candidate image.
 *
 * Usage:
 *   node scripts/generate-article-cover.mjs                  # all missing (interactive y/n)
 *   node scripts/generate-article-cover.mjs <slug>           # one post
 *   node scripts/generate-article-cover.mjs <slug> --force   # regenerate even if image exists
 *   node scripts/generate-article-cover.mjs --yes            # batch, skip interactive review
 *
 * Requires `gcloud auth application-default login`.
 */

import { mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';
import { tmpdir } from 'os';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import {
  GCS_BUCKET,
  GCS_PREFIX,
  MODEL,
  buildBasePrompt,
  extFromMime,
  generateCover,
  injectImageUrl,
  parsePosts,
  processCoverImage,
  uploadToGCS,
} from './lib/cover-generation.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_PATH = resolve(__dirname, '../src/content/blog/posts.ts');

const args = process.argv.slice(2);
const force = args.includes('--force');
const batchYes = args.includes('--yes');
const slugFilter = args.find((a) => !a.startsWith('--'));

function askYesNo(question) {
  return new Promise((resolvePromise) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (ans) => {
      rl.close();
      resolvePromise(/^y(es)?$/i.test(ans.trim()));
    });
  });
}

const src = readFileSync(POSTS_PATH, 'utf-8');
const posts = parsePosts(src);

const workItems = posts.filter((p) => {
  if (slugFilter && p.slug !== slugFilter) return false;
  if (!force && p.currentImage) return false;
  if (!p.title) return false;
  return true;
});

if (workItems.length === 0) {
  console.log('Nothing to generate. All posts already have an image.');
  console.log('Use --force to regenerate, or pass a slug to target one post.');
  process.exit(0);
}

console.log(`Generating covers for ${workItems.length} post(s) using ${MODEL}:\n`);
for (const p of workItems) console.log(`  - ${p.slug}`);
console.log();

let success = 0;
let failed = 0;
let skipped = 0;
const workDir = mkdtempSync(join(tmpdir(), 'onramp-cover-'));

for (let i = 0; i < workItems.length; i++) {
  const post = workItems[i];
  const progress = `[${i + 1}/${workItems.length}]`;
  console.log(`${progress} ${post.slug}`);
  console.log(`  title: ${post.title}`);

  try {
    const prompt = buildBasePrompt(post.title, post.description);
    const start = Date.now();
    const img = await generateCover(prompt);
    console.log(`  generated ${img.bytes.length} bytes in ${((Date.now() - start) / 1000).toFixed(1)}s (${img.mimeType})`);

    const ext = extFromMime(img.mimeType);
    const localPath = join(workDir, `${post.slug}-cover.${ext}`);
    writeFileSync(localPath, img.bytes);
    console.log(`  saved locally: ${localPath}`);

    if (!batchYes) {
      console.log(`  (open the file above to review, then press y to upload)`);
      const ok = await askYesNo('  Upload to GCS and use on this post? [y/N] ');
      if (!ok) {
        console.log(`  skipped — will not upload.\n`);
        skipped++;
        continue;
      }
    }

    console.log(`  processing to WebP hero + thumbnail...`);
    const { hero, thumb } = await processCoverImage(img.bytes);
    console.log(`  hero: ${hero.length} bytes, thumb: ${thumb.length} bytes (from ${img.bytes.length} source)`);

    const heroObject = `${GCS_PREFIX}/${post.slug}-cover.webp`;
    const thumbObject = `${GCS_PREFIX}/${post.slug}-cover-thumb.webp`;
    console.log(`  uploading to gs://${GCS_BUCKET}/${heroObject} + thumb`);
    await Promise.all([
      uploadToGCS(hero, GCS_BUCKET, heroObject, 'image/webp'),
      uploadToGCS(thumb, GCS_BUCKET, thumbObject, 'image/webp'),
    ]);

    const v = Date.now();
    const imageUrl = `https://storage.googleapis.com/${GCS_BUCKET}/${heroObject}?v=${v}`;
    injectImageUrl(POSTS_PATH, post.slug, imageUrl);

    console.log(`  ✓ ${imageUrl}\n`);
    success++;
  } catch (err) {
    console.error(`  ✗ ${err.message}\n`);
    failed++;
  }
}

console.log(`Done. ${success} uploaded, ${skipped} skipped, ${failed} failed.`);
process.exit(failed > 0 ? 1 : 0);
