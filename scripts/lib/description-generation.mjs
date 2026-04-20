/**
 * Shared library for blog-post description rewriting.
 *
 * Used by both the CLI (scripts/generate-article-description.mjs) and the
 * dev-only description-review API (vite-plugins/description-review-api.mjs).
 *
 * Description strategy (see plan): rewrite every post's `description` field
 * as a proper SEO meta description — 130–155 chars, active voice, distinct
 * from the body's first sentence, captures the specific payoff.
 */

import { readFileSync, writeFileSync } from 'fs';
import { GoogleAuth } from 'google-auth-library';

const PROJECT_ID = 'gen-lang-client-0614585924';
const LOCATION = 'us-central1';
const MODEL = 'gemini-2.5-flash';

export const CHAR_MIN = 130;
export const CHAR_MAX = 155;
/** Hard-reject threshold: descriptions longer than this are flagged as "needs rewrite". */
export const CHAR_OVERFLOW = 165;

/**
 * Cheap heuristic: is this description likely just the body's opening
 * sentence pasted into the field? Matches on normalized first-sentence
 * comparison (lowercased, punctuation stripped).
 */
export function looksLikeBodyOpener(description, body) {
  if (!description || !body) return false;
  const firstSentence = (s) =>
    s.split(/[.!?]/)[0].toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const descFirst = firstSentence(description);
  const bodyFirst = firstSentence(body);
  if (!descFirst || !bodyFirst) return false;
  // Treat as copied if either sentence starts with the other (handles the
  // case where the description is the body's opener extended, or vice versa).
  return (
    descFirst.startsWith(bodyFirst.slice(0, 40))
    || bodyFirst.startsWith(descFirst.slice(0, 40))
  );
}

/**
 * Reasons this post needs a rewrite. Returns an array of short reason
 * strings so the UI can show chips; empty array means it's fine as-is.
 */
export function needsRewriteReasons(post) {
  const reasons = [];
  const d = post.description || '';
  if (!d) {
    reasons.push('missing');
    return reasons;
  }
  if (d.length > CHAR_OVERFLOW) reasons.push(`too long (${d.length})`);
  if (d.length < 100) reasons.push(`too short (${d.length})`);
  if (looksLikeBodyOpener(d, post.content)) reasons.push('duplicates opener');
  return reasons;
}

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

function buildPrompt({ title, body, currentDescription, revisionPrompt }) {
  const bodySnippet = (body || '').slice(0, 2500);
  const revisionBlock = revisionPrompt?.trim()
    ? `\n\nADDITIONAL DIRECTION FROM THE EDITOR:\n${revisionPrompt.trim()}\n`
    : '';

  return `You are writing a meta description for an OnRamp blog post. OnRamp is an AI voice assistant for automotive service centers. The audience is shop owners, managers, and technicians.

Requirements:
- 130–155 characters, single sentence (two short sentences only if separated by a period that still fits the char budget).
- Captures the specific payoff the reader gets by clicking — not just the topic. Be concrete ("recover billable hours", "diagnose in under a minute") over vague ("learn about…").
- Active voice, present tense.
- Must be distinct from the article's first sentence — do not paraphrase or lift it. The reader should see SERP copy and first-paragraph copy as two different handles on the same article.
- Include the primary topic keyword naturally, once. No keyword stuffing.
- No filler verbs (learn, discover, find out, explore, unlock).
- No quotation marks, no markdown, no leading label ("Description:").
- No emoji.

TITLE: ${title}

FIRST 2500 CHARS OF BODY:
${bodySnippet}

CURRENT DESCRIPTION (likely weak — may be the body's opener duplicated):
${currentDescription || '(none)'}${revisionBlock}

Output ONLY the new description, nothing else.`;
}

/**
 * Call Gemini 2.5 Flash text generation on Vertex. Returns the raw text
 * response trimmed of whitespace and surrounding quotes.
 */
export async function draftDescription({ title, body, currentDescription, revisionPrompt }) {
  const client = await auth.getClient();
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`;
  const prompt = buildPrompt({ title, body, currentDescription, revisionPrompt });

  const req = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.6,
      // Disable thinking — this is a one-shot copywriting task with a
      // clear prompt. Thinking tokens otherwise eat the token budget
      // before a single answer token is emitted, producing truncated
      // output. thinkingBudget: 0 hard-disables the thinking stage.
      thinkingConfig: { thinkingBudget: 0 },
      maxOutputTokens: 800,
    },
  };

  const res = await client.request({ url, method: 'POST', data: req });
  const text = res.data?.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
  if (!text) {
    throw new Error(`No text returned. Response: ${JSON.stringify(res.data).slice(0, 400)}`);
  }

  // Clean up — strip wrapping quotes, markdown, trailing whitespace, and
  // the "Description:" preamble if the model slipped one in.
  return text
    .trim()
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/^(description|meta description|seo description)\s*:\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// posts.ts parser + writeback
// ---------------------------------------------------------------------------

function unescapeJsString(s) {
  if (!s) return s;
  return s.replace(/\\(.)/g, (_, ch) => {
    if (ch === 'n') return '\n';
    if (ch === 't') return '\t';
    return ch;
  });
}

/**
 * Parse posts.ts for all post blocks — enough info to draft descriptions
 * and write the new ones back. Mirrors the parser in cover-generation.mjs,
 * extended to also return the body content for prompt input.
 */
export function parsePosts(src) {
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

    posts.push({
      slug,
      blockStart: startIdx,
      blockEnd: endIdx,
      title: unescapeJsString(titleMatch?.[1]),
      description: unescapeJsString(descriptionMatch?.[1]),
      content: contentMatch?.[1] ?? '',
    });
  }
  return posts;
}

function escapeBackticks(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

/**
 * Replace the `description` field value for a given slug in posts.ts,
 * preserving the surrounding formatting. Always writes as a backtick-
 * delimited string for safety (handles apostrophes without escape concerns).
 */
export function writeDescription(postsPath, slug, newDescription) {
  const src = readFileSync(postsPath, 'utf-8');
  const posts = parsePosts(src);
  const post = posts.find((p) => p.slug === slug);
  if (!post) throw new Error(`Slug not found in posts.ts: ${slug}`);

  const block = src.slice(post.blockStart, post.blockEnd);

  // The existing description takes one of three forms — single-quoted,
  // double-quoted, or a multi-line backtick. We replace the whole
  // `description: ...,\n` line(s) with a normalized form.
  const rx = /^( {4}description:\s*\n? *)(?:`[\s\S]*?`|'(?:\\.|[^\\'])*'|"(?:\\.|[^\\"])*"),\s*\n/m;
  const match = block.match(rx);
  if (!match) {
    throw new Error(`Could not locate description field in block for '${slug}'.`);
  }

  // Preserve the indent from the captured prefix so the file stays clean.
  const indent = '      ';
  const replacement = `    description:\n${indent}\`${escapeBackticks(newDescription)}\`,\n`;

  // Use the callback form of replace() so `$` characters in the replacement
  // text (e.g. "$162,500") are NOT interpreted as backreferences like $1.
  // The string-form replace() substitutes $1 with capture group 1, which
  // would corrupt any description containing dollar amounts that start with
  // a single-digit reference to a valid capture group.
  const newBlock = block.replace(rx, () => replacement);
  const newSrc = src.slice(0, post.blockStart) + newBlock + src.slice(post.blockEnd);
  writeFileSync(postsPath, newSrc);
}
