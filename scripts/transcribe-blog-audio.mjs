#!/usr/bin/env node
/**
 * transcribe-blog-audio.mjs
 *
 * Backfills missing transcripts for blog audio files using Vertex AI Gemini.
 *
 * For each post in src/content/blog/posts.ts that has an audio URL but no
 * corresponding transcript field, this script:
 *   1. Calls Vertex AI Gemini 2.5 Flash with the GCS URI of the audio file
 *   2. Receives a clean text transcript
 *   3. Writes the transcript back into posts.ts as `briefTranscript` or
 *      `podcastTranscript` (next to the existing `briefAudioUrl` etc. fields)
 *
 * Usage:
 *   node scripts/transcribe-blog-audio.mjs                    # all missing
 *   node scripts/transcribe-blog-audio.mjs <slug>             # one post only
 *   node scripts/transcribe-blog-audio.mjs <slug> --podcast   # one format only
 *   node scripts/transcribe-blog-audio.mjs <slug> --brief
 *   node scripts/transcribe-blog-audio.mjs --force            # re-transcribe even if exists
 *
 * Requires gcloud Application Default Credentials. Run `gcloud auth
 * application-default login` once if you've never done this on this machine.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { VertexAI } from '@google-cloud/vertexai';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_PATH = resolve(__dirname, '../src/content/blog/posts.ts');
const PROJECT_ID = 'gen-lang-client-0614585924';
const LOCATION = 'us-central1';
const MODEL = 'gemini-2.5-flash';

const TRANSCRIPTION_PROMPT = `You are transcribing an audio file into a clean, readable text transcript for publication on a blog.

Output requirements:
- Return ONLY the transcript text. No headers, no commentary, no "Here is the transcript", no markdown formatting.
- For dialogue (multiple speakers), label speakers as "Speaker A:" and "Speaker B:" at the start of each turn. Do not guess names.
- For monologue (single speaker), use plain paragraphs with no speaker labels.
- Remove disfluencies like "um", "uh", "you know", "like" when they're filler. Keep them when they carry meaning.
- Use proper punctuation, sentence breaks, and paragraph breaks. New paragraph for each major topic shift.
- Preserve the exact wording of factual statements, numbers, names, and quotes.
- Do NOT summarize, paraphrase, or condense. Verbatim is the goal, with light cleanup of filler only.

Begin transcript now.`;

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const force = args.includes('--force');
const onlyPodcast = args.includes('--podcast');
const onlyBrief = args.includes('--brief');
const slugFilter = args.find((a) => !a.startsWith('--'));

// ---------------------------------------------------------------------------
// Parse posts.ts to find what needs transcription
// ---------------------------------------------------------------------------

const postsSource = readFileSync(POSTS_PATH, 'utf-8');

/**
 * Parse postsSource to extract { slug, briefAudioUrl, briefTranscript,
 * podcastAudioUrl, podcastTranscript } for each post. Uses regex against the
 * structured format we already enforce in posts.ts.
 */
function parsePosts(src) {
  const posts = [];
  // Match each top-level post object: { ... slug: 'X' ... },
  // We'll use the slug line as an anchor and read forward until the next slug
  // (or end of array) to get the post's field range.
  const slugMatches = [...src.matchAll(/^ {2}\{[\s\S]*?slug: '([^']+)'/gm)];
  for (let i = 0; i < slugMatches.length; i++) {
    const slug = slugMatches[i][1];
    const startIdx = slugMatches[i].index;
    const endIdx = i + 1 < slugMatches.length ? slugMatches[i + 1].index : src.length;
    const block = src.slice(startIdx, endIdx);

    const briefUrl = block.match(/briefAudioUrl: '([^']+)'/)?.[1];
    const briefTranscript = !!block.match(/briefTranscript: /);
    const podcastUrl = block.match(/podcastAudioUrl: '([^']+)'/)?.[1];
    const podcastTranscript = !!block.match(/podcastTranscript: /);

    posts.push({
      slug,
      blockStart: startIdx,
      blockEnd: endIdx,
      briefUrl,
      briefHasTranscript: briefTranscript,
      podcastUrl,
      podcastHasTranscript: podcastTranscript,
    });
  }
  return posts;
}

const posts = parsePosts(postsSource);

// Build the work list
const workItems = [];
for (const post of posts) {
  if (slugFilter && post.slug !== slugFilter) continue;

  if (post.briefUrl && (force || !post.briefHasTranscript) && !onlyPodcast) {
    workItems.push({ slug: post.slug, format: 'brief', url: post.briefUrl });
  }
  if (post.podcastUrl && (force || !post.podcastHasTranscript) && !onlyBrief) {
    workItems.push({ slug: post.slug, format: 'podcast', url: post.podcastUrl });
  }
}

if (workItems.length === 0) {
  console.log('Nothing to transcribe. All audio files already have transcripts.');
  console.log('Use --force to re-transcribe existing entries.');
  process.exit(0);
}

console.log(`Found ${workItems.length} audio file(s) to transcribe:\n`);
for (const item of workItems) {
  console.log(`  - ${item.slug} (${item.format})`);
}
console.log();

// ---------------------------------------------------------------------------
// Vertex AI setup
// ---------------------------------------------------------------------------

const vertex = new VertexAI({ project: PROJECT_ID, location: LOCATION });
const model = vertex.getGenerativeModel({
  model: MODEL,
  generationConfig: {
    temperature: 0.0, // deterministic transcription
    maxOutputTokens: 16384,
  },
});

/**
 * Convert a public storage.googleapis.com URL into the gs:// URI Vertex needs.
 *   https://storage.googleapis.com/onramp-marketing-media/blog/foo.m4a
 *   → gs://onramp-marketing-media/blog/foo.m4a
 */
function urlToGcsUri(url) {
  const m = url.match(/^https:\/\/storage\.googleapis\.com\/([^/]+)\/(.+)$/);
  if (!m) throw new Error(`Cannot convert to gs:// URI: ${url}`);
  return `gs://${m[1]}/${m[2]}`;
}

async function transcribeAudio(gcsUri) {
  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          {
            fileData: {
              mimeType: 'audio/mp4',
              fileUri: gcsUri,
            },
          },
          { text: TRANSCRIPTION_PROMPT },
        ],
      },
    ],
  });

  const response = result.response;
  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error(
      `No transcript returned. Full response: ${JSON.stringify(response, null, 2)}`
    );
  }
  return text.trim();
}

// ---------------------------------------------------------------------------
// Insert transcript into posts.ts
// ---------------------------------------------------------------------------

/**
 * Inject the transcript into posts.ts at the right position. Insert
 * `briefTranscript` immediately after `briefDurationSec`, and
 * `podcastTranscript` immediately after `podcastDurationSec`.
 *
 * Re-reads posts.ts each time to avoid offset drift between writes.
 */
function injectTranscript(slug, format, transcript) {
  const src = readFileSync(POSTS_PATH, 'utf-8');
  const posts = parsePosts(src);
  const post = posts.find((p) => p.slug === slug);
  if (!post) throw new Error(`Slug not found in posts.ts: ${slug}`);

  const block = src.slice(post.blockStart, post.blockEnd);
  const fieldName = format === 'brief' ? 'briefTranscript' : 'podcastTranscript';
  const anchorField =
    format === 'brief' ? 'briefDurationSec' : 'podcastDurationSec';

  // CRITICAL: We use the callback form of String.replace() throughout, NOT the
  // string form. The string form treats `$1`, `$&`, `$$` etc. as backreference
  // metacharacters, which causes corruption when the transcript contains
  // dollar amounts like "$25" or "$1,200" — those get interpreted as
  // backreferences and expanded to capture-group content. The callback form
  // sidesteps this entirely.
  const replacementLine = `    ${fieldName}: \`${escapeBackticks(transcript)}\`,\n`;

  // If transcript already exists, replace it (force mode).
  const existingPattern = new RegExp(
    `    ${fieldName}: \`[\\s\\S]*?\`,\\n`
  );
  if (existingPattern.test(block)) {
    const newBlock = block.replace(existingPattern, () => replacementLine);
    const newSrc = src.slice(0, post.blockStart) + newBlock + src.slice(post.blockEnd);
    writeFileSync(POSTS_PATH, newSrc);
    return;
  }

  // Insert after the duration field (which always immediately follows the URL field).
  const anchorPattern = new RegExp(`(    ${anchorField}: \\d+,\\n)`);
  const m = block.match(anchorPattern);
  if (!m) {
    throw new Error(
      `Anchor field '${anchorField}' not found for slug '${slug}'. Did the field name change?`
    );
  }
  const newBlock = block.replace(anchorPattern, (match) => match + replacementLine);
  const newSrc = src.slice(0, post.blockStart) + newBlock + src.slice(post.blockEnd);
  writeFileSync(POSTS_PATH, newSrc);
}

function escapeBackticks(s) {
  // Template literal in posts.ts is wrapped in backticks. Escape any
  // backticks in the transcript text and any ${...} template-literal
  // expressions.
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------

let success = 0;
let failed = 0;

for (let i = 0; i < workItems.length; i++) {
  const item = workItems[i];
  const progress = `[${i + 1}/${workItems.length}]`;
  console.log(`${progress} Transcribing ${item.slug} (${item.format})...`);

  try {
    const start = Date.now();
    const gcsUri = urlToGcsUri(item.url);
    const transcript = await transcribeAudio(gcsUri);
    const elapsedSec = ((Date.now() - start) / 1000).toFixed(1);
    console.log(
      `${progress} ✓ ${transcript.length} chars (${transcript.split(/\s+/).length} words) in ${elapsedSec}s`
    );
    injectTranscript(item.slug, item.format, transcript);
    success++;
  } catch (err) {
    console.error(`${progress} ✗ Failed: ${err.message}`);
    failed++;
  }
}

console.log();
console.log(`Done. ${success} succeeded, ${failed} failed.`);
process.exit(failed > 0 ? 1 : 0);
