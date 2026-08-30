"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { InlinePlayerBar } from "./components/InlinePlayerBar";
import { QueueStatusCard } from "./components/QueueStatusCard";
import { HistoryJobs } from "./components/HistoryJobs";
import { AlertBanner } from "./components/AlertBanner";
import { SpeakerIcon, SparklesIcon } from "./components/icons";
import { SAMPLE_TEXTS, type HistoryVoice } from "./components/types";
import { historyVoicePromptUrl } from "./lib/audio";
import { usePlaygroundHistory } from "./hooks/usePlaygroundHistory";
import { usePlaygroundAudio } from "./hooks/usePlaygroundAudio";
import { usePlaygroundVoice } from "./hooks/usePlaygroundVoice";
import { useTtsGeneration } from "./hooks/useTtsGeneration";

export default function PlaygroundContent() {
  const { t, locale } = useI18n();

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [speed, setSpeed] = useState<"slow" | "normal" | "fast">("normal");
  const [stockVoices, setStockVoices] = useState<PlaygroundVoice[]>([]);
  const [stockVoicesLoading, setStockVoicesLoading] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  const queueRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<PlaygroundEditorPanelRef>(null);
  const currentJobAudioPathRef = useRef<string | null | undefined>(null);

  const history = usePlaygroundHistory();

  const {
    audioRef,
    recAudioRef,
    recordedAudioUrl,
    audioUrl,
    playingVoicePreview,
    playingHistoryVoiceId,
    isRecPlaying,
    handleVoicePreview,
    playHistoryVoice,
    isStickyPlayerVisible,
    activeStickyPlayer,
    isPlaying,
    audioProgress,
    recAudioProgress,
    audioCurrentTime,
    recAudioCurrentTime,
    audioDuration,
    recAudioDuration,
    togglePlayback,
    toggleRecPlayback,
    handleSeek,
    handleRecSeek,
    closeStickyPlayer,
    playingHistoryJobId,
    playHistoryJob,
    setRecordedBlob,
    setRecordedUrl,
    silenceAllAudio,
    onTtsStart,
    playGeneratedAudio,
    clearRecordedAudio,
    clearVoicePreview,
    handleHistoryVoiceDeleted,
    handleHistoryJobDeleted,
  } = usePlaygroundAudio({ currentJobAudioPathRef, stockVoices });

  const voice = usePlaygroundVoice({
    locale,
    t,
    onPrependHistoryVoice: history.prependHistoryVoice,
    onRecordingStart: silenceAllAudio,
    onRecordingReady: (blob) => setRecordedBlob(blob, { autoplay: true }),
  });

  const { setSelectedVoice } = voice;

  const tts = useTtsGeneration({
    t,
    locale,
    stockVoices,
    textInput,
    speed,
    activeVoicePanel: voice.activeVoicePanel,
    selectedVoice: voice.selectedVoice,
    anonymousVoiceId: voice.anonymousVoiceId,
    canGenerate: voice.canGenerate,
    historyHydrated: history.hydrated,
    stockVoicesReady: !stockVoicesLoading,
    prependHistoryJob: history.prependHistoryJob,
    onJobComplete: (job) => {
      if (job.audio_path) {
        playGeneratedAudio(job.audio_path, job.audio_duration);
      }
      setIsHistoryOpen(true);
      requestAnimationFrame(() => {
        queueRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    },
    onJobStart: onTtsStart,
    onResumePending: (pending) => {
      setTextInput(pending.text);
      voice.restorePendingVoiceState(pending);
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

        // Auto-select first voice if none selected or current is invalid (preserve custom panel)
        if (mapped.length > 0) {
          setSelectedVoice((prev) => {
            const firstId = mapped[0]?.id ?? null;
            if (!prev || !mapped.find((v) => v.id === prev)) return firstId;
            return prev;
          });
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
  }, [locale, setSelectedVoice]);

  useEffect(() => {
    currentJobAudioPathRef.current = tts.currentJob?.audio_path;
  }, [tts.currentJob?.audio_path]);

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
    voice.selectStockVoice(voiceId);
    handleVoicePreview(voiceId);
  };

  const handleSelectHistoryVoice = (item: HistoryVoice) => {
    clearVoicePreview();
    voice.selectHistoryVoice(item);
    setRecordedUrl(historyVoicePromptUrl(item.anonymous_voice_id));
  };

  const deleteHistoryVoice = (voiceId: number) => {
    handleHistoryVoiceDeleted(voiceId);
    voice.handleHistoryVoiceDeleted(voiceId);
    history.removeHistoryVoice(voiceId);
  };

  const deleteHistoryJob = (jobId: string | number) => {
    handleHistoryJobDeleted(jobId, tts.currentJob?.audio_path);
    history.removeHistoryJob(jobId);
  };

  const stickySubtitle = useMemo(() => {
    if (activeStickyPlayer === "tts") {
      if (playingHistoryJobId != null) {
        const hj = history.historyJobs.find((j) => j.playground_job_id === playingHistoryJobId);
        if (hj) return hj.voice_name;
      }
      const isStock = voice.activeVoicePanel === "stock";
      const stockVoice = isStock ? stockVoices.find((v) => v.id === voice.selectedVoice) : null;
      return isStock && stockVoice
        ? stockVoice.nameKey
          ? t(stockVoice.nameKey)
          : stockVoice.name
        : voice.anonymousVoiceId
          ? t("playground.voicePromptLabel").replace("{id}", String(voice.anonymousVoiceId))
          : t("playground.voiceSection.customVoice");
    }

    if (playingHistoryVoiceId != null) {
      return t("playground.voicePromptLabel").replace("{id}", String(playingHistoryVoiceId));
    }
    return voice.anonymousVoiceId
      ? t("playground.voicePromptLabel").replace("{id}", String(voice.anonymousVoiceId))
      : t("playground.unsavedRecording");
  }, [
    activeStickyPlayer,
    playingHistoryJobId,
    playingHistoryVoiceId,
    history.historyJobs,
    voice.activeVoicePanel,
    voice.selectedVoice,
    voice.anonymousVoiceId,
    stockVoices,
    t,
  ]);

  const hasActiveOutput =
    isStickyPlayerVisible ||
    tts.isGenerating ||
    tts.showCompletionCard ||
    Boolean(tts.generationStatus) ||
    Boolean(tts.errorMessage || tts.emptyTextWarning || tts.rateLimitRetryAfter);

  const hasOutput = hasActiveOutput || history.historyJobs.length > 0;

  return (
    <div
      className={`mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-16 transition-all duration-300 ${
        hasOutput ? "max-w-6xl lg:px-8" : "max-w-xl"
      }`}
    >
      {recordedAudioUrl && <audio ref={recAudioRef} src={recordedAudioUrl} className="hidden" />}
      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}

      {/* Hero Header */}
      <div className="text-center mb-6 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-3 shadow-xs backdrop-blur-md">
          <SpeakerIcon className="w-3.5 h-3.5 animate-pulse" />
          <span>{t("playground.badge")}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping ml-1" />
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {t("playground.title")}
        </h1>
      </div>

      {/* Responsive Workbench: Centered when no active audio output, 2-column grid when output is active */}
      <div
        className={
          hasActiveOutput
            ? "grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start animate-in fade-in duration-300"
            : "max-w-xl mx-auto space-y-6"
        }
      >
        {/* LEFT / MAIN COLUMN: Input & Voice Controls */}
        <div className={hasActiveOutput ? "lg:col-span-7 flex flex-col gap-4 sm:gap-6" : "w-full"}>
          <div className="bg-white dark:bg-zinc-900 border border-gray-200/90 dark:border-zinc-800 rounded-3xl sm:rounded-[32px] p-5 sm:p-7 shadow-xl shadow-gray-200/60 dark:shadow-none space-y-4 sm:space-y-5 transition-all">
            {/* Top Bar: Language Pill + Voice Pill */}
            <div className="flex items-center pb-3 border-b border-gray-100 dark:border-zinc-800/80">
              <PlaygroundHeaderControls
                stockVoices={stockVoices}
                stockVoicesLoading={stockVoicesLoading}
                selectedVoice={voice.selectedVoice}
                activeVoicePanel={voice.activeVoicePanel}
                anonymousVoiceId={voice.anonymousVoiceId}
                historyVoices={history.historyVoices}
                playingVoicePreview={playingVoicePreview}
                playingHistoryVoiceId={playingHistoryVoiceId}
                isRecPlaying={isRecPlaying}
                onSelectVoice={handleVoiceSelectAndPlay}
                onSelectHistoryVoice={handleSelectHistoryVoice}
                onPreviewVoice={handleVoicePreview}
                onPlayHistoryVoice={playHistoryVoice}
                onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              />
            </div>

            {/* Text Editor with speed control & character counter */}
            <PlaygroundEditorPanel
              ref={editorRef}
              textInput={textInput}
              onTextChange={setTextInput}
              onSampleSelect={handleSampleTextSelect}
              onGenerate={tts.handleGenerate}
              speed={speed}
              onSpeedChange={setSpeed}
            />

            {/* Action CTA: Generate & Play */}
            <div className="pt-2">
              <button
                onClick={tts.handleGenerate}
                disabled={
                  tts.isGenerating || voice.uploadStatus === "uploading" || !voice.canGenerate
                }
                className="w-full flex items-center justify-center gap-2.5 py-3.5 sm:py-4 px-6 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm sm:text-base rounded-2xl transition-all shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white"
              >
                {tts.isGenerating || voice.uploadStatus === "uploading" ? (
                  <svg
                    className="animate-spin w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
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
                  <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
                <span>
                  {tts.isGenerating
                    ? t("playground.preview.synthesizing")
                    : voice.uploadStatus === "uploading"
                      ? t("playground.voiceSection.uploading")
                      : t("playground.preview.generate")}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT / SECONDARY COLUMN: Output, Player & History */}
        {hasActiveOutput ? (
          <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-6 lg:sticky lg:top-24 animate-in fade-in duration-300">
            {/* Active Audio Player, Queue & Alert Status Card */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200/90 dark:border-zinc-800 rounded-3xl sm:rounded-[32px] p-5 sm:p-6 shadow-xl shadow-gray-200/60 dark:shadow-none space-y-4 transition-all">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                {t("playground.outputPanelTitle") || "Audio Output"}
              </h2>

              {/* Inline Audio Player */}
              <InlinePlayerBar
                isVisible={isStickyPlayerVisible}
                title={
                  activeStickyPlayer === "tts"
                    ? t("playground.synthesizedSpeech")
                    : t("playground.yourRecording")
                }
                subtitle={stickySubtitle}
                isPlaying={activeStickyPlayer === "tts" ? isPlaying : isRecPlaying}
                progress={activeStickyPlayer === "tts" ? audioProgress : recAudioProgress}
                currentTime={activeStickyPlayer === "tts" ? audioCurrentTime : recAudioCurrentTime}
                duration={activeStickyPlayer === "tts" ? audioDuration : recAudioDuration}
                onTogglePlayback={activeStickyPlayer === "tts" ? togglePlayback : toggleRecPlayback}
                onSeek={activeStickyPlayer === "tts" ? handleSeek : handleRecSeek}
                onClose={closeStickyPlayer}
              />

              {/* Live Queue & Synthesis Status */}
              <QueueStatusCard
                lastQueueMetrics={tts.lastQueueMetrics}
                generationStatus={tts.generationStatus}
                isGenerating={tts.isGenerating}
                isCompleted={tts.showCompletionCard}
                onDismissCompleted={() => tts.setShowCompletionCard(false)}
              />

              <AlertBanner
                emptyTextWarning={tts.emptyTextWarning}
                onDismissEmptyTextWarning={() => tts.setEmptyTextWarning(false)}
                generationStatus={tts.generationStatus}
                rateLimitRetryAfter={tts.rateLimitRetryAfter}
                errorMessage={tts.errorMessage}
                onRetryConnection={tts.pollRetryJobId != null ? tts.retryPollConnection : null}
              />
            </div>

            {/* Generation History (inside sidebar when 2-column) */}
            {history.historyJobs.length > 0 && (
              <div ref={queueRef}>
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200/90 dark:border-zinc-800/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                      className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <span>{t("playground.historySection.recentTitle")}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        {history.historyJobs.length}
                      </span>
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
                      <HistoryJobs
                        historyJobs={history.historyJobs}
                        playingHistoryJobId={playingHistoryJobId}
                        isPlaying={isPlaying}
                        onPlayHistoryJob={playHistoryJob}
                        onDeleteHistoryJob={deleteHistoryJob}
                        show={isHistoryExpanded}
                        onToggle={() => setIsHistoryExpanded((prev) => !prev)}
                        showHeader={false}
                        highlightFirst={false}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Centered Generation History (when no active output, placed below centered input) */
          history.historyJobs.length > 0 && (
            <div ref={queueRef} className="w-full animate-in fade-in duration-300">
              <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200/90 dark:border-zinc-800/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <span>{t("playground.historySection.recentTitle")}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      {history.historyJobs.length}
                    </span>
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
                    <HistoryJobs
                      historyJobs={history.historyJobs}
                      playingHistoryJobId={playingHistoryJobId}
                      isPlaying={isPlaying}
                      onPlayHistoryJob={playHistoryJob}
                      onDeleteHistoryJob={deleteHistoryJob}
                      show={isHistoryExpanded}
                      onToggle={() => setIsHistoryExpanded((prev) => !prev)}
                      showHeader={false}
                      highlightFirst={false}
                    />
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>

      <VoiceSelectionModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        stockVoices={stockVoices}
        activeVoicePanel={voice.activeVoicePanel}
        selectedVoice={voice.selectedVoice}
        playingVoicePreview={playingVoicePreview}
        isRecording={voice.isRecording}
        recordingTime={voice.recordingTime}
        recordedAudioBlob={voice.recordedAudioBlob}
        uploadStatus={voice.uploadStatus}
        uploadError={voice.uploadError}
        onRetryUpload={
          voice.uploadCanRetry && voice.recordedAudioBlob ? voice.retryUpload : undefined
        }
        anonymousVoiceId={voice.anonymousVoiceId}
        historyVoices={history.historyVoices}
        playingHistoryVoiceId={playingHistoryVoiceId}
        isRecPlaying={isRecPlaying}
        recAudioRef={recAudioRef}
        recordedDuration={voice.recordingTime}
        onVoiceSelectAndPlay={handleVoiceSelectAndPlay}
        onStartRecording={voice.startRecording}
        onStopRecording={voice.stopRecording}
        onResetRecording={() => {
          clearRecordedAudio();
          voice.resetRecording(stockVoices[0]?.id ?? null);
        }}
        onSelectHistoryVoice={handleSelectHistoryVoice}
        onPlayHistoryVoice={playHistoryVoice}
        onToggleRecordingPlayback={toggleRecPlayback}
        onDeleteHistoryVoice={deleteHistoryVoice}
      />
    </div>
  );
}
