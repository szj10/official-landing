"use client";

import React, { RefObject } from "react";
import { useI18n } from "@/i18n";
import {
  MicIcon,
  StopIcon,
  PlayIcon,
  CheckIcon,
  AlertIcon,
  SpeakerIcon,
  RestartIcon,
} from "./icons";
import { HistoryVoice, formatTime, formatRelativeTime } from "./types";

export interface VoiceRecorderProps {
  isRecording: boolean;
  recordingTime: number;
  recordedAudioBlob: Blob | null;
  uploadStatus: "idle" | "uploading" | "success" | "error";
  uploadError: string | null;
  anonymousVoiceId: number | null;
  historyVoices: HistoryVoice[];
  showHistoryVoices?: boolean;
  playingHistoryVoiceId: number | null;
  isPlayingRecording?: boolean;
  recAudioRef?: RefObject<HTMLAudioElement | null>;
  recordedDuration?: number; // Duration in seconds
  onStartRecording: () => void;
  onStopRecording: () => void;
  onResetRecording: () => void;
  onToggleShowHistoryVoices?: () => void;
  onSelectHistoryVoice: (voice: HistoryVoice) => void;
  onPlayHistoryVoice: (voiceId: number) => void;
  onToggleRecordingPlayback?: () => void;
  onDeleteHistoryVoice?: (voiceId: number) => void;
  onSelectSampleVoiceTab?: () => void;
  onExpandHistoryTab?: () => void;
  historyOnlyMode?: boolean;
}

export function VoiceRecorder({
  isRecording,
  recordingTime,
  recordedAudioBlob,
  uploadStatus,
  uploadError,
  anonymousVoiceId,
  historyVoices,
  playingHistoryVoiceId,
  recordedDuration,
  onStartRecording,
  onStopRecording,
  onResetRecording,
  onSelectHistoryVoice,
  onPlayHistoryVoice,
  onToggleRecordingPlayback,
  onDeleteHistoryVoice,
  onSelectSampleVoiceTab,
  onExpandHistoryTab,
  isPlayingRecording = false,
  historyOnlyMode = false,
}: VoiceRecorderProps) {
  const { t } = useI18n();

  const promptText = t("playground.voiceSection.promptGuideText");

  const handleExpandHistoryTab = () => {
    if (onExpandHistoryTab) {
      onExpandHistoryTab();
    }
  };

  // If in history-only mode, just render the history list
  if (historyOnlyMode) {
    return (
      <div className="space-y-2 h-full overflow-y-auto custom-scrollbar">
        {historyVoices.map((voice) => {
          const isSelected = anonymousVoiceId === voice.anonymous_voice_id;
          const isPlayingThis = playingHistoryVoiceId === voice.anonymous_voice_id;

          const durationStr = voice.audio_duration
            ? formatTime(Math.round(voice.audio_duration))
            : "0:10";
          const relativeTimeStr = voice.created_at ? formatRelativeTime(voice.created_at) : "";

          return (
            <div
              key={voice.anonymous_voice_id}
              onClick={() => {
                onPlayHistoryVoice(voice.anonymous_voice_id);
                onSelectHistoryVoice(voice);
              }}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500 shadow-xs ring-1 ring-indigo-500/20"
                  : "bg-white dark:bg-zinc-800/80 border-gray-200/80 dark:border-zinc-700/60 hover:border-indigo-300 dark:hover:border-indigo-600"
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayHistoryVoice(voice.anonymous_voice_id);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 ${
                    isPlayingThis
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                      : "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900"
                  }`}
                  aria-label={isPlayingThis ? "Stop preview" : "Play preview"}
                >
                  {isPlayingThis ? (
                    <StopIcon className="w-3.5 h-3.5" />
                  ) : (
                    <PlayIcon className="w-3.5 h-3.5 ml-0.5" />
                  )}
                </button>

                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {durationStr} Recording {relativeTimeStr ? `• ${relativeTimeStr}` : ""}
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-zinc-400">
                    Voice ID:{" "}
                    <span className="font-mono font-medium text-gray-700 dark:text-zinc-300">
                      #{voice.anonymous_voice_id}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                {isSelected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-indigo-600 text-white shadow-xs">
                    <CheckIcon className="w-3 h-3" />
                    Selected
                  </span>
                )}
                {onDeleteHistoryVoice && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm(
                          `Are you sure you want to delete Voice #${voice.anonymous_voice_id}?`
                        )
                      ) {
                        onDeleteHistoryVoice(voice.anonymous_voice_id);
                      }
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    aria-label="Delete recording"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full space-y-4">
      {recordedAudioBlob || uploadStatus === "success" ? (
        /* Active Captured Recording Card */
        <div className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/50 shadow-xs space-y-3 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold">
            <CheckIcon className="w-4 h-4" />
            {uploadStatus === "success"
              ? t("playground.voiceSection.uploadSuccess")
              : "Recording Captured"}
          </div>

          {anonymousVoiceId && (
            <div className="space-y-2">
              <div className="text-xs text-gray-500 dark:text-zinc-400">
                Active Voice ID:{" "}
                <span className="font-mono font-bold text-gray-800 dark:text-zinc-200">
                  #{anonymousVoiceId}
                </span>
              </div>
              {(recordedDuration || recordingTime > 0) && (
                <div className="text-xs text-gray-500 dark:text-zinc-400">
                  Duration:{" "}
                  <span className="font-mono font-bold text-gray-800 dark:text-zinc-200">
                    {Math.round(recordedDuration || recordingTime)}s
                  </span>
                </div>
              )}
            </div>
          )}

          {uploadStatus === "uploading" && (
            <div className="flex items-center justify-center gap-2 text-xs text-indigo-600 font-medium py-1">
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
              {t("playground.voiceSection.uploading")}
            </div>
          )}

          {uploadStatus === "error" && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-red-600 font-medium py-1">
              <AlertIcon className="w-4 h-4" />
              {uploadError ?? t("playground.voiceSection.uploadError")}
            </div>
          )}

          <div className="pt-2 border-t border-gray-100 dark:border-zinc-700/60 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onToggleRecordingPlayback) {
                  onToggleRecordingPlayback();
                }
              }}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                isPlayingRecording
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
              }`}
              aria-label="Play recording"
            >
              <PlayIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onResetRecording}
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
              aria-label="Record again"
            >
              <RestartIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      ) : (
        /* Recording Console */
        <div className="w-full max-w-md flex flex-col items-center space-y-4">
          {/* Reading Script Card */}
          <div className="w-full bg-white dark:bg-zinc-800/90 rounded-xl p-3.5 border border-gray-200/80 dark:border-zinc-700/70 shadow-xs relative group">
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              <span>
                {t("playground.voiceSection.promptGuideTitle") || "Reading Script (4-10s)"}
              </span>
              {/* copy button removed */}
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-zinc-200 italic leading-relaxed">
              &quot;{promptText}&quot;
            </p>
            <p className="mt-1.5 text-[10px] sm:text-[11px] text-gray-500 dark:text-zinc-400">
              {t("playground.voiceSection.recordHint")}
            </p>
          </div>

          {/* Mic Console */}
          {isRecording ? (
            <div className="flex flex-col items-center gap-3 py-2">
              {/* Sound wave bars */}
              <div className="flex items-end gap-1 h-6 px-3">
                <span className="w-1.5 bg-red-500 rounded-full animate-[bounce_1s_infinite_100ms] h-3" />
                <span className="w-1.5 bg-red-500 rounded-full animate-[bounce_1s_infinite_300ms] h-6" />
                <span className="w-1.5 bg-red-500 rounded-full animate-[bounce_1s_infinite_200ms] h-5" />
                <span className="w-1.5 bg-red-500 rounded-full animate-[bounce_1s_infinite_400ms] h-5.5" />
                <span className="w-1.5 bg-red-500 rounded-full animate-[bounce_1s_infinite_150ms] h-4" />
              </div>

              <button
                type="button"
                onClick={onStopRecording}
                className="relative group focus:outline-none"
              >
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-500/40 group-active:scale-95 transition-transform">
                  <StopIcon className="w-7 h-7" />
                </div>
              </button>

              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono text-red-500 font-bold text-xs sm:text-sm tracking-wider">
                  {formatTime(recordingTime)} / 0:10
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-1">
              {/* Navigation buttons row with centered mic */}
              <div className="flex items-end justify-center gap-6 w-full max-w-sm">
                {/* Left button: Switch to Sample Voices */}
                {onSelectSampleVoiceTab && (
                  <button
                    type="button"
                    onClick={onSelectSampleVoiceTab}
                    className="flex flex-col items-center gap-1.5 group focus:outline-none transition-all"
                    title={t("playground.voiceSection.switchToSampleVoices") || "Sample Voices"}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-sm group-hover:shadow-md group-hover:scale-105 group-active:scale-95 transition-transform">
                      <SpeakerIcon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-600 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Samples
                    </span>
                  </button>
                )}

                {/* Center button: Record Voice (main action) */}
                <div className="flex flex-col items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onStartRecording}
                    className="group relative focus:outline-none"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-30 group-hover:opacity-75 transition duration-300" />
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 group-hover:scale-105 group-active:scale-95 transition-transform">
                      <MicIcon className="w-7 h-7" />
                    </div>
                  </button>
                  <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-zinc-200">
                    {t("playground.voiceSection.startRecording")}
                  </span>
                </div>

                {/* Right button: Expand History Tab */}
                {historyVoices.length > 0 && onExpandHistoryTab && (
                  <button
                    type="button"
                    onClick={handleExpandHistoryTab}
                    className="flex flex-col items-center gap-1.5 group focus:outline-none transition-all"
                    title={t("playground.voiceSection.viewSavedPrompts") || "Saved Prompts"}
                  >
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-sm group-hover:shadow-md group-hover:scale-105 group-active:scale-95 transition-transform">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      {historyVoices.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {historyVoices.length}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-gray-600 dark:text-zinc-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      History
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
