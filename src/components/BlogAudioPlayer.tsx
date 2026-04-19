import { forwardRef, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Loader2, Headphones, Zap, X, FileText, Gauge, Volume2 } from 'lucide-react';
import {
  useBlogAudioPlayer,
  type UseBlogAudioPlayerReturn,
} from '../hooks/useBlogAudioPlayer';
import {
  trackBlogAudioStarted,
  trackBlogAudioProgress,
  trackBlogAudioCompleted,
  trackBlogAudioSeeked,
  type BlogAudioFormat,
} from '../lib/analytics';

interface BlogAudioPlayerProps {
  slug: string;
  title: string;
  audioUrl: string;
  durationSec?: number;
  variant: BlogAudioFormat;
  /** Optional transcript text. When provided, a "Show transcript" toggle appears below the player. Rendered in DOM (inside <details>) so Google indexes it even when collapsed. */
  transcript?: string;
  /** Compact mode renders a single-row play + time pill suitable for the TOC sidebar. Skips the full card layout, progress bar, speed control, and transcript. */
  compact?: boolean;
}

const PLAYBACK_RATE_OPTIONS = [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0] as const;

interface VariantConfig {
  label: string;
  subtitlePrefix: string;
  Icon: typeof Headphones;
  cardBorderClass: string;
  cardBgClass: string;
  buttonGradientClass: string;
  buttonHoverGradientClass: string;
  buttonShadowClass: string;
  buttonGlowClass: string;
  iconColorClass: string;
  progressGradientClass: string;
  miniBorderClass: string;
}

const VARIANT_CONFIG: Record<BlogAudioFormat, VariantConfig> = {
  podcast: {
    label: 'Listen to the Podcast',
    subtitlePrefix: 'AI-narrated podcast',
    Icon: Headphones,
    cardBorderClass: 'border-electric-500/20',
    cardBgClass: 'bg-carbon-800/50',
    buttonGradientClass: 'from-electric-500 to-electric-600',
    buttonHoverGradientClass: 'hover:from-electric-400 hover:to-electric-500',
    buttonShadowClass: 'shadow-electric-500/40',
    buttonGlowClass: 'glow-electric',
    iconColorClass: 'text-electric-400',
    progressGradientClass: 'from-electric-400 to-electric-500',
    miniBorderClass: 'border-electric-500/30',
  },
  brief: {
    label: 'AI Brief Summary',
    subtitlePrefix: 'Quick overview',
    Icon: Zap,
    cardBorderClass: 'border-safety-500/20',
    cardBgClass: 'bg-carbon-800/50',
    buttonGradientClass: 'from-safety-500 to-safety-600',
    buttonHoverGradientClass: 'hover:from-safety-400 hover:to-safety-500',
    buttonShadowClass: 'shadow-safety-500/40',
    buttonGlowClass: 'glow-safety',
    iconColorClass: 'text-safety-400',
    progressGradientClass: 'from-safety-400 to-safety-500',
    miniBorderClass: 'border-safety-500/30',
  },
  article: {
    label: 'Listen to article',
    subtitlePrefix: 'Verbatim article read',
    Icon: Volume2,
    cardBorderClass: 'border-electric-500/30',
    cardBgClass: 'bg-carbon-800/50',
    buttonGradientClass: 'from-electric-500 to-safety-500',
    buttonHoverGradientClass: 'hover:from-electric-400 hover:to-safety-400',
    buttonShadowClass: 'shadow-electric-500/40',
    buttonGlowClass: 'glow-electric',
    iconColorClass: 'text-electric-400',
    progressGradientClass: 'from-electric-400 via-white/70 to-safety-400',
    miniBorderClass: 'border-electric-500/30',
  },
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function BlogAudioPlayer({
  slug,
  title,
  audioUrl,
  durationSec,
  variant,
  transcript,
  compact = false,
}: BlogAudioPlayerProps) {
  const config = VARIANT_CONFIG[variant];

  const player = useBlogAudioPlayer({
    src: audioUrl,
    initialDurationSec: durationSec,
    onFirstPlay: () => trackBlogAudioStarted({ slug, title, format: variant }),
    onMilestone: (milestone) =>
      trackBlogAudioProgress({ slug, format: variant, milestone }),
    onComplete: (totalListenTimeSeconds) =>
      trackBlogAudioCompleted({ slug, format: variant, totalListenTimeSeconds }),
    onSeek: (fromPercent, toPercent) =>
      trackBlogAudioSeeked({ slug, format: variant, fromPercent, toPercent }),
  });

  const inlineRef = useRef<HTMLDivElement>(null);
  const [inlineVisible, setInlineVisible] = useState(true);
  const [miniDismissed, setMiniDismissed] = useState(false);

  useEffect(() => {
    if (!inlineRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => setInlineVisible(entry.isIntersecting),
      { rootMargin: '0px 0px -100px 0px', threshold: 0 }
    );
    io.observe(inlineRef.current);
    return () => io.disconnect();
  }, []);

  // Mini-player only shows for the player that's currently active on the
  // audio bus. With multiple BlogAudioPlayer instances on the same page
  // (brief + podcast), only one mini will be visible at a time — automatic.
  const showMini = player.isActive && !inlineVisible && !miniDismissed;

  // If this player goes inactive (something else took over, or the audio
  // ended), reset the dismissed flag so the mini can come back next time
  // this player becomes active again.
  useEffect(() => {
    if (!player.isActive) setMiniDismissed(false);
  }, [player.isActive]);

  if (player.state === 'error') {
    return (
      <section
        ref={inlineRef}
        aria-label={`${config.label} player`}
        className="rounded-2xl bg-carbon-800/50 border border-carbon-700/50 p-6 text-carbon-300 text-sm"
      >
        Audio unavailable. Read the post below ↓
      </section>
    );
  }

  if (compact) {
    return (
      <>
        <CompactVariant ref={inlineRef} player={player} config={config} />
        <AnimatePresence>
          {showMini && (
            <MiniVariant
              player={player}
              title={title}
              config={config}
              onDismiss={() => setMiniDismissed(true)}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <InlineVariant
        ref={inlineRef}
        player={player}
        title={title}
        config={config}
        transcript={transcript}
      />
      <AnimatePresence>
        {showMini && (
          <MiniVariant
            player={player}
            title={title}
            config={config}
            onDismiss={() => setMiniDismissed(true)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------- Compact variant (TOC sidebar) ---------- */

interface CompactVariantProps {
  player: UseBlogAudioPlayerReturn;
  config: VariantConfig;
}

const CompactVariant = forwardRef<HTMLDivElement, CompactVariantProps>(
  function CompactVariant({ player, config }, ref) {
    const { state, currentTime, duration, progress, toggle, seekToPercent, seekTo } = player;
    const isPlaying = state === 'playing';
    const isLoading = state === 'loading';
    const hasNeverPlayed = state === 'idle';
    const Icon = config.Icon;
    const displayTime = isPlaying || currentTime > 0 ? currentTime : duration;

    const progressBarRef = useRef<HTMLDivElement>(null);

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressBarRef.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      seekToPercent(pct);
    };

    const handleProgressKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        seekTo(currentTime - 5);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        seekTo(currentTime + 5);
      } else if (e.key === 'Home') {
        e.preventDefault();
        seekTo(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        seekTo(duration);
      }
    };

    return (
      <section
        ref={ref}
        aria-label={`${config.label} player`}
        className={`rounded-xl ${config.cardBgClass} border ${config.cardBorderClass} backdrop-blur-sm overflow-hidden`}
      >
        <button
          type="button"
          onClick={toggle}
          disabled={isLoading}
          aria-label={isPlaying ? `Pause ${config.label}` : `Play ${config.label}`}
          className="w-full flex items-center gap-3 p-3 text-left hover:bg-carbon-700/30 transition-colors disabled:opacity-70"
        >
          <motion.span
            className={`flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br ${config.buttonGradientClass} ${config.buttonHoverGradientClass} flex items-center justify-center shadow-md ${config.buttonShadowClass} transition-colors`}
            animate={hasNeverPlayed ? { scale: [1, 1.06, 1] } : { scale: 1 }}
            transition={
              hasNeverPlayed
                ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.2 }
            }
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 text-white" fill="currentColor" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
            )}
          </motion.span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-carbon-400">
              <Icon className={`w-3 h-3 ${config.iconColorClass}`} />
              {config.label}
            </div>
            <div className="text-sm font-mono text-white/90 mt-0.5">
              {formatTime(displayTime)}
            </div>
          </div>
        </button>
        <div
          ref={progressBarRef}
          role="slider"
          tabIndex={0}
          aria-label="Audio progress"
          aria-valuemin={0}
          aria-valuemax={duration || 0}
          aria-valuenow={currentTime}
          onClick={handleProgressClick}
          onKeyDown={handleProgressKeyDown}
          className="group h-1.5 bg-carbon-700/70 cursor-pointer relative transition-all hover:h-2.5 focus:h-2.5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/20"
        >
          <div
            className={`h-full bg-gradient-to-r ${config.progressGradientClass} transition-[width] duration-100 pointer-events-none`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </section>
    );
  }
);

/* ---------- Inline variant ---------- */

interface InlineVariantProps {
  player: UseBlogAudioPlayerReturn;
  title: string;
  config: VariantConfig;
  transcript?: string;
}

const InlineVariant = forwardRef<HTMLDivElement, InlineVariantProps>(
  function InlineVariant({ player, title, config, transcript }, ref) {
    const { state, currentTime, duration, progress, toggle, seekToPercent, playbackRate, setPlaybackRate } = player;
    const isPlaying = state === 'playing';
    const isLoading = state === 'loading';
    const hasNeverPlayed = state === 'idle';
    const Icon = config.Icon;

    const progressBarRef = useRef<HTMLDivElement>(null);
    const speedMenuRef = useRef<HTMLDivElement>(null);
    const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

    // Close the speed menu when clicking outside or pressing Escape.
    useEffect(() => {
      if (!speedMenuOpen) return;
      const onClick = (e: MouseEvent) => {
        if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
          setSpeedMenuOpen(false);
        }
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setSpeedMenuOpen(false);
      };
      document.addEventListener('mousedown', onClick);
      document.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('mousedown', onClick);
        document.removeEventListener('keydown', onKey);
      };
    }, [speedMenuOpen]);

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressBarRef.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      seekToPercent(pct);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        player.seekTo(currentTime - 5);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        player.seekTo(currentTime + 5);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        player.seekTo(currentTime + 30);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        player.seekTo(currentTime - 30);
      } else if (e.key === 'Home') {
        e.preventDefault();
        player.seekTo(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        player.seekTo(duration);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle();
      }
    };

    return (
      <section
        ref={ref}
        aria-label={`${config.label} player`}
        className={`rounded-2xl ${config.cardBgClass} border ${config.cardBorderClass} p-5 md:p-6 backdrop-blur-sm`}
      >
        <div className="flex items-center gap-4 md:gap-5">
          {/* Big play/pause button */}
          <motion.button
            onClick={toggle}
            disabled={isLoading}
            aria-label={isPlaying ? `Pause ${config.label}` : `Play ${config.label}`}
            className={`relative flex-shrink-0 w-16 h-16 md:w-[72px] md:h-[72px] rounded-full bg-gradient-to-br ${config.buttonGradientClass} ${config.buttonHoverGradientClass} flex items-center justify-center shadow-lg ${config.buttonShadowClass} ${config.buttonGlowClass} transition-colors disabled:opacity-70`}
            animate={hasNeverPlayed ? { scale: [1, 1.05, 1] } : { scale: 1 }}
            transition={
              hasNeverPlayed
                ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.2 }
            }
          >
            {isLoading ? (
              <Loader2 className="w-7 h-7 text-white animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-7 h-7 text-white" fill="currentColor" />
            ) : (
              <Play className="w-7 h-7 text-white ml-0.5" fill="currentColor" />
            )}
          </motion.button>

          {/* Right side: title + progress + time */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-3.5 h-3.5 ${config.iconColorClass} flex-shrink-0`} />
              <span
                className={`text-xs ${config.iconColorClass} font-semibold uppercase tracking-wider`}
              >
                {config.label}
              </span>
            </div>
            <p className="text-white font-medium text-sm md:text-base mb-3 truncate">
              {title}
            </p>

            {/* Progress bar */}
            <div
              ref={progressBarRef}
              role="slider"
              tabIndex={0}
              aria-label="Audio progress"
              aria-valuemin={0}
              aria-valuemax={duration || 0}
              aria-valuenow={currentTime}
              onClick={handleProgressClick}
              onKeyDown={handleKeyDown}
              className="group h-2 bg-carbon-700/70 rounded-full cursor-pointer relative transition-all hover:h-3 focus:h-3 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <div
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${config.progressGradientClass} rounded-full transition-[width] duration-100`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            {/* Time row — clean current/duration readout. */}
            <div className="flex items-center justify-between gap-2 mt-2 text-xs text-carbon-400 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Bottom row: transcript toggle on the left, speed selector on the
            right. Both use the same pill styling so they feel like paired
            utility controls. Native <details> keeps the transcript text in
            the rendered DOM for SEO even when collapsed. */}
        <div className="flex items-start justify-between gap-2 mt-4">
          {transcript ? (
            <details className="group/t flex-1 min-w-0">
              <summary className="flex items-center gap-1.5 cursor-pointer list-none px-3 py-2 rounded-lg text-xs font-medium text-carbon-300 bg-carbon-700/40 hover:bg-carbon-700/70 hover:text-white transition-colors select-none w-fit">
                <FileText className="w-3.5 h-3.5" />
                <span className="group-open/t:hidden">Show transcript</span>
                <span className="hidden group-open/t:inline">Hide transcript</span>
              </summary>
              <div className="mt-4 pt-4 border-t border-carbon-700/40 text-carbon-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {transcript}
              </div>
            </details>
          ) : (
            <span aria-hidden="true" />
          )}

          <div ref={speedMenuRef} className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setSpeedMenuOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={speedMenuOpen}
              aria-label={`Playback speed: ${playbackRate}x. Click to change.`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium font-mono text-carbon-300 bg-carbon-700/40 hover:bg-carbon-700/70 hover:text-white transition-colors"
            >
              <Gauge className="w-3.5 h-3.5" />
              {playbackRate.toFixed(1)}x
            </button>
            <AnimatePresence>
              {speedMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.12 }}
                  role="listbox"
                  aria-label="Playback speed options"
                  className="absolute bottom-full right-0 mb-2 z-10 bg-carbon-900 border border-carbon-700 rounded-xl shadow-xl shadow-black/50 py-1 min-w-[72px] max-h-[280px] overflow-y-auto"
                >
                  {PLAYBACK_RATE_OPTIONS.map((rate) => {
                    const isSelected = Math.abs(rate - playbackRate) < 0.05;
                    return (
                      <button
                        key={rate}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setPlaybackRate(rate);
                          setSpeedMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1 text-xs font-mono transition-colors ${
                          isSelected
                            ? `${config.iconColorClass} bg-carbon-800 font-semibold`
                            : 'text-carbon-300 hover:bg-carbon-800 hover:text-white'
                        }`}
                      >
                        {rate.toFixed(1)}x
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    );
  }
);

/* ---------- Mini variant (sticky bottom) ---------- */

interface MiniVariantProps {
  player: UseBlogAudioPlayerReturn;
  title: string;
  config: VariantConfig;
  onDismiss: () => void;
}

function MiniVariant({ player, title, config, onDismiss }: MiniVariantProps) {
  const { state, currentTime, duration, progress, toggle, seekToPercent } = player;
  const isPlaying = state === 'playing';
  const isLoading = state === 'loading';
  const Icon = config.Icon;

  const progressBarRef = useRef<HTMLDivElement>(null);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seekToPercent(pct);
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-3 pb-[max(env(safe-area-inset-bottom),12px)]"
    >
      <div className="max-w-2xl mx-auto">
        <div
          className={`relative bg-carbon-800/95 backdrop-blur-lg border ${config.miniBorderClass} rounded-2xl shadow-2xl shadow-black/50 p-3`}
        >
          <div className="flex items-center gap-3">
            {/* Compact play/pause */}
            <button
              onClick={toggle}
              disabled={isLoading}
              aria-label={isPlaying ? `Pause ${config.label}` : `Play ${config.label}`}
              className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${config.buttonGradientClass} ${config.buttonHoverGradientClass} flex items-center justify-center shadow-lg ${config.buttonShadowClass} transition-colors disabled:opacity-70`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 text-white" fill="currentColor" />
              ) : (
                <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
              )}
            </button>

            {/* Title + thin progress + time */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Icon className={`w-3 h-3 ${config.iconColorClass} flex-shrink-0`} />
                  <p className="text-white text-xs md:text-sm font-medium truncate">
                    {title}
                  </p>
                </div>
                <span className="text-[10px] md:text-xs text-carbon-400 font-mono flex-shrink-0">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div
                ref={progressBarRef}
                role="slider"
                tabIndex={0}
                aria-label="Audio progress"
                aria-valuemin={0}
                aria-valuemax={duration || 0}
                aria-valuenow={currentTime}
                onClick={handleProgressClick}
                className="h-1 bg-carbon-700/70 rounded-full cursor-pointer relative"
              >
                <div
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${config.progressGradientClass} rounded-full`}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>

            {/* Dismiss */}
            <button
              onClick={onDismiss}
              aria-label="Hide mini player"
              className="flex-shrink-0 p-1.5 rounded-lg text-carbon-500 hover:text-white hover:bg-carbon-700/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
