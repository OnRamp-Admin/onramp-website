/**
 * audioBus — cross-component coordination for audio playback.
 *
 * Multiple parts of the site (voice samples, blog podcasts) can play audio,
 * but only one should play at a time. This module holds the global "currently
 * playing" reference and a listener pattern so each player can pause itself
 * when something else takes over.
 *
 * Both `useAudioPlayer` (voice samples in HowItWorksPage) and `usePodcastPlayer`
 * (blog podcasts) subscribe to this bus.
 */

let currentAudio: HTMLAudioElement | null = null;
const audioChangeListeners = new Set<() => void>();

export function getCurrentAudio(): HTMLAudioElement | null {
  return currentAudio;
}

export function setCurrentAudio(audio: HTMLAudioElement | null): void {
  currentAudio = audio;
}

/**
 * Notify all subscribers that the active audio has changed. Each subscriber
 * is responsible for checking whether it's still the active audio and pausing
 * itself if not.
 */
export function notifyAudioChanged(): void {
  audioChangeListeners.forEach((fn) => fn());
}

/**
 * Subscribe to audio change notifications. Returns an unsubscribe function.
 */
export function subscribeToAudioChanges(fn: () => void): () => void {
  audioChangeListeners.add(fn);
  return () => {
    audioChangeListeners.delete(fn);
  };
}
