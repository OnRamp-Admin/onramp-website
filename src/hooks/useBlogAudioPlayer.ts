import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getCurrentAudio,
  setCurrentAudio,
  notifyAudioChanged,
  subscribeToAudioChanges,
} from '../lib/audioBus';

export type BlogAudioPlayerState =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'ended'
  | 'error';

export interface UseBlogAudioPlayerOptions {
  src: string;
  /** Pre-known duration in seconds. Lets the player render correct total time before audio metadata loads. */
  initialDurationSec?: number;
  /** Fired once per page load on the very first play (idle → playing transition). */
  onFirstPlay?: () => void;
  /** Fired once per page load when the user crosses 25/50/75% of the audio. Never re-fires, even on rewind. */
  onMilestone?: (percent: 25 | 50 | 75) => void;
  /** Fired when the audio reaches the end. Receives total seconds the user actually listened (excluding seeks). */
  onComplete?: (totalListenTimeSec: number) => void;
  /** Fired when the user scrubs by more than 5 seconds (debounces accidental clicks). */
  onSeek?: (fromPercent: number, toPercent: number) => void;
}

export interface UseBlogAudioPlayerReturn {
  state: BlogAudioPlayerState;
  currentTime: number;
  duration: number;
  /** 0..1 */
  progress: number;
  /**
   * True when this player is the most recently played audio on the page,
   * including while paused. Used to decide which mini-player to show when
   * multiple BlogAudioPlayer instances are on the same page.
   */
  isActive: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seekTo: (seconds: number) => void;
  seekToPercent: (percent: number) => void;
}

const SEEK_THRESHOLD_SEC = 5;

export function useBlogAudioPlayer(
  options: UseBlogAudioPlayerOptions
): UseBlogAudioPlayerReturn {
  const { src, initialDurationSec } = options;

  const [state, setState] = useState<BlogAudioPlayerState>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDurationSec ?? 0);
  const [isActive, setIsActive] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const milestonesFiredRef = useRef<Set<25 | 50 | 75>>(new Set());
  const hasFiredFirstPlayRef = useRef(false);
  const totalListenTimeRef = useRef(0);
  const lastTickAtRef = useRef<number | null>(null);
  const lastSeekFromRef = useRef<number | null>(null);

  // Always-fresh callback refs so the rAF loop and event handlers can read
  // the latest version without retriggering effects.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastTickAtRef.current = null;
  }, []);

  const tick = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const now = performance.now();

    // Accumulate listen time only while actively playing.
    if (lastTickAtRef.current !== null) {
      const deltaSec = (now - lastTickAtRef.current) / 1000;
      // Cap delta at 1 second to avoid huge jumps when the tab was backgrounded.
      totalListenTimeRef.current += Math.min(deltaSec, 1);
    }
    lastTickAtRef.current = now;

    setCurrentTime(audio.currentTime);

    if (audio.duration && Number.isFinite(audio.duration)) {
      const pct = Math.floor((audio.currentTime / audio.duration) * 100);
      const milestones: Array<25 | 50 | 75> = [25, 50, 75];
      for (const m of milestones) {
        if (pct >= m && !milestonesFiredRef.current.has(m)) {
          milestonesFiredRef.current.add(m);
          optionsRef.current.onMilestone?.(m);
        }
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startRaf = useCallback(() => {
    stopRaf();
    rafRef.current = requestAnimationFrame(tick);
  }, [tick, stopRaf]);

  const ensureAudio = useCallback((): HTMLAudioElement => {
    if (audioRef.current) return audioRef.current;

    const audio = new Audio();
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';
    audio.src = src;

    audio.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    });
    audio.addEventListener('play', () => {
      setState('playing');
    });
    audio.addEventListener('pause', () => {
      // 'pause' fires on natural pause AND right before `ended`. The 'ended'
      // handler sets state separately, so only flip to 'paused' here if the
      // audio hasn't actually ended.
      if (!audio.ended) {
        setState((prev) => (prev === 'ended' ? prev : 'paused'));
      }
      // Stop accumulating listen time during pause.
      lastTickAtRef.current = null;
    });
    audio.addEventListener('ended', () => {
      setState('ended');
      stopRaf();
      setIsActive(false);
      if (getCurrentAudio() === audioRef.current) {
        setCurrentAudio(null);
        notifyAudioChanged();
      }
      optionsRef.current.onComplete?.(Math.round(totalListenTimeRef.current));
    });
    audio.addEventListener('error', () => {
      setState('error');
      setIsActive(false);
      stopRaf();
    });
    audio.addEventListener('seeking', () => {
      lastSeekFromRef.current = audio.currentTime;
    });
    audio.addEventListener('seeked', () => {
      const from = lastSeekFromRef.current;
      const to = audio.currentTime;
      lastSeekFromRef.current = null;
      if (from !== null && Math.abs(to - from) >= SEEK_THRESHOLD_SEC && audio.duration) {
        const fromPct = Math.round((from / audio.duration) * 100);
        const toPct = Math.round((to / audio.duration) * 100);
        optionsRef.current.onSeek?.(fromPct, toPct);
      }
    });

    audioRef.current = audio;
    return audio;
  }, [src, stopRaf]);

  const play = useCallback(() => {
    const audio = ensureAudio();

    // Pause any other audio playing site-wide.
    const existing = getCurrentAudio();
    if (existing && existing !== audio) {
      existing.pause();
      setCurrentAudio(null);
      notifyAudioChanged();
    }

    setState((prev) => (prev === 'idle' ? 'loading' : prev));

    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => {
          setCurrentAudio(audio);
          setIsActive(true);
          notifyAudioChanged();
          startRaf();
          if (!hasFiredFirstPlayRef.current) {
            hasFiredFirstPlayRef.current = true;
            optionsRef.current.onFirstPlay?.();
          }
        })
        .catch(() => {
          setState('error');
        });
    }
  }, [ensureAudio, startRaf]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    stopRaf();
    // NOTE: do NOT clear the audio bus on pause. The player remains "active"
    // (the most recently played audio on the page) so its mini-player stays
    // visible while paused. The bus is only cleared when another player takes
    // over, when the audio ends naturally, or when the component unmounts.
  }, [stopRaf]);

  const toggle = useCallback(() => {
    if (state === 'playing') {
      pause();
    } else {
      play();
    }
  }, [state, play, pause]);

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    const clamped = Math.max(0, Math.min(seconds, audio.duration));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  }, []);

  const seekToPercent = useCallback(
    (percent: number) => {
      const audio = audioRef.current;
      if (!audio || !Number.isFinite(audio.duration)) return;
      const clampedPct = Math.max(0, Math.min(1, percent));
      seekTo(clampedPct * audio.duration);
    },
    [seekTo]
  );

  // Subscribe to the audio bus so this player pauses + becomes inactive when
  // something else takes over playback site-wide.
  useEffect(() => {
    return subscribeToAudioChanges(() => {
      const audio = audioRef.current;
      if (!audio) return;
      if (getCurrentAudio() !== audio) {
        setIsActive(false);
        if (!audio.paused) {
          audio.pause();
          // The native 'pause' event listener flips React state to 'paused'.
        }
      }
    });
  }, []);

  // Cleanup on unmount: pause + tear down audio + clear from bus.
  useEffect(() => {
    return () => {
      stopRaf();
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.src = '';
        audio.load();
      }
      if (audio && getCurrentAudio() === audio) {
        setCurrentAudio(null);
        notifyAudioChanged();
      }
      audioRef.current = null;
    };
  }, [stopRaf]);

  const safeDuration = duration > 0 ? duration : initialDurationSec ?? 0;
  const progress = safeDuration > 0 ? Math.min(1, currentTime / safeDuration) : 0;

  return {
    state,
    currentTime,
    duration: safeDuration,
    progress,
    isActive,
    play,
    pause,
    toggle,
    seekTo,
    seekToPercent,
  };
}
