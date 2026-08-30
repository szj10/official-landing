"use client";

import { useEffect, useRef, useState, type MutableRefObject, type MouseEvent } from "react";
import { PlaygroundVoice } from "../voices.config";
import {
  playWhenReady,
  disposePreviewAudio,
  historyVoicePromptUrl,
  parseHistoryVoiceIdFromUrl,
  revokeIfBlobUrl,
  replaceMediaUrl,
  resolvePlaygroundAudioUrl,
  attachMediaProgress,
  seekFromClick,
} from "../lib/audio";

export type StickyPlayerKind = "tts" | "rec" | null;

type UsePlaygroundAudioOptions = {
  /** Latest TTS job audio path (for toggle / history restore). Updated by the controller each render. */
  currentJobAudioPathRef: MutableRefObject<string | null | undefined>;
  stockVoices?: PlaygroundVoice[];
};

/**
 * Sticky TTS + recording playback, stock voice preview, and history play helpers.
 */
export function usePlaygroundAudio({
  currentJobAudioPathRef,
  stockVoices = [],
}: UsePlaygroundAudioOptions) {
  const [activeStickyPlayer, setActiveStickyPlayer] = useState<StickyPlayerKind>(null);

  const [playingVoicePreview, setPlayingVoicePreview] = useState<string | null>(null);

  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isRecPlaying, setIsRecPlaying] = useState(false);
  const [recAudioProgress, setRecAudioProgress] = useState(0);
  const [recAudioCurrentTime, setRecAudioCurrentTime] = useState(0);
  const [recAudioDuration, setRecAudioDuration] = useState(0);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);

  const [playingHistoryVoiceId, setPlayingHistoryVoiceId] = useState<number | null>(null);
  const [playingHistoryJobId, setPlayingHistoryJobId] = useState<number | string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recAudioRef = useRef<HTMLAudioElement | null>(null);
  const voicePreviewRef = useRef<HTMLAudioElement | null>(null);
  /** Request sticky TTS autoplay after next audioUrl commit (completion / history / toggle). */
  const pendingTtsAutoplayRef = useRef(false);
  /** Request sticky recording autoplay after next recordedAudioUrl commit. */
  const pendingRecAutoplayRef = useRef(false);
  /** Latest recorded URL for unmount revoke (avoid effect re-running on every URL change). */
  const recordedAudioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    recordedAudioUrlRef.current = recordedAudioUrl;
  }, [recordedAudioUrl]);

  useEffect(() => {
    return () => {
      revokeIfBlobUrl(recordedAudioUrlRef.current);
      disposePreviewAudio(voicePreviewRef);
    };
  }, []);

  const stopAllOtherAudio = (except: "tts" | "rec" | "preview") => {
    if (except !== "tts") {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    }
    if (except !== "rec") {
      if (recAudioRef.current) recAudioRef.current.pause();
      setIsRecPlaying(false);
    }
    if (except !== "preview") {
      disposePreviewAudio(voicePreviewRef);
      setPlayingVoicePreview(null);
    }
    // History highlight tracks sticky-rec history playback; keep it when starting "rec"
    if (except !== "rec") {
      setPlayingHistoryVoiceId(null);
    }
  };

  /** Pause every source and hide the sticky bar (e.g. before starting a new mic capture). */
  const silenceAllAudio = () => {
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    if (recAudioRef.current) recAudioRef.current.pause();
    setIsRecPlaying(false);
    disposePreviewAudio(voicePreviewRef);
    setPlayingVoicePreview(null);
    setPlayingHistoryVoiceId(null);
    setActiveStickyPlayer(null);
  };

  // Track recorded audio progress
  useEffect(() => {
    const audio = recAudioRef.current;
    if (!audio) return;

    return attachMediaProgress(audio, {
      onTimeUpdate: (currentTime, duration) => {
        setRecAudioProgress((currentTime / duration) * 100);
        setRecAudioCurrentTime(currentTime);
        setRecAudioDuration(duration);
      },
      onEnded: () => {
        setIsRecPlaying(false);
        setRecAudioProgress(0);
        setRecAudioCurrentTime(0);
        setPlayingHistoryVoiceId(null);
        setActiveStickyPlayer(null);
      },
      onLoadedMetadata: (duration) => setRecAudioDuration(duration),
    });
  }, [recordedAudioUrl]);

  // Sticky recording autoplay after capture (wait for <audio src> commit + canplay)
  useEffect(() => {
    if (!pendingRecAutoplayRef.current || !recordedAudioUrl) return;
    const audio = recAudioRef.current;
    if (!audio) return;

    pendingRecAutoplayRef.current = false;
    stopAllOtherAudio("rec");
    setActiveStickyPlayer("rec");

    return playWhenReady(audio, {
      resetTime: true,
      onPlaying: () => setIsRecPlaying(true),
      onSkipped: (err) => console.warn("Auto-playback skipped:", err),
    });
  }, [recordedAudioUrl]);

  // Track generated TTS audio progress
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    return attachMediaProgress(audio, {
      onTimeUpdate: (currentTime, duration) => {
        setAudioProgress((currentTime / duration) * 100);
        setAudioCurrentTime(currentTime);
      },
      onEnded: () => {
        setIsPlaying(false);
        setAudioProgress(0);
        setAudioCurrentTime(0);
        setActiveStickyPlayer(null);
      },
    });
  }, [audioUrl]);

  // Sticky TTS autoplay after src commit (completion, history, toggle-back)
  useEffect(() => {
    if (!pendingTtsAutoplayRef.current || !audioUrl) return;
    const audio = audioRef.current;
    if (!audio) return;

    pendingTtsAutoplayRef.current = false;
    stopAllOtherAudio("tts");
    setActiveStickyPlayer("tts");

    return playWhenReady(audio, {
      resetTime: true,
      onPlaying: () => setIsPlaying(true),
      onSkipped: (err) => console.warn("Auto-play after TTS skipped:", err),
    });
  }, [audioUrl]);

  const toggleRecPlayback = () => {
    if (!recAudioRef.current) return;
    if (isRecPlaying) {
      recAudioRef.current.pause();
      setIsRecPlaying(false);
      setPlayingHistoryVoiceId(null);
    } else {
      stopAllOtherAudio("rec");
      setActiveStickyPlayer("rec");
      const historyId = parseHistoryVoiceIdFromUrl(recordedAudioUrl);
      if (historyId != null) setPlayingHistoryVoiceId(historyId);
      recAudioRef.current
        .play()
        .then(() => setIsRecPlaying(true))
        .catch(() => {
          setIsRecPlaying(false);
          setPlayingHistoryVoiceId(null);
        });
    }
  };

  const handleRecSeek = (e: MouseEvent<HTMLDivElement>) => {
    if (!recAudioRef.current) return;
    seekFromClick(recAudioRef.current, e.clientX, e.currentTarget);
  };

  const handleVoicePreview = (voiceId: string, overrideAudioUrl?: string) => {
    const voice = stockVoices.find((v) => v.id === voiceId);
    const audioUrl = overrideAudioUrl || voice?.audioUrl;
    if (!audioUrl) return;

    if (playingVoicePreview === voiceId) {
      disposePreviewAudio(voicePreviewRef);
      setPlayingVoicePreview(null);
      return;
    }

    stopAllOtherAudio("preview");
    disposePreviewAudio(voicePreviewRef);

    const audio = new Audio(audioUrl);
    voicePreviewRef.current = audio;
    audio.onended = () => {
      setPlayingVoicePreview(null);
      disposePreviewAudio(voicePreviewRef);
    };
    audio.onerror = () => {
      console.warn(`Preview audio not available for ${voiceId} at ${audioUrl}`);
      setPlayingVoicePreview(null);
      disposePreviewAudio(voicePreviewRef);
    };
    audio.play().catch(() => {
      setPlayingVoicePreview(null);
      disposePreviewAudio(voicePreviewRef);
    });
    setPlayingVoicePreview(voiceId);
  };

  const playHistoryVoice = (voiceId: number) => {
    // Toggle off when this history voice is already playing in the sticky bar
    if (playingHistoryVoiceId === voiceId && isRecPlaying) {
      if (recAudioRef.current) recAudioRef.current.pause();
      setIsRecPlaying(false);
      setPlayingHistoryVoiceId(null);
      return;
    }

    disposePreviewAudio(voicePreviewRef);
    setPlayingVoicePreview(null);
    stopAllOtherAudio("rec");
    setPlayingHistoryVoiceId(voiceId);

    const url = historyVoicePromptUrl(voiceId);

    // Same src already on <audio> — play without waiting for a URL commit
    if (recordedAudioUrl === url && recAudioRef.current) {
      pendingRecAutoplayRef.current = false;
      setActiveStickyPlayer("rec");
      playWhenReady(recAudioRef.current, {
        resetTime: true,
        onPlaying: () => setIsRecPlaying(true),
        onSkipped: (err) => {
          console.warn("History voice autoplay skipped:", err);
          setPlayingHistoryVoiceId(null);
        },
      });
      return;
    }

    pendingRecAutoplayRef.current = true;
    setRecordedAudioUrl((prev) => replaceMediaUrl(prev, url));
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying && !playingHistoryJobId) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      stopAllOtherAudio("tts");
      setActiveStickyPlayer("tts");
      if (playingHistoryJobId) {
        setPlayingHistoryJobId(null);
        const path = currentJobAudioPathRef.current;
        if (path) {
          pendingTtsAutoplayRef.current = true;
          setAudioUrl(resolvePlaygroundAudioUrl(path));
        } else {
          setAudioUrl(null);
        }
      } else {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  };

  const playHistoryJob = (jobId: string | number, path: string | null) => {
    if (!path) return;
    if (playingHistoryJobId === jobId && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      setPlayingHistoryJobId(null);
      const currentPath = currentJobAudioPathRef.current;
      if (currentPath) setAudioUrl(resolvePlaygroundAudioUrl(currentPath));
      else setAudioUrl(null);
    } else {
      stopAllOtherAudio("tts");
      const nextUrl = resolvePlaygroundAudioUrl(path);
      setPlayingHistoryJobId(jobId);
      setActiveStickyPlayer("tts");
      // Same URL won't re-trigger the audioUrl effect — play immediately when ready.
      if (nextUrl === audioUrl && audioRef.current) {
        playWhenReady(audioRef.current, {
          resetTime: true,
          onPlaying: () => setIsPlaying(true),
          onSkipped: (err) => console.warn("Auto-play after TTS skipped:", err),
        });
      } else {
        pendingTtsAutoplayRef.current = true;
        setAudioUrl(nextUrl);
      }
    }
  };

  const handleSeek = (e: MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    seekFromClick(audioRef.current, e.clientX, e.currentTarget);
  };

  const setRecordedBlob = (blob: Blob | null, options?: { autoplay?: boolean }) => {
    if (!blob) {
      setRecordedAudioUrl((prev) => {
        revokeIfBlobUrl(prev);
        return null;
      });
      return;
    }
    const blobUrl = URL.createObjectURL(blob);
    if (options?.autoplay) {
      pendingRecAutoplayRef.current = true;
    }
    setRecordedAudioUrl((prev) => replaceMediaUrl(prev, blobUrl, { revokeAnyPrev: true }));
  };

  const setRecordedUrl = (url: string | null, options?: { autoplay?: boolean }) => {
    if (options?.autoplay) {
      pendingRecAutoplayRef.current = true;
    }
    setRecordedAudioUrl((prev) => {
      if (prev === url) return prev;
      return replaceMediaUrl(prev, url);
    });
  };

  const stopRecordingPlayback = () => {
    if (recAudioRef.current) recAudioRef.current.pause();
    setIsRecPlaying(false);
    setPlayingHistoryVoiceId(null);
  };

  const clearRecordedAudio = () => {
    stopRecordingPlayback();
    if (activeStickyPlayer === "rec") {
      setActiveStickyPlayer(null);
    }
    setRecordedAudioUrl((prev) => {
      revokeIfBlobUrl(prev);
      return null;
    });
  };

  const clearVoicePreview = () => {
    disposePreviewAudio(voicePreviewRef);
    setPlayingVoicePreview(null);
  };

  const handleHistoryVoiceDeleted = (voiceId: number) => {
    if (playingHistoryVoiceId === voiceId) {
      if (recAudioRef.current) recAudioRef.current.pause();
      setIsRecPlaying(false);
      setPlayingHistoryVoiceId(null);
      if (activeStickyPlayer === "rec") setActiveStickyPlayer(null);
      disposePreviewAudio(voicePreviewRef);
    }
  };

  const handleHistoryJobDeleted = (jobId: string | number, currentJobAudioPath?: string | null) => {
    if (playingHistoryJobId === jobId) {
      audioRef.current?.pause();
      setIsPlaying(false);
      setPlayingHistoryJobId(null);

      if (currentJobAudioPath) {
        setAudioUrl(resolvePlaygroundAudioUrl(currentJobAudioPath));
      } else {
        setAudioUrl(null);
        if (activeStickyPlayer === "tts") {
          setActiveStickyPlayer(null);
        }
      }
    }
  };

  const onTtsStart = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
    setAudioProgress(0);
    setPlayingHistoryJobId(null);
  };

  const closeStickyPlayer = () => {
    if (activeStickyPlayer === "tts") {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    } else if (activeStickyPlayer === "rec") {
      if (recAudioRef.current) recAudioRef.current.pause();
      setIsRecPlaying(false);
      setPlayingHistoryVoiceId(null);
    }
    setActiveStickyPlayer(null);
  };

  const isStickyPlayerVisible =
    (activeStickyPlayer === "tts" && !!audioUrl) ||
    (activeStickyPlayer === "rec" && !!recordedAudioUrl);

  const playGeneratedAudio = (audioPath: string, duration: number | null) => {
    setPlayingHistoryJobId(null);
    pendingTtsAutoplayRef.current = true;
    setAudioUrl(resolvePlaygroundAudioUrl(audioPath));
    setAudioDuration(duration);
    setActiveStickyPlayer("tts");
  };

  return {
    audioRef,
    recAudioRef,
    voicePreviewRef,
    pendingTtsAutoplayRef,
    pendingRecAutoplayRef,

    activeStickyPlayer,
    setActiveStickyPlayer,
    isStickyPlayerVisible,
    closeStickyPlayer,

    playingVoicePreview,
    setPlayingVoicePreview,
    handleVoicePreview,
    clearVoicePreview,

    recordedAudioUrl,
    setRecordedAudioUrl,
    setRecordedBlob,
    setRecordedUrl,
    isRecPlaying,
    setIsRecPlaying,
    recAudioProgress,
    recAudioCurrentTime,
    recAudioDuration,
    toggleRecPlayback,
    stopRecordingPlayback,
    clearRecordedAudio,
    handleRecSeek,
    playHistoryVoice,

    audioUrl,
    setAudioUrl,
    audioDuration,
    setAudioDuration,
    isPlaying,
    setIsPlaying,
    audioProgress,
    setAudioProgress,
    audioCurrentTime,
    togglePlayback,
    playHistoryJob,
    handleSeek,

    playingHistoryVoiceId,
    setPlayingHistoryVoiceId,
    playingHistoryJobId,
    setPlayingHistoryJobId,

    handleHistoryVoiceDeleted,
    handleHistoryJobDeleted,
    onTtsStart,
    stopAllOtherAudio,
    silenceAllAudio,
    playGeneratedAudio,
  };
}
