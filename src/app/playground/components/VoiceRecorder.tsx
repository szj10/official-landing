"use client";

import React, { RefObject } from "react";
import { useI18n } from "@/i18n";
import { MicIcon, StopIcon, PlayIcon, CheckIcon, AlertIcon, ChevronIcon } from "./icons";
import { HistoryVoice, formatTime, formatRelativeTime } from "./types";

interface VoiceRecorderProps {
  isRecording: boolean;
  recordingTime: number;
  recordedAudioBlob: Blob | null;
  uploadStatus: "idle" | "uploading" | "success" | "error";
  uploadError: string | null;
  anonymousVoiceId: number | null;
  historyVoices: HistoryVoice[];
  showHistoryVoices: boolean;
  playingHistoryVoiceId: number | null;
  recAudioRef: RefObject<HTMLAudioElement | null>;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onResetRecording: () => void;
  onToggleShowHistoryVoices: () => void;
  onSelectHistoryVoice: (voice: HistoryVoice) => void;
  onPlayHistoryVoice: (voiceId: number) => void;
}

export function VoiceRecorder({
  isRecording,
  recordingTime,
  recordedAudioBlob,
  uploadStatus,
  uploadError,
  anonymousVoiceId,
  historyVoices,
  showHistoryVoices,
  playingHistoryVoiceId,
  onStartRecording,
  onStopRecording,
  onResetRecording,
  onToggleShowHistoryVoices,
  onSelectHistoryVoice,
  onPlayHistoryVoice,
}: VoiceRecorderProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center p-5 sm:p-8 bg-gray-50/50 dark:bg-zinc-900/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-700">
      {recordedAudioBlob ? (
        <div className="w-full max-w-md space-y-4">
          {/* Removed inline audio player (now handled by StickyPlayerBar) */}{" "}
          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            <div>
              {uploadStatus === "uploading" && (
                <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
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
              {uploadStatus === "success" && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <CheckIcon className="w-3.5 h-3.5" />
                  {t("playground.voiceSection.uploadSuccess")}
                </div>
              )}
              {uploadStatus === "error" && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                  <AlertIcon className="w-3.5 h-3.5" />
                  {uploadError ?? t("playground.voiceSection.uploadError")}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onResetRecording}
              className="text-xs font-semibold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {t("playground.voiceSection.recordAgain")}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center w-full max-w-sm">
          <div className="mb-5 text-xs font-medium text-gray-500 dark:text-zinc-400 italic bg-white/60 dark:bg-zinc-800/60 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-zinc-700/50 shadow-sm">
            &quot;{t("playground.voiceSection.promptGuideText")}&quot;
          </div>

          {isRecording ? (
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={onStopRecording}
                className="relative group focus:outline-none"
              >
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
                <div className="relative w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-xl group-active:scale-95 transition-transform">
                  <StopIcon className="w-6 h-6" />
                </div>
              </button>
              <span className="font-mono text-red-500 font-bold text-sm tracking-wider">
                {formatTime(recordingTime)}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onStartRecording}
              className="group flex flex-col items-center gap-3 mx-auto focus:outline-none"
            >
              <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 group-active:scale-95 transition-transform">
                <MicIcon className="w-7 h-7" />
              </div>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                {t("playground.voiceSection.startRecording")}
              </span>
            </button>
          )}
        </div>
      )}

      {/* History Voices — collapsible */}
      {historyVoices.length > 0 && (
        <div className="w-full mt-6 pt-5 border-t border-gray-200 dark:border-zinc-700/50">
          <button
            type="button"
            onClick={onToggleShowHistoryVoices}
            className="w-full flex items-center justify-between px-1 py-1 text-left group"
          >
            <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">
              Recent Voice Prompts
              <span className="ml-2 text-[10px] font-medium bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 px-1.5 py-0.5 rounded-full">
                {historyVoices.length}
              </span>
            </span>
            <ChevronIcon className="w-4 h-4 text-gray-400" open={showHistoryVoices} />
          </button>

          {showHistoryVoices && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {historyVoices.map((voice) => {
                const isSelected = anonymousVoiceId === voice.anonymous_voice_id;
                const isPlayingThis = playingHistoryVoiceId === voice.anonymous_voice_id;

                return (
                  <div
                    key={voice.anonymous_voice_id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-sm"
                        : "bg-white dark:bg-zinc-800 border-gray-100 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                    }`}
                    onClick={() => {
                      onPlayHistoryVoice(voice.anonymous_voice_id);
                      onSelectHistoryVoice(voice);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        {isPlayingThis ? (
                          <StopIcon className="w-4 h-4" />
                        ) : (
                          <PlayIcon className="w-4 h-4 ml-0.5" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Voice Prompt #{voice.anonymous_voice_id}
                        </span>
                        <span className="text-xs text-gray-500">
                          {voice.audio_duration ? formatTime(voice.audio_duration) : "0:00"}
                          {voice.created_at && ` • ${formatRelativeTime(voice.created_at)}`}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="text-indigo-600 dark:text-indigo-400 mr-2">
                        <CheckIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
