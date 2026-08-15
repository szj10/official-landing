"use client";

import React, { RefObject } from "react";
import { useI18n } from "@/i18n";
import { SpeakerIcon, MicIcon, ArrowRightIcon } from "./icons";
import { VoiceGrid } from "./VoiceGrid";
import { VoiceRecorder } from "./VoiceRecorder";
import { HistoryVoice } from "./types";

interface VoiceStepProps {
  activeVoicePanel: "stock" | "custom";
  selectedVoice: string | null;
  playingVoicePreview: string | null;
  isRecording: boolean;
  recordingTime: number;
  recordedAudioBlob: Blob | null;
  recordedAudioUrl: string | null;
  isRecPlaying: boolean;
  recAudioProgress: number;
  recAudioCurrentTime: number;
  recAudioDuration: number;
  uploadStatus: "idle" | "uploading" | "success" | "error";
  uploadError: string | null;
  anonymousVoiceId: number | null;
  historyVoices: HistoryVoice[];
  showHistoryVoices: boolean;
  playingHistoryVoiceId: number | null;
  canGenerate: boolean;
  recAudioRef: RefObject<HTMLAudioElement | null>;
  onSetActiveVoicePanel: (panel: "stock" | "custom") => void;
  onVoiceSelectAndPlay: (voiceId: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onToggleRecPlayback: () => void;
  onRecSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  onResetRecording: () => void;
  onToggleShowHistoryVoices: () => void;
  onSelectHistoryVoice: (voice: HistoryVoice) => void;
  onPlayHistoryVoice: (voiceId: number) => void;
  onAdvanceToNext: () => void;
}

export function VoiceStep({
  activeVoicePanel,
  selectedVoice,
  playingVoicePreview,
  isRecording,
  recordingTime,
  recordedAudioBlob,
  recordedAudioUrl,
  isRecPlaying,
  recAudioProgress,
  recAudioCurrentTime,
  recAudioDuration,
  uploadStatus,
  uploadError,
  anonymousVoiceId,
  historyVoices,
  showHistoryVoices,
  playingHistoryVoiceId,
  canGenerate,
  recAudioRef,
  onSetActiveVoicePanel,
  onVoiceSelectAndPlay,
  onStartRecording,
  onStopRecording,
  onToggleRecPlayback,
  onRecSeek,
  onResetRecording,
  onToggleShowHistoryVoices,
  onSelectHistoryVoice,
  onPlayHistoryVoice,
  onAdvanceToNext,
}: VoiceStepProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Sub-tab toggle */}
      <div className="flex p-1 bg-gray-100 dark:bg-zinc-800/80 rounded-2xl max-w-sm">
        <button
          type="button"
          onClick={() => onSetActiveVoicePanel("stock")}
          className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            activeVoicePanel === "stock"
              ? "bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-400 shadow-sm"
              : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
          }`}
        >
          <SpeakerIcon className="w-4 h-4" />
          <span>{t("playground.voiceSection.sampleVoices")}</span>
        </button>
        <button
          type="button"
          onClick={() => onSetActiveVoicePanel("custom")}
          className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            activeVoicePanel === "custom"
              ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
          }`}
        >
          <MicIcon className="w-4 h-4" />
          <span>{t("playground.voiceSection.recordCustom")}</span>
        </button>
      </div>

      {/* Voice Selection Panels */}
      {activeVoicePanel === "stock" ? (
        <VoiceGrid
          selectedVoice={selectedVoice}
          playingVoicePreview={playingVoicePreview}
          onVoiceSelectAndPlay={onVoiceSelectAndPlay}
        />
      ) : (
        <VoiceRecorder
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
          recAudioRef={recAudioRef}
          onStartRecording={onStartRecording}
          onStopRecording={onStopRecording}
          onToggleRecPlayback={onToggleRecPlayback}
          onRecSeek={onRecSeek}
          onResetRecording={onResetRecording}
          onToggleShowHistoryVoices={onToggleShowHistoryVoices}
          onSelectHistoryVoice={onSelectHistoryVoice}
          onPlayHistoryVoice={onPlayHistoryVoice}
        />
      )}

      {/* Advance Action Button */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800">
        <p className="text-xs text-gray-500 dark:text-zinc-400">
          {canGenerate
            ? "Click Next to proceed to synthesize"
            : "Please select or record a voice first"}
        </p>
        <button
          type="button"
          onClick={onAdvanceToNext}
          disabled={!canGenerate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold shadow-md shadow-purple-500/20 transition-all active:scale-95"
        >
          <span>Next: Synthesize</span>
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
