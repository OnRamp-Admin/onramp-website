/**
 * Shared library for audio-file transcription.
 *
 * Used by:
 *   - CLI (scripts/transcribe-blog-audio.mjs) — bulk/force transcription
 *   - Content admin portal (vite-plugins/content-admin-api.mjs) — inline
 *     transcription right after upload or on explicit re-transcribe.
 *
 * Mirrors the split pattern used for cover and description generation.
 */

import { readFileSync, writeFileSync } from 'fs';
import { VertexAI } from '@google-cloud/vertexai';

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

const vertex = new VertexAI({ project: PROJECT_ID, location: LOCATION });
const model = vertex.getGenerativeModel({
  model: MODEL,
  generationConfig: {
    temperature: 0.0,
    maxOutputTokens: 16384,
  },
});

/**
 * Convert a public storage.googleapis.com URL (with or without a
 * `?v=<ts>` cache-buster) into the gs:// URI Vertex expects.
 */
export function urlToGcsUri(url) {
  const cleanUrl = url.split('?')[0];
  const m = cleanUrl.match(/^https:\/\/storage\.googleapis\.com\/([^/]+)\/(.+)$/);
  if (!m) throw new Error(`Cannot convert to gs:// URI: ${url}`);
  return `gs://${m[1]}/${m[2]}`;
}

/**
 * Transcribe an audio file already sitting on GCS. Returns cleaned text.
 * Throws on rate-limit, auth failure, or empty response.
 */
export async function transcribeAudio(gcsUri) {
  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          { fileData: { mimeType: 'audio/mp4', fileUri: gcsUri } },
          { text: TRANSCRIPTION_PROMPT },
        ],
      },
    ],
  });

  const text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error(
      `No transcript returned. Response: ${JSON.stringify(result?.response, null, 2)?.slice(0, 500)}`,
    );
  }
  return text.trim();
}

function escapeBackticks(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

/**
 * Inject a transcript into posts.ts at the right position for its kind.
 *
 *   kind='brief'   → writes/replaces `briefTranscript` right after `briefDurationSec`
 *   kind='podcast' → writes/replaces `podcastTranscript` right after `podcastDurationSec`
 *   kind='article' → writes/replaces `articleTranscript` right after `articleDurationSec`
 *
 * Uses the callback form of String.replace() to avoid $1 interpolation bugs
 * in transcripts containing dollar amounts (e.g. "$125/hr").
 */
export function writeTranscript(postsPath, slug, kind, transcript) {
  const src = readFileSync(postsPath, 'utf-8');
  const slugMatches = [...src.matchAll(/^ {2}\{[\s\S]*?slug: '([^']+)'/gm)];
  const idx = slugMatches.findIndex((m) => m[1] === slug);
  if (idx < 0) throw new Error(`Slug not found in posts.ts: ${slug}`);

  const startIdx = slugMatches[idx].index;
  const endIdx = idx + 1 < slugMatches.length ? slugMatches[idx + 1].index : src.length;
  const block = src.slice(startIdx, endIdx);

  const fieldName = `${kind}Transcript`;
  const anchorField = `${kind}DurationSec`;

  const replacementLine = `    ${fieldName}: \`${escapeBackticks(transcript)}\`,\n`;

  // Replace an existing transcript if present.
  const existingPattern = new RegExp(`    ${fieldName}: \`[\\s\\S]*?\`,\\n`);
  let newBlock;
  if (existingPattern.test(block)) {
    newBlock = block.replace(existingPattern, () => replacementLine);
  } else {
    // Otherwise insert after the duration anchor.
    const anchorPattern = new RegExp(`(    ${anchorField}: \\d+,\\n)`);
    if (!anchorPattern.test(block)) {
      throw new Error(`Anchor field '${anchorField}' not found for slug '${slug}'.`);
    }
    newBlock = block.replace(anchorPattern, (match) => match + replacementLine);
  }

  const newSrc = src.slice(0, startIdx) + newBlock + src.slice(endIdx);
  writeFileSync(postsPath, newSrc);
}
