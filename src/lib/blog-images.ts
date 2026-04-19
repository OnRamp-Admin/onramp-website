/**
 * Cover-image helpers for blog pages.
 *
 * The cover-generation pipeline uploads two WebP variants per post:
 * - `<slug>-cover.webp`        (1344x768, hero / large display)
 * - `<slug>-cover-thumb.webp`  (800x450, index cards / related-post tiles)
 *
 * `posts.ts` only stores the hero URL. This helper derives the matching
 * thumbnail URL from the hero URL, preserving any cache-buster query.
 *
 * For legacy PNG covers (generated before the WebP pipeline) it returns
 * null for the thumb so components fall back to using the hero URL as the
 * only source.
 */

export interface CoverSources {
  /** Hero-resolution URL — what's stored on the post. */
  hero: string;
  /** Thumbnail URL if a separate thumb variant exists. Null for legacy PNGs. */
  thumb: string | null;
  /** srcset suitable for <img srcSet>. Null for legacy PNGs. */
  srcSet: string | null;
  /** Intrinsic width and height for CLS prevention on both variants. */
  heroWidth: number;
  heroHeight: number;
  thumbWidth: number;
  thumbHeight: number;
}

const HERO_WIDTH = 1344;
const HERO_HEIGHT = 768;
const THUMB_WIDTH = 800;
const THUMB_HEIGHT = 450;

export function getCoverSources(imageUrl: string | undefined | null): CoverSources | null {
  if (!imageUrl) return null;

  const [base, query] = imageUrl.split('?');
  const heroWebp = base.endsWith('-cover.webp');

  if (!heroWebp) {
    // Legacy asset (likely a .png from before the WebP pipeline) — we only
    // have the hero, no responsive variants.
    return {
      hero: imageUrl,
      thumb: null,
      srcSet: null,
      heroWidth: HERO_WIDTH,
      heroHeight: HERO_HEIGHT,
      thumbWidth: HERO_WIDTH,
      thumbHeight: HERO_HEIGHT,
    };
  }

  const thumbBase = base.replace('-cover.webp', '-cover-thumb.webp');
  const thumb = query ? `${thumbBase}?${query}` : thumbBase;

  return {
    hero: imageUrl,
    thumb,
    srcSet: `${thumb} ${THUMB_WIDTH}w, ${imageUrl} ${HERO_WIDTH}w`,
    heroWidth: HERO_WIDTH,
    heroHeight: HERO_HEIGHT,
    thumbWidth: THUMB_WIDTH,
    thumbHeight: THUMB_HEIGHT,
  };
}
