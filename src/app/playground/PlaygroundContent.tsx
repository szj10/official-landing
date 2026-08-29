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

  const audio = usePlaygroundAudio({ currentJobAudioPathRef, stockVoices });

  const voice = usePlaygroundVoice({
    locale,
    t,
    onPrependHistoryVoice: history.prependHistoryVoice,
    onRecordingStart: audio.silenceAllAudio,
    onRecordingReady: (blob) => audio.setRecordedBlob(blob, { autoplay: true }),
  });

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
    prependHistoryJob: history.prependHistoryJob,
    onJobComplete: (job) => {
      if (job.audio_path) {
        audio.playGeneratedAudio(job.audio_path, job.audio_duration);
      }
      setIsHistoryOpen(true);
    },
    onJobStart: audio.onTtsStart,
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

        // Auto-select first voice if none selected or current is invalid
        if (mapped.length > 0) {
          voice.setSelectedVoice((prev) => {
            const firstId = mapped[0]?.id ?? null;
            if (!prev || !mapped.find((v) => v.id === prev)) return firstId;
            return prev;
          });
          voice.setActiveVoicePanel("stock");
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
  }, [locale]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    currentJobAudioPathRef.current = tts.currentJob?.audio_path;
  }, [tts.currentJob?.audio_path]);

  // Space toggles sticky play/pause when the bar is visible and focus is not in an editable field.
  useEffect(() => {
    if (!audio.isStickyPlayerVisible) return;

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
      if (audio.activeStickyPlayer === "tts") {
        audio.togglePlayback();
      } else if (audio.activeStickyPlayer === "rec") {
        audio.toggleRecPlayback();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    audio.isStickyPlayerVisible,
    audio.activeStickyPlayer,
    audio.togglePlayback,
    audio.toggleRecPlayback,
  ]);

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
    audio.handleVoicePreview(voiceId);
  };

  const handleSelectHistoryVoice = (item: HistoryVoice) => {
    voice.selectHistoryVoice(item);
    audio.setRecordedUrl(historyVoicePromptUrl(item.anonymous_voice_id));
  };

  const deleteHistoryVoice = (voiceId: number) => {
    audio.handleHistoryVoiceDeleted(voiceId);
    voice.handleHistoryVoiceDeleted(voiceId);
    history.removeHistoryVoice(voiceId);
  };

  const deleteHistoryJob = (jobId: string | number) => {
    audio.handleHistoryJobDeleted(jobId, tts.currentJob?.audio_path);
    history.removeHistoryJob(jobId);
  };

  const deriveStickySubtitle = () => {
    if (audio.activeStickyPlayer === "tts") {
      if (audio.playingHistoryJobId != null) {
        const hj = history.historyJobs.find(
          (j) => j.playground_job_id === audio.playingHistoryJobId
        );
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
    } else {
      if (audio.playingHistoryVoiceId != null) {
        return t("playground.voicePromptLabel").replace(
          "{id}",
          String(audio.playingHistoryVoiceId)
        );
      }
      return voice.anonymousVoiceId
        ? t("playground.voicePromptLabel").replace("{id}", String(voice.anonymousVoiceId))
        : t("playground.unsavedRecording");
    }
  };

  return (
    <div
      className={`max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 transition-all duration-300 ${
        audio.isStickyPlayerVisible ? "pb-24 sm:pb-28" : "pb-16"
      }`}
    >
      {audio.recordedAudioUrl && (
        <audio ref={audio.recAudioRef} src={audio.recordedAudioUrl} className="hidden" />
      )}
      {audio.audioUrl && <audio ref={audio.audioRef} src={audio.audioUrl} className="hidden" />}

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
          <div className="flex items-center pb-3 border-b border-gray-100 dark:border-zinc-800/80">
            <PlaygroundHeaderControls
              stockVoices={stockVoices}
              stockVoicesLoading={stockVoicesLoading}
              selectedVoice={voice.selectedVoice}
              activeVoicePanel={voice.activeVoicePanel}
              anonymousVoiceId={voice.anonymousVoiceId}
              historyVoices={history.historyVoices}
              playingVoicePreview={audio.playingVoicePreview}
              playingHistoryVoiceId={audio.playingHistoryVoiceId}
              isRecPlaying={audio.isRecPlaying}
              onSelectVoice={handleVoiceSelectAndPlay}
              onSelectHistoryVoice={handleSelectHistoryVoice}
              onPreviewVoice={audio.handleVoicePreview}
              onPlayHistoryVoice={audio.playHistoryVoice}
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
              className="w-full flex items-center justify-center gap-2.5 py-3.5 sm:py-4 px-6 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm sm:text-base rounded-2xl sm:rounded-full transition-all shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white"
            >
              {tts.isGenerating || voice.uploadStatus === "uploading" ? (
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
                {tts.isGenerating
                  ? t("playground.preview.synthesizing")
                  : voice.uploadStatus === "uploading"
                    ? t("playground.voiceSection.uploading")
                    : "Generate & play"}
              </span>
            </button>
          </div>

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

        {/* Secondary Accordion: Generation History */}
        {history.historyJobs.length > 0 && (
          <div className="mt-6" ref={queueRef}>
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
                    playingHistoryJobId={audio.playingHistoryJobId}
                    isPlaying={audio.isPlaying}
                    onPlayHistoryJob={audio.playHistoryJob}
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

      <VoiceSelectionModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        stockVoices={stockVoices}
        activeVoicePanel={voice.activeVoicePanel}
        selectedVoice={voice.selectedVoice}
        playingVoicePreview={audio.playingVoicePreview}
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
        playingHistoryVoiceId={audio.playingHistoryVoiceId}
        isRecPlaying={audio.isRecPlaying}
        recAudioRef={audio.recAudioRef}
        recordedDuration={voice.recordingTime}
        onVoiceSelectAndPlay={handleVoiceSelectAndPlay}
        onStartRecording={voice.startRecording}
        onStopRecording={voice.stopRecording}
        onResetRecording={() => {
          audio.stopRecordingPlayback();
          voice.resetRecording(stockVoices[0]?.id ?? null);
        }}
        onSelectHistoryVoice={handleSelectHistoryVoice}
        onPlayHistoryVoice={audio.playHistoryVoice}
        onToggleRecordingPlayback={audio.toggleRecPlayback}
        onDeleteHistoryVoice={deleteHistoryVoice}
      />

      <StickyPlayerBar
        isVisible={audio.isStickyPlayerVisible}
        title={
          audio.activeStickyPlayer === "tts"
            ? t("playground.synthesizedSpeech")
            : t("playground.yourRecording")
        }
        subtitle={deriveStickySubtitle()}
        isPlaying={audio.activeStickyPlayer === "tts" ? audio.isPlaying : audio.isRecPlaying}
        progress={audio.activeStickyPlayer === "tts" ? audio.audioProgress : audio.recAudioProgress}
        currentTime={
          audio.activeStickyPlayer === "tts" ? audio.audioCurrentTime : audio.recAudioCurrentTime
        }
        duration={audio.activeStickyPlayer === "tts" ? audio.audioDuration : audio.recAudioDuration}
        onTogglePlayback={
          audio.activeStickyPlayer === "tts" ? audio.togglePlayback : audio.toggleRecPlayback
        }
        onSeek={audio.activeStickyPlayer === "tts" ? audio.handleSeek : audio.handleRecSeek}
        onClose={audio.closeStickyPlayer}
      />
    </div>
  );
}
