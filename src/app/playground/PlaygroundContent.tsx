"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/i18n";
import { PLAYGROUND_VOICES } from "./voices.config";

// Voice config is centralised in voices.config.ts — edit that file to add/remove voices.

const SAMPLE_TEXTS = [
  {
    id: "welcome",
    titleKey: "playground.sampleTexts.welcome.title",
    textKey: "playground.sampleTexts.welcome.text",
  },
  {
    id: "product",
    titleKey: "playground.sampleTexts.product.title",
    textKey: "playground.sampleTexts.product.text",
  },
  {
    id: "tutorial",
    titleKey: "playground.sampleTexts.tutorial.title",
    textKey: "playground.sampleTexts.tutorial.text",
  },
];

// ---------------------------------------------------------------------------
// TTS Job status type (mirrors backend PlaygroundTTSJobResponse)
// ---------------------------------------------------------------------------
type TTSJobStatus = "queued" | "processing" | "completed" | "failed" | "rate_limited";

interface TTSJobResponse {
  job_id: string;
  status: TTSJobStatus;
  stream_url: string | null;
  audio_path: string | null;
  audio_duration: number | null;
  error_message: string | null;
  is_cached: boolean;
  expires_at: string;
  created_at: string;
  completed_at: string | null;
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function SpeakerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
      />
    </svg>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01.469-1.57m0 0a3 3 0 01-1.469-1.57m0 0L9 7m4.469 4.43a3 3 0 01.469 1.57m0 0a3 3 0 01-1.469 1.57m0 0l.469.43m0 0L15 17"
      />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatRetryAfter(seconds: number) {
  if (seconds >= 3600) return `${Math.ceil(seconds / 3600)}h`;
  if (seconds >= 60) return `${Math.ceil(seconds / 60)}m`;
  return `${seconds}s`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function PlaygroundContent() {
  const { t } = useI18n();

  // --- Text state ---
  const [textInput, setTextInput] = useState("");
  const [selectedSampleText, setSelectedSampleText] = useState<string | null>(null);

  // --- Voice state ---
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [playingVoicePreview, setPlayingVoicePreview] = useState<string | null>(null);

  // --- Recording state ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  // --- Generation state ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<TTSJobStatus | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [isCachedResult, setIsCachedResult] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rateLimitRetryAfter, setRateLimitRetryAfter] = useState<number | null>(null);

  // --- Playback state ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);

  // --- Refs ---
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const voicePreviewRef = useRef<HTMLAudioElement | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  // Audio progress tracking
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
        setAudioCurrentTime(audio.currentTime);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setAudioProgress(0);
      setAudioCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  // ---------------------------------------------------------------------------
  // Sample text selection
  // ---------------------------------------------------------------------------
  const handleSampleTextSelect = (id: string) => {
    const sample = SAMPLE_TEXTS.find((s) => s.id === id);
    if (sample) {
      setTextInput(t(sample.textKey));
      setSelectedSampleText(id);
    }
  };

  // ---------------------------------------------------------------------------
  // Voice preview — plays local audio file from /public/audio_prompts/
  // ---------------------------------------------------------------------------
  const handleVoicePreview = (voiceId: string) => {
    const voice = PLAYGROUND_VOICES.find((v) => v.id === voiceId);
    if (!voice) return;

    // Toggle off if already playing
    if (playingVoicePreview === voiceId) {
      voicePreviewRef.current?.pause();
      setPlayingVoicePreview(null);
      return;
    }

    // Stop any currently playing preview
    if (voicePreviewRef.current) {
      voicePreviewRef.current.pause();
    }

    const audio = new Audio(voice.localAudioFile);
    voicePreviewRef.current = audio;
    audio.onended = () => setPlayingVoicePreview(null);
    audio.onerror = () => {
      console.warn(`Preview audio not available for ${voiceId} at ${voice.localAudioFile}`);
      setPlayingVoicePreview(null);
    };
    audio.play().catch(() => setPlayingVoicePreview(null));
    setPlayingVoicePreview(voiceId);
  };

  // ---------------------------------------------------------------------------
  // Microphone recording
  // ---------------------------------------------------------------------------
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setRecordedAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Recording error:", error);
      alert(t("playground.microphoneError"));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Generate — calls backend playground TTS API then streams status via SSE
  // ---------------------------------------------------------------------------
  const handleGenerate = async () => {
    const text = textInput.trim();
    if (!text || !selectedVoice) return;

    const voice = PLAYGROUND_VOICES.find((v) => v.id === selectedVoice);
    if (!voice) return;

    // Reset state
    setIsGenerating(true);
    setGenerationStatus(null);
    setAudioUrl(null);
    setAudioDuration(null);
    setIsCachedResult(false);
    setErrorMessage(null);
    setRateLimitRetryAfter(null);
    setIsPlaying(false);
    setAudioProgress(0);

    // Close any existing SSE stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    try {
      // Step 1: Create playground TTS job
      const res = await fetch("/api/v1/playground/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice_id: voice.backendVoiceId,
          language: voice.language,
        }),
      });

      if (res.status === 429) {
        const body = await res.json();
        const retryAfter: number = body?.detail?.retry_after ?? 3600;
        setRateLimitRetryAfter(retryAfter);
        setGenerationStatus("rate_limited");
        setIsGenerating(false);
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const detail =
          typeof body?.detail === "string" ? body.detail : t("playground.generateError");
        setErrorMessage(detail);
        setGenerationStatus("failed");
        setIsGenerating(false);
        return;
      }

      const job: TTSJobResponse = await res.json();

      // If it's a cached completed result, resolve immediately
      if (job.status === "completed" && job.audio_path) {
        const resolvedUrl = resolveAudioUrl(job.audio_path);
        setAudioUrl(resolvedUrl);
        setAudioDuration(job.audio_duration);
        setIsCachedResult(job.is_cached);
        setGenerationStatus("completed");
        setIsGenerating(false);
        return;
      }

      // Step 2: Open SSE stream for real-time updates
      setGenerationStatus(job.status);
      listenToSSEStream(
        job.job_id,
        job.stream_url ?? `/api/v1/playground/tts/${job.job_id}/stream`
      );
    } catch (err) {
      console.error("Generate error:", err);
      setErrorMessage(t("playground.generateError"));
      setGenerationStatus("failed");
      setIsGenerating(false);
    }
  };

  /**
   * Resolve audio_path from backend into a playable URL.
   * The backend stores a MinIO/S3 path. We proxy through Next.js rewrites
   * to the backend's presigned URL endpoint (or serve directly if the backend
   * returns full URLs). For now, route through /api/v1/playground/audio/:path*.
   *
   * NOTE: If the backend provides a full URL in audio_path, use it directly.
   * Otherwise, strip and build the proxied path.
   */
  function resolveAudioUrl(audioPath: string): string {
    // If already a full URL, use directly
    if (audioPath.startsWith("http://") || audioPath.startsWith("https://")) {
      return audioPath;
    }
    // Proxy through Next.js rewrite to backend storage
    return `/api/v1/playground/audio/${audioPath}`;
  }

  /**
   * Open an EventSource (SSE) to the backend stream URL and update state
   * as job status changes until a terminal state is reached.
   */
  function listenToSSEStream(jobId: string, streamUrl: string) {
    // streamUrl from backend is like /api/v1/playground/tts/{job_id}/stream
    // which is already proxied by Next.js rewrites
    const es = new EventSource(streamUrl);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const job: TTSJobResponse = JSON.parse(event.data);
        setGenerationStatus(job.status);

        if (job.status === "completed") {
          if (job.audio_path) {
            const resolvedUrl = resolveAudioUrl(job.audio_path);
            setAudioUrl(resolvedUrl);
            setAudioDuration(job.audio_duration);
            setIsCachedResult(job.is_cached);
          }
          setIsGenerating(false);
          es.close();
          eventSourceRef.current = null;
        } else if (job.status === "failed") {
          setErrorMessage(job.error_message ?? t("playground.generateError"));
          setIsGenerating(false);
          es.close();
          eventSourceRef.current = null;
        } else if (job.status === "rate_limited") {
          setRateLimitRetryAfter(3600);
          setIsGenerating(false);
          es.close();
          eventSourceRef.current = null;
        }
      } catch (e) {
        console.error("SSE parse error:", e);
      }
    };

    es.onerror = (err) => {
      console.error(`SSE error for job ${jobId}:`, err);
      es.close();
      eventSourceRef.current = null;

      // If still generating and no audio, mark as failed
      setIsGenerating((prev) => {
        if (prev) {
          setGenerationStatus((status) => {
            if (status !== "completed" && status !== "failed") {
              setErrorMessage(t("playground.streamError"));
              return "failed";
            }
            return status;
          });
          return false;
        }
        return prev;
      });
    };
  }

  // ---------------------------------------------------------------------------
  // Audio playback
  // ---------------------------------------------------------------------------
  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audioRef.current.currentTime = pct * audioRef.current.duration;
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `huavoi-tts-${Date.now()}.wav`;
    a.click();
  };

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------
  const currentText =
    textInput ||
    (selectedSampleText
      ? t(SAMPLE_TEXTS.find((s) => s.id === selectedSampleText)?.textKey ?? "")
      : "");

  const canGenerate = !!currentText && !!selectedVoice && !isGenerating;

  const statusLabel = () => {
    switch (generationStatus) {
      case "queued":
        return t("playground.status.queued");
      case "processing":
        return t("playground.status.processing");
      case "completed":
        return t("playground.status.completed");
      case "failed":
        return t("playground.status.failed");
      case "rate_limited":
        return t("playground.status.rateLimited");
      default:
        return "";
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full glass-panel text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-6 shadow-sm shadow-indigo-500/5">
          <SpeakerIcon className="w-3.5 h-3.5" />
          <span>{t("playground.badge")}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
          {t("playground.title")}
        </h1>
        <p className="text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
          {t("playground.subtitle")}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* === Text Input Panel === */}
        <div className="glass-panel rounded-3xl p-8 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            {t("playground.textSection.title")}
          </h2>

          {/* Sample text presets */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-3">
              {t("playground.textSection.sampleTexts")}
            </label>
            <div className="space-y-2">
              {SAMPLE_TEXTS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSampleTextSelect(sample.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                    selectedSampleText === sample.id
                      ? "bg-indigo-500/10 border-2 border-indigo-500 text-indigo-700 dark:text-indigo-300"
                      : "bg-gray-50 dark:bg-zinc-900 border-2 border-transparent hover:border-gray-200 dark:hover:border-zinc-700 text-gray-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="font-medium text-sm mb-1">{t(sample.titleKey)}</div>
                  <div className="text-xs opacity-70 line-clamp-2">{t(sample.textKey)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom text */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-3">
              {t("playground.textSection.customText")}
            </label>
            <textarea
              value={textInput}
              onChange={(e) => {
                setTextInput(e.target.value);
                setSelectedSampleText(null);
              }}
              placeholder={t("playground.textSection.placeholder")}
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border-2 border-gray-200 dark:border-zinc-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 resize-none text-sm"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400">
              <span>
                {textInput.trim().split(/\s+/).filter(Boolean).length}{" "}
                {t("playground.textSection.words")} / {textInput.length}{" "}
                {t("playground.textSection.characters")}
              </span>
              <span
                className={
                  textInput.trim().split(/\s+/).filter(Boolean).length > 200
                    ? "text-red-500 font-semibold"
                    : ""
                }
              >
                {t("playground.textSection.maxWords")}
              </span>
            </div>
          </div>
        </div>

        {/* === Voice Selection Panel === */}
        <div className="glass-panel rounded-3xl p-8 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <SpeakerIcon className="w-5 h-5 text-purple-500" />
            {t("playground.voiceSection.title")}
          </h2>

          {/* Sample voices */}
          <div className="mb-6 flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-3">
              {t("playground.voiceSection.sampleVoices")}
            </label>
            <div className="space-y-2">
              {PLAYGROUND_VOICES.map((voice) => (
                <div
                  key={voice.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    selectedVoice === voice.id && !recordedAudioBlob
                      ? "bg-purple-500/10 border-2 border-purple-500"
                      : "bg-gray-50 dark:bg-zinc-900 border-2 border-transparent hover:border-gray-200 dark:hover:border-zinc-700"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${voice.color} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg`}
                  >
                    {voice.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">
                        {t(voice.nameKey)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-zinc-400">
                        {t(voice.genderKey)} • {t(voice.accentKey)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-zinc-500 truncate">
                      {t(voice.previewKey)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Preview button — plays local audio file */}
                    <button
                      onClick={() => handleVoicePreview(voice.id)}
                      className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 flex items-center justify-center transition-colors"
                      title={t("playground.previewVoice")}
                    >
                      {playingVoicePreview === voice.id ? (
                        <StopIcon className="w-3.5 h-3.5 text-gray-700 dark:text-zinc-300" />
                      ) : (
                        <PlayIcon className="w-3.5 h-3.5 text-gray-700 dark:text-zinc-300 ml-0.5" />
                      )}
                    </button>
                    {/* Select button */}
                    <button
                      onClick={() => {
                        setSelectedVoice(voice.id);
                        setRecordedAudioBlob(null);
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        selectedVoice === voice.id && !recordedAudioBlob
                          ? "bg-purple-500 text-white"
                          : "bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-700 dark:text-zinc-300"
                      }`}
                      title={t("playground.selectVoice")}
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mic recording section */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-3">
              {t("playground.voiceSection.recordCustom")}
            </label>
            <div className="rounded-xl bg-gray-50 dark:bg-zinc-900 border-2 border-dashed border-gray-300 dark:border-zinc-700 p-6">
              {recordedAudioBlob ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <CheckIcon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {t("playground.voiceSection.recordingComplete")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3">
                    {formatTime(recordingTime)} {t("playground.voiceSection.duration")}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
                    {t("playground.voiceSection.customVoiceNote")}
                  </p>
                  <button
                    onClick={() => {
                      setRecordedAudioBlob(null);
                      setRecordingTime(0);
                      setSelectedVoice(null);
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {t("playground.voiceSection.recordAgain")}
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  {isRecording ? (
                    <>
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-lg animate-pulse">
                        <MicIcon className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {t("playground.voiceSection.recording")} {formatTime(recordingTime)}
                      </p>
                      <button
                        onClick={stopRecording}
                        className="mt-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-colors"
                      >
                        {t("playground.voiceSection.stopRecording")}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <MicIcon className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                        {t("playground.voiceSection.recordYourVoice")}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3">
                        {t("playground.voiceSection.recordHint")}
                      </p>
                      <button
                        onClick={startRecording}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-medium transition-all shadow-md"
                      >
                        {t("playground.voiceSection.startRecording")}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* === Preview / Generation Panel === */}
      <div className="mt-8 glass-panel rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg
              className="w-5 h-5 text-pink-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            {t("playground.preview.title")}
          </h2>
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-8 py-3 rounded-full transition-all duration-200 font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 disabled:shadow-none hover:-translate-y-0.5 disabled:hover:translate-y-0 active:translate-y-0 text-sm disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {statusLabel() || t("playground.preview.generating")}
              </span>
            ) : (
              t("playground.preview.generate")
            )}
          </button>
        </div>

        {/* Rate limit error */}
        {generationStatus === "rate_limited" && rateLimitRetryAfter !== null && (
          <div className="mb-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
            <AlertIcon className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">{t("playground.rateLimitTitle")}</p>
              <p className="text-xs mt-0.5">
                {t("playground.rateLimitMessage")} {formatRetryAfter(rateLimitRetryAfter)}
              </p>
            </div>
          </div>
        )}

        {/* Generation error */}
        {generationStatus === "failed" && errorMessage && (
          <div className="mb-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
            <AlertIcon className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">{t("playground.errorTitle")}</p>
              <p className="text-xs mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Processing indicator */}
        {isGenerating && (generationStatus === "queued" || generationStatus === "processing") && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:300ms]" />
              </div>
              <span className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
                {statusLabel()}
              </span>
            </div>
            <div className="h-1 w-full bg-indigo-100 dark:bg-indigo-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {/* Audio player */}
        {audioUrl ? (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-6">
            {/* Cached badge */}
            {isCachedResult && (
              <div className="flex items-center gap-1.5 mb-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  {t("playground.preview.cached")}
                </span>
              </div>
            )}

            <div className="flex items-center gap-4">
              {/* Play/Pause button */}
              <button
                onClick={togglePlayback}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
              </button>

              <div className="flex-1 min-w-0">
                <audio ref={audioRef} src={audioUrl} className="hidden" />

                {/* Seekable progress bar */}
                <div
                  className="h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden cursor-pointer"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-xs text-gray-600 dark:text-zinc-400">
                    {formatTime(Math.floor(audioCurrentTime))}
                    {audioDuration ? ` / ${formatTime(Math.floor(audioDuration))}` : ""}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-zinc-500">
                    {isPlaying ? t("playground.preview.playing") : t("playground.preview.ready")}
                  </p>
                </div>
              </div>

              {/* Download button */}
              <button
                onClick={handleDownload}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors shrink-0"
                title={t("playground.preview.download")}
              >
                <DownloadIcon className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
              </button>
            </div>
          </div>
        ) : (
          !isGenerating && (
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl p-12 text-center">
              <svg
                className="w-16 h-16 text-gray-300 dark:text-zinc-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                {t("playground.preview.noAudio")}
              </p>
            </div>
          )
        )}
      </div>

      {/* === Tips Section === */}
      <div className="mt-12 glass-panel rounded-3xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {t("playground.tips.title")}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              ),
              title: t("playground.tips.tip1.title"),
              description: t("playground.tips.tip1.description"),
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              ),
              title: t("playground.tips.tip2.title"),
              description: t("playground.tips.tip2.description"),
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A11.962 11.962 0 003 9.7c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.132-2.053-.382-3.016z"
                  />
                </svg>
              ),
              title: t("playground.tips.tip3.title"),
              description: t("playground.tips.tip3.description"),
            },
          ].map((tip, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                {tip.icon}
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                  {tip.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-zinc-400">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
