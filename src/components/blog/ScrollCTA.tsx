/**
 * ScrollCTA — quiet in-content CTA that fades in once the reader has scrolled
 * past most of the article. Uses Framer Motion's whileInView (the project's
 * standard scroll trigger pattern). Mount it after the markdown content so it
 * appears near the end of the read.
 *
 * Click fires `blog_cta_clicked` with cta_location='mid_scroll' so we can tell
 * mid-scroll clicks apart from the bottom CTA in PostHog.
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { trackBlogCTAClicked } from '../../lib/analytics';

interface ScrollCTAProps {
  slug: string;
}

export default function ScrollCTA({ slug }: ScrollCTAProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className="my-10 px-5 py-4 rounded-xl border border-carbon-700/50 bg-carbon-800/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
    >
      <p className="text-carbon-200 text-sm">
        Curious how ONRAMP handles this in real shops?
      </p>
      <Link
        to="/how-it-works"
        onClick={() =>
          trackBlogCTAClicked({ slug, destination: '/how-it-works' })
        }
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-electric-500/10 border border-electric-500/40 text-electric-400 text-sm font-medium hover:bg-electric-500/20 transition-colors whitespace-nowrap"
      >
        See How It Works
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </motion.div>
  );
}
