"use client";

import React, { RefObject } from "react";
import { useI18n } from "@/i18n";
import { MicIcon, StopIcon, PlayIcon, CheckIcon, AlertIcon, RestartIcon } from "./icons";
import { formatTime } from "./types";

export interface VoiceRecorderProps {
  isRecording: boolean;
  recordingTime: number;
  recordedAudioBlob: Blob | null;
  uploadStatus: "idle" | "uploading" | "success" | "error";
  uploadError: string | null;
  /** Re-upload last Blob without re-recording (non-429 failures only). */
  onRetryUpload?: () => void;
  anonymousVoiceId: number | null;
  isPlayingRecording?: boolean;
  recAudioRef?: RefObject<HTMLAudioElement | null>;
  recordedDuration?: number; // Duration in seconds
  onStartRecording: () => void;
  onStopRecording: () => void;
  onResetRecording: () => void;
  onToggleRecordingPlayback?: () => void;
}

export function VoiceRecorder({
  isRecording,
  recordingTime,
  recordedAudioBlob,
  uploadStatus,
  uploadError,
  onRetryUpload,
  anonymousVoiceId,
  recordedDuration,
  onStartRecording,
  onStopRecording,
  onResetRecording,
  onToggleRecordingPlayback,
  isPlayingRecording = false,
}: VoiceRecorderProps) {
  const { t } = useI18n();

  const promptText = t("playground.voiceSection.promptGuideText");

  return (
    <div className="flex flex-col items-center w-full space-y-4">
      {recordedAudioBlob || uploadStatus === "success" ? (
        /* Active Captured Recording Card */
        <div className="w-full bg-indigo-50/50 dark:bg-zinc-800/60 rounded-2xl p-4 sm:p-5 border border-indigo-100 dark:border-zinc-700/60 shadow-xs space-y-3.5 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold">
            <CheckIcon className="w-3.5 h-3.5" />
            {uploadStatus === "success" ? "Recording uploaded!" : "Recording captured"}
          </div>

          {anonymousVoiceId && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-500 dark:text-zinc-400">
                Recording ID:{" "}
                <span className="font-mono font-bold text-gray-800 dark:text-zinc-200">
                  #{anonymousVoiceId}
                </span>
              </div>
              {(recordedDuration || recordingTime > 0) && (
                <div className="text-xs font-medium text-gray-500 dark:text-zinc-400">
                  Duration:{" "}
                  <span className="font-mono font-bold text-gray-800 dark:text-zinc-200">
                    {Math.round(recordedDuration || recordingTime)}s
                  </span>
                </div>
              )}
            </div>
          )}

          {uploadStatus === "uploading" && (
            <div className="flex items-center justify-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold py-1">
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
              <span>Uploading recording…</span>
            </div>
          )}

          {uploadStatus === "error" && (
            <div className="flex flex-col items-center gap-1.5 py-1">
              <div className="flex items-center justify-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
                <AlertIcon className="w-4 h-4 shrink-0" />
                <span className="text-left">
                  {uploadError ?? "Upload failed. Please try again."}
                </span>
              </div>
              {onRetryUpload && (
                <button
                  type="button"
                  onClick={onRetryUpload}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:no-underline"
                >
                  Retry upload
                </button>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-gray-200/60 dark:border-zinc-700/60 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (onToggleRecordingPlayback) {
                  onToggleRecordingPlayback();
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
                isPlayingRecording
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                  : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
              }`}
              aria-label="Play recording"
            >
              <PlayIcon className="w-4 h-4" />
              <span>{isPlayingRecording ? "Pause" : "Play Recording"}</span>
            </button>
            <button
              type="button"
              onClick={onResetRecording}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold text-xs bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
              aria-label="Record again"
            >
              <RestartIcon className="w-4 h-4" />
              <span>Record Again</span>
            </button>
          </div>
        </div>
      ) : (
        /* Recording Console */
        <div className="w-full flex flex-col items-center space-y-4">
          {/* Reading Script Card */}
          <div className="w-full bg-gray-50/80 dark:bg-zinc-800/40 rounded-2xl p-4 border border-gray-100 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
              <span>{t("playground.voiceSection.promptGuideTitle")}</span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-zinc-200 italic leading-relaxed">
              &quot;{promptText}&quot;
            </p>
            <p className="text-[11px] text-gray-400 dark:text-zinc-500">
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
                className="relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-full"
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
            <div className="flex flex-col items-center gap-2 py-1">
              <button
                type="button"
                onClick={onStartRecording}
                className="group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-30 group-hover:opacity-75 transition duration-300" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 group-hover:scale-105 group-active:scale-95 transition-transform">
                  <MicIcon className="w-7 h-7" />
                </div>
              </button>
              <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                Tap to record
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
