"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { PLAYGROUND_VOICES } from "../voices.config";
import type { HistoryTTSJob, TTSJobResponse, TTSJobStatus } from "../components/types";
import { clearPendingJob, readPendingJob, writePendingJob } from "../lib/historyStorage";

const MAX_TTS_TEXT_LENGTH = parseInt(process.env.NEXT_PUBLIC_MAX_TTS_TEXT_LENGTH || "600", 10);
/** Stop polling and surface a retry banner after this many consecutive network/HTTP failures. */
const MAX_CONSECUTIVE_POLL_FAILURES = 5;

export type QueueMetrics = {
  position: number;
  jobsAhead: number;
  queueDepth: number;
  estimatedWaitSeconds: number;
};

type UseTtsGenerationOptions = {
  t: (key: string) => string;
  locale: string;
  textInput: string;
  setTextInput: Dispatch<SetStateAction<string>>;
  activeVoicePanel: "stock" | "custom";
  setActiveVoicePanel: Dispatch<SetStateAction<"stock" | "custom">>;
  selectedVoice: string | null;
  setSelectedVoice: Dispatch<SetStateAction<string | null>>;
  anonymousVoiceId: number | null;
  setAnonymousVoiceId: Dispatch<SetStateAction<number | null>>;
  setUploadStatus: Dispatch<SetStateAction<"idle" | "uploading" | "success" | "error">>;
  speed: "slow" | "normal" | "fast";
  canGenerate: boolean;
  historyHydrated: boolean;
  prependHistoryJob: (job: HistoryTTSJob) => void;
  onJobComplete: (
    job: TTSJobResponse,
    contextOverride?: {
      textInput?: string;
      activeVoicePanel?: "stock" | "custom";
      anonymousVoiceId?: number | null;
      selectedVoice?: string | null;
    }
  ) => void;
  onJobStart: () => void;
};

/**
 * TTS request, job polling, pending-job resume, and completion history writes.
 */
export function useTtsGeneration({
  t,
  locale,
  textInput,
  setTextInput,
  activeVoicePanel,
  setActiveVoicePanel,
  selectedVoice,
  setSelectedVoice,
  anonymousVoiceId,
  setAnonymousVoiceId,
  setUploadStatus,
  speed,
  canGenerate,
  historyHydrated,
  prependHistoryJob,
  onJobComplete,
  onJobStart,
}: UseTtsGenerationOptions) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<TTSJobStatus | null>(null);
  const [currentJob, setCurrentJob] = useState<TTSJobResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rateLimitRetryAfter, setRateLimitRetryAfter] = useState<number | null>(null);
  /** When set, failed status is a recoverable poll/connection issue for this job. */
  const [pollRetryJobId, setPollRetryJobId] = useState<string | number | null>(null);
  const [emptyTextWarning, setEmptyTextWarning] = useState(false);
  const [showCompletionCard, setShowCompletionCard] = useState(false);
  const [lastQueueMetrics, setLastQueueMetrics] = useState<QueueMetrics | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollFailureCountRef = useRef(0);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Resume pending job after refresh — wait for history hydrate to avoid
  // setHistoryJobs overwriting a saveCompletedJob prepend from resume.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!historyHydrated) return;

    const resumePending = async () => {
      const pending = readPendingJob();
      if (!pending) return;

      try {
        const pendingJobId = pending.job_id;
        console.log(`🔄 Resuming pending job ${pendingJobId} after page refresh...`);

        const res = await fetch(`/api/v1/playground/tts/${pendingJobId}`);
        if (!res.ok) {
          clearPendingJob();
          console.log(`❌ Job ${pendingJobId} not found on backend`);
          return;
        }

        const job: TTSJobResponse = await res.json();

        if (pending.text) {
          setTextInput(pending.text);

          if (pending.active_panel) {
            setActiveVoicePanel(pending.active_panel);
          }

          if (pending.active_panel === "stock" && pending.selected_voice) {
            setSelectedVoice(pending.selected_voice);
          } else if (pending.active_panel === "custom" && pending.anonymous_voice_id) {
            setAnonymousVoiceId(pending.anonymous_voice_id);
            setUploadStatus("success");
          }
        }

        if (job.status === "queued" || job.status === "processing") {
          setCurrentJob(job);
          setGenerationStatus(job.status);
          setIsGenerating(true);
          pollJobStatus(pendingJobId);
          console.log(`✅ Resumed polling for job ${pendingJobId} (status: ${job.status})`);
        } else if (job.status === "completed" && job.audio_path) {
          setCurrentJob(job);
          setGenerationStatus(job.status);
          onJobComplete(job, {
            textInput: pending.text,
            activeVoicePanel: pending.active_panel,
            anonymousVoiceId: pending.anonymous_voice_id,
            selectedVoice: pending.selected_voice,
          });
          setShowCompletionCard(true);

          saveCompletedJob(job, {
            textInput: pending.text,
            activeVoicePanel: pending.active_panel,
            anonymousVoiceId: pending.anonymous_voice_id,
            selectedVoice: pending.selected_voice,
          });

          clearPendingJob();
          console.log(`✅ Job ${pendingJobId} completed while away`);
        } else {
          clearPendingJob();
          console.log(`❌ Job ${pendingJobId} failed with status: ${job.status}`);
        }
      } catch (err) {
        console.error(`Failed to resume job:`, err);
        clearPendingJob();
      }
    };

    void resumePending();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once after history hydrate
  }, [historyHydrated]);

  function resetGenerationState() {
    setIsGenerating(true);
    setGenerationStatus(null);
    setCurrentJob(null);
    setErrorMessage(null);
    setRateLimitRetryAfter(null);
    setPollRetryJobId(null);
    pollFailureCountRef.current = 0;
    setLastQueueMetrics(null);
    setShowCompletionCard(false);

    onJobStart();

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

    prependHistoryJob(newJob);
  }

  function handleJobResponse(job: TTSJobResponse, inputText?: string) {
    setCurrentJob(job);
    setGenerationStatus(job.status);

    if (job.status === "completed" && job.audio_path) {
      onJobComplete(job);
      setIsGenerating(false);
      saveCompletedJob(job);

      // Clear pending job status
      clearPendingJob();
      return;
    }

    // Store job ID + context for resumption after page refresh
    writePendingJob({
      job_id: job.job_id,
      text: inputText || textInput,
      anonymous_voice_id: anonymousVoiceId,
      active_panel: activeVoicePanel,
      selected_voice: selectedVoice,
    });

    pollJobStatus(job.job_id);
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
          clearPendingJob();
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
        onJobComplete(job);
      }
      setIsGenerating(false);
      setShowCompletionCard(true);

      // Retrieve context from localStorage if job was resumed after refresh
      const pending = readPendingJob();
      let contextOverride;
      if (pending?.text) {
        contextOverride = {
          textInput: pending.text,
          activeVoicePanel: pending.active_panel,
          anonymousVoiceId: pending.anonymous_voice_id,
          selectedVoice: pending.selected_voice,
        };
      }

      saveCompletedJob(job, contextOverride);

      // Clear pending job from localStorage
      clearPendingJob();

      stopPolling();
    } else if (job.status === "failed") {
      handleGenerationError(job.error_message ?? t("playground.generateError"));

      // Clear pending job from localStorage
      clearPendingJob();

      stopPolling();
    } else if (job.status === "rate_limited") {
      handleRateLimitError(3600);

      // Clear pending job from localStorage
      clearPendingJob();

      stopPolling();
    }
  }

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

  return {
    isGenerating,
    generationStatus,
    currentJob,
    errorMessage,
    rateLimitRetryAfter,
    pollRetryJobId,
    emptyTextWarning,
    setEmptyTextWarning,
    showCompletionCard,
    setShowCompletionCard,
    lastQueueMetrics,
    handleGenerate,
    retryPollConnection,
  };
}
