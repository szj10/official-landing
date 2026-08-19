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
  uploadStatus: "idle" | "uploading" | "success" | "error";
  uploadError: string | null;
  anonymousVoiceId: number | null;
  historyVoices: HistoryVoice[];
  showHistoryVoices: boolean;
  playingHistoryVoiceId: number | null;
  recAudioRef: React.RefObject<HTMLAudioElement | null>;
  onSetActiveVoicePanel: (panel: "stock" | "custom") => void;
  onVoiceSelectAndPlay: (voiceId: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onResetRecording: () => void;
  onToggleShowHistoryVoices: () => void;
  onSelectHistoryVoice: (voice: HistoryVoice) => void;
  onPlayHistoryVoice: (voiceId: number) => void;
  onDeleteHistoryVoice?: (voiceId: number) => void;

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
  uploadStatus,
  uploadError,
  anonymousVoiceId,
  historyVoices,
  showHistoryVoices,
  playingHistoryVoiceId,
  recAudioRef,
  onSetActiveVoicePanel,
  onVoiceSelectAndPlay,
  onStartRecording,
  onStopRecording,
  onResetRecording,
  onToggleShowHistoryVoices,
  onSelectHistoryVoice,
  onPlayHistoryVoice,
  onDeleteHistoryVoice,
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar">
          {/* Header Panel Switch Tabs */}
          <div className="flex p-1 bg-gray-100/80 dark:bg-zinc-800/80 rounded-xl shadow-inner w-full max-w-sm mx-auto sm:mx-0">
            <button
              type="button"
              className={`flex-1 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                activeVoicePanel === "stock"
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200"
              }`}
              onClick={() => onSetActiveVoicePanel("stock")}
            >
              {t("playground.voiceSection.sampleVoices")}
            </button>
            <button
              type="button"
              className={`flex-1 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
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
              onVoiceSelectAndPlay={onVoiceSelectAndPlay}
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
              onSelectHistoryVoice={onSelectHistoryVoice}
              onPlayHistoryVoice={onPlayHistoryVoice}
              onDeleteHistoryVoice={onDeleteHistoryVoice}
              onSelectSampleVoiceTab={() => onSetActiveVoicePanel("stock")}
            />
          )}
        </div>

        {/* Footer with Speed Controls and Confirm Button */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-900/80 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Speed Selector */}
          <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300 shrink-0">
              {t("playground.speedSection.speed")}:
            </span>
            <div className="flex p-0.5 bg-gray-200/80 dark:bg-zinc-800 rounded-lg">
              <button
                type="button"
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  speed === "slow"
                    ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
                onClick={() => onSetSpeed("slow")}
              >
                {t("playground.speedSection.slow")}
              </button>
              <button
                type="button"
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  speed === "normal"
                    ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
                onClick={() => onSetSpeed("normal")}
              >
                {t("playground.speedSection.normal")}
              </button>
              <button
                type="button"
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  speed === "fast"
                    ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
                onClick={() => onSetSpeed("fast")}
              >
                {t("playground.speedSection.fast")}
              </button>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-sm shrink-0"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
