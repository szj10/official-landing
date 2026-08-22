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

  const editorRef = useRef<{ focusTextarea: () => void }>(null);
  const currentJobAudioPathRef = useRef<string | null | undefined>(null);

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

  const handleSampleTextSelect = (id: string) => {
    const sample = SAMPLE_TEXTS.find((s) => s.id === id);
    if (sample) {
      setTextInput(t(sample.textKey));
      setTimeout(() => {
        editorRef.current?.focusTextarea();
      }, 0);
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
      className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 transition-all duration-300 ${
        isStickyPlayerVisible ? "pb-32 sm:pb-40" : "pb-16"
      }`}
    >
      {recordedAudioUrl && <audio ref={recAudioRef} src={recordedAudioUrl} className="hidden" />}
      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}

      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full glass-panel text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-4 shadow-sm">
          <SpeakerIcon className="w-3.5 h-3.5" />
          <span>{t("playground.badge")}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
          {t("playground.title")}
        </h1>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <PlaygroundEditorPanel
          ref={editorRef}
          textInput={textInput}
          onTextChange={setTextInput}
          onSampleSelect={handleSampleTextSelect}
        />

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
