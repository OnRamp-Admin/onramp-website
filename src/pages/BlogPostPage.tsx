import { useParams, Link, Navigate } from 'react-router-dom';
import { Children, useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { getBlogPost, isScheduled } from '../content/blog/posts';
import type { Components } from 'react-markdown';
import { useSEO } from '../hooks/useSEO';
import BlogAudioPlayer from '../components/BlogAudioPlayer';
import ShareBar from '../components/blog/ShareBar';
import ScrollCTA from '../components/blog/ScrollCTA';
import InlineBlogLeadForm from '../components/blog/InlineBlogLeadForm';
import BlogCoverFallback from '../components/blog/BlogCoverFallback';
import TableOfContents, { slugify } from '../components/blog/TableOfContents';
import RelatedPosts from '../components/blog/RelatedPosts';
import { getCoverSources } from '../lib/blog-images';
import {
  trackBlogPostViewed,
  setBlogEntryPoint,
  trackBlogCTAClicked,
} from '../lib/analytics';

/**
 * Flatten any React node tree into a plain string — covers strings, numbers,
 * arrays, React elements, and fragments. Used to derive heading text from the
 * children ReactMarkdown hands us, which can be any shape depending on the
 * inline markdown syntax (bold, links, inline code, etc.).
 */
function headingText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  return Children.toArray(node)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') return String(child);
      if (child && typeof child === 'object' && 'props' in child) {
        const props = (child as { props?: { children?: ReactNode } }).props;
        return headingText(props?.children);
      }
      return '';
    })
    .join('');
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPost(slug) : undefined;

  useSEO({
    title: post ? `${post.title} | OnRamp Blog` : 'Blog | OnRamp',
    description: post?.description || 'Read the latest from the OnRamp team.',
    // Use the post's image (if set) for LinkedIn / X / Facebook share previews.
    // Relative paths get resolved against the site root by the OG spec consumers.
    ogImage: post?.image
      ? post.image.startsWith('http')
        ? post.image
        : `https://getonramp.io${post.image.startsWith('/') ? '' : '/'}${post.image}`
      : undefined,
  });

  useEffect(() => {
    if (post) {
      // PostHog: track post view + tag the user/session as a blog entry so we
      // can build blog → site funnels and identify "entered via blog" users.
      trackBlogPostViewed({
        slug: post.slug,
        title: post.title,
        tags: post.tags,
        readTime: post.readTime,
      });
      setBlogEntryPoint(post.slug);

      // Article structured data for SEO / LLM indexing
      const scriptId = 'blog-article-schema';
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        author: { '@type': 'Person', name: post.author },
        publisher: {
          '@type': 'Organization',
          name: 'OnRamp Innovations, Inc.',
          logo: { '@type': 'ImageObject', url: 'https://getonramp.io/Onramp-Logo-Pink Brain-White Text-MED.png' },
        },
        url: `https://getonramp.io/blog/${post.slug}`,
        keywords: post.tags.join(', '),
      });

      return () => { script?.remove(); };
    }
  }, [post]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // Track how many times each slug has been used so duplicate-text headings
  // get the same `-2`, `-3` suffix the TableOfContents parser applies.
  const slugCounts = new Map<string, number>();
  const nextSlug = (text: string): string => {
    const base = slugify(text);
    if (!base) return base;
    const count = slugCounts.get(base) ?? 0;
    slugCounts.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };

  const markdownComponents: Components = {
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold text-white mt-10 mb-4">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 id={nextSlug(headingText(children))} className="text-2xl font-bold text-white mt-8 mb-3 scroll-mt-28">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 id={nextSlug(headingText(children))} className="text-xl font-semibold text-white mt-6 mb-2 scroll-mt-28">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-carbon-200 leading-relaxed mb-4">{children}</p>
    ),
    a: ({ href, children }) => {
      const isInternal = href?.startsWith('/');
      if (isInternal) {
        return (
          <Link
            to={href!}
            onClick={() =>
              trackBlogCTAClicked({ slug: post.slug, destination: href! })
            }
            className="text-electric-400 hover:underline"
          >
            {children}
          </Link>
        );
      }
      return (
        <a
          href={href}
          onClick={() =>
            trackBlogCTAClicked({
              slug: post.slug,
              destination: href || 'external',
            })
          }
          className="text-electric-400 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    },
    ul: ({ children }) => (
      <ul className="text-carbon-200 space-y-2 ml-4 list-disc mb-4">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="text-carbon-200 space-y-2 ml-4 list-decimal mb-4">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-electric-500 pl-4 italic text-carbon-200 my-4">
        {children}
      </blockquote>
    ),
    strong: ({ children }) => (
      <strong className="text-white font-semibold">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="bg-carbon-800 text-electric-400 px-1.5 py-0.5 rounded text-sm">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-carbon-800 rounded-xl p-4 overflow-x-auto my-4">
        {children}
      </pre>
    ),
    img: ({ src, alt }) => (
      <img src={src} alt={alt || ''} className="rounded-xl my-6 w-full" loading="lazy" />
    ),
    hr: () => <hr className="border-carbon-700/50 my-8" />,
  };

  const articleAudioPlayer = post.articleAudioUrl ? (
    <BlogAudioPlayer
      slug={post.slug}
      title={post.title}
      audioUrl={post.articleAudioUrl}
      durationSec={post.articleDurationSec}
      variant="article"
      transcript={post.articleTranscript}
      compact
    />
  ) : null;

  return (
    <div className="min-h-screen bg-carbon-950 pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-carbon-200 hover:text-electric-400 transition-colors text-sm mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </motion.div>

        {/* Hero cover image with title overlaid on the bottom. Gradient keeps
            the title legible against any image. Falls back to the branded
            BlogCoverFallback (card variant, no built-in title) for posts
            without an image yet — our overlay still handles the title.
            Eager + fetchpriority so LCP doesn't suffer. */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 relative rounded-2xl overflow-hidden"
        >
          {post.image ? (
            (() => {
              const src = getCoverSources(post.image);
              // Hero loads eager+high priority for LCP. srcset lets mobile
              // grab the 800w thumbnail (~35KB WebP) instead of the hero.
              return (
                <img
                  src={src?.hero ?? post.image}
                  srcSet={src?.srcSet ?? undefined}
                  sizes="(min-width: 1024px) 72rem, 100vw"
                  width={src?.heroWidth}
                  height={src?.heroHeight}
                  alt=""
                  loading="eager"
                  // @ts-expect-error fetchPriority is valid HTML attribute
                  fetchpriority="high"
                  decoding="async"
                  className="w-full aspect-[16/9] object-cover"
                />
              );
            })()
          ) : (
            <BlogCoverFallback title={post.title} variant="card" />
          )}

          {/* Bottom-to-top black gradient so the title sits on a readable base
              regardless of what the image beneath looks like. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/50 to-transparent" />

          {isScheduled(post) && (
            <span
              className="absolute top-4 right-4 md:top-6 md:right-6 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-yellow-400 text-yellow-950 shadow-lg shadow-yellow-400/40 ring-1 ring-yellow-300"
              title={`Scheduled for ${new Date(post.date + 'T00:00:00').toLocaleDateString()}`}
            >
              Scheduled ·{' '}
              {new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}

          <h1 className="absolute inset-x-0 bottom-0 p-6 md:p-10 text-3xl md:text-5xl font-bold text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            {post.title}
          </h1>
        </motion.div>

        <div className="lg:grid lg:grid-cols-[15rem_minmax(0,48rem)] lg:gap-10 lg:justify-center">
          {/* Desktop left rail — article audio player (if available) + TOC.
              The aside stretches to the full grid row (= article height) by
              default. The inner div is `sticky top-24`, so it pins 6rem
              below the viewport top for the entire scroll through the
              article, then releases when the aside's bottom scrolls away. */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents
                markdown={post.content}
                header={articleAudioPlayer ?? undefined}
              />
            </div>
          </aside>

          <div className="min-w-0">
            {/* Header */}
            <motion.header
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-electric-500/10 text-electric-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-lg text-carbon-200 leading-relaxed mb-5">
                {post.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-carbon-200 text-sm">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {post.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {post.readTime} min read
                </span>
              </div>
            </motion.header>

            {/* Mobile: article audio above brief+podcast. The desktop copy
                lives in the sticky TOC aside; on mobile the TOC is hidden
                and the audio surfaces inline instead. */}
            {articleAudioPlayer && (
              <div className="lg:hidden mb-4">
                <BlogAudioPlayer
                  slug={post.slug}
                  title={post.title}
                  audioUrl={post.articleAudioUrl!}
                  durationSec={post.articleDurationSec}
                  variant="article"
                  transcript={post.articleTranscript}
                />
              </div>
            )}

            {/* Audio players (optional, only render if their URL is set on the post).
                Brief comes first because it's the lower-commitment "give it a try"
                option; podcast follows for readers who want the deep dive. */}
            {(post.briefAudioUrl || post.podcastAudioUrl) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-10 space-y-4"
              >
                {post.briefAudioUrl && (
                  <BlogAudioPlayer
                    slug={post.slug}
                    title={post.title}
                    audioUrl={post.briefAudioUrl}
                    durationSec={post.briefDurationSec}
                    variant="brief"
                    transcript={post.briefTranscript}
                  />
                )}
                {post.podcastAudioUrl && (
                  <BlogAudioPlayer
                    slug={post.slug}
                    title={post.title}
                    audioUrl={post.podcastAudioUrl}
                    durationSec={post.podcastDurationSec}
                    variant="podcast"
                    transcript={post.podcastTranscript}
                  />
                )}
              </motion.div>
            )}

            {/* Share buttons — sit above the content so readers can share without
                scrolling to the end. LinkedIn first (highest-value B2B channel). */}
            <ShareBar slug={post.slug} title={post.title} />

            {/* Content */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {post.content}
              </ReactMarkdown>
            </motion.article>

            {/* Quiet mid-scroll CTA — fades in once the reader nears the end of
                the article. Lower-friction next step than the lead form below. */}
            <ScrollCTA slug={post.slug} />

            {/* Bottom-of-post lead capture — replaces the old static CTA box.
                Submits to the same Google Form pipeline as ContactPage with a
                blog-specific source label. */}
            <InlineBlogLeadForm slug={post.slug} />

            <RelatedPosts currentSlug={post.slug} currentTags={post.tags} />
          </div>
        </div>
      </div>
    </div>
  );
}
