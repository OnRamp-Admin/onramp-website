import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { mobileViewport } from '../lib/motion';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { blogPosts } from '../content/blog/posts';
import { useSEO } from '../hooks/useSEO';
import { trackBlogIndexViewed } from '../lib/analytics';

export default function BlogIndexPage() {
  useSEO({
    title: 'Blog | OnRamp',
    description: 'Insights on AI, automotive repair technology, and the future of service center operations from the ONRAMP team.',
  });

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
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={mobileViewport}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link
                to={`/blog/${post.slug}`}
                className="block group bg-carbon-800/50 border border-carbon-700/50 rounded-2xl p-6 hover:border-electric-500/30 transition-all duration-300 h-full"
              >
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

                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-electric-400 transition-colors">
                  {post.title}
                </h2>

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
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
