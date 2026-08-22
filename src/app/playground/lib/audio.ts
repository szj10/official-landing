/** Shared playground audio helpers (sticky TTS / recording / preview). */

/** Play once the element can play; returns abort cleanup for unmount / URL change. */
export function playWhenReady(
  audio: HTMLAudioElement,
  opts?: {
    resetTime?: boolean;
    onPlaying?: () => void;
    onSkipped?: (err: unknown) => void;
  }
): () => void {
  let cancelled = false;

  const tryPlay = () => {
    if (cancelled) return;
    if (opts?.resetTime) {
      try {
        audio.currentTime = 0;
      } catch {
        // ignore seek errors on unloaded media
      }
    }
    audio
      .play()
      .then(() => {
        if (!cancelled) opts?.onPlaying?.();
      })
      .catch((err) => {
        if (!cancelled) opts?.onSkipped?.(err);
      });
  };

  if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    tryPlay();
    return () => {
      cancelled = true;
    };
  }

  const onCanPlay = () => {
    audio.removeEventListener("canplay", onCanPlay);
    tryPlay();
  };
  audio.addEventListener("canplay", onCanPlay);

  return () => {
    cancelled = true;
    audio.removeEventListener("canplay", onCanPlay);
  };
}

/** Pause, detach listeners, clear src, and drop the preview Audio instance. */
export function disposePreviewAudio(ref: { current: HTMLAudioElement | null }) {
  const audio = ref.current;
  if (!audio) return;
  audio.pause();
  audio.onended = null;
  audio.onerror = null;
  audio.removeAttribute("src");
  audio.load();
  ref.current = null;
}

export function historyVoicePromptUrl(voiceId: number): string {
  return `/api/v1/playground/audio/voice-prompt/${voiceId}`;
}

export function parseHistoryVoiceIdFromUrl(url: string | null | undefined): number | null {
  if (!url) return null;
  const match = url.match(/\/voice-prompt\/(\d+)/);
  return match ? Number(match[1]) : null;
}

/** Revoke only blob: object URLs (no-op for http(s) history URLs). */
export function revokeIfBlobUrl(url: string | null | undefined) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

/**
 * Replace recorded/sticky src while revoking a previous blob URL.
 * Keeps http(s) history URLs intact (revokeObjectURL is a no-op on them, but we skip).
 */
export function replaceMediaUrl(
  prev: string | null,
  next: string,
  opts?: { revokeAnyPrev?: boolean }
): string {
  if (opts?.revokeAnyPrev && prev) {
    URL.revokeObjectURL(prev);
  } else {
    revokeIfBlobUrl(prev);
  }
  return next;
}

export function resolvePlaygroundAudioUrl(
  audioPath: string,
  bucket: "storage" | "output" = "output"
): string {
  if (audioPath.startsWith("http://") || audioPath.startsWith("https://")) {
    return audioPath;
  }
  return `/api/v1/playground/audio/${audioPath}?bucket=${bucket}`;
}

/** Attach timeupdate / ended / loadedmetadata; returns cleanup. */
export function attachMediaProgress(
  audio: HTMLAudioElement,
  handlers: {
    onTimeUpdate: (currentTime: number, duration: number) => void;
    onEnded: () => void;
    onLoadedMetadata?: (duration: number) => void;
  }
): () => void {
  const handleTimeUpdate = () => {
    if (audio.duration) {
      handlers.onTimeUpdate(audio.currentTime, audio.duration);
    }
  };
  const handleEnded = () => handlers.onEnded();
  const handleLoadedMetadata = () => {
    if (audio.duration) handlers.onLoadedMetadata?.(audio.duration);
  };

  audio.addEventListener("timeupdate", handleTimeUpdate);
  audio.addEventListener("ended", handleEnded);
  if (handlers.onLoadedMetadata) {
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
  }

  return () => {
    audio.removeEventListener("timeupdate", handleTimeUpdate);
    audio.removeEventListener("ended", handleEnded);
    if (handlers.onLoadedMetadata) {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    }
  };
}

export function seekFromClick(audio: HTMLAudioElement, clientX: number, target: HTMLElement) {
  if (!audio.duration) return;
  const rect = target.getBoundingClientRect();
  const pct = (clientX - rect.left) / rect.width;
  audio.currentTime = pct * audio.duration;
}
