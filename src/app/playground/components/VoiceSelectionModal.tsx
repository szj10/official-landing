"use client";

import React, { useEffect } from "react";
import { useI18n } from "@/i18n";
import { VoiceGrid } from "./VoiceGrid";
import { VoiceRecorder } from "./VoiceRecorder";
import { HistoryVoice } from "./types";

type VoiceTab = "sample" | "record" | "history";

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
  /** Re-upload last Blob on non-429 failure; omit for rate-limit errors. */
  onRetryUpload?: () => void;
  anonymousVoiceId: number | null;
  historyVoices: HistoryVoice[];
  showHistoryVoices: boolean;
  playingHistoryVoiceId: number | null;
  isRecPlaying: boolean;
  recAudioRef: React.RefObject<HTMLAudioElement | null>;
  recordedDuration?: number; // Duration in seconds
  onSetActiveVoicePanel: (panel: "stock" | "custom") => void;
  onVoiceSelectAndPlay: (voiceId: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onResetRecording: () => void;
  onToggleShowHistoryVoices: () => void;
  onSelectHistoryVoice: (voice: HistoryVoice) => void;
  onPlayHistoryVoice: (voiceId: number) => void;
  onToggleRecordingPlayback: () => void;
  onDeleteHistoryVoice?: (voiceId: number) => void;
  onClearSampleVoice?: () => void;

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
  onRetryUpload,
  anonymousVoiceId,
  historyVoices,
  showHistoryVoices,
  playingHistoryVoiceId,
  isRecPlaying,
  recAudioRef,
  recordedDuration,
  onSetActiveVoicePanel,
  onVoiceSelectAndPlay,
  onStartRecording,
  onStopRecording,
  onResetRecording,
  onToggleShowHistoryVoices,
  onSelectHistoryVoice,
  onPlayHistoryVoice,
  onToggleRecordingPlayback,
  onDeleteHistoryVoice,
  onClearSampleVoice,
  speed,
  onSetSpeed,
}: VoiceSelectionModalProps) {
  const { t } = useI18n();

  // Compute initial tab based on voice selection state
  const getInitialTab = (): VoiceTab => {
    if (anonymousVoiceId && activeVoicePanel === "custom") {
      return recordedAudioBlob ? "record" : "history";
    }
    if (selectedVoice && activeVoicePanel === "stock") {
      return "sample";
    }
    return "sample"; // default
  };

  const [activeTab, setActiveTab] = React.useState<VoiceTab>(getInitialTab);

  // Handle tab change - clear voice selections when switching tabs
  const handleTabChange = (newTab: VoiceTab) => {
    if (activeTab === newTab) return; // No-op if same tab

    // Clear all selections when changing tabs
    if (onClearSampleVoice) {
      onClearSampleVoice();
    }
    setActiveTab(newTab);
  };

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
      <div className="relative w-full max-w-2xl glass-panel rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar">
          {/* 3-Tab Navigation */}
          <div className="flex p-1 bg-gray-100/80 dark:bg-zinc-800/80 rounded-xl shadow-inner w-full max-w-lg mx-auto">
            <button
              type="button"
              className={`flex-1 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                activeTab === "sample"
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200"
              }`}
              onClick={() => handleTabChange("sample")}
            >
              {t("playground.voiceSection.sampleVoices")}
            </button>
            <button
              type="button"
              className={`flex-1 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                activeTab === "record"
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200"
              }`}
              onClick={() => handleTabChange("record")}
            >
              {t("playground.voiceSection.tabCustom")}
            </button>
            {historyVoices.length > 0 && (
              <button
                type="button"
                className={`flex-1 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all relative ${
                  activeTab === "history"
                    ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200"
                }`}
                onClick={() => handleTabChange("history")}
              >
                {t("playground.voiceSection.history")}
                <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                  {historyVoices.length}
                </span>
              </button>
            )}
          </div>

          {/* Tab Content - Fixed height container for consistent sizing */}
          <div className="h-[280px] sm:h-[320px] flex flex-col">
            {activeTab === "sample" && (
              <>
                {/* Quick Navigation Banner - Navigate to History */}
                <div className="w-full flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-xs shadow-xs mb-4">
                  <span className="text-indigo-900 dark:text-indigo-200 font-medium flex items-center gap-1.5 text-[11px] sm:text-xs">
                    <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                    {t("playground.voiceSection.preferRecordedVoices")}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTabChange("record")}
                    className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors shrink-0 text-[11px] sm:text-xs group"
                  >
                    {t("playground.voiceSection.recordingTab")}
                    <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                  </button>
                </div>
                <VoiceGrid
                  selectedVoice={selectedVoice}
                  playingVoicePreview={playingVoicePreview}
                  onVoiceSelectAndPlay={onVoiceSelectAndPlay}
                />
              </>
            )}

            {activeTab === "record" && (
              <>
                {/* Quick Navigation Banner - Navigate to History */}
                {historyVoices.length > 0 ? (
                  <div className="w-full flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-xs shadow-xs mb-4">
                    <span className="text-indigo-900 dark:text-indigo-200 font-medium flex items-center gap-1.5 text-[11px] sm:text-xs">
                      <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                      {t("playground.voiceSection.findPreviousVoices")}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTabChange("history")}
                      className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors shrink-0 text-[11px] sm:text-xs group"
                    >
                      {t("playground.voiceSection.historyTab")}
                      <span className="group-hover:translate-x-0.5 transition-transform">
                        &rarr;
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-xs shadow-xs shrink-0">
                    <span className="text-indigo-900 dark:text-indigo-200 font-medium flex items-center gap-1.5 text-[11px] sm:text-xs">
                      <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                      {t("playground.voiceSection.preferSampleVoices")}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTabChange("sample")}
                      className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors shrink-0 text-[11px] sm:text-xs group"
                    >
                      {t("playground.voiceSection.sampleVoiceTab")}
                      <span className="group-hover:translate-x-0.5 transition-transform">
                        &rarr;
                      </span>
                    </button>
                  </div>
                )}
                <VoiceRecorder
                  isRecording={isRecording}
                  recordingTime={recordingTime}
                  recordedAudioBlob={recordedAudioBlob}
                  uploadStatus={uploadStatus}
                  uploadError={uploadError}
                  onRetryUpload={onRetryUpload}
                  anonymousVoiceId={anonymousVoiceId}
                  historyVoices={historyVoices}
                  showHistoryVoices={showHistoryVoices}
                  playingHistoryVoiceId={playingHistoryVoiceId}
                  isPlayingRecording={isRecPlaying}
                  recAudioRef={recAudioRef}
                  recordedDuration={recordedDuration}
                  onStartRecording={onStartRecording}
                  onStopRecording={onStopRecording}
                  onResetRecording={onResetRecording}
                  onToggleShowHistoryVoices={onToggleShowHistoryVoices}
                  onSelectHistoryVoice={onSelectHistoryVoice}
                  onPlayHistoryVoice={onPlayHistoryVoice}
                  onToggleRecordingPlayback={onToggleRecordingPlayback}
                  onDeleteHistoryVoice={onDeleteHistoryVoice}
                  onSelectSampleVoiceTab={() => handleTabChange("sample")}
                  onExpandHistoryTab={() => handleTabChange("history")}
                />
              </>
            )}

            {activeTab === "history" && (
              <div className="h-full flex flex-col overflow-hidden gap-2">
                {/* Quick Navigation Banner - Navigate to Sample Voices */}
                <div className="w-full flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-xs shadow-xs shrink-0">
                  <span className="text-indigo-900 dark:text-indigo-200 font-medium flex items-center gap-1.5 text-[11px] sm:text-xs">
                    <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                    {t("playground.voiceSection.preferSampleVoices")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("sample")}
                    className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors shrink-0 text-[11px] sm:text-xs group"
                  >
                    {t("playground.voiceSection.sampleVoiceTab")}
                    <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {historyVoices.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400 dark:text-zinc-400"
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
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                        {t("playground.voiceSection.noHistory")}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4">
                        {t("playground.voiceSection.recordFirstPrompt")}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleTabChange("record")}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01.469-1.57m0 0a3 3 0 01-1.469-1.57m0 0L9 7m4.469 4.43a3 3 0 01.469 1.57m0 0a3 3 0 01-1.469 1.57m0 0l.469.43m0 0L15 17"
                          />
                        </svg>
                        {t("playground.voiceSection.tabCustom")}
                      </button>
                    </div>
                  ) : (
                    <VoiceRecorder
                      isRecording={false}
                      recordingTime={0}
                      recordedAudioBlob={null}
                      uploadStatus="idle"
                      uploadError={null}
                      anonymousVoiceId={anonymousVoiceId}
                      historyVoices={historyVoices}
                      showHistoryVoices={true}
                      playingHistoryVoiceId={playingHistoryVoiceId}
                      isPlayingRecording={isRecPlaying}
                      recAudioRef={recAudioRef}
                      onStartRecording={() => handleTabChange("record")}
                      onStopRecording={() => {}}
                      onResetRecording={() => {}}
                      onToggleShowHistoryVoices={onToggleShowHistoryVoices}
                      onSelectHistoryVoice={onSelectHistoryVoice}
                      onPlayHistoryVoice={onPlayHistoryVoice}
                      onToggleRecordingPlayback={onToggleRecordingPlayback}
                      onDeleteHistoryVoice={onDeleteHistoryVoice}
                      onSelectSampleVoiceTab={() => handleTabChange("sample")}
                      onExpandHistoryTab={() => handleTabChange("history")}
                      historyOnlyMode={true}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Speed Controls and Confirm Button */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-900/80 shrink-0 flex flex-row items-center justify-between gap-3">
          {/* Speed Selector */}
          <div className="flex p-0.5 bg-gray-200/80 dark:bg-zinc-800 rounded-lg shrink-0">
            <button
              type="button"
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                speed === "slow"
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
              onClick={() => onSetSpeed("slow")}
            >
              0.7x
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                speed === "normal"
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
              onClick={() => onSetSpeed("normal")}
            >
              1.0x
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                speed === "fast"
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
              onClick={() => onSetSpeed("fast")}
            >
              1.3x
            </button>
          </div>

          {/* Confirm Button - Only show when a voice is actually selected */}
          {(() => {
            // Sample voice selected in "sample" tab
            const hasSampleVoice =
              activeTab === "sample" && selectedVoice && activeVoicePanel === "stock";

            // Custom voice: either uploaded with ID, or currently in "record" tab with recorded blob ready
            const hasCustomVoice =
              (activeTab === "record" && anonymousVoiceId && uploadStatus === "success") ||
              (activeTab === "history" && anonymousVoiceId);

            const isProcessing = isRecording || uploadStatus === "uploading";
            const shouldShow = (hasSampleVoice || hasCustomVoice) && !isProcessing;

            return shouldShow ? (
              <button
                onClick={onClose}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-sm shrink-0"
              >
                {t("playground.voiceSection.confirm")}
              </button>
            ) : null;
          })()}
        </div>
      </div>
    </div>
  );
}
