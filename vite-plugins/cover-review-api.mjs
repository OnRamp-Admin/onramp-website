/**
 * Vite dev-only middleware that powers the /admin/cover-review page.
 *
 * Exposes JSON endpoints under /api/covers/* for listing posts, generating
 * candidate covers (with iterative editing via Nano Banana), approving +
 * uploading approved covers to GCS, and serving the local candidate PNGs.
 *
 * Not included in production builds — `configureServer` only runs for
 * `vite` / `vite dev`, never for `vite build`.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import {
  GCS_BUCKET,
  GCS_PREFIX,
  buildBasePrompt,
  buildEditPrompt,
  extFromMime,
  generateCover,
  injectImageUrl,
  parsePosts,
  processCoverImage,
  uploadToGCS,
} from '../scripts/lib/cover-generation.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const POSTS_PATH = resolve(PROJECT_ROOT, 'src/content/blog/posts.ts');
const REVIEW_DIR = resolve(PROJECT_ROOT, 'cover-review');

function ensureReviewDir() {
  if (!existsSync(REVIEW_DIR)) mkdirSync(REVIEW_DIR, { recursive: true });
}

/** Find `<slug>-cover.<ext>` in the review dir, or null. */
function findCandidate(slug) {
  if (!existsSync(REVIEW_DIR)) return null;
  const files = readdirSync(REVIEW_DIR);
  const match = files.find((f) => new RegExp(`^${slug}-cover\\.(png|jpg|jpeg|webp)$`).test(f));
  if (!match) return null;
  const fullPath = join(REVIEW_DIR, match);
  const stat = statSync(fullPath);
  return { path: fullPath, file: match, updatedAt: stat.mtimeMs };
}

function mimeFromFile(file) {
  const ext = file.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
}

async function readJsonBody(req) {
  return await new Promise((res, rej) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8');
      if (!raw) return res({});
      try {
        res(JSON.parse(raw));
      } catch {
        rej(new Error('Invalid JSON body'));
      }
    });
    req.on('error', rej);
  });
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

export default function coverReviewApiPlugin() {
  return {
    name: 'onramp:cover-review-api',
    apply: 'serve', // dev only — never runs during vite build
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api/covers')) return next();

        try {
          // GET /api/covers — list posts + status
          if (req.method === 'GET' && (url === '/api/covers' || url === '/api/covers/')) {
            const src = readFileSync(POSTS_PATH, 'utf-8');
            const posts = parsePosts(src);
            const out = posts.map((p) => {
              const c = findCandidate(p.slug);
              return {
                slug: p.slug,
                title: p.title,
                description: p.description,
                currentImage: p.currentImage,
                candidateExists: !!c,
                candidateUpdatedAt: c?.updatedAt ?? null,
              };
            });
            return sendJson(res, 200, { posts: out });
          }

          // /api/covers/:slug[...]
          const match = url.match(/^\/api\/covers\/([^/?]+)(\/[^?]*)?(\?.*)?$/);
          if (!match) return sendError(res, 404, 'Not found');
          const slug = decodeURIComponent(match[1]);
          const suffix = match[2] || '';

          // GET /api/covers/:slug/image — serve the candidate PNG
          if (req.method === 'GET' && suffix === '/image') {
            const c = findCandidate(slug);
            if (!c) return sendError(res, 404, 'No candidate for this slug');
            const bytes = readFileSync(c.path);
            res.statusCode = 200;
            res.setHeader('Content-Type', mimeFromFile(c.file));
            res.setHeader('Cache-Control', 'no-store');
            return res.end(bytes);
          }

          // POST /api/covers/:slug/generate — generate or edit
          if (req.method === 'POST' && suffix === '/generate') {
            const src = readFileSync(POSTS_PATH, 'utf-8');
            const posts = parsePosts(src);
            const post = posts.find((p) => p.slug === slug);
            if (!post) return sendError(res, 404, `Slug not found: ${slug}`);

            const body = await readJsonBody(req);
            const revisionPrompt = typeof body.revisionPrompt === 'string' ? body.revisionPrompt : '';
            const fresh = body.fresh === true;

            ensureReviewDir();
            const candidate = fresh ? null : findCandidate(slug);

            let prompt;
            let inputImage = null;
            if (candidate) {
              prompt = buildEditPrompt(revisionPrompt);
              inputImage = {
                mimeType: mimeFromFile(candidate.file),
                bytes: readFileSync(candidate.path),
              };
            } else {
              prompt = buildBasePrompt(post.title, post.description);
              // When no candidate and the user still supplied feedback (e.g.
              // "emphasize the diagnostic scanner"), append it to the base
              // prompt so the first generation already reflects their intent.
              if (revisionPrompt.trim()) {
                prompt += `\n\nAdditional direction from the site owner: ${revisionPrompt.trim()}`;
              }
            }

            const mode = candidate ? 'edit' : 'generate';
            const start = Date.now();
            // eslint-disable-next-line no-console
            console.log(`[cover-review] ${mode} ${slug} — revision="${revisionPrompt.slice(0, 60)}" input=${inputImage ? inputImage.bytes.length : 'none'}`);

            let img;
            try {
              img = await generateCover(prompt, inputImage);
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              console.error(`[cover-review] ${mode} ${slug} FAILED in ${Date.now() - start}ms: ${msg}`);
              return sendError(res, 500, msg);
            }

            const elapsedMs = Date.now() - start;
            const sameBytes = inputImage && img.bytes.length === inputImage.bytes.length
              && img.bytes.equals(inputImage.bytes);

            // Clear any old candidate file with a different extension.
            if (candidate && !candidate.file.endsWith(`.${extFromMime(img.mimeType)}`)) {
              try { unlinkSync(candidate.path); } catch { /* ignore */ }
            }
            const outFile = `${slug}-cover.${extFromMime(img.mimeType)}`;
            const outPath = join(REVIEW_DIR, outFile);
            writeFileSync(outPath, img.bytes);

            console.log(`[cover-review] ${mode} ${slug} OK in ${elapsedMs}ms — ${img.bytes.length} bytes${sameBytes ? ' ⚠ IDENTICAL to input (model did not edit)' : ''}`);

            return sendJson(res, 200, {
              updatedAt: Date.now(),
              bytes: img.bytes.length,
              elapsedMs,
              mode,
              identicalToInput: !!sameBytes,
            });
          }

          // POST /api/covers/:slug/approve — process candidate into hero +
          // thumbnail WebP variants, upload both with 30-day Cache-Control,
          // write the hero URL to posts.ts (thumb URL is derived at render
          // time from the hero URL by convention).
          if (req.method === 'POST' && suffix === '/approve') {
            const c = findCandidate(slug);
            if (!c) return sendError(res, 400, 'No candidate to approve. Generate one first.');

            const src = readFileSync(POSTS_PATH, 'utf-8');
            const posts = parsePosts(src);
            const post = posts.find((p) => p.slug === slug);
            if (!post) return sendError(res, 404, `Slug not found: ${slug}`);

            const pngBytes = readFileSync(c.path);
            const { hero, thumb } = await processCoverImage(pngBytes);

            const heroObject = `${GCS_PREFIX}/${slug}-cover.webp`;
            const thumbObject = `${GCS_PREFIX}/${slug}-cover-thumb.webp`;

            await Promise.all([
              uploadToGCS(hero, GCS_BUCKET, heroObject, 'image/webp'),
              uploadToGCS(thumb, GCS_BUCKET, thumbObject, 'image/webp'),
            ]);

            const v = Date.now();
            const imageUrl = `https://storage.googleapis.com/${GCS_BUCKET}/${heroObject}?v=${v}`;
            injectImageUrl(POSTS_PATH, slug, imageUrl);

            // Clean up the local PNG candidate after successful upload.
            try { unlinkSync(c.path); } catch { /* ignore */ }

            return sendJson(res, 200, {
              imageUrl,
              heroBytes: hero.length,
              thumbBytes: thumb.length,
            });
          }

          // DELETE /api/covers/:slug — discard the local candidate
          if (req.method === 'DELETE' && (suffix === '' || suffix === '/')) {
            const c = findCandidate(slug);
            if (!c) return sendJson(res, 200, { discarded: false });
            unlinkSync(c.path);
            return sendJson(res, 200, { discarded: true });
          }

          return sendError(res, 404, `Unsupported: ${req.method} ${url}`);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          // eslint-disable-next-line no-console
          console.error(`[cover-review-api] ${req.method} ${url}: ${msg}`);
          return sendError(res, 500, msg);
        }
      });
    },
  };
}
