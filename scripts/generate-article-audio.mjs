#!/usr/bin/env node
/**
 * generate-article-audio.mjs
 *
 * CLI wrapper over scripts/lib/article-audio-generation.mjs. Generates the
 * "Listen to article" TTS audio for one or more blog posts, uploads to GCS,
 * and writes `articleAudioUrl` + `articleDurationSec` + `articleTranscript`
 * back into posts.ts.
 *
 * Usage:
 *   node scripts/generate-article-audio.mjs                 # all missing
 *   node scripts/generate-article-audio.mjs <slug>          # one post
 *   node scripts/generate-article-audio.mjs --force         # regenerate all
 *   node scripts/generate-article-audio.mjs <slug> --force  # regenerate one
 *
 * Requires `gcloud auth application-default login`, `ffmpeg`, and `ffprobe`.
 */

import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import {
  VOICE_NAME,
  generateArticleAudio,
} from './lib/article-audio-generation.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_PATH = resolve(__dirname, '../src/content/blog/posts.ts');

const args = process.argv.slice(2);
const force = args.includes('--force');
const slugFilter = args.find((a) => !a.startsWith('--'));

function unescapeJsString(s) {
  if (!s) return s;
  return s.replace(/\\(.)/g, (_, ch) => {
    if (ch === 'n') return '\n';
    if (ch === 't') return '\t';
    return ch;
  });
}

function parsePosts(src) {
  const posts = [];
  const slugMatches = [...src.matchAll(/^ {2}\{[\s\S]*?slug: '([^']+)'/gm)];
  for (let i = 0; i < slugMatches.length; i++) {
    const slug = slugMatches[i][1];
    const startIdx = slugMatches[i].index;
    const endIdx = i + 1 < slugMatches.length ? slugMatches[i + 1].index : src.length;
    const block = src.slice(startIdx, endIdx);

    const titleMatch = block.match(/title:\s*'((?:\\.|[^\\'])*)'/)
      || block.match(/title:\s*"((?:\\.|[^\\"])*)"/)
      || block.match(/title:\s*`([^`]*)`/);
    const descriptionMatch = block.match(/description:\s*`([\s\S]*?)`,\s*\n/)
      || block.match(/description:\s*'((?:\\.|[^\\'])*)',\s*\n/)
      || block.match(/description:\s*"((?:\\.|[^\\"])*)",\s*\n/);
    const contentMatch = block.match(/content:\s*`([\s\S]*?)`,\s*\n\s*\},?\s*$/m)
      || block.match(/content:\s*`([\s\S]*)`,?\n/);
    const hasArticleAudio = /articleAudioUrl: '/.test(block);

    posts.push({
      slug,
      title: unescapeJsString(titleMatch?.[1]),
      description: unescapeJsString(descriptionMatch?.[1]),
      content: contentMatch?.[1],
      hasArticleAudio,
    });
  }
  return posts;
}

const src = readFileSync(POSTS_PATH, 'utf-8');
const posts = parsePosts(src);

const workItems = posts.filter((p) => {
  if (slugFilter && p.slug !== slugFilter) return false;
  if (!force && p.hasArticleAudio) return false;
  if (!p.content) return false;
  return true;
});

if (workItems.length === 0) {
  console.log('Nothing to generate. All posts already have articleAudioUrl.');
  console.log('Use --force to regenerate, or pass a slug to target one post.');
  process.exit(0);
}

console.log(`Generating article audio for ${workItems.length} post(s), voice=${VOICE_NAME}:\n`);
for (const p of workItems) console.log(`  - ${p.slug}`);
console.log();

let success = 0;
let failed = 0;

for (let i = 0; i < workItems.length; i++) {
  const post = workItems[i];
  const progress = `[${i + 1}/${workItems.length}]`;
  console.log(`${progress} ${post.slug}`);

  try {
    const start = Date.now();
    const result = await generateArticleAudio({
      slug: post.slug,
      title: post.title,
      description: post.description,
      content: post.content,
      postsPath: POSTS_PATH,
      onProgress: (evt) => {
        if (evt.stage === 'start') {
          console.log(`  payload: ${evt.payloadChars} chars`);
        } else if (evt.stage === 'tts') {
          console.log(`    ... still waiting on Gemini TTS (attempt ${evt.attempt}): ${Math.round(evt.elapsedMs / 1000)}s elapsed`);
        } else if (evt.stage === 'retry') {
          console.warn(`  ⚠ TTS transient failure — retry ${evt.attempt} in ${evt.delayMs / 1000}s (${evt.reason})`);
        } else if (evt.stage === 'synthesized') {
          console.log(`  synthesized ${evt.bytes} bytes (${evt.mimeType})`);
        } else if (evt.stage === 'converting') {
          console.log(`  converting to m4a...`);
        } else if (evt.stage === 'converted') {
          console.log(`  duration: ${evt.durationSec}s`);
        } else if (evt.stage === 'uploading') {
          console.log(`  uploading to gs://onramp-marketing-media/${evt.objectName}`);
        }
      },
    });
    console.log(`  ✓ ${result.audioUrl} (${((Date.now() - start) / 1000).toFixed(1)}s total)\n`);
    success++;
  } catch (err) {
    console.error(`  ✗ ${err.message}\n`);
    failed++;
  }
}

console.log(`Done. ${success} succeeded, ${failed} failed.`);
process.exit(failed > 0 ? 1 : 0);
