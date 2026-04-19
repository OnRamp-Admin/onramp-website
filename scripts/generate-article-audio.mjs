#!/usr/bin/env node
/**
 * generate-article-audio.mjs
 *
 * Generates a verbatim "Listen to article" audio track for each blog post via
 * Gemini TTS (Vertex AI) using the Sadaltager prebuilt voice, uploads to GCS,
 * and writes the URL + duration + transcript back into posts.ts.
 *
 * Run this before publishing a post so the "Listen to article" player is
 * live on day 1. Only regenerates posts that don't already have
 * `articleAudioUrl` set (unless --force).
 *
 * Usage:
 *   node scripts/generate-article-audio.mjs                 # all missing
 *   node scripts/generate-article-audio.mjs <slug>          # one post
 *   node scripts/generate-article-audio.mjs --force         # regenerate all
 *   node scripts/generate-article-audio.mjs <slug> --force  # regenerate one
 *
 * Requires:
 * - gcloud Application Default Credentials (`gcloud auth application-default login`)
 * - ffmpeg + ffprobe on PATH (for format conversion + duration measurement)
 * - gsutil on PATH (for the upload step)
 *
 * Model + voice selection:
 * - Default model: gemini-2.5-flash-preview-tts (stable on Vertex as of
 *   April 2026). If the Gemini 3 TTS family reaches GA on Vertex, swap
 *   MODEL below.
 * - Voice: Sadaltager (warm, measured, English male — matches the OnRamp
 *   brand). Full prebuilt voice list:
 *   https://ai.google.dev/gemini-api/docs/speech-generation#voices
 */

import { execSync } from 'child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { GoogleAuth } from 'google-auth-library';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_PATH = resolve(__dirname, '../src/content/blog/posts.ts');
const PROJECT_ID = 'gen-lang-client-0614585924';
const LOCATION = 'us-central1';
const MODEL = 'gemini-2.5-flash-preview-tts';
const VOICE_NAME = 'Sadaltager';
const GCS_BUCKET = 'onramp-marketing-media';
const GCS_PREFIX = 'blog';
const CACHE_HEADER = 'public, max-age=2592000'; // 30 days

const TTS_INSTRUCTION = `You are reading this blog article aloud for the OnRamp blog "Listen to article" feature. Target audience: automotive service center owners, managers, and technicians. Read in a clear, measured, professional pace. Do not skip content. Do not summarize. Read the text verbatim.

Structure of what follows:
1. The post TITLE — read it clearly, slightly slower, as an announcement. Brief pause after.
2. A short SUMMARY paragraph — read it as a spoken dek / intro. Brief pause after.
3. The BODY of the article. Use natural inflection on section headings (slightly slower, slightly lower pitch). Pause briefly between paragraphs.
4. The OUTRO — a short standard wrap-up and call to action. Shift to a slightly warmer, conversational tone; this is the sign-off.

Ignore section markers like "TITLE:", "SUMMARY:", "BODY:", or "OUTRO:" — those are just for you to know what part you are on. Do not say them aloud.`;

/**
 * Standard outro appended to every article. Replaces per-post CTAs so the
 * voice version always ends with a consistent, branded wrap-up — and so we
 * don't read inline link text like "Calculate your shop's ROI →" aloud.
 */
const OUTRO_CTA = `We hope you found this article helpful. ONRAMP is here to help your technicians work at the speed of AI. If you'd like to learn more, please schedule a demo with us. We'd love to share how your shop can drive profitability using ONRAMP.`;

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const force = args.includes('--force');
const slugFilter = args.find((a) => !a.startsWith('--'));

// ---------------------------------------------------------------------------
// Parse posts.ts
// ---------------------------------------------------------------------------

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

    // Title: single-quoted (possibly with escaped '), double-quoted, or backtick.
    const titleMatch = block.match(/title:\s*'((?:\\.|[^\\'])*)'/)
      || block.match(/title:\s*"((?:\\.|[^\\"])*)"/)
      || block.match(/title:\s*`([^`]*)`/);
    // Description: usually a backtick template (long), sometimes a string.
    const descriptionMatch = block.match(/description:\s*`([\s\S]*?)`,\s*\n/)
      || block.match(/description:\s*'((?:\\.|[^\\'])*)',\s*\n/)
      || block.match(/description:\s*"((?:\\.|[^\\"])*)",\s*\n/);
    const contentMatch = block.match(/content:\s*`([\s\S]*?)`,\s*\n\s*\},?\s*$/m) || block.match(/content:\s*`([\s\S]*)`,?\n/);
    const hasArticleAudio = /articleAudioUrl: '/.test(block);

    posts.push({
      slug,
      blockStart: startIdx,
      blockEnd: endIdx,
      block,
      title: unescapeJsString(titleMatch?.[1]),
      description: unescapeJsString(descriptionMatch?.[1]),
      content: contentMatch?.[1],
      hasArticleAudio,
    });
  }
  return posts;
}

// ---------------------------------------------------------------------------
// Markdown → clean plain text
// ---------------------------------------------------------------------------

/**
 * Strip markdown down to readable prose suitable for TTS.
 * - Removes fenced code blocks entirely (Gemini mispronounces code).
 * - Converts `[text](url)` → `text`.
 * - Strips heading hashes but keeps the heading text (with a pause hint).
 * - Strips emphasis/strong markers.
 * - Removes images entirely.
 * - Normalizes table rows to comma-separated sentences (best-effort).
 */
function markdownToPlainText(md) {
  let text = md;

  // Drop the per-post CTA block. Convention: authors end posts with a
  // horizontal rule (---) followed by a short italic CTA / link. That
  // gets replaced at the script level by the standard OUTRO_CTA so the
  // audio always wraps up consistently. Truncate at the LAST `---` line.
  const hrRegex = /^-{3,}\s*$/gm;
  let lastHrIdx = -1;
  let hrMatch;
  while ((hrMatch = hrRegex.exec(text)) !== null) {
    lastHrIdx = hrMatch.index;
  }
  if (lastHrIdx !== -1) {
    text = text.slice(0, lastHrIdx);
  }

  // Fenced code blocks
  text = text.replace(/```[\s\S]*?```/g, '');
  // Inline code
  text = text.replace(/`([^`]+)`/g, '$1');
  // Images: ![alt](url) → alt (or drop)
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
  // Links: [text](url) → text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // HTML tags
  text = text.replace(/<[^>]+>/g, '');
  // Heading prefixes — keep the heading text
  text = text.replace(/^(#{1,6})\s+(.*)$/gm, '$2.');
  // Bold + italic markers
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/\*([^*\n]+)\*/g, '$1');
  text = text.replace(/_([^_\n]+)_/g, '$1');
  // Horizontal rules
  text = text.replace(/^-{3,}$/gm, '');
  // Table separator lines
  text = text.replace(/^\s*\|?[-:|\s]+\|?\s*$/gm, '');
  // Table pipes — convert to commas
  text = text.replace(/\s*\|\s*/g, ', ');
  // Unordered list markers
  text = text.replace(/^\s*[-*+]\s+/gm, '');
  // Ordered list markers
  text = text.replace(/^\s*\d+\.\s+/gm, '');
  // Collapse 3+ blank lines to 2
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

// ---------------------------------------------------------------------------
// Vertex AI TTS via REST
// ---------------------------------------------------------------------------

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

async function synthesizeSpeech(text) {
  const client = await auth.getClient();
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: `${TTS_INSTRUCTION}\n\n---\n\n${text}` }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE_NAME } },
      },
    },
  };

  const res = await client.request({
    url,
    method: 'POST',
    data: body,
  });

  const audioPart = res.data?.candidates?.[0]?.content?.parts?.find(
    (p) => p.inlineData?.mimeType?.startsWith('audio/'),
  );
  if (!audioPart?.inlineData?.data) {
    throw new Error(`No audio returned. Response: ${JSON.stringify(res.data).slice(0, 500)}`);
  }

  return {
    mimeType: audioPart.inlineData.mimeType,
    bytes: Buffer.from(audioPart.inlineData.data, 'base64'),
  };
}

// ---------------------------------------------------------------------------
// Audio conversion + upload
// ---------------------------------------------------------------------------

/**
 * Convert Gemini's raw PCM audio output to m4a.
 *
 * Gemini TTS returns `audio/L16;codec=pcm;rate=<N>` — headerless, 16-bit
 * signed little-endian, mono. ffmpeg needs the format, rate, and channel
 * count explicitly (before -i) because there's no container/header to
 * auto-detect from. If Gemini ever returns a self-describing format (wav,
 * ogg), we fall through to the plain-input path.
 */
function convertToM4A(inputPath, outputPath, mimeType) {
  const m = /rate=(\d+)/.exec(mimeType || '');
  const isRawPCM = /audio\/L16/i.test(mimeType || '') || /codec=pcm/i.test(mimeType || '');
  const rate = m ? m[1] : '24000';

  const cmd = isRawPCM
    ? `ffmpeg -y -f s16le -ar ${rate} -ac 1 -i "${inputPath}" -c:a aac -b:a 96k "${outputPath}"`
    : `ffmpeg -y -i "${inputPath}" -c:a aac -b:a 96k -ac 1 -ar 24000 "${outputPath}"`;

  execSync(cmd, { stdio: 'pipe' });
}

function probeDurationSec(path) {
  const out = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${path}"`,
  )
    .toString()
    .trim();
  return Math.round(parseFloat(out));
}

async function uploadToGCS(localPath, bucket, objectName, contentType) {
  const client = await auth.getClient();
  const bytes = readFileSync(localPath);
  const url = `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(objectName)}`;
  await client.request({
    url,
    method: 'POST',
    headers: {
      'Content-Type': contentType,
      'Cache-Control': CACHE_HEADER,
    },
    body: bytes,
  });
}

// ---------------------------------------------------------------------------
// Write fields back into posts.ts
// ---------------------------------------------------------------------------

function escapeBackticks(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function injectArticleFields(slug, audioUrl, durationSec, transcript) {
  const src = readFileSync(POSTS_PATH, 'utf-8');
  const posts = parsePosts(src);
  const post = posts.find((p) => p.slug === slug);
  if (!post) throw new Error(`Slug not found in posts.ts: ${slug}`);

  const block = src.slice(post.blockStart, post.blockEnd);

  // Remove any existing article* fields (force / idempotence).
  let newBlock = block
    .replace(/^ {4}articleAudioUrl: '[^']*',\n/m, '')
    .replace(/^ {4}articleDurationSec: \d+,\n/m, '')
    .replace(/^ {4}articleTranscript: `[\s\S]*?`,\n/m, '');

  // Find an anchor to insert after. Prefer briefTranscript / podcastTranscript
  // (keeps all article-audio fields near the other audio fields). Fall back
  // to any of the other audio fields; failing that, insert right after
  // `tags: [...]` which every post has.
  const anchorRegexes = [
    /^( {4}podcastTranscript: `[\s\S]*?`,\n)/m,
    /^( {4}briefTranscript: `[\s\S]*?`,\n)/m,
    /^( {4}podcastDurationSec: \d+,\n)/m,
    /^( {4}briefDurationSec: \d+,\n)/m,
    /^( {4}tags: \[[^\]]*\],\n)/m,
  ];

  const insertion = [
    `    articleAudioUrl: '${audioUrl}',\n`,
    `    articleDurationSec: ${durationSec},\n`,
    `    articleTranscript: \`${escapeBackticks(transcript)}\`,\n`,
  ].join('');

  let inserted = false;
  for (const rx of anchorRegexes) {
    if (rx.test(newBlock)) {
      newBlock = newBlock.replace(rx, (_m, anchor) => `${anchor}${insertion}`);
      inserted = true;
      break;
    }
  }
  if (!inserted) {
    throw new Error(
      `Could not find an anchor field to insert article audio after in post '${slug}'.`,
    );
  }

  const newSrc = src.slice(0, post.blockStart) + newBlock + src.slice(post.blockEnd);
  writeFileSync(POSTS_PATH, newSrc);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

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

console.log(`Generating article audio for ${workItems.length} post(s):\n`);
for (const p of workItems) console.log(`  - ${p.slug}`);
console.log();

let success = 0;
let failed = 0;
const workDir = mkdtempSync(join(tmpdir(), 'onramp-tts-'));

for (let i = 0; i < workItems.length; i++) {
  const post = workItems[i];
  const progress = `[${i + 1}/${workItems.length}]`;
  console.log(`${progress} ${post.slug}`);

  try {
    const body = markdownToPlainText(post.content);
    // Assemble what Gemini will read aloud: title, then description as a
    // short spoken dek, then the body, then the standard outro CTA. The
    // TTS_INSTRUCTION tells the model to skip the section markers
    // ("TITLE:", "SUMMARY:", "BODY:", "OUTRO:") themselves.
    const titleLine = post.title ? `TITLE: ${post.title}` : '';
    const summaryLine = post.description ? `SUMMARY: ${post.description.trim()}` : '';
    const spokenPayload = [titleLine, summaryLine, `BODY:\n${body}`, `OUTRO:\n${OUTRO_CTA}`]
      .filter(Boolean)
      .join('\n\n');

    // Transcript shown in the blog UI mirrors what was actually spoken, but
    // without the marker labels — so a user reading along sees the same
    // structure they hear.
    const transcript = [
      post.title || '',
      post.description?.trim() || '',
      body,
      OUTRO_CTA,
    ].filter(Boolean).join('\n\n');

    console.log(`  payload: ${spokenPayload.length} chars (~${Math.round(spokenPayload.split(/\s+/).length / 150)} min spoken)`);
    console.log(`  includes: title=${!!post.title}, description=${!!post.description}, body=${body.length}c, outro=${OUTRO_CTA.length}c`);

    console.log(`  calling ${MODEL} (voice: ${VOICE_NAME})...`);
    const start = Date.now();
    const audio = await synthesizeSpeech(spokenPayload);
    console.log(`  synthesized ${audio.bytes.length} bytes in ${((Date.now() - start) / 1000).toFixed(1)}s (${audio.mimeType})`);

    const rawPath = join(workDir, `${post.slug}-article.raw`);
    const m4aPath = join(workDir, `${post.slug}-article.m4a`);
    writeFileSync(rawPath, audio.bytes);

    console.log(`  converting to m4a (source: ${audio.mimeType})...`);
    convertToM4A(rawPath, m4aPath, audio.mimeType);
    const durationSec = probeDurationSec(m4aPath);
    console.log(`  duration: ${durationSec}s`);

    const objectName = `${GCS_PREFIX}/${post.slug}-article.m4a`;
    console.log(`  uploading to gs://${GCS_BUCKET}/${objectName}`);
    await uploadToGCS(m4aPath, GCS_BUCKET, objectName, 'audio/mp4');

    const v = Date.now();
    const audioUrl = `https://storage.googleapis.com/${GCS_BUCKET}/${objectName}?v=${v}`;
    injectArticleFields(post.slug, audioUrl, durationSec, transcript);

    console.log(`  ✓ wrote article fields to posts.ts\n`);
    success++;
  } catch (err) {
    console.error(`  ✗ ${err.message}\n`);
    failed++;
  }
}

console.log(`Done. ${success} succeeded, ${failed} failed.`);
process.exit(failed > 0 ? 1 : 0);
