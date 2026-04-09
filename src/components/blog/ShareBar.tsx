/**
 * ShareBar — small horizontal row of share buttons rendered above blog post
 * markdown. Three actions: LinkedIn (highest-value B2B channel), X/Twitter,
 * and Copy Link. Fires `blog_share_clicked` for each click so PostHog can
 * report which channels readers actually use.
 */
import { useState } from 'react';
import { Linkedin, Twitter, Link2, Check } from 'lucide-react';
import { trackBlogShareClicked } from '../../lib/analytics';

interface ShareBarProps {
  slug: string;
  title: string;
}

export default function ShareBar({ slug, title }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  // Build share URLs lazily on click — gives correct values even if SSR or
  // pre-rendering ever changes the canonical URL strategy.
  const getShareUrl = () => `https://getonramp.io/blog/${slug}`;

  const handleLinkedIn = () => {
    trackBlogShareClicked({ slug, channel: 'linkedin' });
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
  };

  const handleTwitter = () => {
    trackBlogShareClicked({ slug, channel: 'twitter' });
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
  };

  const handleCopyLink = async () => {
    trackBlogShareClicked({ slug, channel: 'copy_link' });
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Older browsers / non-secure contexts — fall back silently. The event
      // still fired, so the user's intent is captured even if the copy failed.
    }
  };

  const buttonClass =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-carbon-700/50 text-carbon-200 text-xs font-medium hover:border-electric-500/50 hover:text-electric-400 transition-colors';

  return (
    <div className="flex flex-wrap items-center gap-2 mb-10">
      <span className="text-xs text-carbon-300 mr-1">Share:</span>
      <button type="button" onClick={handleLinkedIn} className={buttonClass} aria-label="Share on LinkedIn">
        <Linkedin className="w-3.5 h-3.5" />
        LinkedIn
      </button>
      <button type="button" onClick={handleTwitter} className={buttonClass} aria-label="Share on X">
        <Twitter className="w-3.5 h-3.5" />
        X
      </button>
      <button type="button" onClick={handleCopyLink} className={buttonClass} aria-label="Copy link">
        {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  );
}
