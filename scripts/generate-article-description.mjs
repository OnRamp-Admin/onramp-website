#!/usr/bin/env node
/**
 * generate-article-description.mjs
 *
 * CLI wrapper for rewriting blog post descriptions. For multi-post review
 * prefer the dev-only /admin/description-review page, which supports
 * prompt-based revisions and in-UI editing before writing to posts.ts.
 *
 * This CLI is useful for:
 *   - Quickly regenerating one post's description in the terminal.
 *   - Listing posts that need a rewrite (by heuristic).
 *
 * Usage:
 *   node scripts/generate-article-description.mjs                 # needs-rewrite posts (default)
 *   node scripts/generate-article-description.mjs --all           # every post
 *   node scripts/generate-article-description.mjs <slug>          # one post, prints draft
 *   node scripts/generate-article-description.mjs <slug> --write  # one post, draft + write back
 *   node scripts/generate-article-description.mjs --list          # print which posts need rewrite
 *
 * Requires `gcloud auth application-default login`.
 */

import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import {
  CHAR_MAX,
  CHAR_MIN,
  draftDescription,
  needsRewriteReasons,
  parsePosts,
  writeDescription,
} from './lib/description-generation.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_PATH = resolve(__dirname, '../src/content/blog/posts.ts');

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const slugFilter = args.find((a) => !a.startsWith('--'));

const src = readFileSync(POSTS_PATH, 'utf-8');
const posts = parsePosts(src);

if (flags.has('--list')) {
  for (const p of posts) {
    const reasons = needsRewriteReasons(p);
    if (reasons.length === 0) continue;
    console.log(`- ${p.slug}  [${reasons.join(', ')}]`);
  }
  process.exit(0);
}

const workItems = posts.filter((p) => {
  if (slugFilter && p.slug !== slugFilter) return false;
  if (slugFilter || flags.has('--all')) return true;
  return needsRewriteReasons(p).length > 0;
});

if (workItems.length === 0) {
  console.log('Nothing to draft. All descriptions pass the needs-rewrite heuristic.');
  console.log('Use --all to draft every post, or pass a slug to force one.');
  process.exit(0);
}

function charQualityLabel(n) {
  if (n >= CHAR_MIN && n <= CHAR_MAX) return '✓ in range';
  if (n >= 100 && n <= 165) return '~ close';
  return '✗ out of range';
}

const shouldWrite = flags.has('--write') && !!slugFilter;

console.log(`Drafting ${workItems.length} description(s):\n`);

let success = 0;
let failed = 0;

for (let i = 0; i < workItems.length; i++) {
  const post = workItems[i];
  const progress = `[${i + 1}/${workItems.length}]`;
  console.log(`${progress} ${post.slug}`);
  console.log(`  title: ${post.title}`);
  console.log(`  current (${post.description?.length ?? 0} chars): ${post.description?.slice(0, 120) || '(none)'}...`);

  try {
    const start = Date.now();
    const draft = await draftDescription({
      title: post.title,
      body: post.content,
      currentDescription: post.description,
    });
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`  draft   (${draft.length} chars, ${charQualityLabel(draft.length)}, ${elapsed}s):`);
    console.log(`    ${draft}`);

    if (shouldWrite) {
      writeDescription(POSTS_PATH, post.slug, draft);
      console.log(`  ✓ written to posts.ts\n`);
    } else {
      console.log('');
    }

    success++;
  } catch (err) {
    console.error(`  ✗ ${err.message}\n`);
    failed++;
  }
}

console.log(`Done. ${success} drafted, ${failed} failed.`);
if (!shouldWrite) {
  console.log(`\nDrafts not written. Pass --write along with a single <slug> to save, or use the review UI at /admin/description-review for multi-post approval.`);
}
process.exit(failed > 0 ? 1 : 0);
