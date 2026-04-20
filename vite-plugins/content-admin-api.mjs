/**
 * Vite dev-only middleware — unified content enrichment portal API.
 *
 * Endpoints power /admin/content:
 *   GET    /api/content                              — list posts + status
 *   GET    /api/auth/status                          — ADC validity
 *   POST   /api/auth/relogin                         — spawn gcloud login
 *   POST   /api/content/:slug/cover/regenerate       — one-shot cover gen
 *   POST   /api/content/:slug/description/regenerate — one-shot description
 *   POST   /api/content/:slug/audio/:kind            — upload brief|podcast m4a + probe + upload to GCS + inject + transcribe
 *   POST   /api/content/:slug/article-audio/generate — full TTS flow
 *   POST   /api/content/:slug/transcript/:kind       — re-transcribe brief|podcast|article
 *
 * Never ships to production — `apply: 'serve'` restricts to dev server only.
 */

import { spawn } from 'child_process';
import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { GoogleAuth } from 'google-auth-library';
import {
  CACHE_HEADER,
  GCS_BUCKET,
  GCS_PREFIX,
  buildBasePrompt,
  extFromMime,
  generateCover,
  injectImageUrl,
  parsePosts as parsePostsForCover,
  processCoverImage,
  uploadToGCS,
} from '../scripts/lib/cover-generation.mjs';
import {
  draftDescription,
  needsRewriteReasons,
  parsePosts as parsePostsForDescription,
  writeDescription,
} from '../scripts/lib/description-generation.mjs';
import {
  transcribeAudio,
  urlToGcsUri,
  writeTranscript,
} from '../scripts/lib/transcript-generation.mjs';
import {
  convertToM4A,
  generateArticleAudio,
  probeDurationSec,
} from '../scripts/lib/article-audio-generation.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const POSTS_PATH = resolve(PROJECT_ROOT, 'src/content/blog/posts.ts');

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

async function readJsonBody(req) {
  return await new Promise((resolvePromise, rejectPromise) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8');
      if (!raw) return resolvePromise({});
      try { resolvePromise(JSON.parse(raw)); }
      catch { rejectPromise(new Error('Invalid JSON body')); }
    });
    req.on('error', rejectPromise);
  });
}

async function readBinaryBody(req) {
  return await new Promise((resolvePromise, rejectPromise) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolvePromise(Buffer.concat(chunks)));
    req.on('error', rejectPromise);
  });
}

/**
 * Full enrichment summary for every post. Also returns charMin/Max (for the
 * description rule) and overall counts so the UI can render the top-bar
 * summary without re-computing.
 */
function buildContentList() {
  const src = readFileSync(POSTS_PATH, 'utf-8');
  // Use the description parser (it returns title + description + content
  // which covers everything we need for status).
  const parsed = parsePostsForDescription(src);

  const posts = parsed.map((p) => {
    // Pull audio fields directly off the raw block — not in the lib schema.
    const block = src.slice(p.blockStart, p.blockEnd);
    const briefUrl = block.match(/briefAudioUrl: '([^']+)'/)?.[1] || null;
    const briefDurationSec = Number(block.match(/briefDurationSec: (\d+)/)?.[1]) || null;
    const briefHasTranscript = /briefTranscript: /.test(block);
    const podcastUrl = block.match(/podcastAudioUrl: '([^']+)'/)?.[1] || null;
    const podcastDurationSec = Number(block.match(/podcastDurationSec: (\d+)/)?.[1]) || null;
    const podcastHasTranscript = /podcastTranscript: /.test(block);
    const articleUrl = block.match(/articleAudioUrl: '([^']+)'/)?.[1] || null;
    const articleDurationSec = Number(block.match(/articleDurationSec: (\d+)/)?.[1]) || null;
    const articleHasTranscript = /articleTranscript: /.test(block);
    const imageUrl = block.match(/^ {4}image:\s*'([^']*)'/m)?.[1] || null;
    const dateMatch = block.match(/date:\s*'([^']+)'/)?.[1] || null;

    // Scheduled: date in the future (local time). Mirrors isScheduled()
    // in src/content/blog/posts.ts but we can't import TS from here.
    let isScheduled = false;
    if (dateMatch) {
      const postDate = new Date(`${dateMatch}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      isScheduled = postDate > today;
    }

    const descriptionFlags = needsRewriteReasons({
      description: p.description,
      content: p.content,
    });

    return {
      slug: p.slug,
      title: p.title,
      date: dateMatch,
      isScheduled,
      image: imageUrl,
      description: p.description,
      descriptionLength: p.description?.length ?? 0,
      descriptionFlags,
      briefAudioUrl: briefUrl,
      briefDurationSec,
      briefHasTranscript,
      podcastAudioUrl: podcastUrl,
      podcastDurationSec,
      podcastHasTranscript,
      articleAudioUrl: articleUrl,
      articleDurationSec,
      articleHasTranscript,
    };
  });

  // Sort by date desc, scheduled (future) posts bubble to the top.
  posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const counts = {
    total: posts.length,
    coverOk: posts.filter((p) => !!p.image).length,
    descriptionOk: posts.filter((p) => p.descriptionFlags.length === 0).length,
    briefOk: posts.filter((p) => !!p.briefAudioUrl).length,
    podcastOk: posts.filter((p) => !!p.podcastAudioUrl).length,
    articleOk: posts.filter((p) => !!p.articleAudioUrl).length,
  };

  return { posts, counts };
}

async function checkAuth() {
  try {
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    return { valid: !!token?.token };
  } catch (err) {
    return { valid: false, error: err?.message || String(err) };
  }
}

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------

export default function contentAdminApiPlugin() {
  return {
    name: 'onramp:content-admin-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api/content') && !url.startsWith('/api/auth')) return next();

        try {
          // ----- Auth endpoints -----
          if (req.method === 'GET' && url === '/api/auth/status') {
            const status = await checkAuth();
            return sendJson(res, 200, status);
          }

          if (req.method === 'POST' && url === '/api/auth/relogin') {
            try {
              const child = spawn('gcloud', ['auth', 'application-default', 'login'], {
                detached: true,
                stdio: 'ignore',
              });
              child.unref();
              return sendJson(res, 200, { pid: child.pid });
            } catch (err) {
              const msg = err?.message || String(err);
              if (/ENOENT/.test(msg)) {
                return sendError(res, 500, 'gcloud CLI not found on PATH. Install Google Cloud SDK or run `gcloud auth application-default login` in your terminal manually.');
              }
              return sendError(res, 500, msg);
            }
          }

          // ----- Content list -----
          if (req.method === 'GET' && (url === '/api/content' || url === '/api/content/')) {
            const listing = buildContentList();
            const authStatus = await checkAuth();
            return sendJson(res, 200, { ...listing, auth: authStatus });
          }

          // ----- Per-post routes: /api/content/:slug/... -----
          const match = url.match(/^\/api\/content\/([^/?]+)(\/[^?]*)?(\?.*)?$/);
          if (!match) return sendError(res, 404, 'Not found');
          const slug = decodeURIComponent(match[1]);
          const suffix = match[2] || '';

          // Regenerate description
          if (req.method === 'POST' && suffix === '/description/regenerate') {
            const src = readFileSync(POSTS_PATH, 'utf-8');
            const post = parsePostsForDescription(src).find((p) => p.slug === slug);
            if (!post) return sendError(res, 404, `Slug not found: ${slug}`);

            const text = await draftDescription({
              title: post.title,
              body: post.content,
              currentDescription: post.description,
            });
            writeDescription(POSTS_PATH, slug, text);
            return sendJson(res, 200, { description: text, length: text.length });
          }

          // Regenerate cover (one-shot, auto-approve)
          if (req.method === 'POST' && suffix === '/cover/regenerate') {
            const src = readFileSync(POSTS_PATH, 'utf-8');
            const post = parsePostsForCover(src).find((p) => p.slug === slug);
            if (!post) return sendError(res, 404, `Slug not found: ${slug}`);

            const prompt = buildBasePrompt(post.title, post.description);
            const img = await generateCover(prompt);
            const { hero, thumb } = await processCoverImage(img.bytes);

            const heroObject = `${GCS_PREFIX}/${slug}-cover.webp`;
            const thumbObject = `${GCS_PREFIX}/${slug}-cover-thumb.webp`;
            await Promise.all([
              uploadToGCS(hero, GCS_BUCKET, heroObject, 'image/webp'),
              uploadToGCS(thumb, GCS_BUCKET, thumbObject, 'image/webp'),
            ]);

            const v = Date.now();
            const imageUrl = `https://storage.googleapis.com/${GCS_BUCKET}/${heroObject}?v=${v}`;
            injectImageUrl(POSTS_PATH, slug, imageUrl);
            return sendJson(res, 200, { imageUrl, heroBytes: hero.length, thumbBytes: thumb.length });
          }

          // Upload brief / podcast audio: body is raw binary m4a
          const uploadMatch = suffix.match(/^\/audio\/(brief|podcast)$/);
          if (req.method === 'POST' && uploadMatch) {
            const kind = uploadMatch[1];
            const ctype = req.headers['content-type'] || 'audio/mp4';
            if (!/audio\//.test(ctype)) {
              return sendError(res, 400, `Expected audio/* Content-Type, got: ${ctype}`);
            }

            const src0 = readFileSync(POSTS_PATH, 'utf-8');
            const post = parsePostsForDescription(src0).find((p) => p.slug === slug);
            if (!post) return sendError(res, 404, `Slug not found: ${slug}`);

            const bytes = await readBinaryBody(req);
            if (bytes.length === 0) return sendError(res, 400, 'Empty upload body');

            const workDir = mkdtempSync(join(tmpdir(), `onramp-${kind}-`));
            const localPath = join(workDir, `${slug}-${kind}.m4a`);
            writeFileSync(localPath, bytes);

            // If the incoming file is something other than m4a (e.g. the
            // browser picked an mp3), re-encode so GCS serves uniform assets.
            const needsReencode = !/audio\/mp4|audio\/m4a|audio\/aac/i.test(ctype);
            const finalPath = join(workDir, `${slug}-${kind}.final.m4a`);
            if (needsReencode) {
              convertToM4A(localPath, finalPath, ctype);
            } else {
              writeFileSync(finalPath, bytes);
            }
            const durationSec = probeDurationSec(finalPath);

            const objectName = `${GCS_PREFIX}/${slug}-${kind}.m4a`;
            await uploadToGCS(readFileSync(finalPath), GCS_BUCKET, objectName, 'audio/mp4');

            const v = Date.now();
            const audioUrl = `https://storage.googleapis.com/${GCS_BUCKET}/${objectName}?v=${v}`;

            // Inject URL + duration into posts.ts. We use a per-kind regex
            // targeting the block between slug markers. This is the same
            // approach the CLI upload flow uses.
            updateAudioFields(slug, kind, audioUrl, durationSec);

            // Auto-transcribe after upload. This can take ~15–60s; we just
            // wait inline. Client shows a progress label client-side.
            let transcriptChars = 0;
            try {
              const transcript = await transcribeAudio(urlToGcsUri(audioUrl));
              writeTranscript(POSTS_PATH, slug, kind, transcript);
              transcriptChars = transcript.length;
            } catch (err) {
              // Upload succeeded but transcription failed — return partial.
              return sendJson(res, 207, {
                audioUrl,
                durationSec,
                transcriptError: err?.message || String(err),
              });
            }

            return sendJson(res, 200, { audioUrl, durationSec, transcriptChars });
          }

          // Generate article audio (full TTS flow, can take ~3 min)
          if (req.method === 'POST' && suffix === '/article-audio/generate') {
            const src = readFileSync(POSTS_PATH, 'utf-8');
            const post = parsePostsForDescription(src).find((p) => p.slug === slug);
            if (!post) return sendError(res, 404, `Slug not found: ${slug}`);

            // Stream progress as NDJSON so the UI can show heartbeats. We
            // accumulate events server-side and flush a pseudo-SSE pattern.
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/x-ndjson');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('X-Content-Type-Options', 'nosniff');

            const emit = (evt) => {
              try { res.write(`${JSON.stringify(evt)}\n`); } catch { /* client closed */ }
            };

            try {
              const result = await generateArticleAudio({
                slug,
                title: post.title,
                description: post.description,
                content: post.content,
                postsPath: POSTS_PATH,
                onProgress: emit,
              });
              emit({ stage: 'done', ...result });
            } catch (err) {
              emit({ stage: 'error', message: err?.message || String(err) });
            }
            return res.end();
          }

          // Re-transcribe brief | podcast | article
          const transcribeMatch = suffix.match(/^\/transcript\/(brief|podcast|article)$/);
          if (req.method === 'POST' && transcribeMatch) {
            const kind = transcribeMatch[1];
            const src = readFileSync(POSTS_PATH, 'utf-8');
            const startIdx = src.search(new RegExp(`slug: '${slug}'`));
            if (startIdx < 0) return sendError(res, 404, `Slug not found: ${slug}`);
            const block = src.slice(startIdx, startIdx + 20000);
            const url = block.match(new RegExp(`${kind}AudioUrl: '([^']+)'`))?.[1];
            if (!url) return sendError(res, 400, `No ${kind} audio uploaded yet for this post.`);
            const transcript = await transcribeAudio(urlToGcsUri(url));
            writeTranscript(POSTS_PATH, slug, kind, transcript);
            return sendJson(res, 200, { transcriptChars: transcript.length });
          }

          return sendError(res, 404, `Unsupported: ${req.method} ${url}`);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          // eslint-disable-next-line no-console
          console.error(`[content-admin-api] ${req.method} ${url}: ${msg}`);
          // Response may have already started streaming — only send error if not.
          if (!res.headersSent) return sendError(res, 500, msg);
          try { res.end(); } catch { /* ignore */ }
        }
      });
    },
  };
}

/**
 * Update brief / podcast audio URL + duration in a post's block. Replaces
 * existing values if present. Inserts before the transcript field if
 * missing.
 */
function updateAudioFields(slug, kind, audioUrl, durationSec) {
  const src = readFileSync(POSTS_PATH, 'utf-8');
  const slugMatches = [...src.matchAll(/^ {2}\{[\s\S]*?slug: '([^']+)'/gm)];
  const i = slugMatches.findIndex((m) => m[1] === slug);
  if (i < 0) throw new Error(`Slug not found: ${slug}`);

  const startIdx = slugMatches[i].index;
  const endIdx = i + 1 < slugMatches.length ? slugMatches[i + 1].index : src.length;
  const block = src.slice(startIdx, endIdx);

  const urlField = `${kind}AudioUrl`;
  const durField = `${kind}DurationSec`;

  const newUrlLine = `    ${urlField}: '${audioUrl}',\n`;
  const newDurLine = `    ${durField}: ${durationSec},\n`;

  let newBlock = block;

  // Replace or insert URL
  if (new RegExp(`^ {4}${urlField}: '[^']*',\\n`, 'm').test(newBlock)) {
    newBlock = newBlock.replace(new RegExp(`^ {4}${urlField}: '[^']*',\\n`, 'm'), () => newUrlLine);
  } else {
    // Insert after tags line (every post has one)
    const tagsRx = /^( {4}tags: \[[^\]]*\],\n)/m;
    if (!tagsRx.test(newBlock)) throw new Error(`No tags field in post '${slug}' to anchor audio fields to`);
    newBlock = newBlock.replace(tagsRx, (_m, a) => `${a}${newUrlLine}`);
  }

  // Replace or insert duration
  if (new RegExp(`^ {4}${durField}: \\d+,\\n`, 'm').test(newBlock)) {
    newBlock = newBlock.replace(new RegExp(`^ {4}${durField}: \\d+,\\n`, 'm'), () => newDurLine);
  } else {
    // Insert immediately after the URL line we just placed
    newBlock = newBlock.replace(new RegExp(`^( {4}${urlField}: '[^']*',\\n)`, 'm'), (_m, u) => `${u}${newDurLine}`);
  }

  const newSrc = src.slice(0, startIdx) + newBlock + src.slice(endIdx);
  writeFileSync(POSTS_PATH, newSrc);
}

// Suppress unused-import warning for CACHE_HEADER + extFromMime (kept
// imported for parity with cover-review plugin; some future endpoints may
// use them).
void CACHE_HEADER;
void extFromMime;
