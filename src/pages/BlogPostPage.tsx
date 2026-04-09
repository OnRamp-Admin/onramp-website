import { useParams, Link, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { getBlogPost } from '../content/blog/posts';
import type { Components } from 'react-markdown';
import { useSEO } from '../hooks/useSEO';
import {
  trackBlogPostViewed,
  setBlogEntryPoint,
  trackBlogCTAClicked,
} from '../lib/analytics';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPost(slug) : undefined;

  useSEO({
    title: post ? `${post.title} | OnRamp Blog` : 'Blog | OnRamp',
    description: post?.description || 'Read the latest from the OnRamp team.',
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

  const markdownComponents: Components = {
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold text-white mt-10 mb-4">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold text-white mt-8 mb-3">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold text-white mt-6 mb-2">
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

  return (
    <div className="min-h-screen bg-carbon-950 pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
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

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {post.title}
          </h1>

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

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 bg-carbon-800/50 border border-carbon-700/50 rounded-2xl p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            Ready to see ONRAMP in action?
          </h2>
          <p className="text-carbon-200 mb-6">
            See how voice-first AI keeps technicians in the zone and off the
            terminal.
          </p>
          <Link
            to="/how-it-works"
            onClick={() =>
              trackBlogCTAClicked({
                slug: post.slug,
                destination: '/how-it-works',
              })
            }
            className="inline-flex items-center gap-2 px-6 py-3 bg-electric-500 hover:bg-electric-600 text-white font-semibold rounded-xl transition-colors"
          >
            See How It Works
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
