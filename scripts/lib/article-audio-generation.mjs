/**
 * Shared library for "Listen to article" audio generation.
 *
 * Used by:
 *   - CLI (scripts/generate-article-audio.mjs) — batch or single-post gen
 *   - Content admin portal (vite-plugins/content-admin-api.mjs) — one-click
 *     TTS generation with streaming progress updates.
 *
 * Mirrors the split pattern used for cover + description generation. The
 * portal needs a programmatic entry point (no console.log side effects) and
 * a progress callback so it can push heartbeat events to the UI.
 */

import { execSync } from 'child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { GoogleAuth } from 'google-auth-library';
import { uploadToGCS } from './cover-generation.mjs';

const PROJECT_ID = 'gen-lang-client-0614585924';
const LOCATION = 'us-central1';
const MODEL = 'gemini-2.5-flash-preview-tts';
export const VOICE_NAME = 'Sadaltager';
const GCS_BUCKET = 'onramp-marketing-media';
const GCS_PREFIX = 'blog';

export const TTS_INSTRUCTION = `You are reading this blog article aloud for the OnRamp blog "Listen to article" feature. Target audience: automotive service center owners, managers, and technicians. Read in a clear, measured, professional pace. Do not skip content. Do not summarize. Read the text verbatim.

Structure of what follows:
1. The post TITLE — read it clearly, slightly slower, as an announcement. Brief pause after.
2. A short SUMMARY paragraph — read it as a spoken dek / intro. Brief pause after.
3. The BODY of the article. Use natural inflection on section headings (slightly slower, slightly lower pitch). Pause briefly between paragraphs.
4. The OUTRO — a short standard wrap-up and call to action. Shift to a slightly warmer, conversational tone; this is the sign-off.

Ignore section markers like "TITLE:", "SUMMARY:", "BODY:", or "OUTRO:" — those are just for you to know what part you are on. Do not say them aloud.`;

/** Standard outro appended to every article. Replaces per-post CTAs. */
export const OUTRO_CTA = `We hope you found this article helpful. ONRAMP is here to help your technicians work at the speed of AI. If you'd like to learn more, please schedule a demo with us. We'd love to share how your shop can drive profitability using ONRAMP.`;

const TTS_REQUEST_TIMEOUT_MS = 4 * 60 * 1000;
const TTS_RETRY_DELAYS_MS = [10_000, 30_000];

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Strip markdown down to readable prose suitable for TTS.
 * - Removes fenced code blocks entirely (Gemini mispronounces code).
 * - Converts `[text](url)` → `text`.
 * - Strips heading hashes but keeps heading text (with a pause hint).
 * - Removes everything after the last `---` (per-post CTA — replaced by OUTRO).
 */
export function markdownToPlainText(md) {
  let text = md;

  const hrRegex = /^-{3,}\s*$/gm;
  let lastHrIdx = -1;
  let hrMatch;
  while ((hrMatch = hrRegex.exec(text)) !== null) {
    lastHrIdx = hrMatch.index;
  }
  if (lastHrIdx !== -1) {
    text = text.slice(0, lastHrIdx);
  }

  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`([^`]+)`/g, '$1');
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/^(#{1,6})\s+(.*)$/gm, '$2.');
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/\*([^*\n]+)\*/g, '$1');
  text = text.replace(/_([^_\n]+)_/g, '$1');
  text = text.replace(/^-{3,}$/gm, '');
  text = text.replace(/^\s*\|?[-:|\s]+\|?\s*$/gm, '');
  text = text.replace(/\s*\|\s*/g, ', ');
  text = text.replace(/^\s*[-*+]\s+/gm, '');
  text = text.replace(/^\s*\d+\.\s+/gm, '');
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/**
 * Build the payload Gemini reads aloud (title + summary + body + outro with
 * section markers) and the transcript we store alongside it (same content,
 * no section markers — matches what listeners actually hear).
 */
export function buildSpokenPayload({ title, description, body }) {
  const titleLine = title ? `TITLE: ${title}` : '';
  const summaryLine = description ? `SUMMARY: ${description.trim()}` : '';
  const payload = [titleLine, summaryLine, `BODY:\n${body}`, `OUTRO:\n${OUTRO_CTA}`]
    .filter(Boolean)
    .join('\n\n');
  const transcript = [title || '', description?.trim() || '', body, OUTRO_CTA]
    .filter(Boolean)
    .join('\n\n');
  return { payload, transcript };
}

/**
 * Call Gemini TTS with retry + timeout. onProgress is invoked every 15s
 * with `{ stage: 'tts', elapsedMs, attempt }` so callers (CLI or portal)
 * can show a heartbeat.
 */
export async function synthesizeSpeech(text, onProgress) {
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

  let res;
  for (let attempt = 0; attempt <= TTS_RETRY_DELAYS_MS.length; attempt++) {
    const start = Date.now();
    const hb = setInterval(() => {
      onProgress?.({ stage: 'tts', elapsedMs: Date.now() - start, attempt: attempt + 1 });
    }, 15_000);
    try {
      res = await client.request({
        url,
        method: 'POST',
        data: body,
        timeout: TTS_REQUEST_TIMEOUT_MS,
      });
      clearInterval(hb);
      break;
    } catch (err) {
      clearInterval(hb);
      const status = err?.response?.status ?? err?.code;
      const msg = err?.response?.data?.error?.message || err?.message || String(err);
      const isTransient = status === 429 || (status >= 500 && status < 600)
        || /timeout|timed out|etimedout|econnreset|socket hang up|aborted/i.test(msg);
      if (!isTransient || attempt >= TTS_RETRY_DELAYS_MS.length) {
        throw new Error(`Vertex TTS failed (${status ?? 'no-status'}): ${msg}`);
      }
      const delay = TTS_RETRY_DELAYS_MS[attempt];
      onProgress?.({ stage: 'retry', attempt: attempt + 1, delayMs: delay, reason: msg });
      await sleep(delay);
    }
  }

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

/** Convert Gemini raw PCM to m4a via ffmpeg. */
export function convertToM4A(inputPath, outputPath, mimeType) {
  const m = /rate=(\d+)/.exec(mimeType || '');
  const isRawPCM = /audio\/L16/i.test(mimeType || '') || /codec=pcm/i.test(mimeType || '');
  const rate = m ? m[1] : '24000';
  const cmd = isRawPCM
    ? `ffmpeg -y -f s16le -ar ${rate} -ac 1 -i "${inputPath}" -c:a aac -b:a 96k "${outputPath}"`
    : `ffmpeg -y -i "${inputPath}" -c:a aac -b:a 96k -ac 1 -ar 24000 "${outputPath}"`;
  execSync(cmd, { stdio: 'pipe' });
}

export function probeDurationSec(path) {
  const out = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${path}"`,
  ).toString().trim();
  return Math.round(parseFloat(out));
}

function escapeBackticks(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

/**
 * Inject articleAudioUrl + articleDurationSec + articleTranscript into a
 * post's block, removing any prior article-audio fields first so
 * regenerations stay idempotent. Uses callback form of String.replace() to
 * avoid $1 interpolation bugs with dollar amounts in transcripts.
 */
export function injectArticleFields(postsPath, slug, audioUrl, durationSec, transcript) {
  const src = readFileSync(postsPath, 'utf-8');
  const slugMatches = [...src.matchAll(/^ {2}\{[\s\S]*?slug: '([^']+)'/gm)];
  const idx = slugMatches.findIndex((m) => m[1] === slug);
  if (idx < 0) throw new Error(`Slug not found in posts.ts: ${slug}`);

  const startIdx = slugMatches[idx].index;
  const endIdx = idx + 1 < slugMatches.length ? slugMatches[idx + 1].index : src.length;
  const block = src.slice(startIdx, endIdx);

  // Remove any existing article* fields first (idempotent).
  let newBlock = block
    .replace(/^ {4}articleAudioUrl: '[^']*',\n/m, '')
    .replace(/^ {4}articleDurationSec: \d+,\n/m, '')
    .replace(/^ {4}articleTranscript: `[\s\S]*?`,\n/m, '');

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
    throw new Error(`No anchor field found to insert article audio after for '${slug}'.`);
  }

  const newSrc = src.slice(0, startIdx) + newBlock + src.slice(endIdx);
  writeFileSync(postsPath, newSrc);
}

/**
 * End-to-end orchestrator: text → TTS → m4a → GCS → posts.ts. Callers pass
 * in the post's title/description/content (already parsed) plus an optional
 * onProgress callback for streaming updates.
 */
export async function generateArticleAudio({
  slug,
  title,
  description,
  content,
  postsPath,
  onProgress,
}) {
  const body = markdownToPlainText(content);
  const { payload, transcript } = buildSpokenPayload({ title, description, body });
  onProgress?.({ stage: 'start', payloadChars: payload.length });

  const audio = await synthesizeSpeech(payload, onProgress);
  onProgress?.({ stage: 'synthesized', bytes: audio.bytes.length, mimeType: audio.mimeType });

  const workDir = mkdtempSync(join(tmpdir(), 'onramp-tts-'));
  const rawPath = join(workDir, `${slug}-article.raw`);
  const m4aPath = join(workDir, `${slug}-article.m4a`);
  writeFileSync(rawPath, audio.bytes);

  onProgress?.({ stage: 'converting' });
  convertToM4A(rawPath, m4aPath, audio.mimeType);
  const durationSec = probeDurationSec(m4aPath);
  onProgress?.({ stage: 'converted', durationSec });

  const objectName = `${GCS_PREFIX}/${slug}-article.m4a`;
  onProgress?.({ stage: 'uploading', objectName });
  await uploadToGCS(readFileSync(m4aPath), GCS_BUCKET, objectName, 'audio/mp4');

  const v = Date.now();
  const audioUrl = `https://storage.googleapis.com/${GCS_BUCKET}/${objectName}?v=${v}`;
  injectArticleFields(postsPath, slug, audioUrl, durationSec, transcript);

  onProgress?.({ stage: 'done', audioUrl, durationSec });
  return { audioUrl, durationSec, transcript, bytes: audio.bytes.length };
}
