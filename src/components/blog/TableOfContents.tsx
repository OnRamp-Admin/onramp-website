import { useEffect, useMemo, useRef, useState } from 'react';

export interface TocHeading {
  depth: 2 | 3;
  text: string;
  slug: string;
}

/**
 * Shared slugger used by both the TOC and the markdown h2/h3 renderer so
 * anchor links line up. Matches the common `rehype-slug` / github-slugger
 * behavior closely enough for our purposes.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[`~!@#$%^&*()+={}\[\]|\\:;"'<>,.?/]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Parse H2/H3 headings out of a markdown string, ignoring anything inside
 * fenced code blocks. De-duplicates slugs by appending `-2`, `-3`, ... the
 * same way rehype-slug does.
 */
export function parseHeadings(markdown: string): TocHeading[] {
  const lines = markdown.split('\n');
  const headings: TocHeading[] = [];
  const seen = new Map<string, number>();
  let inFence = false;

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;

    const depth = match[1].length as 2 | 3;
    const text = match[2].replace(/[*_`]/g, '');
    const baseSlug = slugify(text);
    if (!baseSlug) continue;

    const count = seen.get(baseSlug) ?? 0;
    const slug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
    seen.set(baseSlug, count + 1);

    headings.push({ depth, text, slug });
  }

  return headings;
}

interface TableOfContentsProps {
  markdown: string;
  /** Rendered above the TOC on desktop, e.g. the compact article-audio player. */
  header?: React.ReactNode;
}

export default function TableOfContents({ markdown, header }: TableOfContentsProps) {
  const headings = useMemo(() => parseHeadings(markdown), [markdown]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  // After a user click we want the clicked entry to stay highlighted during
  // the smooth scroll, even though IntersectionObserver is firing. Store the
  // timestamp until which IO updates should be ignored.
  const ioSuppressUntilRef = useRef<number>(0);

  useEffect(() => {
    if (headings.length === 0) return;

    // Match DOM elements to expected slugs, and warn once in dev if the
    // renderer produced different ids than the parser expected. This is the
    // single most common reason TOC clicks "do nothing".
    const missing = headings.filter((h) => !document.getElementById(h.slug));
    if (missing.length > 0 && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(
        '[TableOfContents] %d of %d heading slugs have no matching DOM id. Anchor clicks will fall back to text-match.',
        missing.length,
        headings.length,
        missing.map((h) => h.slug),
      );
    }

    const visible = new Map<string, IntersectionObserverEntry>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry);
          } else {
            visible.delete(entry.target.id);
          }
        }

        if (visible.size === 0) return;
        if (Date.now() < ioSuppressUntilRef.current) return;

        const topmost = [...visible.values()].sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
        )[0];

        setActiveSlug(topmost.target.id);
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: [0, 1],
      },
    );

    const nodes = headings
      .map((h) => document.getElementById(h.slug))
      .filter((n): n is HTMLElement => n !== null);

    nodes.forEach((node) => observer.observe(node));

    if (nodes.length > 0 && !activeSlug) {
      setActiveSlug(nodes[0].id);
    }

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headings]);

  /**
   * Find the heading element for a TOC slug. First tries getElementById, then
   * falls back to scanning all h2/h3 on the page and matching their text
   * (slugified) against the target slug. The fallback catches any future
   * drift between the TOC parser and whatever produces the ids in the DOM.
   */
  function resolveHeadingElement(slug: string, text: string): HTMLElement | null {
    const byId = document.getElementById(slug);
    if (byId) return byId;
    const candidates = Array.from(document.querySelectorAll<HTMLElement>('h2, h3'));
    return (
      candidates.find((el) => slugify(el.textContent || '') === slug)
      ?? candidates.find((el) => (el.textContent || '').trim() === text.trim())
      ?? null
    );
  }

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, h: TocHeading) {
    const target = resolveHeadingElement(h.slug, h.text);
    if (!target) {
      // eslint-disable-next-line no-console
      if (import.meta.env.DEV) console.warn('[TableOfContents] no element for slug', h.slug);
      return; // let the browser default take over
    }
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', `#${h.slug}`);
    // Lock in the clicked entry for 900ms so the smooth scroll doesn't cause
    // the IntersectionObserver to flip the highlight to a passing heading.
    ioSuppressUntilRef.current = Date.now() + 900;
    setActiveSlug(h.slug);
  }

  if (headings.length === 0 && !header) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="max-h-[calc(100vh-7rem)] overflow-y-auto pr-2"
    >
      {header && <div className="mb-6">{header}</div>}

      {headings.length > 0 && (
        <>
          <div className="text-xs font-bold uppercase tracking-wider text-safety-400 underline underline-offset-4 decoration-safety-500/60 mb-3">
            On this page
          </div>
          <ul className="space-y-1 text-sm">
            {headings.map((h) => {
              const isActive = h.slug === activeSlug;
              return (
                <li key={h.slug} className={h.depth === 3 ? 'pl-4' : ''}>
                  <a
                    href={`#${h.slug}`}
                    onClick={(e) => handleClick(e, h)}
                    className={[
                      'block py-1 border-l-2 pl-3 transition-colors',
                      isActive
                        ? 'border-electric-400 text-electric-400'
                        : 'border-transparent text-carbon-300 hover:text-white',
                    ].join(' ')}
                  >
                    {h.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </nav>
  );
}
