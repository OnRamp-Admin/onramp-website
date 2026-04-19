/**
 * Shared library for cover-image generation + upload + posts.ts writeback.
 *
 * Used by both the CLI (scripts/generate-article-cover.mjs) and the dev-only
 * cover-review API (vite-plugins/cover-review-api.ts). Centralizing here so
 * the Vertex call, GCS upload, prompt construction, and posts.ts mutation
 * all live in one place.
 */

import { readFileSync, writeFileSync } from 'fs';
import { GoogleAuth } from 'google-auth-library';
import sharp from 'sharp';

export const PROJECT_ID = 'gen-lang-client-0614585924';
export const LOCATION = 'us-central1';
export const MODEL = 'gemini-2.5-flash-image';
export const GCS_BUCKET = 'onramp-marketing-media';
export const GCS_PREFIX = 'blog';
export const CACHE_HEADER = 'public, max-age=2592000'; // 30 days

// WebP encoding settings. 85 quality is indistinguishable from PNG to the
// eye for illustrations/photography while dropping size by ~10x. Thumbnail
// is sized for blog index cards and "You may also like" tiles, which
// render at ~400-600px wide — 800px covers 2x retina comfortably.
const WEBP_QUALITY = 85;
const HERO_WIDTH = 1344;     // Nano Banana's native 16:9 output width
const HERO_HEIGHT = 768;
const THUMB_WIDTH = 800;
const THUMB_HEIGHT = 450;

/**
 * Brand + composition rules, distilled. Included in both the base prompt
 * (first generation) and the edit prompt (iterative revisions) so the model
 * doesn't drift on the essentials.
 */
const BRAND_RULES = `CRITICAL — keep human technician(s) as a key component of the composition. This brand is about empowering auto technicians with advanced technology, not replacing them. Show a confident, futuristic-looking mechanic wearing modern shop attire or a sleek sci-fi work uniform, elements can include things like a heads-up display, holographic diagnostic overlays, floating data panels, or a halo of tools arranged around them. They are clearly the one doing the work — AI is augmenting, not replacing them. Do NOT show: robotic arms operating on cars, autonomous machines doing repairs, fully automated assembly lines, vehicles being serviced without a human.

Style: futuristic technical illustration with an angular, geometric, sharp-edged feel that echoes the OnRamp brand. Isometric or 3/4 perspective. Brand palette: electric blue (#0088e6) glow on dark carbon-fiber background with occasional safety-orange (#e67d00) accents. Supporting visual motifs (mix-and-match, don't force all of them): sound waves, a stylized brain or neural network, mechanic's tools (wrench, diagnostic scanner, wiring harness), a vehicle or car part.

No text, typography, words, or letters anywhere in the image — the title will be rendered below the image on the site. Clean, modern, confident. No photographic realism.

FRAMING — the illustration MUST fill the entire 16:9 frame edge to edge, from pixel 0 on every side. Do NOT add white, black, colored, gradient, or empty borders, margins, padding, letterbox bars, or pillarbox bars of any kind. Do NOT center the artwork inside a smaller inner box with space around it. The composition should bleed off all four edges.`;

/**
 * Prompt for a first-pass generation (no prior image).
 *
 * Includes the post's description (the dek that sits under the title on
 * the site) as "article premise" so the image is grounded in the post's
 * specific angle, not just a generic automotive/AI visual.
 *
 * We deliberately do NOT pass the full article body — Nano Banana is a
 * visual model and long prose tends to confuse it. The description is a
 * human-written distillation, which is exactly what an image brief wants.
 */
export function buildBasePrompt(title, description = '') {
  const premise = description?.trim()
    ? `Article premise: ${description.trim()}\n\n`
    : '';
  return `16:9 cover illustration for a blog post titled "${title}" published on the OnRamp marketing site. Target audience: owners, managers, and technicians at automotive service centers (dealership service drives, independent repair shops, collision centers). The article theme is automotive.

${premise}Let the visual reflect the specific premise above — e.g. if the premise is about wasted terminal time, show the technician fluidly working with a heads-up display instead of breaking flow at a computer; if it's about diagnostics, emphasize the diagnostic overlay; if it's about the shop as a whole, pull back to a bay-level scene. Adapt the composition to the article's angle, not a generic stock scene.

${BRAND_RULES}`;
}

/**
 * Prompt for iterative editing — wraps the user's revision instruction with
 * framing that tells the model to keep the existing composition unless the
 * revision says otherwise, plus the brand rules so the model doesn't drift
 * away from the OnRamp look over multiple edits.
 */
export function buildEditPrompt(revisionText) {
  const instruction = revisionText?.trim() || 'Refine this cover to better match the brand direction below.';
  return `Revise the attached cover illustration per the user's feedback: "${instruction}"

Keep the same overall composition, subject, and staging unless the feedback explicitly says to change them. Apply the brand rules below to every revision so the output stays on-brand:

${BRAND_RULES}`;
}

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

/**
 * Call Gemini image generation on Vertex.
 *
 * @param {string} prompt - Text instruction.
 * @param {{ mimeType: string, bytes: Buffer } | null} inputImage - Optional
 *   input image for edit mode. When provided, it's sent as an inlineData part
 *   alongside the text so Nano Banana applies the prompt as an edit.
 * @returns {Promise<{ mimeType: string, bytes: Buffer }>}
 */
const RETRY_DELAYS_MS = [5000, 15000, 45000]; // three retries on 429

/** Sleep for ms — only used for backoff between Vertex retries. */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateCover(prompt, inputImage = null) {
  const client = await auth.getClient();
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`;

  const parts = [];
  if (inputImage) {
    parts.push({
      inlineData: {
        mimeType: inputImage.mimeType,
        data: inputImage.bytes.toString('base64'),
      },
    });
  }
  parts.push({ text: prompt });

  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio: '16:9' },
    },
  };

  let res;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      res = await client.request({ url, method: 'POST', data: body });
      break;
    } catch (err) {
      const status = err?.response?.status ?? err?.code;
      const message = err?.response?.data?.error?.message || err?.message || String(err);
      const isRateLimit = status === 429 || /rate|exhaust|quota|RESOURCE_EXHAUSTED/i.test(message);
      if (!isRateLimit || attempt >= RETRY_DELAYS_MS.length) {
        // Rethrow with a cleaned-up, user-friendly message on 429.
        if (isRateLimit) {
          throw new Error(`Vertex rate limit hit (429). Wait a minute or two and try again. (${message})`);
        }
        throw err;
      }
      const delay = RETRY_DELAYS_MS[attempt];
      // eslint-disable-next-line no-console
      console.warn(`[cover-generation] 429 from Vertex — retry ${attempt + 1}/${RETRY_DELAYS_MS.length} in ${delay / 1000}s`);
      await sleep(delay);
    }
  }

  const imgPart = res.data?.candidates?.[0]?.content?.parts?.find(
    (p) => p.inlineData?.mimeType?.startsWith('image/'),
  );
  if (!imgPart?.inlineData?.data) {
    const finishReason = res.data?.candidates?.[0]?.finishReason;
    const finishMessage = res.data?.candidates?.[0]?.finishMessage;
    throw new Error(
      finishMessage
        ? `${finishReason}: ${finishMessage}`
        : `No image returned. Response: ${JSON.stringify(res.data).slice(0, 400)}`,
    );
  }

  return {
    mimeType: imgPart.inlineData.mimeType,
    bytes: Buffer.from(imgPart.inlineData.data, 'base64'),
  };
}

/**
 * Process a Nano Banana PNG into the two WebP variants we actually serve:
 * a hero-sized 1344×768 and a thumbnail 800×450. Both use WebP quality 85,
 * which for illustrations is indistinguishable from the source PNG while
 * being ~10x smaller on disk.
 *
 * Returns an object with `hero` and `thumb` Buffers ready to upload.
 */
export async function processCoverImage(pngBytes) {
  const hero = await sharp(pngBytes)
    .resize(HERO_WIDTH, HERO_HEIGHT, { fit: 'cover', position: 'center' })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer();

  const thumb = await sharp(pngBytes)
    .resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: 'cover', position: 'center' })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer();

  return { hero, thumb };
}

/**
 * Upload a file to GCS via the JSON API (REST) using ADC. Avoids gsutil's
 * interactive reauth requirement.
 *
 * Uses `uploadType=multipart` so object metadata (Cache-Control) actually
 * persists — the simpler `uploadType=media` endpoint only accepts the raw
 * body and ignores everything else, which is why our previous uploads had
 * GCS's default 1-hour Cache-Control instead of our 30-day header.
 */
export async function uploadToGCS(localPathOrBytes, bucket, objectName, contentType) {
  const client = await auth.getClient();
  const bytes = Buffer.isBuffer(localPathOrBytes)
    ? localPathOrBytes
    : readFileSync(localPathOrBytes);

  const boundary = `onramp_${Math.random().toString(36).slice(2)}`;
  const metadata = {
    name: objectName,
    contentType,
    cacheControl: CACHE_HEADER,
  };

  const multipartBody = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: ${contentType}\r\n\r\n`,
      'utf-8',
    ),
    bytes,
    Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8'),
  ]);

  const url = `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=multipart`;
  await client.request({
    url,
    method: 'POST',
    headers: {
      'Content-Type': `multipart/related; boundary=${boundary}`,
      'Content-Length': String(multipartBody.length),
    },
    body: multipartBody,
  });
}

/**
 * Parse posts.ts for all post blocks. Returns enough info to locate and
 * mutate each post's field block.
 */
export function parsePosts(src) {
  const posts = [];
  const slugMatches = [...src.matchAll(/^ {2}\{[\s\S]*?slug: '([^']+)'/gm)];
  for (let i = 0; i < slugMatches.length; i++) {
    const slug = slugMatches[i][1];
    const startIdx = slugMatches[i].index;
    const endIdx = i + 1 < slugMatches.length ? slugMatches[i + 1].index : src.length;
    const block = src.slice(startIdx, endIdx);

    // Titles can be single-quoted (possibly with escaped apostrophes),
    // double-quoted, or backtick template literals.
    const titleMatch = block.match(/title:\s*'((?:\\.|[^\\'])*)'/)
      || block.match(/title:\s*"((?:\\.|[^\\"])*)"/)
      || block.match(/title:\s*`([^`]*)`/);
    const descriptionMatch = block.match(/description:\s*`([\s\S]*?)`,\s*\n/)
      || block.match(/description:\s*'((?:\\.|[^\\'])*)',\s*\n/)
      || block.match(/description:\s*"((?:\\.|[^\\"])*)",\s*\n/);
    const imageMatch = block.match(/^ {4}image:\s*'([^']*)',\s*$/m);

    posts.push({
      slug,
      blockStart: startIdx,
      blockEnd: endIdx,
      title: unescapeJsString(titleMatch?.[1]),
      description: unescapeJsString(descriptionMatch?.[1]),
      currentImage: imageMatch?.[1] || null,
    });
  }
  return posts;
}

/**
 * Undo JS string escape sequences (\\', \\", \\`, \\\\, \\n, \\t) in values
 * captured from posts.ts via regex. Without this, a title like
 * `'Won\\'t Use New Tech'` would render as `Won\\'t`.
 */
function unescapeJsString(s) {
  if (!s) return s;
  return s.replace(/\\(.)/g, (_, ch) => {
    if (ch === 'n') return '\n';
    if (ch === 't') return '\t';
    return ch;
  });
}

/**
 * Write `image: '<url>'` into the given post's block (replacing any existing
 * value). Re-reads the file each time to avoid offset drift.
 */
export function injectImageUrl(postsPath, slug, imageUrl) {
  const src = readFileSync(postsPath, 'utf-8');
  const posts = parsePosts(src);
  const post = posts.find((p) => p.slug === slug);
  if (!post) throw new Error(`Slug not found in posts.ts: ${slug}`);

  const block = src.slice(post.blockStart, post.blockEnd);
  let newBlock = block.replace(/^ {4}image: '[^']*',\n/m, '');

  const descRx = /^( {4}description:\s*(?:'[^']*'|"[^"]*"|`[\s\S]*?`)\s*,\s*\n)/m;
  if (!descRx.test(newBlock)) {
    throw new Error(`No 'description' field found on post '${slug}'.`);
  }
  newBlock = newBlock.replace(descRx, (_m, desc) => `${desc}    image: '${imageUrl}',\n`);

  const newSrc = src.slice(0, post.blockStart) + newBlock + src.slice(post.blockEnd);
  writeFileSync(postsPath, newSrc);
}

export function extFromMime(mimeType) {
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/jpeg') return 'jpg';
  return 'webp';
}

export function mimeFromExt(ext) {
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  return 'image/webp';
}
