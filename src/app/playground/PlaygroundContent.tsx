"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/i18n";
import { PLAYGROUND_VOICES } from "./voices.config";

// Sub-components
import { PlaygroundEditorPanel } from "./components/PlaygroundEditorPanel";
import { VoiceSelectionModal } from "./components/VoiceSelectionModal";
import { StickyPlayerBar } from "./components/StickyPlayerBar";
import { QueueStatusCard } from "./components/QueueStatusCard";
import { AlertBanner } from "./components/AlertBanner";

import { SpeakerIcon, SparklesIcon } from "./components/icons";

// Types and constants
import {
  TTSJobStatus,
  TTSJobResponse,
  HistoryVoice,
  HistoryTTSJob,
  SAMPLE_TEXTS,
  formatRetryAfter,
} from "./components/types";

// Get max length from environment variable or use default
const MAX_TTS_TEXT_LENGTH = parseInt(process.env.NEXT_PUBLIC_MAX_TTS_TEXT_LENGTH || "600", 10);
/** Stop polling and surface a retry banner after this many consecutive network/HTTP failures. */
const MAX_CONSECUTIVE_POLL_FAILURES = 5;

export default function PlaygroundContent() {
  const { t, locale } = useI18n();

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [activeStickyPlayer, setActiveStickyPlayer] = useState<"tts" | "rec" | null>(null);

  // --- Step 1: Text state ---
  const [textInput, setTextInput] = useState("");

  // --- Step 2: Voice state ---
  const [selectedVoice, setSelectedVoice] = useState<string | null>("voice1");
  const [playingVoicePreview, setPlayingVoicePreview] = useState<string | null>(null);
  const [activeVoicePanel, setActiveVoicePanel] = useState<"stock" | "custom">("custom");

  // --- Step 2: Recording state ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">(
    "idle"
  );
  const [anonymousVoiceId, setAnonymousVoiceId] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // --- Step 2: Recorded voice playback ---
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isRecPlaying, setIsRecPlaying] = useState(false);
  const [recAudioProgress, setRecAudioProgress] = useState(0);
  const [recAudioCurrentTime, setRecAudioCurrentTime] = useState(0);
  const [recAudioDuration, setRecAudioDuration] = useState(0);

  // --- Step 3: Speed state ---
  const [speed, setSpeed] = useState<"slow" | "normal" | "fast">("normal");

  // --- Step 3: Generation state ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<TTSJobStatus | null>(null);
  const [currentJob, setCurrentJob] = useState<TTSJobResponse | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rateLimitRetryAfter, setRateLimitRetryAfter] = useState<number | null>(null);
  /** When set, failed status is a recoverable poll/connection issue for this job. */
  const [pollRetryJobId, setPollRetryJobId] = useState<string | number | null>(null);
  const [emptyTextWarning, setEmptyTextWarning] = useState(false);
  const [showCompletionCard, setShowCompletionCard] = useState(false);

  // Preserved queue metrics
  const [lastQueueMetrics, setLastQueueMetrics] = useState<{
    position: number;
    jobsAhead: number;
    queueDepth: number;
    estimatedWaitSeconds: number;
  } | null>(null);

  // --- Step 3: Playback state ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);

  // --- History state ---
  const [historyVoices, setHistoryVoices] = useState<HistoryVoice[]>([]);
  const [historyJobs, setHistoryJobs] = useState<HistoryTTSJob[]>([]);
  const [showHistoryVoices, setShowHistoryVoices] = useState(false);
  const [playingHistoryVoiceId, setPlayingHistoryVoiceId] = useState<number | null>(null);
  const [playingHistoryJobId, setPlayingHistoryJobId] = useState<number | string | null>(null);

  // --- Persistent Refs ---
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimeRef = useRef<number>(0); // Always in sync with state
  const voicePreviewRef = useRef<HTMLAudioElement | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollFailureCountRef = useRef(0);
  const editorRef = useRef<{ focusTextarea: () => void }>(null);

  // ---------------------------------------------------------------------------
  // Load History from localStorage / backend + Resume pending jobs
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const loadHistory = async () => {
      try {
        // Load voices
        const storedVoices = localStorage.getItem("playground_voice_ids");
        if (storedVoices) {
          const voices: HistoryVoice[] = JSON.parse(storedVoices);
          const now = new Date().getTime();
          const validIds = voices
            .filter((v) => new Date(v.expires_at).getTime() > now)
            .map((v) => v.anonymous_voice_id);

          if (validIds.length > 0) {
            const res = await fetch(
              `/api/v1/playground/history/voices?${validIds.map((id) => `ids=${id}`).join("&")}`
            );
            if (res.ok) {
              const data = await res.json();
              const sortedData = [...data].sort(
                (a, b) => b.anonymous_voice_id - a.anonymous_voice_id
              );
              setHistoryVoices(sortedData);
              localStorage.setItem("playground_voice_ids", JSON.stringify(sortedData));
            }
          } else {
            localStorage.setItem("playground_voice_ids", "[]");
          }
        }

        // Load TTS jobs
        const storedJobs = localStorage.getItem("playground_tts_jobs");
        if (storedJobs) {
          const jobs: HistoryTTSJob[] = JSON.parse(storedJobs);
          const now = new Date().getTime();
          const validJobs = jobs.filter((j) => new Date(j.expires_at).getTime() > now);
          const validIds = validJobs.map((j) => j.playground_job_id);

          if (validIds.length > 0) {
            const res = await fetch(
              `/api/v1/playground/history/tts?${validIds.map((id) => `ids=${id}`).join("&")}`
            );
            if (res.ok) {
              const backendJobs: TTSJobResponse[] = await res.json();
              const mergedJobs = validJobs
                .map((localJob) => {
                  const bj = backendJobs.find((b) => b.job_id === localJob.playground_job_id);
                  if (bj && bj.status === "completed") {
                    return {
                      ...localJob,
                      audio_path: bj.audio_path,
                    };
                  }
                  return localJob;
                })
                .filter((j) => j.audio_path !== null);

              setHistoryJobs(mergedJobs);
              localStorage.setItem("playground_tts_jobs", JSON.stringify(mergedJobs));
            }
          } else {
            localStorage.setItem("playground_tts_jobs", "[]");
          }
        }

        // 🔄 Resume pending job if page was refreshed during generation
        const pendingJobData = localStorage.getItem("playground_pending_job");
        if (pendingJobData) {
          try {
            const parsed = JSON.parse(pendingJobData);
            const pendingJobId = parsed.job_id || parsed; // Support old format (plain job_id string)

            console.log(`🔄 Resuming pending job ${pendingJobId} after page refresh...`);

            const res = await fetch(`/api/v1/playground/tts/${pendingJobId}`);
            if (res.ok) {
              const job: TTSJobResponse = await res.json();

              // Restore input text and voice selection
              if (typeof parsed === "object" && parsed.text) {
                setTextInput(parsed.text);

                if (parsed.active_panel) {
                  setActiveVoicePanel(parsed.active_panel);
                }

                if (parsed.active_panel === "stock" && parsed.selected_voice) {
                  setSelectedVoice(parsed.selected_voice);
                } else if (parsed.active_panel === "custom" && parsed.anonymous_voice_id) {
                  setAnonymousVoiceId(parsed.anonymous_voice_id);
                  setUploadStatus("success");
                }
              }

              // Only resume if job is still in progress
              if (job.status === "queued" || job.status === "processing") {
                setCurrentJob(job);
                setGenerationStatus(job.status);
                setIsGenerating(true);

                // Resume polling
                pollJobStatus(parseInt(pendingJobId));

                console.log(`✅ Resumed polling for job ${pendingJobId} (status: ${job.status})`);
              } else if (job.status === "completed" && job.audio_path) {
                // Job completed while user was away
                setCurrentJob(job);
                setGenerationStatus(job.status);
                setAudioUrl(resolveAudioUrl(job.audio_path));
                setAudioDuration(job.audio_duration);
                setShowCompletionCard(true);

                // Pass context to saveCompletedJob for proper voice name display
                const contextOverride = {
                  textInput: parsed.text,
                  activeVoicePanel: parsed.active_panel,
                  anonymousVoiceId: parsed.anonymous_voice_id,
                  selectedVoice: parsed.selected_voice,
                };
                saveCompletedJob(job, contextOverride);

                // Clear pending status
                localStorage.removeItem("playground_pending_job");

                console.log(`✅ Job ${pendingJobId} completed while away`);
              } else {
                // Job failed or rate limited - clear pending status
                localStorage.removeItem("playground_pending_job");
                console.log(`❌ Job ${pendingJobId} failed with status: ${job.status}`);
              }
            } else {
              // Job not found - clear pending status
              localStorage.removeItem("playground_pending_job");
              console.log(`❌ Job ${pendingJobId} not found on backend`);
            }
          } catch (err) {
            console.error(`Failed to resume job:`, err);
            localStorage.removeItem("playground_pending_job");
          }
        }
      } catch (err) {
        console.error("Failed to load playground history:", err);
      }
    };
    loadHistory();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    };
  }, [recordedAudioUrl]);

  // Track recorded audio progress
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
      // Auto-dismiss the sticky player when recording finishes
      setActiveStickyPlayer(null);
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

  // Helper to stop all other audio sources when a new one starts
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
      if (voicePreviewRef.current) voicePreviewRef.current.pause();
      setPlayingVoicePreview(null);
      setPlayingHistoryVoiceId(null);
    }
  };

  // Track generated TTS audio progress
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
      // Auto-dismiss the sticky player when TTS audio finishes
      setActiveStickyPlayer(null);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  // Auto-start StickyPlayerBar playback when a new TTS job completes
  useEffect(() => {
    if (showCompletionCard && audioUrl && audioRef.current) {
      // Give the <audio> element a tick to load the new src
      const timer = setTimeout(() => {
        if (!audioRef.current) return;
        stopAllOtherAudio("tts");
        setActiveStickyPlayer("tts");
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.warn("Auto-play after TTS completion skipped:", err));
      }, 150);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCompletionCard]);

  // ---------------------------------------------------------------------------
  // Recorded Audio Controls
  // ---------------------------------------------------------------------------
  const toggleRecPlayback = () => {
    if (!recAudioRef.current) return;
    if (isRecPlaying) {
      recAudioRef.current.pause();
      setIsRecPlaying(false);
    } else {
      stopAllOtherAudio("rec");
      setActiveStickyPlayer("rec");
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
  // Step 1: Text input
  // ---------------------------------------------------------------------------
  const handleSampleTextSelect = (id: string) => {
    const sample = SAMPLE_TEXTS.find((s) => s.id === id);
    if (sample) {
      setTextInput(t(sample.textKey));
      // Focus textarea and move cursor to end after text is set
      setTimeout(() => {
        editorRef.current?.focusTextarea();
      }, 0);
    }
  };

  // ---------------------------------------------------------------------------
  // Step 2: Voice Preview Audio
  // ---------------------------------------------------------------------------
  const handleVoicePreview = (voiceId: string) => {
    const voice = PLAYGROUND_VOICES.find((v) => v.id === voiceId);
    if (!voice) return;

    if (playingVoicePreview === voiceId) {
      voicePreviewRef.current?.pause();
      setPlayingVoicePreview(null);
      return;
    }

    stopAllOtherAudio("preview");

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

  const handleVoiceSelectAndPlay = (voiceId: string) => {
    setSelectedVoice(voiceId);
    setActiveVoicePanel("stock");
    handleVoicePreview(voiceId);
  };

  const playHistoryVoice = (voiceId: number) => {
    if (playingHistoryVoiceId === voiceId) {
      voicePreviewRef.current?.pause();
      setPlayingHistoryVoiceId(null);
      return;
    }

    stopAllOtherAudio("preview");

    const audio = new Audio(`/api/v1/playground/audio/voice-prompt/${voiceId}`);
    voicePreviewRef.current = audio;
    audio.onended = () => setPlayingHistoryVoiceId(null);
    audio.play().catch(() => setPlayingHistoryVoiceId(null));
    setPlayingHistoryVoiceId(voiceId);
  };

  const deleteHistoryVoice = (voiceId: number) => {
    // Stop playback if this voice is currently playing
    if (playingHistoryVoiceId === voiceId) {
      voicePreviewRef.current?.pause();
      setPlayingHistoryVoiceId(null);
    }

    // If this was the selected voice, clear the selection (but stay in custom panel)
    if (anonymousVoiceId === voiceId) {
      setAnonymousVoiceId(null);
      setUploadStatus("idle");
      // DO NOT switch panels - stay in "Record Voice" tab
    }

    // Remove from state and localStorage
    setHistoryVoices((prev) => {
      const next = prev.filter((v) => v.anonymous_voice_id !== voiceId);
      localStorage.setItem("playground_voice_ids", JSON.stringify(next));
      return next;
    });
  };

  const deleteHistoryJob = (jobId: string | number) => {
    // Stop playback if this job is currently playing
    if (playingHistoryJobId === jobId) {
      audioRef.current?.pause();
      setIsPlaying(false);
      setPlayingHistoryJobId(null);

      // Restore current job audio if available
      if (currentJob?.audio_path) {
        setAudioUrl(resolveAudioUrl(currentJob.audio_path));
      }
    }

    // Remove from state and localStorage
    setHistoryJobs((prev) => {
      const next = prev.filter((j) => j.playground_job_id !== jobId);
      localStorage.setItem("playground_tts_jobs", JSON.stringify(next));
      return next;
    });
  };

  // ---------------------------------------------------------------------------
  // Step 2: Microphone recording
  // ---------------------------------------------------------------------------
  const startRecording = async () => {
    try {
      // Stop ALL audio sources including StickyPlayerBar
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
      if (recAudioRef.current) recAudioRef.current.pause();
      setIsRecPlaying(false);
      if (voicePreviewRef.current) voicePreviewRef.current.pause();
      setPlayingVoicePreview(null);
      setPlayingHistoryVoiceId(null);
      setActiveStickyPlayer(null);

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

        const blobUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return blobUrl;
        });

        setSelectedVoice(null);
        setActiveVoicePanel("custom");

        stream.getTracks().forEach((track) => track.stop());

        // Send recording with accurate duration from ref
        await uploadRecordingToBackend(audioBlob, recordingTimeRef.current);

        setTimeout(() => {
          if (recAudioRef.current) {
            stopAllOtherAudio("rec");
            setActiveStickyPlayer("rec");
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
      recordingTimeRef.current = 0;

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          recordingTimeRef.current = newTime; // Keep ref in sync
          // Auto-stop at 10 seconds
          if (newTime >= 10 && mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) {
              clearInterval(recordingIntervalRef.current);
              recordingIntervalRef.current = null;
            }
          }
          return newTime;
        });
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

  const uploadRecordingToBackend = async (blob: Blob, durationSeconds: number) => {
    setUploadStatus("uploading");
    setUploadError(null);
    setAnonymousVoiceId(null);

    try {
      const formData = new FormData();
      formData.append("file", blob, "recording.webm");
      formData.append("language", locale);
      formData.append("duration", durationSeconds.toString());

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

      const newVoice: HistoryVoice = {
        anonymous_voice_id: data.anonymous_voice_id,
        audio_duration: data.audio_duration,
        expires_at: data.expires_at,
        created_at: new Date().toISOString(),
      };
      setHistoryVoices((prev) => {
        const next = [newVoice, ...prev]
          .sort((a, b) => b.anonymous_voice_id - a.anonymous_voice_id)
          .slice(0, 50);
        localStorage.setItem("playground_voice_ids", JSON.stringify(next));
        return next;
      });
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus("error");
      setUploadError(t("playground.voiceSection.uploadError"));
    }
  };

  // ---------------------------------------------------------------------------
  // Step 3: Synthesis Generation & Polling
  // ---------------------------------------------------------------------------
  const handleGenerate = async () => {
    const text = textInput.trim();

    if (!text) {
      setEmptyTextWarning(true);
      return;
    }
    setEmptyTextWarning(false);

    // Enforce character limit
    if (text.length > MAX_TTS_TEXT_LENGTH) {
      setErrorMessage(
        t("playground.textTooLong") || `Text exceeds ${MAX_TTS_TEXT_LENGTH} character limit`
      );
      return;
    }

    if (!canGenerate) {
      return;
    }

    const isStock = activeVoicePanel === "stock";
    const voice = isStock ? PLAYGROUND_VOICES.find((v) => v.id === selectedVoice) : null;
    if (isStock && !voice) return;
    const language = isStock && voice ? voice.language : locale;

    const rateMap = { slow: 0.3, normal: 0.5, fast: 0.8 };
    const rate = rateMap[speed];

    resetGenerationState();

    try {
      const requestBody = isStock
        ? { text, voice_id: voice!.backendVoiceId, language, rate }
        : { text, anonymous_voice_id: anonymousVoiceId, language, rate };

      const res = await fetch("/api/v1/playground/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (res.status === 429) {
        const body = await res.json();
        handleRateLimitError(body?.detail?.retry_after ?? 3600);
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const detail =
          typeof body?.detail === "string" ? body.detail : t("playground.generateError");
        handleGenerationError(detail);
        return;
      }

      const job: TTSJobResponse = await res.json();
      handleJobResponse(job, text);
    } catch (err) {
      console.error("Generate error:", err);
      handleGenerationError(t("playground.generateError"));
    }
  };

  function resetGenerationState() {
    setIsGenerating(true);
    setGenerationStatus(null);
    setCurrentJob(null);
    setAudioUrl(null);
    setAudioDuration(null);
    setErrorMessage(null);
    setRateLimitRetryAfter(null);
    setPollRetryJobId(null);
    pollFailureCountRef.current = 0;
    setIsPlaying(false);
    setAudioProgress(0);
    setLastQueueMetrics(null);
    setShowCompletionCard(false);

    stopPolling();
  }

  function handleRateLimitError(retryAfter: number) {
    setPollRetryJobId(null);
    pollFailureCountRef.current = 0;
    setRateLimitRetryAfter(retryAfter);
    setGenerationStatus("rate_limited");
    setIsGenerating(false);
  }

  function handleGenerationError(message: string) {
    setPollRetryJobId(null);
    pollFailureCountRef.current = 0;
    setErrorMessage(message);
    setGenerationStatus("failed");
    setIsGenerating(false);
  }

  function stopPolling() {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }

  /** After N consecutive poll failures, stop the interval and offer retry (keeps pending job). */
  function handleConsecutivePollFailure(jobId: string | number) {
    pollFailureCountRef.current += 1;
    if (pollFailureCountRef.current < MAX_CONSECUTIVE_POLL_FAILURES) return;

    stopPolling();
    setPollRetryJobId(jobId);
    setErrorMessage(t("playground.connectionErrorMessage"));
    setGenerationStatus("failed");
    setIsGenerating(false);
  }

  function retryPollConnection() {
    if (pollRetryJobId == null) return;
    const jobId = pollRetryJobId;
    setPollRetryJobId(null);
    setErrorMessage(null);
    setIsGenerating(true);
    setGenerationStatus(
      currentJob?.status === "queued" || currentJob?.status === "processing"
        ? currentJob.status
        : "processing"
    );
    pollJobStatus(jobId);
  }

  function saveCompletedJob(
    jobToSave: TTSJobResponse,
    contextOverride?: {
      textInput?: string;
      activeVoicePanel?: "stock" | "custom";
      anonymousVoiceId?: number | null;
      selectedVoice?: string | null;
    }
  ) {
    // Use context override if provided (e.g., from resumed job), otherwise use current state
    const ctx = contextOverride || {
      textInput,
      activeVoicePanel,
      anonymousVoiceId,
      selectedVoice,
    };

    const isStock = ctx.activeVoicePanel === "stock";
    const stockVoice = isStock ? PLAYGROUND_VOICES.find((v) => v.id === ctx.selectedVoice) : null;

    const vName =
      isStock && stockVoice
        ? t(stockVoice.nameKey)
        : ctx.anonymousVoiceId
          ? t("playground.voicePromptLabel").replace("{id}", String(ctx.anonymousVoiceId))
          : t("playground.voiceSection.customVoice");

    const textToUse = ctx.textInput || textInput;
    const textSnippet = textToUse.slice(0, 50) + (textToUse.length > 50 ? "..." : "");

    const newJob: HistoryTTSJob = {
      playground_job_id: jobToSave.job_id,
      text: textSnippet,
      voice_name: vName,
      audio_path: jobToSave.audio_path,
      created_at: jobToSave.created_at,
      expires_at: jobToSave.expires_at,
    };

    setHistoryJobs((prev) => {
      if (prev.find((p) => p.playground_job_id === newJob.playground_job_id)) return prev;
      const next = [newJob, ...prev].slice(0, 50);
      localStorage.setItem("playground_tts_jobs", JSON.stringify(next));
      return next;
    });
  }

  function handleJobResponse(job: TTSJobResponse, inputText?: string) {
    setCurrentJob(job);
    setGenerationStatus(job.status);

    if (job.status === "completed" && job.audio_path) {
      setAudioUrl(resolveAudioUrl(job.audio_path));
      setAudioDuration(job.audio_duration);
      setIsGenerating(false);
      setActiveStickyPlayer("tts");
      saveCompletedJob(job);

      // Clear pending job status
      localStorage.removeItem("playground_pending_job");
      return;
    }

    // Store job ID + context for resumption after page refresh
    const pendingJobData = {
      job_id: job.job_id,
      text: inputText || textInput,
      anonymous_voice_id: anonymousVoiceId,
      active_panel: activeVoicePanel,
      selected_voice: selectedVoice,
    };
    localStorage.setItem("playground_pending_job", JSON.stringify(pendingJobData));

    pollJobStatus(job.job_id);
  }

  function resolveAudioUrl(audioPath: string, bucket: "storage" | "output" = "output"): string {
    if (audioPath.startsWith("http://") || audioPath.startsWith("https://")) {
      return audioPath;
    }
    return `/api/v1/playground/audio/${audioPath}?bucket=${bucket}`;
  }

  function pollJobStatus(jobId: string | number) {
    stopPolling();
    pollFailureCountRef.current = 0;
    setPollRetryJobId(null);

    fetchJobStatus(jobId);

    pollingIntervalRef.current = setInterval(() => {
      fetchJobStatus(jobId);
    }, 1000);
  }

  async function fetchJobStatus(jobId: string | number) {
    try {
      const res = await fetch(`/api/v1/playground/tts/${jobId}`);
      if (!res.ok) {
        if (res.status === 429) {
          const body = await res.json().catch(() => ({}));
          handleRateLimitError(body?.detail?.retry_after ?? 3600);
          stopPolling();
          return;
        }
        // Job gone — not recoverable by retrying poll
        if (res.status === 404) {
          stopPolling();
          localStorage.removeItem("playground_pending_job");
          handleGenerationError(t("playground.jobNotFoundError"));
          return;
        }
        console.warn(`Polling HTTP ${res.status} for job ${jobId}`);
        handleConsecutivePollFailure(jobId);
        return;
      }

      pollFailureCountRef.current = 0;
      const job: TTSJobResponse = await res.json();
      handleJobUpdate(job);
    } catch (e) {
      console.error("Polling error:", e);
      handleConsecutivePollFailure(jobId);
    }
  }

  function handleJobUpdate(job: TTSJobResponse) {
    setPollRetryJobId(null);
    setCurrentJob(job);
    setGenerationStatus(job.status);

    const pos = job.queue_position != null ? Number(job.queue_position) : null;
    const ahead = job.jobs_ahead != null ? Number(job.jobs_ahead) : null;
    const depth = job.queue_depth != null ? Number(job.queue_depth) : null;
    const wait = job.estimated_wait_seconds != null ? Number(job.estimated_wait_seconds) : null;

    if (
      job.status === "queued" &&
      pos !== null &&
      !isNaN(pos) &&
      ahead !== null &&
      !isNaN(ahead) &&
      depth !== null &&
      !isNaN(depth) &&
      wait !== null &&
      !isNaN(wait)
    ) {
      setLastQueueMetrics({
        position: pos,
        jobsAhead: ahead,
        queueDepth: depth,
        estimatedWaitSeconds: wait,
      });
    }

    if (job.status === "completed") {
      if (job.audio_path) {
        setAudioUrl(resolveAudioUrl(job.audio_path));
        setAudioDuration(job.audio_duration);
        setActiveStickyPlayer("tts");
      }
      setIsGenerating(false);
      setShowCompletionCard(true);

      // Retrieve context from localStorage if job was resumed after refresh
      const pendingJobData = localStorage.getItem("playground_pending_job");
      let contextOverride;
      if (pendingJobData) {
        try {
          const parsed = JSON.parse(pendingJobData);
          if (typeof parsed === "object" && parsed.text) {
            contextOverride = {
              textInput: parsed.text,
              activeVoicePanel: parsed.active_panel,
              anonymousVoiceId: parsed.anonymous_voice_id,
              selectedVoice: parsed.selected_voice,
            };
          }
        } catch (e) {
          console.warn("Failed to parse pending job context:", e);
        }
      }

      saveCompletedJob(job, contextOverride);

      // Clear pending job from localStorage
      localStorage.removeItem("playground_pending_job");

      stopPolling();
    } else if (job.status === "failed") {
      handleGenerationError(job.error_message ?? t("playground.generateError"));

      // Clear pending job from localStorage
      localStorage.removeItem("playground_pending_job");

      stopPolling();
    } else if (job.status === "rate_limited") {
      handleRateLimitError(3600);

      // Clear pending job from localStorage
      localStorage.removeItem("playground_pending_job");

      stopPolling();
    }
  }

  // ---------------------------------------------------------------------------
  // Audio playback controls
  // ---------------------------------------------------------------------------
  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying && !playingHistoryJobId) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      stopAllOtherAudio("tts");
      if (playingHistoryJobId) {
        setPlayingHistoryJobId(null);
        if (currentJob?.audio_path) setAudioUrl(resolveAudioUrl(currentJob.audio_path));
        else setAudioUrl(null);
      }
      setTimeout(() => {
        setActiveStickyPlayer("tts");
        audioRef.current?.play();
        setIsPlaying(true);
      }, 50);
    }
  };

  const playHistoryJob = (jobId: string | number, path: string | null) => {
    if (!path) return;
    if (playingHistoryJobId === jobId && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      setPlayingHistoryJobId(null);
      if (currentJob?.audio_path) setAudioUrl(resolveAudioUrl(currentJob.audio_path));
      else setAudioUrl(null);
    } else {
      stopAllOtherAudio("tts");
      setAudioUrl(resolveAudioUrl(path));
      setPlayingHistoryJobId(jobId);
      setActiveStickyPlayer("tts");
      setIsPlaying(true);
      setTimeout(() => audioRef.current?.play(), 50);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audioRef.current.currentTime = pct * audioRef.current.duration;
  };

  // ---------------------------------------------------------------------------
  // Derived state & summaries
  // ---------------------------------------------------------------------------
  const hasValidStockVoice = activeVoicePanel === "stock" && !!selectedVoice;
  const hasValidCustomVoice =
    activeVoicePanel === "custom" && uploadStatus === "success" && anonymousVoiceId !== null;
  const canGenerate = hasValidStockVoice || hasValidCustomVoice;

  const isStickyPlayerVisible =
    (activeStickyPlayer === "tts" && !!audioUrl) ||
    (activeStickyPlayer === "rec" && !!recordedAudioUrl);

  // Step 1 Summary

  // Step 2 Summary
  const selectedStockVoiceObj = PLAYGROUND_VOICES.find((v) => v.id === selectedVoice);

  return (
    <div
      className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 transition-all duration-300 ${
        isStickyPlayerVisible ? "pb-32 sm:pb-40" : "pb-16"
      }`}
    >
      {/* Persistent HTML Audio Elements (prevents playback interruption on step collapse/expand) */}
      {recordedAudioUrl && <audio ref={recAudioRef} src={recordedAudioUrl} className="hidden" />}
      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}

      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full glass-panel text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-4 shadow-sm">
          <SpeakerIcon className="w-3.5 h-3.5" />
          <span>{t("playground.badge")}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
          {t("playground.title")}
        </h1>
      </div>

      {/* New Canvas Layout */}
      <div className="space-y-6 sm:space-y-8">
        {/* Editor */}
        <PlaygroundEditorPanel
          ref={editorRef}
          textInput={textInput}
          onTextChange={setTextInput}
          onSampleSelect={handleSampleTextSelect}
        />

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row items-center gap-4 max-w-lg mx-auto sm:max-w-none">
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="w-full sm:w-1/2 flex items-center justify-between px-5 py-3.5 sm:py-4 glass-panel border-2 border-gray-200 dark:border-zinc-700 rounded-xl sm:rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <SpeakerIcon className="w-4 h-4" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-[160px]">
                  {selectedStockVoiceObj
                    ? t(selectedStockVoiceObj.nameKey)
                    : anonymousVoiceId
                      ? t("playground.voicePromptLabel").replace("{id}", String(anonymousVoiceId))
                      : t("playground.chooseVoice")}
                </span>
                <span className="text-xs text-gray-500 dark:text-zinc-400">
                  {speed === "slow"
                    ? t("playground.speedSection.slow")
                    : speed === "normal"
                      ? t("playground.speedSection.normal")
                      : t("playground.speedSection.fast")}
                </span>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-gray-400 dark:text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || uploadStatus === "uploading" || !canGenerate}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-5 py-3.5 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {isGenerating || uploadStatus === "uploading" ? (
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
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
            ) : (
              <SparklesIcon className="w-5 h-5" />
            )}
            {isGenerating
              ? t("playground.preview.synthesizing")
              : uploadStatus === "uploading"
                ? t("playground.voiceSection.uploading")
                : t("playground.preview.generate")}
          </button>
        </div>

        {/* Inline Alerts & Queue Stats */}
        <div className="max-w-2xl mx-auto space-y-4">
          <AlertBanner
            emptyTextWarning={emptyTextWarning}
            onDismissEmptyTextWarning={() => setEmptyTextWarning(false)}
            generationStatus={generationStatus}
            rateLimitRetryAfter={rateLimitRetryAfter}
            errorMessage={errorMessage}
            isGenerating={isGenerating}
            onRetryConnection={pollRetryJobId != null ? retryPollConnection : null}
          />
          <QueueStatusCard
            lastQueueMetrics={lastQueueMetrics}
            isGenerating={isGenerating && generationStatus === "queued"}
            isCompleted={showCompletionCard}
            onDismiss={() => setShowCompletionCard(false)}
            historyJobs={historyJobs}
            playingHistoryJobId={playingHistoryJobId}
            isPlaying={isPlaying}
            onPlayHistoryJob={playHistoryJob}
            onDeleteHistoryJob={deleteHistoryJob}
          />
        </div>
      </div>

      {/* Voice Selection Modal */}
      <VoiceSelectionModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        activeVoicePanel={activeVoicePanel}
        selectedVoice={selectedVoice}
        playingVoicePreview={playingVoicePreview}
        isRecording={isRecording}
        recordingTime={recordingTime}
        recordedAudioBlob={recordedAudioBlob}
        uploadStatus={uploadStatus}
        uploadError={uploadError}
        anonymousVoiceId={anonymousVoiceId}
        historyVoices={historyVoices}
        showHistoryVoices={showHistoryVoices}
        playingHistoryVoiceId={playingHistoryVoiceId}
        isRecPlaying={isRecPlaying}
        recAudioRef={recAudioRef}
        recordedDuration={recordingTime}
        onSetActiveVoicePanel={setActiveVoicePanel}
        onVoiceSelectAndPlay={handleVoiceSelectAndPlay}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onResetRecording={() => {
          if (recAudioRef.current) recAudioRef.current.pause();
          setIsRecPlaying(false);
          setRecordedAudioBlob(null);
          setRecordedAudioUrl(null);
          setRecordingTime(0);
          recordingTimeRef.current = 0;
          setSelectedVoice("voice1");
          setUploadStatus("idle");
          setAnonymousVoiceId(null);
          setUploadError(null);
        }}
        onToggleShowHistoryVoices={() => setShowHistoryVoices((v) => !v)}
        onSelectHistoryVoice={(voice) => {
          setActiveVoicePanel("custom");
          setAnonymousVoiceId(voice.anonymous_voice_id);
          setRecordedAudioBlob(null);
          if (recordedAudioUrl) {
            URL.revokeObjectURL(recordedAudioUrl);
            setRecordedAudioUrl(null);
          }
          setUploadStatus("success");
        }}
        onPlayHistoryVoice={playHistoryVoice}
        onToggleRecordingPlayback={toggleRecPlayback}
        onDeleteHistoryVoice={deleteHistoryVoice}
        onClearSampleVoice={() => {
          // Clear sample voice selection
          setSelectedVoice(null);

          // Clear custom voice selection
          setAnonymousVoiceId(null);
          setRecordedAudioBlob(null);
          if (recordedAudioUrl) {
            URL.revokeObjectURL(recordedAudioUrl);
            setRecordedAudioUrl(null);
          }
          setUploadStatus("idle");
          setUploadError(null);

          // Stop any playing audio
          if (voicePreviewRef.current) {
            voicePreviewRef.current.pause();
            setPlayingVoicePreview(null);
          }
          if (recAudioRef.current) {
            recAudioRef.current.pause();
            setIsRecPlaying(false);
          }
          setPlayingHistoryVoiceId(null);
        }}
        speed={speed}
        onSetSpeed={setSpeed}
      />

      {/* Sticky Bottom Player Bar */}
      <StickyPlayerBar
        isVisible={isStickyPlayerVisible}
        title={
          activeStickyPlayer === "tts"
            ? t("playground.synthesizedSpeech")
            : t("playground.yourRecording")
        }
        subtitle={
          activeStickyPlayer === "tts"
            ? (() => {
                const isStock = activeVoicePanel === "stock";
                const stockVoice = isStock
                  ? PLAYGROUND_VOICES.find((v) => v.id === selectedVoice)
                  : null;
                return isStock && stockVoice
                  ? t(stockVoice.nameKey)
                  : anonymousVoiceId
                    ? t("playground.voicePromptLabel").replace("{id}", String(anonymousVoiceId))
                    : t("playground.voiceSection.customVoice");
              })()
            : anonymousVoiceId
              ? t("playground.voicePromptLabel").replace("{id}", String(anonymousVoiceId))
              : t("playground.unsavedRecording")
        }
        isPlaying={activeStickyPlayer === "tts" ? isPlaying : isRecPlaying}
        progress={activeStickyPlayer === "tts" ? audioProgress : recAudioProgress}
        currentTime={activeStickyPlayer === "tts" ? audioCurrentTime : recAudioCurrentTime}
        duration={activeStickyPlayer === "tts" ? audioDuration : recAudioDuration}
        onTogglePlayback={activeStickyPlayer === "tts" ? togglePlayback : toggleRecPlayback}
        onSeek={activeStickyPlayer === "tts" ? handleSeek : handleRecSeek}
        onClose={() => {
          // Pause the currently playing audio
          if (activeStickyPlayer === "tts") {
            if (audioRef.current) audioRef.current.pause();
            setIsPlaying(false);
          } else if (activeStickyPlayer === "rec") {
            if (recAudioRef.current) recAudioRef.current.pause();
            setIsRecPlaying(false);
          }
          // Hide the sticky player
          setActiveStickyPlayer(null);
        }}
      />
    </div>
  );
}
