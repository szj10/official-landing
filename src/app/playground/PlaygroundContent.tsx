"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import { PLAYGROUND_VOICES } from "./voices.config";

import { PlaygroundEditorPanel } from "./components/PlaygroundEditorPanel";
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

  const queueRef = useRef<HTMLDivElement>(null);
  const editorIslandRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<{ focusTextarea: () => void }>(null);
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
  } = usePlaygroundAudio({ currentJobAudioPathRef });

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
    },
    onJobStart: () => {
      audioRef.current?.pause();
      setIsPlaying(false);
      setAudioProgress(0);
    },
  });

  useEffect(() => {
    currentJobAudioPathRef.current = currentJob?.audio_path;
  }, [currentJob?.audio_path]);

  const handleGenerateWithScroll = () => {
    handleGenerate();
    setTimeout(() => {
      queueRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 150);
  };

  const handleSampleTextSelect = (id: string) => {
    const sample = SAMPLE_TEXTS.find((s) => s.id === id);
    if (sample) {
      setTextInput(t(sample.textKey));
      setTimeout(() => {
        editorRef.current?.focusTextarea();
        editorIslandRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      }
    }

    removeHistoryJob(jobId);
  };

  const selectedStockVoiceObj = PLAYGROUND_VOICES.find((v) => v.id === selectedVoice);

  const deriveStickySubtitle = () => {
    if (activeStickyPlayer === "tts") {
      if (playingHistoryJobId != null) {
        const hj = historyJobs.find((j) => j.playground_job_id === playingHistoryJobId);
        if (hj) return hj.voice_name;
      }
      const isStock = activeVoicePanel === "stock";
      const stockVoice = isStock ? PLAYGROUND_VOICES.find((v) => v.id === selectedVoice) : null;
      return isStock && stockVoice
        ? t(stockVoice.nameKey)
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
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-all duration-300 ${
        isStickyPlayerVisible ? "pb-32 sm:pb-40" : "pb-16"
      }`}
    >
      {recordedAudioUrl && <audio ref={recAudioRef} src={recordedAudioUrl} className="hidden" />}
      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}

      {/* Hero Header */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm backdrop-blur-md">
          <SpeakerIcon className="w-3.5 h-3.5 animate-pulse" />
          <span>{t("playground.badge")}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping ml-1" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
          {t("playground.title")}
        </h1>
      </div>

      {/* Grid Workbench: 4 Distinct Islands */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column (8 cols): Editor Island + Controls Island */}
        <div className="lg:col-span-8 space-y-6">
          {/* Island 01: Prompt Text Input */}
          <section
            ref={editorIslandRef}
            className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200/90 dark:border-zinc-800/90 rounded-3xl p-5 sm:p-7 shadow-xl shadow-indigo-500/5 space-y-4 transition-all hover:border-indigo-500/30 dark:hover:border-indigo-500/30"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-black">
                  01
                </span>
                <h2 className="text-sm font-bold tracking-wider uppercase text-gray-700 dark:text-zinc-200">
                  Prompt Text Input
                </h2>
              </div>
              <span className="text-xs font-medium text-gray-400 dark:text-zinc-500">
                Max 600 Characters
              </span>
            </div>

            <PlaygroundEditorPanel
              ref={editorRef}
              textInput={textInput}
              onTextChange={setTextInput}
              onSampleSelect={handleSampleTextSelect}
              onGenerate={handleGenerateWithScroll}
            />
          </section>

          {/* Island 02: Synthesis & Parameter Controls */}
          <section className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200/90 dark:border-zinc-800/90 rounded-3xl p-5 sm:p-7 shadow-xl shadow-indigo-500/5 space-y-6 transition-all hover:border-indigo-500/30 dark:hover:border-indigo-500/30">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400 text-xs font-black">
                  02
                </span>
                <h2 className="text-sm font-bold tracking-wider uppercase text-gray-700 dark:text-zinc-200">
                  Voice & Speed Synthesis Parameters
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Quick Voice Chips */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  {t("playground.chooseVoice")}
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {PLAYGROUND_VOICES.map((v) => {
                    const isSelected = activeVoicePanel === "stock" && selectedVoice === v.id;
                    const isPreviewing = playingVoicePreview === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => {
                          setSelectedVoice(v.id);
                          setActiveVoicePanel("stock");
                        }}
                        className={`inline-flex items-center gap-1.5 pl-1.5 pr-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                            : "bg-gray-50 dark:bg-zinc-800/60 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700/80 hover:border-indigo-400 dark:hover:border-indigo-500"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full bg-gradient-to-tr ${v.color} flex items-center justify-center text-[10px] font-black text-white`}
                        >
                          {v.avatar}
                        </span>
                        <span className="truncate max-w-[90px]">{t(v.nameKey)}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVoiceSelectAndPlay(v.id);
                          }}
                          className={`p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors ${
                            isPreviewing ? "text-amber-300 animate-pulse" : "opacity-75"
                          }`}
                          title="Preview Voice"
                        >
                          {isPreviewing ? (
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <rect x="6" y="4" width="4" height="16" rx="1" />
                              <rect x="14" y="4" width="4" height="16" rx="1" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setIsVoiceModalOpen(true)}
                    className="px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                  >
                    + Clone / All Voices
                  </button>
                </div>
              </div>

              {/* Mobile-only: Active Persona Summary (Island 03 is hidden on mobile) */}
              <div className="block lg:hidden">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200/60 dark:border-zinc-700/60">
                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${
                      activeVoicePanel === "stock" && selectedStockVoiceObj
                        ? selectedStockVoiceObj.color
                        : "from-purple-600 to-indigo-600"
                    } flex items-center justify-center text-sm font-black text-white shadow-sm shrink-0`}
                  >
                    {activeVoicePanel === "stock" && selectedStockVoiceObj
                      ? selectedStockVoiceObj.avatar
                      : "V"}
                  </div>

                  {/* Name + badge */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {activeVoicePanel === "stock" && selectedStockVoiceObj
                          ? t(selectedStockVoiceObj.nameKey)
                          : anonymousVoiceId
                            ? t("playground.voicePromptLabel").replace(
                                "{id}",
                                String(anonymousVoiceId)
                              )
                            : t("playground.chooseVoice")}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                          activeVoicePanel === "stock"
                            ? "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300"
                            : "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        {activeVoicePanel === "stock" ? "Stock" : "Cloned"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-zinc-500 truncate">
                      {activeVoicePanel === "stock" && selectedStockVoiceObj
                        ? t(selectedStockVoiceObj.previewKey)
                        : t("playground.voiceSection.customVoice")}
                    </p>
                  </div>

                  {/* Preview button */}
                  {activeVoicePanel === "stock" && selectedStockVoiceObj ? (
                    <button
                      type="button"
                      onClick={() => handleVoicePreview(selectedStockVoiceObj.id)}
                      className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 text-indigo-600 dark:text-indigo-400 transition-colors shrink-0"
                      title="Listen to Preview"
                    >
                      {playingVoicePreview === selectedStockVoiceObj.id ? (
                        <svg
                          className="w-4 h-4 fill-current text-amber-500 animate-pulse"
                          viewBox="0 0 24 24"
                        >
                          <rect x="6" y="4" width="4" height="16" rx="1" />
                          <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                  ) : activeVoicePanel === "custom" && anonymousVoiceId !== null ? (
                    <button
                      type="button"
                      onClick={() => playHistoryVoice(anonymousVoiceId)}
                      className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 text-emerald-600 dark:text-emerald-400 transition-colors shrink-0"
                      title="Listen to Recorded Voice Preview"
                    >
                      {playingHistoryVoiceId === anonymousVoiceId && isRecPlaying ? (
                        <svg
                          className="w-4 h-4 fill-current text-amber-500 animate-pulse"
                          viewBox="0 0 24 24"
                        >
                          <rect x="6" y="4" width="4" height="16" rx="1" />
                          <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                  ) : null}

                  {/* Change voice button */}
                  <button
                    type="button"
                    onClick={() => setIsVoiceModalOpen(true)}
                    className="px-2.5 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors shrink-0"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Speed Segmented Pill */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  Playback Speed
                </label>
                <div className="inline-flex p-1 rounded-xl bg-gray-100 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/80 w-full sm:w-auto">
                  {(["slow", "normal", "fast"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSpeed(s)}
                      className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        speed === s
                          ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                          : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {s === "slow"
                        ? t("playground.speedSection.slow")
                        : s === "normal"
                          ? t("playground.speedSection.normal")
                          : t("playground.speedSection.fast")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hero Synthesize Action CTA */}
            <div className="pt-2">
              <button
                onClick={handleGenerateWithScroll}
                disabled={isGenerating || uploadStatus === "uploading" || !canGenerate}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-base sm:text-lg rounded-2xl transition-all shadow-lg shadow-indigo-500/25 dark:shadow-indigo-500/15 hover:shadow-indigo-500/40 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
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
                  <SparklesIcon className="w-5 h-5 animate-pulse" />
                )}
                <span>
                  {isGenerating
                    ? t("playground.preview.synthesizing")
                    : uploadStatus === "uploading"
                      ? t("playground.voiceSection.uploading")
                      : t("playground.preview.generate")}
                </span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-mono bg-white/20 text-white rounded border border-white/30 ml-2">
                  ⌘↵
                </kbd>
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
          </section>
        </div>

        {/* Right Column (4 cols): Persona Island + History/Queue Island */}
        <div className="lg:col-span-4 space-y-6">
          {/* Island 03: Selected Voice Persona */}
          <section className="hidden lg:block bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200/90 dark:border-zinc-800/90 rounded-3xl p-5 sm:p-6 shadow-xl shadow-purple-500/5 space-y-5 transition-all hover:border-purple-500/30 dark:hover:border-purple-500/30">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-pink-100 dark:bg-pink-900/60 text-pink-600 dark:text-pink-400 text-xs font-black">
                  03
                </span>
                <h2 className="text-sm font-bold tracking-wider uppercase text-gray-700 dark:text-zinc-200">
                  Active Persona
                </h2>
              </div>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  activeVoicePanel === "stock"
                    ? "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300"
                    : "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {activeVoicePanel === "stock" ? "Stock Voice" : "Cloned Voice"}
              </span>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200/60 dark:border-zinc-700/60">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${
                  activeVoicePanel === "stock" && selectedStockVoiceObj
                    ? selectedStockVoiceObj.color
                    : "from-purple-600 to-indigo-600"
                } flex items-center justify-center text-lg font-black text-white shadow-sm shrink-0`}
              >
                {activeVoicePanel === "stock" && selectedStockVoiceObj
                  ? selectedStockVoiceObj.avatar
                  : "V"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                  {activeVoicePanel === "stock" && selectedStockVoiceObj
                    ? t(selectedStockVoiceObj.nameKey)
                    : anonymousVoiceId
                      ? t("playground.voicePromptLabel").replace("{id}", String(anonymousVoiceId))
                      : t("playground.chooseVoice")}
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                  {activeVoicePanel === "stock" && selectedStockVoiceObj
                    ? t(selectedStockVoiceObj.previewKey)
                    : t("playground.voiceSection.customVoice")}
                </p>
              </div>

              {activeVoicePanel === "stock" && selectedStockVoiceObj ? (
                <button
                  type="button"
                  onClick={() => handleVoicePreview(selectedStockVoiceObj.id)}
                  className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 text-indigo-600 dark:text-indigo-400 transition-colors shrink-0"
                  title="Listen to Preview"
                >
                  {playingVoicePreview === selectedStockVoiceObj.id ? (
                    <svg
                      className="w-5 h-5 fill-current text-amber-500 animate-pulse"
                      viewBox="0 0 24 24"
                    >
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              ) : activeVoicePanel === "custom" && anonymousVoiceId !== null ? (
                <button
                  type="button"
                  onClick={() => playHistoryVoice(anonymousVoiceId)}
                  className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 text-emerald-600 dark:text-emerald-400 transition-colors shrink-0"
                  title="Listen to Recorded Voice Preview"
                >
                  {playingHistoryVoiceId === anonymousVoiceId && isRecPlaying ? (
                    <svg
                      className="w-5 h-5 fill-current text-amber-500 animate-pulse"
                      viewBox="0 0 24 24"
                    >
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              ) : null}
            </div>

            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="w-full py-3 px-4 rounded-2xl border border-gray-200 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-500 text-xs font-bold text-gray-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <SpeakerIcon className="w-4 h-4" />
              <span>{t("playground.chooseVoice")} / Clone Voice</span>
            </button>
          </section>

          {/* Island 04: Generation History & Queue */}
          <section
            ref={queueRef}
            className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200/90 dark:border-zinc-800/90 rounded-3xl p-5 sm:p-6 shadow-xl shadow-purple-500/5 space-y-4 transition-all hover:border-purple-500/30 dark:hover:border-purple-500/30"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                  04
                </span>
                <h2 className="text-sm font-bold tracking-wider uppercase text-gray-700 dark:text-zinc-200">
                  Generation History
                </h2>
              </div>
            </div>

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
          </section>
        </div>
      </div>

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
          setSelectedVoice("voice1");
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
