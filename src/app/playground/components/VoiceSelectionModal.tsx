"use client";

import React, { useEffect } from "react";
import { useI18n } from "@/i18n";
import { VoiceGrid } from "./VoiceGrid";
import { VoiceRecorder } from "./VoiceRecorder";
import { HistoryVoice } from "./types";

interface VoiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Voice Selection Props
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
  recAudioRef: React.RefObject<HTMLAudioElement | null>;
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

  // Speed Selector Props
  speed: "slow" | "normal" | "fast";
  onSetSpeed: (speed: "slow" | "normal" | "fast") => void;
}

export function VoiceSelectionModal({
  isOpen,
  onClose,
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
  speed,
  onSetSpeed,
}: VoiceSelectionModalProps) {
  const { t } = useI18n();

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800 shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t("playground.voiceSection.sampleVoices")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Tabs */}
          <div className="flex p-1 bg-gray-100/80 dark:bg-zinc-800/80 rounded-xl shadow-inner w-full max-w-sm mx-auto sm:mx-0">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeVoicePanel === "stock"
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200"
              }`}
              onClick={() => onSetActiveVoicePanel("stock")}
            >
              {t("playground.voiceSection.tabStock")}
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeVoicePanel === "custom"
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200"
              }`}
              onClick={() => onSetActiveVoicePanel("custom")}
            >
              {t("playground.voiceSection.tabCustom")}
            </button>
          </div>

          {/* Voice Panels */}
          {activeVoicePanel === "stock" ? (
            <VoiceGrid
              selectedVoice={selectedVoice}
              playingVoicePreview={playingVoicePreview}
              onVoiceSelectAndPlay={(id) => {
                onVoiceSelectAndPlay(id);
                // Auto-close modal after selecting a stock voice
                setTimeout(() => onClose(), 400);
              }}
            />
          ) : (
            <VoiceRecorder
              isRecording={isRecording}
              recordingTime={recordingTime}
              recordedAudioBlob={recordedAudioBlob}
              uploadStatus={uploadStatus}
              uploadError={uploadError}
              anonymousVoiceId={anonymousVoiceId}
              historyVoices={historyVoices}
              showHistoryVoices={showHistoryVoices}
              playingHistoryVoiceId={playingHistoryVoiceId}
              recAudioRef={recAudioRef}
              onStartRecording={onStartRecording}
              onStopRecording={onStopRecording}
              onResetRecording={onResetRecording}
              onToggleShowHistoryVoices={onToggleShowHistoryVoices}
              onSelectHistoryVoice={(voice) => {
                onSelectHistoryVoice(voice);
                // Auto-close modal after selecting history voice
                setTimeout(() => onClose(), 400);
              }}
              onPlayHistoryVoice={onPlayHistoryVoice}
            />
          )}

          {/* Speed Selector */}
          <div className="pt-6 border-t border-gray-100 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-3">
              {t("playground.bottomBar.speed")}
            </h3>
            <div className="flex p-1 bg-gray-100/80 dark:bg-zinc-800/80 rounded-xl shadow-inner w-full max-w-sm">
              <button
                type="button"
                className={`flex-1 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  speed === "slow"
                    ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
                onClick={() => onSetSpeed("slow")}
              >
                0.3x
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  speed === "normal"
                    ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
                onClick={() => onSetSpeed("normal")}
              >
                0.5x
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  speed === "fast"
                    ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
                onClick={() => onSetSpeed("fast")}
              >
                0.8x
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
