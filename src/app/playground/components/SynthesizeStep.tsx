"use client";

import React, { RefObject } from "react";
import { useI18n } from "@/i18n";
import { SpeakerIcon, SparklesIcon } from "./icons";
import { QueueStatusCard } from "./QueueStatusCard";
import { AudioPlayer } from "./AudioPlayer";
import { HistoryJobs } from "./HistoryJobs";
import { AlertBanner } from "./AlertBanner";
import { HistoryTTSJob, TTSJobStatus } from "./types";

interface SynthesizeStepProps {
  isGenerating: boolean;
  generationStatus: TTSJobStatus | null;
  audioUrl: string | null;
  audioDuration: number | null;
  isPlaying: boolean;
  audioProgress: number;
  audioCurrentTime: number;
  isCachedResult: boolean;
  errorMessage: string | null;
  rateLimitRetryAfter: number | null;
  emptyTextWarning: boolean;
  lastQueueMetrics: {
    position: number;
    jobsAhead: number;
    queueDepth: number;
    estimatedWaitSeconds: number;
  } | null;
  historyJobs: HistoryTTSJob[];
  showHistoryJobs: boolean;
  playingHistoryJobId: number | string | null;
  audioRef: RefObject<HTMLAudioElement | null>;
  canGenerate: boolean;
  onGenerate: () => void;
  onTogglePlayback: () => void;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDownload: () => void;
  onCloseAudio: () => void;
  onDismissEmptyTextWarning: () => void;
  onToggleShowHistoryJobs: () => void;
  onPlayHistoryJob: (jobId: string | number, path: string | null) => void;
}

export function SynthesizeStep({
  isGenerating,
  generationStatus,
  audioUrl,
  audioDuration,
  isPlaying,
  audioProgress,
  audioCurrentTime,
  isCachedResult,
  errorMessage,
  rateLimitRetryAfter,
  emptyTextWarning,
  lastQueueMetrics,
  historyJobs,
  showHistoryJobs,
  playingHistoryJobId,
  audioRef,
  canGenerate,
  onGenerate,
  onTogglePlayback,
  onSeek,
  onDownload,
  onCloseAudio,
  onDismissEmptyTextWarning,
  onToggleShowHistoryJobs,
  onPlayHistoryJob,
}: SynthesizeStepProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-5">
      {/* Alerts */}
      <AlertBanner
        emptyTextWarning={emptyTextWarning}
        onDismissEmptyTextWarning={onDismissEmptyTextWarning}
        generationStatus={generationStatus}
        rateLimitRetryAfter={rateLimitRetryAfter}
        errorMessage={errorMessage}
        isGenerating={isGenerating}
      />

      {/* Queue Card when generating in queue */}
      {isGenerating && generationStatus === "queued" && (
        <QueueStatusCard lastQueueMetrics={lastQueueMetrics} />
      )}

      {/* Active Audio Result Card */}
      {audioUrl ? (
        <AudioPlayer
          audioUrl={audioUrl}
          isPlaying={isPlaying}
          audioProgress={audioProgress}
          audioCurrentTime={audioCurrentTime}
          audioDuration={audioDuration}
          isCachedResult={isCachedResult}
          audioRef={audioRef}
          onTogglePlayback={onTogglePlayback}
          onSeek={onSeek}
          onDownload={onDownload}
          onClose={onCloseAudio}
        />
      ) : !isGenerating ? (
        /* Empty Prompt Card before generation */
        <div className="flex flex-col items-center justify-center p-6 sm:p-10 rounded-2xl bg-gray-50/60 dark:bg-zinc-900/40 border border-gray-100 dark:border-zinc-800 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <SparklesIcon className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Ready to Synthesize
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 max-w-sm mb-5">
            Your text and voice are selected. Click Generate below or use the action bar to
            synthesize high-quality AI speech.
          </p>
          <button
            type="button"
            onClick={onGenerate}
            disabled={!canGenerate}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
          >
            <SpeakerIcon className="w-4 h-4" />
            <span>{t("playground.preview.generate")}</span>
          </button>
        </div>
      ) : null}

      {/* Recent Generations list */}
      <HistoryJobs
        historyJobs={historyJobs}
        showHistoryJobs={showHistoryJobs}
        playingHistoryJobId={playingHistoryJobId}
        isPlaying={isPlaying}
        onToggleShowHistoryJobs={onToggleShowHistoryJobs}
        onPlayHistoryJob={onPlayHistoryJob}
      />
    </div>
  );
}
