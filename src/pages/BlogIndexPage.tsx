import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Plus } from 'lucide-react';
import { blogPosts, isScheduled } from '../content/blog/posts';
import { useSEO } from '../hooks/useSEO';
import { trackBlogIndexViewed } from '../lib/analytics';
import BlogCoverFallback from '../components/blog/BlogCoverFallback';
import { getCoverSources } from '../lib/blog-images';

// Grid is long and scroll-heavy — override the default mobileViewport so
// cards start fading in ~200px BEFORE they enter the viewport. Positive
// margin grows the observer's root area. Cards feel "already there" on scroll.
const gridViewport = { once: true, margin: '200px 0px' } as const;

/**
 * How many posts to render on the initial page, and how many more each
 * Load-more click reveals. Keeping this as a single value so the UX is
 * predictable (same size on first load and on each expansion).
 *
 * SEO note: hiding posts behind Load More is safe because sitemap.xml lists
 * every /blog/<slug> URL individually, and posts link to one another via
 * the "You may also like" grid. Crawlers find every post without pressing
 * a button.
 */
const POSTS_PER_PAGE = 30;

export default function BlogIndexPage() {
  useSEO({
    title: 'Blog | OnRamp',
    description: 'Insights on AI, automotive repair technology, and the future of service center operations from the ONRAMP team.',
  });

  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const visiblePosts = blogPosts.slice(0, visibleCount);
  const hasMore = visibleCount < blogPosts.length;

  useEffect(() => {
    trackBlogIndexViewed();
  }, []);

  return (
    <div className="min-h-screen bg-carbon-950 pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-safety-400">ONRAMP</span> <span className="text-white">Blog</span>
          </h1>
          <p className="text-lg text-carbon-200 max-w-2xl mx-auto">
            Perspectives on AI, automotive repair, and the technology reshaping
            how service centers operate.
          </p>
        </motion.div>

        {/* Post Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {visiblePosts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={gridViewport}
              // Stagger only the first few cards (hero feel on initial load)
              // and drop the delay for everything else so scrolled-to cards
              // appear immediately. The previous `index * 0.1` meant the
              // 24th card waited 2.3s after scroll-in-view — felt broken.
              transition={{ duration: 0.35, delay: Math.min(index, 3) * 0.08 }}
            >
              <Link
                to={`/blog/${post.slug}`}
                className="block group bg-carbon-800/50 border border-carbon-700/50 rounded-2xl overflow-hidden hover:border-electric-500/30 transition-all duration-300 h-full"
              >
                {/* Cover with title overlaid on the bottom — matches the blog
                    post hero treatment so the index feels cohesive with the
                    article pages. Gradient keeps the title legible against
                    any image. */}
                <div className="relative">
                  {post.image ? (
                    (() => {
                      const src = getCoverSources(post.image);
                      // Cards use the thumbnail variant as the primary src
                      // (tiny WebP, ~35KB). Browsers with DPR > 2 on wider
                      // viewports may upgrade to the hero via srcset.
                      return (
                        <img
                          src={src?.thumb ?? post.image}
                          srcSet={src?.srcSet ?? undefined}
                          sizes="(min-width: 1024px) 28rem, (min-width: 768px) 45vw, 100vw"
                          width={src?.thumbWidth}
                          height={src?.thumbHeight}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="w-full aspect-[16/9] object-cover"
                        />
                      );
                    })()
                  ) : (
                    <BlogCoverFallback title={post.title} variant="card" />
                  )}

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/50 to-transparent" />

                  {isScheduled(post) && (
                    <span
                      className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-yellow-400 text-yellow-950 shadow-md shadow-yellow-400/40 ring-1 ring-yellow-300"
                      title={`Scheduled for ${new Date(post.date + 'T00:00:00').toLocaleDateString()}`}
                    >
                      Scheduled
                    </span>
                  )}

                  <h2 className="absolute inset-x-0 bottom-0 p-4 md:p-5 text-lg md:text-xl font-bold text-white leading-snug line-clamp-3 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] group-hover:text-electric-400 transition-colors">
                    {post.title}
                  </h2>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-electric-500/10 text-electric-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-carbon-200 text-sm mb-4 line-clamp-3">
                    {post.description}
                  </p>

                  <div className="flex items-center justify-between text-carbon-200 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(post.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTime} min read
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-electric-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Read <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Load more — reveals the next batch of posts in place. Scrolls the
            button out of view so the user lands on fresh posts. */}
        {hasMore && (
          <div className="mt-12 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setVisibleCount((n) => n + POSTS_PER_PAGE)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-electric-500 to-safety-500 text-white font-semibold text-sm shadow-lg shadow-electric-500/30 hover:shadow-electric-500/50 transition-shadow"
            >
              <Plus className="w-4 h-4" />
              Load more posts
            </button>
            <p className="text-xs text-carbon-400">
              Showing {visiblePosts.length} of {blogPosts.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
