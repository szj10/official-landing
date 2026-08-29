"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import {
  type BackendCommunityVoice,
  type PlaygroundVoice,
  mapCommunityVoiceToPlaygroundVoice,
} from "./voices.config";

import { PlaygroundHeaderControls } from "./components/PlaygroundHeaderControls";
import {
  PlaygroundEditorPanel,
  type PlaygroundEditorPanelRef,
} from "./components/PlaygroundEditorPanel";
import { VoiceSelectionModal } from "./components/VoiceSelectionModal";
import { StickyPlayerBar } from "./components/StickyPlayerBar";
import { QueueStatusCard } from "./components/QueueStatusCard";
import { AlertBanner } from "./components/AlertBanner";
import { SpeakerIcon, SparklesIcon } from "./components/icons";
import { SAMPLE_TEXTS } from "./components/types";
import {
  disposePreviewAudio,
  historyVoicePromptUrl,
  replaceMediaUrl,
  resolvePlaygroundAudioUrl,
  revokeIfBlobUrl,
} from "./lib/audio";
import { usePlaygroundHistory } from "./hooks/usePlaygroundHistory";
import { usePlaygroundAudio } from "./hooks/usePlaygroundAudio";
import { useVoiceState } from "./hooks/useVoiceState";
import { useVoiceRecording } from "./hooks/useVoiceRecording";
import { useTtsGeneration } from "./hooks/useTtsGeneration";

export default function PlaygroundContent() {
  const { t, locale } = useI18n();

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [speed, setSpeed] = useState<"slow" | "normal" | "fast">("normal");
  const [stockVoices, setStockVoices] = useState<PlaygroundVoice[]>([]);
  const [stockVoicesLoading, setStockVoicesLoading] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const queueRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<PlaygroundEditorPanelRef>(null);
  const currentJobAudioPathRef = useRef<string | null | undefined>(null);

  const {
    selectedVoice,
    setSelectedVoice,
    activeVoicePanel,
    setActiveVoicePanel,
    anonymousVoiceId,
    setAnonymousVoiceId,
    uploadStatus,
    setUploadStatus,
    uploadError,
    setUploadError,
    uploadCanRetry,
    setUploadCanRetry,
    resetVoiceState,
  } = useVoiceState();

  const {
    historyVoices,
    historyJobs,
    hydrated: historyHydrated,
    removeHistoryVoice,
    removeHistoryJob,
    prependHistoryVoice,
    prependHistoryJob,
  } = usePlaygroundHistory();

  const {
    audioRef,
    recAudioRef,
    voicePreviewRef,
    pendingRecAutoplayRef,
    activeStickyPlayer,
    setActiveStickyPlayer,
    isStickyPlayerVisible,
    closeStickyPlayer,
    playingVoicePreview,
    setPlayingVoicePreview,
    handleVoicePreview,
    recordedAudioUrl,
    setRecordedAudioUrl,
    isRecPlaying,
    setIsRecPlaying,
    recAudioProgress,
    recAudioCurrentTime,
    recAudioDuration,
    toggleRecPlayback,
    handleRecSeek,
    playHistoryVoice,
    audioUrl,
    setAudioUrl,
    audioDuration,
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
    silenceAllAudio,
    playGeneratedAudio,
  } = usePlaygroundAudio({ currentJobAudioPathRef, stockVoices });

  const {
    isRecording,
    recordedAudioBlob,
    recordingTime,
    setRecordedAudioBlob,
    startRecording,
    stopRecording,
    retryUpload,
    resetRecordingState,
  } = useVoiceRecording({
    locale,
    t,
    prependHistoryVoice,
    silenceAllAudio,
    setRecordedAudioUrl,
    pendingRecAutoplayRef,
    setSelectedVoice,
    setActiveVoicePanel,
    setUploadStatus,
    setAnonymousVoiceId,
    setUploadError,
    setUploadCanRetry,
    uploadCanRetry,
  });

  const hasValidStockVoice = activeVoicePanel === "stock" && !!selectedVoice;
  const hasValidCustomVoice =
    activeVoicePanel === "custom" && uploadStatus === "success" && anonymousVoiceId !== null;
  const canGenerate = hasValidStockVoice || hasValidCustomVoice;

  const {
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
  } = useTtsGeneration({
    t,
    locale,
    stockVoices,
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
    onJobComplete: (job) => {
      if (job.audio_path) {
        playGeneratedAudio(job.audio_path, job.audio_duration);
      }
      setIsHistoryOpen(true);
    },
    onJobStart: () => {
      audioRef.current?.pause();
      setIsPlaying(false);
      setAudioProgress(0);
    },
  });

  // Fetch top community voices when locale changes
  useEffect(() => {
    let ignore = false;
    async function loadVoices() {
      setStockVoicesLoading(true);
      try {
        const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || "";
        const url = `${apiBase}/api/v1/voices/community?language=${encodeURIComponent(locale)}&limit=10`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: BackendCommunityVoice[] = await res.json();
        if (ignore) return;
        const mapped = data.map((v, i) => mapCommunityVoiceToPlaygroundVoice(v, i));
        setStockVoices(mapped);
        // Auto-select the first voice if none selected yet
        setSelectedVoice((prev) => {
          const firstId = mapped[0]?.id ?? null;
          if (!prev || !mapped.find((v) => v.id === prev)) return firstId;
          return prev;
        });
        if (mapped.length > 0) {
          setActiveVoicePanel("stock");
        }
      } catch (err) {
        console.warn("Failed to fetch community voices:", err);
      } finally {
        if (!ignore) {
          setStockVoicesLoading(false);
        }
      }
    }

    loadVoices();
    return () => {
      ignore = true;
    };
  }, [locale, setSelectedVoice, setActiveVoicePanel]);

  useEffect(() => {
    currentJobAudioPathRef.current = currentJob?.audio_path;
  }, [currentJob?.audio_path]);

  // Space toggles sticky play/pause when the bar is visible and focus is not in an editable field.
  useEffect(() => {
    if (!isStickyPlayerVisible) return;

    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      if (target.isContentEditable) return true;
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== " " && e.code !== "Space") return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.isComposing) return;
      if (isEditableTarget(e.target)) return;

      e.preventDefault();
      if (activeStickyPlayer === "tts") {
        togglePlayback();
      } else if (activeStickyPlayer === "rec") {
        toggleRecPlayback();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isStickyPlayerVisible, activeStickyPlayer, togglePlayback, toggleRecPlayback]);

  const handleGenerateWithScroll = () => {
    handleGenerate();
  };

  const handleSampleTextSelect = (id: string) => {
    const sample = SAMPLE_TEXTS.find((s) => s.id === id);
    if (sample) {
      setTextInput(t(sample.textKey));
      setTimeout(() => {
        editorRef.current?.focusTextarea();
      }, 50);
    }
  };

  const handleVoiceSelectAndPlay = (voiceId: string) => {
    setSelectedVoice(voiceId);
    setActiveVoicePanel("stock");
    handleVoicePreview(voiceId);
  };

  const deleteHistoryVoice = (voiceId: number) => {
    if (playingHistoryVoiceId === voiceId) {
      if (recAudioRef.current) recAudioRef.current.pause();
      setIsRecPlaying(false);
      setPlayingHistoryVoiceId(null);
      if (activeStickyPlayer === "rec") setActiveStickyPlayer(null);
      disposePreviewAudio(voicePreviewRef);
    }

    if (anonymousVoiceId === voiceId) {
      setAnonymousVoiceId(null);
      setUploadStatus("idle");
    }

    removeHistoryVoice(voiceId);
  };

  const deleteHistoryJob = (jobId: string | number) => {
    if (playingHistoryJobId === jobId) {
      audioRef.current?.pause();
      setIsPlaying(false);
      setPlayingHistoryJobId(null);

      if (currentJob?.audio_path) {
        setAudioUrl(resolvePlaygroundAudioUrl(currentJob.audio_path));
      } else {
        setAudioUrl(null);
        if (activeStickyPlayer === "tts") {
          setActiveStickyPlayer(null);
        }
      }
    }

    removeHistoryJob(jobId);
  };

  const deriveStickySubtitle = () => {
    if (activeStickyPlayer === "tts") {
      if (playingHistoryJobId != null) {
        const hj = historyJobs.find((j) => j.playground_job_id === playingHistoryJobId);
        if (hj) return hj.voice_name;
      }
      const isStock = activeVoicePanel === "stock";
      const stockVoice = isStock ? stockVoices.find((v) => v.id === selectedVoice) : null;
      return isStock && stockVoice
        ? stockVoice.nameKey
          ? t(stockVoice.nameKey)
          : stockVoice.name
        : anonymousVoiceId
          ? t("playground.voicePromptLabel").replace("{id}", String(anonymousVoiceId))
          : t("playground.voiceSection.customVoice");
    } else {
      if (playingHistoryVoiceId != null) {
        return t("playground.voicePromptLabel").replace("{id}", String(playingHistoryVoiceId));
      }
      return anonymousVoiceId
        ? t("playground.voicePromptLabel").replace("{id}", String(anonymousVoiceId))
        : t("playground.unsavedRecording");
    }
  };

  return (
    <div
      className={`max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 transition-all duration-300 ${
        isStickyPlayerVisible ? "pb-32 sm:pb-40" : "pb-16"
      }`}
    >
      {recordedAudioUrl && <audio ref={recAudioRef} src={recordedAudioUrl} className="hidden" />}
      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}

      {/* Hero Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-3 shadow-xs backdrop-blur-md">
          <SpeakerIcon className="w-3.5 h-3.5 animate-pulse" />
          <span>{t("playground.badge")}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping ml-1" />
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {t("playground.title")}
        </h1>
      </div>

      {/* Clean Main Workbench Card */}
      <div className="max-w-xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200/90 dark:border-zinc-800 rounded-3xl sm:rounded-[32px] p-5 sm:p-7 shadow-xl shadow-gray-200/60 dark:shadow-none space-y-4 sm:space-y-5 transition-all">
          {/* Top Bar: Language Pill + Voice Pill */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800/80">
            <PlaygroundHeaderControls
              stockVoices={stockVoices}
              stockVoicesLoading={stockVoicesLoading}
              selectedVoice={selectedVoice}
              activeVoicePanel={activeVoicePanel}
              anonymousVoiceId={anonymousVoiceId}
              playingVoicePreview={playingVoicePreview}
              playingHistoryVoiceId={playingHistoryVoiceId}
              isRecPlaying={isRecPlaying}
              onSelectVoice={(id) => {
                setSelectedVoice(id);
                setActiveVoicePanel("stock");
              }}
              onPreviewVoice={handleVoicePreview}
              onPlayHistoryVoice={playHistoryVoice}
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            />

            {/* Speed Pill */}
            <div className="inline-flex p-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700/80 text-[11px] font-semibold">
              {(["slow", "normal", "fast"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-0.5 rounded-full transition-all ${
                    speed === s
                      ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                      : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {s === "slow" ? "0.8x" : s === "normal" ? "1.0x" : "1.2x"}
                </button>
              ))}
            </div>
          </div>

          {/* Text Editor with Tags > button & character counter */}
          <PlaygroundEditorPanel
            ref={editorRef}
            textInput={textInput}
            onTextChange={setTextInput}
            onSampleSelect={handleSampleTextSelect}
            onGenerate={handleGenerateWithScroll}
          />

          {/* Action CTA: Generate & Play */}
          <div className="pt-2">
            <button
              onClick={handleGenerateWithScroll}
              disabled={isGenerating || uploadStatus === "uploading" || !canGenerate}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 sm:py-4 px-6 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm sm:text-base rounded-2xl sm:rounded-full transition-all shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white"
            >
              {isGenerating || uploadStatus === "uploading" ? (
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
              ) : (
                <SparklesIcon className="w-4 h-4" />
              )}
              <span>
                {isGenerating
                  ? t("playground.preview.synthesizing")
                  : uploadStatus === "uploading"
                    ? t("playground.voiceSection.uploading")
                    : "Generate & play"}
              </span>
            </button>
          </div>

          <AlertBanner
            emptyTextWarning={emptyTextWarning}
            onDismissEmptyTextWarning={() => setEmptyTextWarning(false)}
            generationStatus={generationStatus}
            rateLimitRetryAfter={rateLimitRetryAfter}
            errorMessage={errorMessage}
            isGenerating={isGenerating}
            onRetryConnection={pollRetryJobId != null ? retryPollConnection : null}
          />
        </div>

        {/* Secondary Accordion / Section: Generation History & Queue */}
        <div className="mt-6" ref={queueRef}>
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200/90 dark:border-zinc-800/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <span>Generation History & Queue</span>
                {historyJobs.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    {historyJobs.length}
                  </span>
                )}
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isHistoryOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {isHistoryOpen && (
              <div className="pt-2 animate-in fade-in duration-200">
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
            )}
          </div>
        </div>
      </div>

      <VoiceSelectionModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        stockVoices={stockVoices}
        activeVoicePanel={activeVoicePanel}
        selectedVoice={selectedVoice}
        playingVoicePreview={playingVoicePreview}
        isRecording={isRecording}
        recordingTime={recordingTime}
        recordedAudioBlob={recordedAudioBlob}
        uploadStatus={uploadStatus}
        uploadError={uploadError}
        onRetryUpload={uploadCanRetry && recordedAudioBlob ? retryUpload : undefined}
        anonymousVoiceId={anonymousVoiceId}
        historyVoices={historyVoices}
        playingHistoryVoiceId={playingHistoryVoiceId}
        isRecPlaying={isRecPlaying}
        recAudioRef={recAudioRef}
        recordedDuration={recordingTime}
        onVoiceSelectAndPlay={handleVoiceSelectAndPlay}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onResetRecording={() => {
          if (recAudioRef.current) recAudioRef.current.pause();
          setIsRecPlaying(false);
          setPlayingHistoryVoiceId(null);
          resetRecordingState();
          setSelectedVoice(stockVoices[0]?.id ?? null);
        }}
        onSelectHistoryVoice={(voice) => {
          setActiveVoicePanel("custom");
          setAnonymousVoiceId(voice.anonymous_voice_id);
          setRecordedAudioBlob(null);
          const historyUrl = historyVoicePromptUrl(voice.anonymous_voice_id);
          setRecordedAudioUrl((prev) => {
            if (prev === historyUrl) return prev;
            return replaceMediaUrl(prev, historyUrl);
          });
          setUploadStatus("success");
          setUploadError(null);
          setUploadCanRetry(false);
        }}
        onPlayHistoryVoice={playHistoryVoice}
        onToggleRecordingPlayback={toggleRecPlayback}
        onDeleteHistoryVoice={deleteHistoryVoice}
        onClearSampleVoice={() => {
          resetVoiceState();
          setRecordedAudioBlob(null);
          setRecordedAudioUrl((prev) => {
            revokeIfBlobUrl(prev);
            return null;
          });
          disposePreviewAudio(voicePreviewRef);
          setPlayingVoicePreview(null);
          if (recAudioRef.current) {
            recAudioRef.current.pause();
            setIsRecPlaying(false);
          }
          setPlayingHistoryVoiceId(null);
        }}
        speed={speed}
        onSetSpeed={setSpeed}
      />

      <StickyPlayerBar
        isVisible={isStickyPlayerVisible}
        title={
          activeStickyPlayer === "tts"
            ? t("playground.synthesizedSpeech")
            : t("playground.yourRecording")
        }
        subtitle={deriveStickySubtitle()}
        isPlaying={activeStickyPlayer === "tts" ? isPlaying : isRecPlaying}
        progress={activeStickyPlayer === "tts" ? audioProgress : recAudioProgress}
        currentTime={activeStickyPlayer === "tts" ? audioCurrentTime : recAudioCurrentTime}
        duration={activeStickyPlayer === "tts" ? audioDuration : recAudioDuration}
        onTogglePlayback={activeStickyPlayer === "tts" ? togglePlayback : toggleRecPlayback}
        onSeek={activeStickyPlayer === "tts" ? handleSeek : handleRecSeek}
        onClose={closeStickyPlayer}
      />
    </div>
  );
}
