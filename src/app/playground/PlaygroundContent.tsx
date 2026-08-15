"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/i18n";
import { PLAYGROUND_VOICES } from "./voices.config";

// Sub-components
import { StepHeader } from "./components/StepHeader";
import { TextInputStep } from "./components/TextInputStep";
import { VoiceStep } from "./components/VoiceStep";
import { SynthesizeStep } from "./components/SynthesizeStep";
import { BottomActionBar } from "./components/BottomActionBar";
import { SpeakerIcon } from "./components/icons";

// Types and constants
import {
  WizardStep,
  TTSJobStatus,
  TTSJobResponse,
  HistoryVoice,
  HistoryTTSJob,
  SAMPLE_TEXTS,
  formatTime,
  formatRetryAfter,
} from "./components/types";

export default function PlaygroundContent() {
  const { t, locale } = useI18n();

  // --- Active Wizard Step (accordion: only one section open at a time, but no locks) ---
  const [activeStep, setActiveStep] = useState<WizardStep>("text");

  // --- Step 1: Text state ---
  const [textInput, setTextInput] = useState("");
  const [selectedSampleText, setSelectedSampleText] = useState<string | null>(null);

  // --- Step 2: Voice state ---
  const [selectedVoice, setSelectedVoice] = useState<string | null>("voice1");
  const [playingVoicePreview, setPlayingVoicePreview] = useState<string | null>(null);
  const [activeVoicePanel, setActiveVoicePanel] = useState<"stock" | "custom">("stock");

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
  const [isCachedResult, setIsCachedResult] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rateLimitRetryAfter, setRateLimitRetryAfter] = useState<number | null>(null);
  const [emptyTextWarning, setEmptyTextWarning] = useState(false);

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
  const [showHistoryJobs, setShowHistoryJobs] = useState(false);
  const [showHistoryVoices, setShowHistoryVoices] = useState(false);
  const [playingHistoryVoiceId, setPlayingHistoryVoiceId] = useState<number | null>(null);
  const [playingHistoryJobId, setPlayingHistoryJobId] = useState<number | string | null>(null);

  // --- Persistent Refs ---
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const voicePreviewRef = useRef<HTMLAudioElement | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ---------------------------------------------------------------------------
  // Load History from localStorage / backend
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
              setHistoryVoices(data);
              localStorage.setItem("playground_voice_ids", JSON.stringify(data));
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
      if (eventSourceRef.current) eventSourceRef.current.close();
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
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

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
  // Step 1: Sample text selection
  // ---------------------------------------------------------------------------
  const handleSampleTextSelect = (id: string) => {
    const sample = SAMPLE_TEXTS.find((s) => s.id === id);
    if (sample) {
      setTextInput(t(sample.textKey));
      setSelectedSampleText(id);
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

  // ---------------------------------------------------------------------------
  // Step 2: Microphone recording
  // ---------------------------------------------------------------------------
  const startRecording = async () => {
    try {
      stopAllOtherAudio("preview");
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

        await uploadRecordingToBackend(audioBlob);

        setTimeout(() => {
          if (recAudioRef.current) {
            stopAllOtherAudio("rec");
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

      const newVoice: HistoryVoice = {
        anonymous_voice_id: data.anonymous_voice_id,
        audio_duration: data.audio_duration,
        expires_at: data.expires_at,
      };
      setHistoryVoices((prev) => {
        const next = [newVoice, ...prev].slice(0, 50);
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
      setActiveStep("text");
      return;
    }
    setEmptyTextWarning(false);

    if (!canGenerate) {
      setActiveStep("voice");
      return;
    }

    setActiveStep("synthesize");

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
      handleJobResponse(job);
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
    setIsCachedResult(false);
    setErrorMessage(null);
    setRateLimitRetryAfter(null);
    setIsPlaying(false);
    setAudioProgress(0);
    setLastQueueMetrics(null);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }

  function handleRateLimitError(retryAfter: number) {
    setRateLimitRetryAfter(retryAfter);
    setGenerationStatus("rate_limited");
    setIsGenerating(false);
  }

  function handleGenerationError(message: string) {
    setErrorMessage(message);
    setGenerationStatus("failed");
    setIsGenerating(false);
  }

  function saveCompletedJob(jobToSave: TTSJobResponse) {
    const isStock = activeVoicePanel === "stock";
    const stockVoice = isStock ? PLAYGROUND_VOICES.find((v) => v.id === selectedVoice) : null;

    const vName =
      isStock && stockVoice
        ? t(stockVoice.nameKey)
        : anonymousVoiceId
          ? `Voice Prompt #${anonymousVoiceId}`
          : t("playground.voiceSection.customVoice");

    const textSnippet = currentText.slice(0, 50) + (currentText.length > 50 ? "..." : "");

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

  function handleJobResponse(job: TTSJobResponse) {
    setCurrentJob(job);
    setGenerationStatus(job.status);

    if (job.status === "completed" && job.audio_path) {
      setAudioUrl(resolveAudioUrl(job.audio_path));
      setAudioDuration(job.audio_duration);
      setIsCachedResult(job.is_cached);
      setIsGenerating(false);
      saveCompletedJob(job);
      return;
    }

    pollJobStatus(job.job_id);
  }

  function resolveAudioUrl(audioPath: string, bucket: "storage" | "output" = "output"): string {
    if (audioPath.startsWith("http://") || audioPath.startsWith("https://")) {
      return audioPath;
    }
    return `/api/v1/playground/audio/${audioPath}?bucket=${bucket}`;
  }

  function pollJobStatus(jobId: string | number) {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

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
          const body = await res.json();
          handleRateLimitError(body?.detail?.retry_after ?? 3600);
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          return;
        }
        return;
      }

      const job: TTSJobResponse = await res.json();
      handleJobUpdate(job);
    } catch (e) {
      console.error("Polling error:", e);
    }
  }

  function handleJobUpdate(job: TTSJobResponse) {
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
        setIsCachedResult(job.is_cached);
      }
      setIsGenerating(false);
      saveCompletedJob(job);
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    } else if (job.status === "failed") {
      handleGenerationError(job.error_message ?? t("playground.generateError"));
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    } else if (job.status === "rate_limited") {
      handleRateLimitError(3600);
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
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

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `huavoi-tts-${Date.now()}.wav`;
    a.click();
  };

  // ---------------------------------------------------------------------------
  // Derived state & summaries
  // ---------------------------------------------------------------------------
  const currentText =
    textInput ||
    (selectedSampleText
      ? t(SAMPLE_TEXTS.find((s) => s.id === selectedSampleText)?.textKey ?? "")
      : "");

  const hasValidStockVoice = activeVoicePanel === "stock" && !!selectedVoice;
  const hasValidCustomVoice =
    activeVoicePanel === "custom" && uploadStatus === "success" && anonymousVoiceId !== null;
  const canGenerate = hasValidStockVoice || hasValidCustomVoice;

  // Step 1 Summary
  const textWordsCount = textInput.trim().split(/\s+/).filter(Boolean).length;
  const step1Summary = textInput.trim()
    ? `📝 ${textWordsCount} words · "${textInput.slice(0, 24)}${textInput.length > 24 ? "..." : ""}"`
    : selectedSampleText
      ? `📝 Sample: ${selectedSampleText}`
      : "No text entered";

  // Step 2 Summary
  const selectedStockVoiceObj = PLAYGROUND_VOICES.find((v) => v.id === selectedVoice);
  const step2Summary =
    activeVoicePanel === "stock" && selectedStockVoiceObj
      ? `🎙 ${t(selectedStockVoiceObj.nameKey)} (${selectedStockVoiceObj.gender === "male" ? t("common.male") : t("common.female")})`
      : anonymousVoiceId
        ? `🎙 Custom Voice #${anonymousVoiceId}`
        : "No voice selected";

  // Step 3 Summary
  const step3Summary = audioUrl
    ? `✅ Synthesized (${audioDuration ? formatTime(Math.floor(audioDuration)) : "Ready"})`
    : isGenerating
      ? "⏳ In Progress..."
      : canGenerate
        ? "✨ Ready to Synthesize"
        : "Browse or Synthesize";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 pb-32 sm:pb-32">
      {/* Persistent HTML Audio Elements (prevents playback interruption on step collapse/expand) */}
      {recordedAudioUrl && <audio ref={recAudioRef} src={recordedAudioUrl} className="hidden" />}
      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}

      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
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

      {/* Accordion / Step-by-Step Sections */}
      <div className="space-y-4 sm:space-y-5">
        {/* Step 1: Input Text */}
        <StepHeader
          stepNumber={1}
          title={t("playground.textSection.title")}
          badgeColorClass="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"
          isExpanded={activeStep === "text"}
          isCompleted={!!textInput.trim()}
          summary={step1Summary}
          onClick={() => setActiveStep(activeStep === "text" ? "voice" : "text")}
        >
          <TextInputStep
            textInput={textInput}
            selectedSampleText={selectedSampleText}
            onTextChange={(val) => {
              setTextInput(val);
              setSelectedSampleText(null);
            }}
            onSampleSelect={handleSampleTextSelect}
            onAdvanceToNext={() => setActiveStep("voice")}
          />
        </StepHeader>

        {/* Step 2: Voice Selection / Recording */}
        <StepHeader
          stepNumber={2}
          title={t("playground.voiceSection.sampleVoices")}
          badgeColorClass="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
          isExpanded={activeStep === "voice"}
          isCompleted={canGenerate}
          summary={step2Summary}
          onClick={() => setActiveStep(activeStep === "voice" ? "synthesize" : "voice")}
        >
          <VoiceStep
            activeVoicePanel={activeVoicePanel}
            selectedVoice={selectedVoice}
            playingVoicePreview={playingVoicePreview}
            isRecording={isRecording}
            recordingTime={recordingTime}
            recordedAudioBlob={recordedAudioBlob}
            recordedAudioUrl={recordedAudioUrl}
            isRecPlaying={isRecPlaying}
            recAudioProgress={recAudioProgress}
            recAudioCurrentTime={recAudioCurrentTime}
            recAudioDuration={recAudioDuration}
            uploadStatus={uploadStatus}
            uploadError={uploadError}
            anonymousVoiceId={anonymousVoiceId}
            historyVoices={historyVoices}
            showHistoryVoices={showHistoryVoices}
            playingHistoryVoiceId={playingHistoryVoiceId}
            canGenerate={canGenerate}
            recAudioRef={recAudioRef}
            onSetActiveVoicePanel={setActiveVoicePanel}
            onVoiceSelectAndPlay={handleVoiceSelectAndPlay}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onToggleRecPlayback={toggleRecPlayback}
            onRecSeek={handleRecSeek}
            onResetRecording={() => {
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
            onAdvanceToNext={() => setActiveStep("synthesize")}
          />
        </StepHeader>

        {/* Step 3: Synthesize TTS */}
        <StepHeader
          stepNumber={3}
          title="Synthesize Speech"
          badgeColorClass="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
          isExpanded={activeStep === "synthesize"}
          isCompleted={!!audioUrl}
          summary={step3Summary}
          onClick={() => setActiveStep(activeStep === "synthesize" ? "text" : "synthesize")}
        >
          <SynthesizeStep
            isGenerating={isGenerating}
            generationStatus={generationStatus}
            audioUrl={audioUrl}
            audioDuration={audioDuration}
            isPlaying={isPlaying}
            audioProgress={audioProgress}
            audioCurrentTime={audioCurrentTime}
            isCachedResult={isCachedResult}
            errorMessage={errorMessage}
            rateLimitRetryAfter={rateLimitRetryAfter}
            emptyTextWarning={emptyTextWarning}
            lastQueueMetrics={lastQueueMetrics}
            historyJobs={historyJobs}
            showHistoryJobs={showHistoryJobs}
            playingHistoryJobId={playingHistoryJobId}
            audioRef={audioRef}
            canGenerate={canGenerate}
            onGenerate={handleGenerate}
            onTogglePlayback={togglePlayback}
            onSeek={handleSeek}
            onDownload={handleDownload}
            onCloseAudio={() => {
              setAudioUrl(null);
              setGenerationStatus(null);
              if (audioRef.current) audioRef.current.pause();
              setIsPlaying(false);
            }}
            onDismissEmptyTextWarning={() => setEmptyTextWarning(false)}
            onToggleShowHistoryJobs={() => setShowHistoryJobs((v) => !v)}
            onPlayHistoryJob={playHistoryJob}
          />
        </StepHeader>
      </div>

      {/* Sticky Bottom Action Bar */}
      <BottomActionBar
        speed={speed}
        isGenerating={isGenerating}
        uploadStatus={uploadStatus}
        canGenerate={canGenerate}
        onSetSpeed={setSpeed}
        onGenerate={handleGenerate}
      />
    </div>
  );
}
