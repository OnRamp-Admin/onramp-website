import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { blogPosts, type BlogPost } from '../../content/blog/posts';
import BlogCoverFallback from './BlogCoverFallback';
import { getCoverSources } from '../../lib/blog-images';

interface RelatedPostsProps {
  /** Current post slug — excluded from results. */
  currentSlug: string;
  /** Tags on the current post; posts sharing tags rank higher. */
  currentTags: string[];
  /** Max cards to render. Default 4 — matches the desktop grid. */
  limit?: number;
}

/**
 * "You may also like..." grid below the article.
 *
 * Ranks posts by shared-tag overlap (+2 per match) plus recency (+1 for the
 * 20% most recent posts). Excludes the current post. Falls back to the
 * branded BlogCoverFallback when a post has no image yet.
 */
export default function RelatedPosts({
  currentSlug,
  currentTags,
  limit = 4,
}: RelatedPostsProps) {
  const currentTagSet = new Set(currentTags);
  const candidates = blogPosts.filter((p) => p.slug !== currentSlug);
  if (candidates.length === 0) return null;

  // Recency cutoff — top 20% most recent posts get a small boost.
  const sortedByDate = [...candidates].sort((a, b) => b.date.localeCompare(a.date));
  const recentCutoffIndex = Math.max(1, Math.floor(sortedByDate.length * 0.2));
  const recentSlugs = new Set(sortedByDate.slice(0, recentCutoffIndex).map((p) => p.slug));

  const scored = candidates.map((post) => {
    const shared = post.tags.filter((t) => currentTagSet.has(t)).length;
    const score = shared * 2 + (recentSlugs.has(post.slug) ? 1 : 0);
    return { post, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.post.date.localeCompare(a.post.date);
  });

  const picks = scored.slice(0, limit).map((s) => s.post);
  if (picks.length === 0) return null;

  return (
    <section className="mt-16 pt-10 border-t border-carbon-700/50">
      <h2 className="text-2xl font-bold text-white mb-6">You may also like</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {picks.map((post) => (
          <RelatedCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}

function RelatedCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block rounded-2xl overflow-hidden bg-carbon-800/50 border border-carbon-700/50 hover:border-electric-500/30 transition-colors"
    >
      <div className="relative">
        {post.image ? (
          (() => {
            const src = getCoverSources(post.image);
            return (
              <img
                src={src?.thumb ?? post.image}
                srcSet={src?.srcSet ?? undefined}
                sizes="(min-width: 1024px) 18rem, (min-width: 640px) 45vw, 100vw"
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
      </div>
      <div className="p-4">
        {post.tags[0] && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-electric-400">
            {post.tags[0]}
          </span>
        )}
        <h3 className="mt-1 text-base font-semibold text-white leading-snug line-clamp-3 group-hover:text-electric-400 transition-colors">
          {post.title}
        </h3>
        <div className="mt-3 flex items-center gap-1 text-[11px] text-carbon-400">
          <Calendar className="w-3 h-3" />
          {new Date(post.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      </div>
    </Link>
  );
}
