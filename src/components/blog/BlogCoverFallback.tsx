interface BlogCoverFallbackProps {
  title: string;
  /** Smaller sizes (cards) hide the title overlay so the tile reads as pure art. */
  variant?: 'hero' | 'card';
  className?: string;
}

/**
 * Branded 16:9 placeholder shown when a post has no cover image yet.
 *
 * Uses the OnRamp electric-blue → safety-orange gradient over a carbon-fiber
 * pattern plus a decorative sound-wave SVG so the tile still feels
 * intentional. Swap out for a generated cover via scripts/generate-article-cover.mjs.
 */
export default function BlogCoverFallback({
  title,
  variant = 'hero',
  className = '',
}: BlogCoverFallbackProps) {
  return (
    <div
      className={`relative w-full aspect-[16/9] overflow-hidden rounded-2xl bg-carbon-900 ${className}`}
      aria-hidden="true"
    >
      {/* Diagonal brand gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-electric-600 via-carbon-900 to-safety-500 opacity-80" />

      {/* Carbon fiber weave */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px),
            repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)
          `,
        }}
      />

      {/* Electric glow blob */}
      <div className="absolute -top-1/4 -right-1/4 w-2/3 h-2/3 rounded-full bg-electric-500/30 blur-3xl" />
      <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-safety-500/20 blur-3xl" />

      {/* Sound-wave SVG */}
      <svg
        className="absolute bottom-4 right-4 w-24 h-12 text-white/30"
        viewBox="0 0 96 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <line x1="4" y1="24" x2="4" y2="24" />
        <line x1="12" y1="18" x2="12" y2="30" />
        <line x1="20" y1="10" x2="20" y2="38" />
        <line x1="28" y1="16" x2="28" y2="32" />
        <line x1="36" y1="6" x2="36" y2="42" />
        <line x1="44" y1="14" x2="44" y2="34" />
        <line x1="52" y1="4" x2="52" y2="44" />
        <line x1="60" y1="12" x2="60" y2="36" />
        <line x1="68" y1="18" x2="68" y2="30" />
        <line x1="76" y1="8" x2="76" y2="40" />
        <line x1="84" y1="16" x2="84" y2="32" />
        <line x1="92" y1="22" x2="92" y2="26" />
      </svg>

      {variant === 'hero' && (
        <div className="absolute inset-0 flex items-end p-8">
          <h2 className="text-2xl md:text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] max-w-[80%] leading-tight">
            {title}
          </h2>
        </div>
      )}
    </div>
  );
}
