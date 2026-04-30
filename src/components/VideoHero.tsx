import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { mobileViewport } from '../lib/motion';
import {
  trackVideoClicked,
  trackVideoStarted,
  trackVideoProgress,
  trackVideoCompleted,
} from '../lib/analytics';

// Bunny Stream video metadata. These IDs aren't secret — they're visible in the
// embed URL — so they live in code, not env. Library/Video IDs are in the Bunny
// dashboard: Stream → Library → (Library ID) and the video's "Video ID" field.
const BUNNY_LIBRARY_ID = '648915';
const BUNNY_VIDEO_GUID = 'de407b44-8296-4522-8f1d-eb1e2a584e75';
const VIDEO_DURATION_SECONDS = 70;
const VIDEO_UPLOAD_DATE = '2026-04-28'; // YYYY-MM-DD — when the video was uploaded to Bunny

const SITE_URL = 'https://getonramp.io';
const POSTER_ALT = 'Watch the ONRAMP overview video — voice-AI for auto technicians';
const PLAY_LABEL = 'Play Video';
const VIDEO_NAME = 'ONRAMP — Voice-AI for Auto Technicians';
const VIDEO_DESCRIPTION =
  'A 70-second overview of how ONRAMP helps automotive technicians diagnose faster, execute repairs flawlessly, and generate perfect RO reports — hands-free.';
const VIDEO_LOCATION = 'home_hero';
const BUNNY_EMBED_ORIGIN = 'https://iframe.mediadelivery.net';

function buildEmbedUrl(libraryId: string, guid: string) {
  const params = new URLSearchParams({
    autoplay: 'true',
    preload: 'true',
    responsive: 'true',
  });
  return `https://iframe.mediadelivery.net/embed/${libraryId}/${guid}?${params.toString()}`;
}

function secondsToIsoDuration(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `PT${minutes ? `${minutes}M` : ''}${seconds}S`;
}

export default function VideoHero() {
  const [playing, setPlaying] = useState(false);
  const ready = Boolean(BUNNY_LIBRARY_ID && BUNNY_VIDEO_GUID);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Subscribe to Bunny Stream's player.js postMessage events once the iframe
  // mounts. Bunny exposes: ready, play, pause, ended, timeupdate.
  // We forward play / progress milestones / completion into PostHog.
  useEffect(() => {
    if (!playing) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const milestonesFired = new Set<25 | 50 | 75>();
    let started = false;
    let maxSeconds = 0;
    let durationSeconds = VIDEO_DURATION_SECONDS;
    const eventBase = {
      video_location: VIDEO_LOCATION,
      video_id: BUNNY_VIDEO_GUID,
      video_name: VIDEO_NAME,
    };

    const send = (method: string, value?: string) => {
      iframe.contentWindow?.postMessage(
        JSON.stringify({ context: 'player.js', version: '0.0.11', method, value }),
        BUNNY_EMBED_ORIGIN,
      );
    };

    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== BUNNY_EMBED_ORIGIN) return;
      let payload: { context?: string; event?: string; value?: { seconds?: number; duration?: number } };
      try {
        payload = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (payload?.context !== 'player.js') return;

      switch (payload.event) {
        case 'ready':
          send('addEventListener', 'play');
          send('addEventListener', 'ended');
          send('addEventListener', 'timeupdate');
          break;
        case 'play':
          if (!started) {
            started = true;
            trackVideoStarted(eventBase);
          }
          break;
        case 'timeupdate': {
          const seconds = payload.value?.seconds ?? 0;
          const duration = payload.value?.duration ?? durationSeconds;
          if (duration > 0) durationSeconds = duration;
          if (seconds > maxSeconds) maxSeconds = seconds;
          const percent = (seconds / durationSeconds) * 100;
          for (const m of [25, 50, 75] as const) {
            if (percent >= m && !milestonesFired.has(m)) {
              milestonesFired.add(m);
              trackVideoProgress({ ...eventBase, milestone: m });
            }
          }
          break;
        }
        case 'ended':
          trackVideoCompleted({ ...eventBase, total_watch_time_seconds: Math.round(maxSeconds) });
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [playing]);

  const handlePlayClick = () => {
    if (!ready) return;
    trackVideoClicked({
      video_location: VIDEO_LOCATION,
      video_id: BUNNY_VIDEO_GUID,
      video_name: VIDEO_NAME,
    });
    setPlaying(true);
  };

  const schema = ready
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: VIDEO_NAME,
        description: VIDEO_DESCRIPTION,
        thumbnailUrl: [
          `${SITE_URL}/HomeVideoHero.webp`,
          `${SITE_URL}/HomeVideoHero-mobile.webp`,
          `${SITE_URL}/HomeVideoHero.jpg`,
        ],
        uploadDate: VIDEO_UPLOAD_DATE,
        duration: secondsToIsoDuration(VIDEO_DURATION_SECONDS),
        embedUrl: `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${BUNNY_VIDEO_GUID}`,
        publisher: {
          '@type': 'Organization',
          name: 'OnRamp Innovations, Inc.',
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/onramp-logo-white-md.png`,
          },
        },
      }
    : null;

  return (
    <section
      aria-label="Product video"
      className="relative px-4 py-16 md:py-24 bg-carbon-950"
    >
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={mobileViewport}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto"
      >
        <div className="relative aspect-video rounded-2xl overflow-hidden border border-carbon-700/60 shadow-2xl shadow-electric-500/10 bg-carbon-900">
          {playing && ready ? (
            <iframe
              ref={iframeRef}
              src={buildEmbedUrl(BUNNY_LIBRARY_ID!, BUNNY_VIDEO_GUID!)}
              title="ONRAMP overview video"
              loading="lazy"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          ) : (
            <button
              type="button"
              onClick={handlePlayClick}
              disabled={!ready}
              aria-label={PLAY_LABEL}
              className="group absolute inset-0 w-full h-full cursor-pointer disabled:cursor-not-allowed focus:outline-none focus-visible:ring-4 focus-visible:ring-electric-400/60"
            >
              <picture>
                <source
                  type="image/webp"
                  srcSet="/HomeVideoHero-sm.webp 480w, /HomeVideoHero-mobile.webp 1024w, /HomeVideoHero.webp 1920w"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1024px"
                />
                <img
                  src="/HomeVideoHero.jpg"
                  alt={POSTER_ALT}
                  width={1920}
                  height={1080}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </picture>

              {/* Subtle dark overlay for legibility of the play button */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-carbon-950/60 via-carbon-950/10 to-carbon-950/30 transition-opacity duration-300 group-hover:opacity-90"
              />

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 md:gap-5">
                <span
                  aria-hidden="true"
                  className="flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-electric-500/95 text-white shadow-2xl shadow-electric-500/40 transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
                  style={{ boxShadow: '0 0 40px rgba(26,160,255,0.45)' }}
                >
                  <Play className="w-9 h-9 md:w-11 md:h-11 ml-1" fill="currentColor" />
                </span>
                <span className="text-white text-lg md:text-xl font-semibold tracking-wide drop-shadow-lg">
                  {PLAY_LABEL}
                </span>
              </div>
            </button>
          )}
        </div>
      </motion.div>
    </section>
  );
}
