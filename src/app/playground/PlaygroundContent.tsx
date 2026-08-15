"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/i18n";
import { PLAYGROUND_VOICES } from "./voices.config";

// Voice config is centralised in voices.config.ts — edit that file to add/remove voices.
// Sample texts are stored in public/locales/{locale}/sample-texts.json for easier management.

const SAMPLE_TEXTS = [
  {
    id: "playful",
    textKey: "sampleTexts.playful.text",
  },
  {
    id: "mockNews",
    textKey: "sampleTexts.mockNews.text",
  },
  {
    id: "curious",
    textKey: "sampleTexts.curious.text",
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

function ChevronIcon({ className, open }: { className?: string; open?: boolean }) {
  return (
    <svg
      className={`${className} transform transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
  const { t, locale } = useI18n();

  // --- Text state ---
  const [textInput, setTextInput] = useState("");
  const [selectedSampleText, setSelectedSampleText] = useState<string | null>(null);

  // --- Voice state ---
  const [selectedVoice, setSelectedVoice] = useState<string | null>("voice1");
  const [playingVoicePreview, setPlayingVoicePreview] = useState<string | null>(null);

  // --- Speed state ---
  const [speed, setSpeed] = useState<"slow" | "normal" | "fast">("normal");

  // --- Voice panel toggle: "stock" shows sample voices, "custom" shows recording ---
  const [activeVoicePanel, setActiveVoicePanel] = useState<"stock" | "custom">("stock");

  // --- Recording state ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">(
    "idle"
  );
  const [anonymousVoiceId, setAnonymousVoiceId] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // --- Recorded voice preview & playback state ---
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isRecPlaying, setIsRecPlaying] = useState(false);
  const [recAudioProgress, setRecAudioProgress] = useState(0);
  const [recAudioCurrentTime, setRecAudioCurrentTime] = useState(0);
  const [recAudioDuration, setRecAudioDuration] = useState(0);

  // --- Generation state ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<TTSJobStatus | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [isCachedResult, setIsCachedResult] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rateLimitRetryAfter, setRateLimitRetryAfter] = useState<number | null>(null);
  const [emptyTextWarning, setEmptyTextWarning] = useState(false);

  // --- Playback state ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);

  // --- Refs ---
  const audioRef = useRef<HTMLAudioElement>(null);
  const recAudioRef = useRef<HTMLAudioElement | null>(null);
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
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    };
  }, [recordedAudioUrl]);

  // Track recorded audio playback progress
  useEffect(() => {
    const audio = recAudioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setRecAudioProgress((audio.currentTime / audio.duration) * 100);
        setRecAudioCurrentTime(audio.currentTime);
        setRecAudioDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      setIsRecPlaying(false);
      setRecAudioProgress(0);
      setRecAudioCurrentTime(0);
    };
    const handleLoadedMetadata = () => {
      if (audio.duration) setRecAudioDuration(audio.duration);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [recordedAudioUrl]);

  // Generated audio progress tracking
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
  // Recorded Voice Playback Toggle & Seek
  // ---------------------------------------------------------------------------
  const toggleRecPlayback = () => {
    if (!recAudioRef.current) return;
    if (isRecPlaying) {
      recAudioRef.current.pause();
      setIsRecPlaying(false);
    } else {
      recAudioRef.current
        .play()
        .then(() => setIsRecPlaying(true))
        .catch(() => setIsRecPlaying(false));
    }
  };

  const handleRecSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!recAudioRef.current || !recAudioRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    recAudioRef.current.currentTime = pct * recAudioRef.current.duration;
  };

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

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setRecordedAudioBlob(audioBlob);

        // Create playable Blob URL
        const blobUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return blobUrl;
        });

        // Automatically activate custom voice selection
        setSelectedVoice(null);
        setActiveVoicePanel("custom");

        stream.getTracks().forEach((track) => track.stop());

        // Upload recording to backend
        await uploadRecordingToBackend(audioBlob);

        // Auto playback recorded voice
        setTimeout(() => {
          if (recAudioRef.current) {
            recAudioRef.current.currentTime = 0;
            recAudioRef.current
              .play()
              .then(() => setIsRecPlaying(true))
              .catch((err) => console.warn("Auto-playback skipped:", err));
          }
        }, 250);
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
  // Upload the recorded blob to the backend anonymous audio prompt endpoint
  // ---------------------------------------------------------------------------
  const uploadRecordingToBackend = async (blob: Blob) => {
    setUploadStatus("uploading");
    setUploadError(null);
    setAnonymousVoiceId(null);

    try {
      const formData = new FormData();
      formData.append("file", blob, "recording.webm");
      formData.append("language", locale);

      const res = await fetch("/api/v1/playground/upload-voice-prompt", {
        method: "POST",
        body: formData,
      });

      if (res.status === 429) {
        const body = await res.json().catch(() => ({}));
        const retryAfter: number = body?.detail?.retry_after ?? 3600;
        setUploadStatus("error");
        setUploadError(
          t("playground.voiceSection.uploadRateLimit").replace(
            "{time}",
            formatRetryAfter(retryAfter)
          )
        );
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const detail =
          typeof body?.detail === "string" ? body.detail : t("playground.voiceSection.uploadError");
        setUploadStatus("error");
        setUploadError(detail);
        return;
      }

      const data = await res.json();
      setAnonymousVoiceId(data.anonymous_voice_id);
      setUploadStatus("success");
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus("error");
      setUploadError(t("playground.voiceSection.uploadError"));
    }
  };

  // ---------------------------------------------------------------------------
  // Generate — calls backend playground TTS API then streams status via SSE
  // ---------------------------------------------------------------------------
  const handleGenerate = async () => {
    const text = textInput.trim();
    const hasVoice = !!selectedVoice && !recordedAudioBlob;
    const hasRecording =
      !!recordedAudioBlob && uploadStatus === "success" && anonymousVoiceId !== null;
    if (!text) {
      setEmptyTextWarning(true);
      return;
    }
    setEmptyTextWarning(false);
    if (!hasVoice && !hasRecording) return;

    const voice = hasVoice ? PLAYGROUND_VOICES.find((v) => v.id === selectedVoice) : null;
    if (hasVoice && !voice) return;
    const language = hasVoice ? voice!.language : locale;

    // Calculate rate based on speed setting
    const rateMap = { slow: 0.3, normal: 0.5, fast: 0.8 };
    const rate = rateMap[speed];

    setIsGenerating(true);
    setGenerationStatus(null);
    setAudioUrl(null);
    setAudioDuration(null);
    setIsCachedResult(false);
    setErrorMessage(null);
    setRateLimitRetryAfter(null);
    setIsPlaying(false);
    setAudioProgress(0);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    try {
      const requestBody = hasVoice
        ? { text, voice_id: voice!.backendVoiceId, language, rate }
        : { text, anonymous_voice_id: anonymousVoiceId, language, rate };

      const res = await fetch("/api/v1/playground/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
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

      if (job.status === "completed" && job.audio_path) {
        const resolvedUrl = resolveAudioUrl(job.audio_path);
        setAudioUrl(resolvedUrl);
        setAudioDuration(job.audio_duration);
        setIsCachedResult(job.is_cached);
        setGenerationStatus("completed");
        setIsGenerating(false);
        return;
      }

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

  function resolveAudioUrl(audioPath: string): string {
    if (audioPath.startsWith("http://") || audioPath.startsWith("https://")) {
      return audioPath;
    }
    return `/api/v1/playground/audio/${audioPath}`;
  }

  function listenToSSEStream(jobId: string, streamUrl: string) {
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

  const hasSelectedVoice = !!selectedVoice && !recordedAudioBlob;
  const hasUploadedRecording =
    !!recordedAudioBlob && uploadStatus === "success" && anonymousVoiceId !== null;
  const canGenerate = (hasSelectedVoice || hasUploadedRecording) && !isGenerating;

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 pb-32 sm:pb-32">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full glass-panel text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-4 shadow-sm">
          <SpeakerIcon className="w-3.5 h-3.5" />
          <span>{t("playground.badge")}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
          {t("playground.title")}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
          {t("playground.subtitle")}
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Step 1: Input Text */}
        <section className="glass-panel rounded-3xl shadow-lg border border-white/20 dark:border-zinc-800/50 p-5 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">
              1
            </span>
            {t("playground.textSection.title")}
          </h2>

          {/* Sample text cards */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">
              {t("playground.textSection.sampleTexts")}
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {SAMPLE_TEXTS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSampleTextSelect(sample.id)}
                  className={`relative p-3 rounded-2xl border-2 text-left transition-all ${
                    selectedSampleText === sample.id
                      ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-md"
                      : "bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm"
                  }`}
                >
                  {selectedSampleText === sample.id && (
                    <div className="absolute top-2 right-2 text-indigo-500">
                      <CheckIcon className="w-4 h-4" />
                    </div>
                  )}
                  <p
                    className={`text-xs leading-relaxed line-clamp-4 ${
                      selectedSampleText === sample.id
                        ? "text-indigo-700 dark:text-indigo-300"
                        : "text-gray-600 dark:text-zinc-400"
                    }`}
                  >
                    {t(sample.textKey)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              value={textInput}
              onChange={(e) => {
                setTextInput(e.target.value);
                setSelectedSampleText(null);
              }}
              placeholder={t("playground.textSection.placeholder")}
              rows={5}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-zinc-900/50 border-2 border-gray-200 dark:border-zinc-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-400 resize-none text-sm sm:text-base shadow-inner"
            />
            {/* Word count with circular progress */}
            {(() => {
              const words = textInput.trim().split(/\s+/).filter(Boolean).length;
              const maxWords = 200;
              const percentage = Math.min((words / maxWords) * 100, 100);
              const isOverLimit = words > maxWords;
              const strokeColor = isOverLimit
                ? "text-red-500"
                : percentage > 80
                  ? "text-amber-500"
                  : "text-indigo-500";

              return (
                <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm px-2.5 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-zinc-700">
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200 dark:text-zinc-600"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={`${strokeColor} transition-all duration-300`}
                        strokeDasharray={`${percentage}, 100`}
                        strokeWidth="3"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                  </div>
                  <span
                    className={`text-xs font-semibold ${isOverLimit ? "text-red-500" : "text-gray-600 dark:text-zinc-300"}`}
                  >
                    {words}/{maxWords}
                  </span>
                </div>
              );
            })()}
          </div>
        </section>

        {/* Step 2: Voice Setting */}
        <section className="glass-panel rounded-3xl shadow-lg border border-white/20 dark:border-zinc-800/50 p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-bold">
                2
              </span>
              {t("playground.voiceSection.sampleVoices")}
            </h2>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 dark:bg-zinc-800/80 rounded-xl">
              <button
                onClick={() => setActiveVoicePanel("stock")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeVoicePanel === "stock"
                    ? "bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-400 shadow-sm"
                    : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
                }`}
              >
                <SpeakerIcon className="w-4 h-4" />
                <span>{t("playground.voiceSection.sampleVoices")}</span>
              </button>
              <button
                onClick={() => setActiveVoicePanel("custom")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeVoicePanel === "custom"
                    ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
                }`}
              >
                <MicIcon className="w-4 h-4" />
                <span>{t("playground.voiceSection.recordCustom")}</span>
              </button>
            </div>
          </div>

          {/* Voices Grid */}
          {activeVoicePanel === "stock" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {PLAYGROUND_VOICES.map((voice) => (
                <div
                  key={voice.id}
                  onClick={() => {
                    setSelectedVoice(voice.id);
                    handleVoicePreview(voice.id);
                  }}
                  className={`group relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedVoice === voice.id && !recordedAudioBlob
                      ? "bg-purple-50 dark:bg-purple-900/20 border-purple-500 shadow-md"
                      : "bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-sm"
                  }`}
                >
                  {selectedVoice === voice.id && !recordedAudioBlob && (
                    <div className="absolute top-2 right-2 text-purple-500">
                      <CheckIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex flex-col items-center text-center gap-2">
                    <div
                      className={`w-14 h-14 rounded-full bg-gradient-to-br ${voice.color} flex items-center justify-center text-white font-bold text-xl shadow-inner relative`}
                    >
                      {voice.avatar}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVoicePreview(voice.id);
                        }}
                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center text-gray-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 hover:scale-110 transition-transform"
                      >
                        {playingVoicePreview === voice.id ? (
                          <StopIcon className="w-3.5 h-3.5" />
                        ) : (
                          <PlayIcon className="w-3.5 h-3.5 ml-0.5" />
                        )}
                      </button>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                        {t(voice.nameKey)}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 capitalize">
                        {voice.gender === "male" ? t("common.male") : t("common.female")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Custom Recording */}
          {activeVoicePanel === "custom" && (
            <div className="flex flex-col items-center justify-center p-6 sm:p-10 bg-gray-50/50 dark:bg-zinc-900/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-700">
              {recordedAudioBlob ? (
                <div className="w-full max-w-md space-y-4">
                  {recordedAudioUrl && (
                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={toggleRecPlayback}
                          className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 flex items-center justify-center transition-colors shrink-0"
                        >
                          {isRecPlaying ? (
                            <PauseIcon className="w-5 h-5" />
                          ) : (
                            <PlayIcon className="w-5 h-5 ml-1" />
                          )}
                        </button>
                        <div className="flex-1">
                          <audio ref={recAudioRef} src={recordedAudioUrl} className="hidden" />
                          <div className="flex justify-between text-xs font-semibold mb-1.5 text-gray-700 dark:text-zinc-300">
                            <span>{t("playground.voiceSection.recordedPreview")}</span>
                            <span className="font-mono text-gray-500">
                              {formatTime(Math.floor(recAudioCurrentTime))} /{" "}
                              {formatTime(Math.floor(recAudioDuration || recordingTime))}
                            </span>
                          </div>
                          <div
                            className="h-2 bg-gray-100 dark:bg-zinc-900 rounded-full cursor-pointer overflow-hidden"
                            onClick={handleRecSeek}
                          >
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all duration-100"
                              style={{ width: `${recAudioProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status and Actions */}
                  <div className="flex items-center justify-between">
                    <div>
                      {uploadStatus === "uploading" && (
                        <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
                          <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
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
                          {t("playground.voiceSection.uploading")}
                        </div>
                      )}
                      {uploadStatus === "success" && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                          <CheckIcon className="w-3.5 h-3.5" />
                          {t("playground.voiceSection.uploadSuccess")}
                        </div>
                      )}
                      {uploadStatus === "error" && (
                        <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                          <AlertIcon className="w-3.5 h-3.5" />
                          {uploadError ?? t("playground.voiceSection.uploadError")}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (recAudioRef.current) recAudioRef.current.pause();
                        setIsRecPlaying(false);
                        setRecordedAudioBlob(null);
                        setRecordedAudioUrl(null);
                        setRecordingTime(0);
                        setSelectedVoice("voice1");
                        setUploadStatus("idle");
                        setAnonymousVoiceId(null);
                        setUploadError(null);
                      }}
                      className="text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                      {t("playground.voiceSection.recordAgain")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-4 text-xs font-medium text-gray-500 dark:text-zinc-400 italic bg-white/50 dark:bg-zinc-800/50 px-4 py-2 rounded-lg max-w-sm mx-auto">
                    &quot;{t("playground.voiceSection.promptGuideText")}&quot;
                  </div>
                  {isRecording ? (
                    <div className="flex flex-col items-center gap-3">
                      <button onClick={stopRecording} className="relative group">
                        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                        <div className="relative w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-xl group-active:scale-95 transition-transform">
                          <StopIcon className="w-6 h-6" />
                        </div>
                      </button>
                      <span className="font-mono text-red-500 font-bold">
                        {formatTime(recordingTime)}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={startRecording}
                      className="group flex flex-col items-center gap-3"
                    >
                      <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 group-active:scale-95 transition-transform">
                        <MicIcon className="w-7 h-7" />
                      </div>
                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {t("playground.voiceSection.startRecording")}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Output Audio Preview Card */}
        {audioUrl && (
          <section className="animate-fade-in-up">
            <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 sm:p-8 shadow-xl text-white overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 mix-blend-overlay"></div>

              <button
                onClick={() => {
                  setAudioUrl(null);
                  setGenerationStatus(null);
                  if (audioRef.current) audioRef.current.pause();
                  setIsPlaying(false);
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors text-white/80 hover:text-white z-10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                <button
                  onClick={togglePlayback}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform shrink-0"
                >
                  {isPlaying ? (
                    <PauseIcon className="w-8 h-8" />
                  ) : (
                    <PlayIcon className="w-8 h-8 ml-1" />
                  )}
                </button>

                <div className="flex-1 w-full">
                  <audio ref={audioRef} src={audioUrl} className="hidden" />
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-bold text-lg sm:text-xl">
                      {isPlaying ? t("playground.preview.playing") : t("playground.preview.ready")}
                    </span>
                    {isCachedResult && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                        {t("playground.preview.cached")}
                      </span>
                    )}
                  </div>

                  <div
                    className="h-3 bg-black/20 rounded-full cursor-pointer overflow-hidden backdrop-blur-sm shadow-inner"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full bg-white rounded-full transition-all duration-300"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>

                  <div className="flex justify-between mt-2 text-xs sm:text-sm font-medium text-white/80 font-mono">
                    <span>{formatTime(Math.floor(audioCurrentTime))}</span>
                    <span>{audioDuration ? formatTime(Math.floor(audioDuration)) : "0:00"}</span>
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-colors shrink-0 border border-white/30"
                >
                  <DownloadIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Alerts (Error / Warning / Status) */}
        {emptyTextWarning && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 animate-fade-in-up">
            <AlertIcon className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium flex-1">{t("playground.emptyTextWarning")}</p>
            <button
              onClick={() => setEmptyTextWarning(false)}
              className="text-amber-500 hover:text-amber-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {generationStatus === "rate_limited" && rateLimitRetryAfter !== null && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 animate-fade-in-up">
            <AlertIcon className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">{t("playground.rateLimitTitle")}</p>
              <p className="text-xs mt-0.5">
                {t("playground.rateLimitMessage")} {formatRetryAfter(rateLimitRetryAfter)}
              </p>
            </div>
          </div>
        )}

        {generationStatus === "failed" && errorMessage && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 animate-fade-in-up">
            <AlertIcon className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">{t("playground.errorTitle")}</p>
              <p className="text-xs mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {isGenerating && (generationStatus === "queued" || generationStatus === "processing") && (
          <div className="px-6 py-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 flex flex-col items-center justify-center gap-3 animate-fade-in-up">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0ms]" />
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:150ms]" />
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:300ms]" />
            </div>
            <span className="text-sm text-indigo-700 dark:text-indigo-300 font-bold tracking-wide">
              {statusLabel()}
            </span>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar (Mobile & Desktop) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-zinc-800/50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex flex-row items-center justify-between gap-4">
          {/* Speed Selector */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              {t("playground.speedSection.title")}
            </span>
            <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-full p-1">
              {(["slow", "normal", "fast"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-colors ${
                    speed === s
                      ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
                  }`}
                >
                  {t(`playground.speedSection.${s}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || (!hasSelectedVoice && !hasUploadedRecording)}
            className="flex-1 sm:flex-none bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white px-8 py-3 rounded-2xl transition-all font-bold text-sm sm:text-base shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-95 flex items-center justify-center gap-2"
          >
            <SpeakerIcon className="w-5 h-5" />
            <span>{t("playground.preview.generate")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
