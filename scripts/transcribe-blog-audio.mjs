#!/usr/bin/env node
/**
 * transcribe-blog-audio.mjs
 *
 * Backfills missing transcripts for blog audio files (brief / podcast /
 * article) using Vertex AI Gemini. Thin CLI over scripts/lib/transcript-generation.mjs.
 *
 * Usage:
 *   node scripts/transcribe-blog-audio.mjs                    # all missing (brief + podcast)
 *   node scripts/transcribe-blog-audio.mjs <slug>             # one post only
 *   node scripts/transcribe-blog-audio.mjs <slug> --podcast   # one format only
 *   node scripts/transcribe-blog-audio.mjs <slug> --brief
 *   node scripts/transcribe-blog-audio.mjs <slug> --article   # article audio
 *   node scripts/transcribe-blog-audio.mjs --force            # re-transcribe even if exists
 *
 * Requires `gcloud auth application-default login`.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  transcribeAudio,
  urlToGcsUri,
  writeTranscript,
} from './lib/transcript-generation.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_PATH = resolve(__dirname, '../src/content/blog/posts.ts');

const args = process.argv.slice(2);
const force = args.includes('--force');
const onlyPodcast = args.includes('--podcast');
const onlyBrief = args.includes('--brief');
const onlyArticle = args.includes('--article');
const slugFilter = args.find((a) => !a.startsWith('--'));

function parsePosts(src) {
  const posts = [];
  const slugMatches = [...src.matchAll(/^ {2}\{[\s\S]*?slug: '([^']+)'/gm)];
  for (let i = 0; i < slugMatches.length; i++) {
    const slug = slugMatches[i][1];
    const startIdx = slugMatches[i].index;
    const endIdx = i + 1 < slugMatches.length ? slugMatches[i + 1].index : src.length;
    const block = src.slice(startIdx, endIdx);
    posts.push({
      slug,
      briefUrl: block.match(/briefAudioUrl: '([^']+)'/)?.[1],
      briefHasTranscript: /briefTranscript: /.test(block),
      podcastUrl: block.match(/podcastAudioUrl: '([^']+)'/)?.[1],
      podcastHasTranscript: /podcastTranscript: /.test(block),
      articleUrl: block.match(/articleAudioUrl: '([^']+)'/)?.[1],
      articleHasTranscript: /articleTranscript: /.test(block),
    });
  }
  return posts;
}

const posts = parsePosts(readFileSync(POSTS_PATH, 'utf-8'));

// Decide which kinds to consider based on flags. If any single-kind flag is
// set, we restrict to that kind; otherwise we cover brief + podcast (legacy
// default). `article` is opt-in via the flag since it's usually auto-written
// by the TTS generator itself.
const kinds = [];
if (onlyBrief) kinds.push('brief');
if (onlyPodcast) kinds.push('podcast');
if (onlyArticle) kinds.push('article');
if (kinds.length === 0) kinds.push('brief', 'podcast');

const workItems = [];
for (const post of posts) {
  if (slugFilter && post.slug !== slugFilter) continue;
  for (const kind of kinds) {
    const url = post[`${kind}Url`];
    const hasTranscript = post[`${kind}HasTranscript`];
    if (url && (force || !hasTranscript)) {
      workItems.push({ slug: post.slug, kind, url });
    }
  }
}

if (workItems.length === 0) {
  console.log('Nothing to transcribe. All selected audio files already have transcripts.');
  console.log('Use --force to re-transcribe existing entries.');
  process.exit(0);
}

console.log(`Found ${workItems.length} audio file(s) to transcribe:\n`);
for (const item of workItems) {
  console.log(`  - ${item.slug} (${item.kind})`);
}
console.log();

let success = 0;
let failed = 0;

for (let i = 0; i < workItems.length; i++) {
  const item = workItems[i];
  const progress = `[${i + 1}/${workItems.length}]`;
  console.log(`${progress} Transcribing ${item.slug} (${item.kind})...`);

  try {
    const start = Date.now();
    const gcsUri = urlToGcsUri(item.url);
    const transcript = await transcribeAudio(gcsUri);
    const elapsedSec = ((Date.now() - start) / 1000).toFixed(1);
    console.log(
      `${progress} ✓ ${transcript.length} chars (${transcript.split(/\s+/).length} words) in ${elapsedSec}s`,
    );
    writeTranscript(POSTS_PATH, item.slug, item.kind, transcript);
    success++;
  } catch (err) {
    console.error(`${progress} ✗ Failed: ${err.message}`);
    failed++;
  }
}

console.log();
console.log(`Done. ${success} succeeded, ${failed} failed.`);
process.exit(failed > 0 ? 1 : 0);
