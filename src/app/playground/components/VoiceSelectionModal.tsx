"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useI18n } from "@/i18n";
import { PlaygroundVoice } from "../voices.config";
import { VoiceRecorder } from "./VoiceRecorder";
import { HistoryVoice, formatTime } from "./types";
import { CheckIcon, PlayIcon, StopIcon, MicIcon } from "./icons";

interface VoiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockVoices?: PlaygroundVoice[];
  // Voice state
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
  playingHistoryVoiceId: number | null;
  isRecPlaying: boolean;
  recAudioRef: React.RefObject<HTMLAudioElement | null>;
  recordedDuration?: number;
  // Callbacks
  onVoiceSelectAndPlay: (voiceId: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onResetRecording: () => void;
  onSelectHistoryVoice: (voice: HistoryVoice) => void;
  onPlayHistoryVoice: (voiceId: number) => void;
  onToggleRecordingPlayback: () => void;
  onDeleteHistoryVoice?: (voiceId: number) => void;
}

export function VoiceSelectionModal({
  isOpen,
  onClose,
  stockVoices = [],
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
  playingHistoryVoiceId,
  isRecPlaying,
  recAudioRef,
  recordedDuration,
  onVoiceSelectAndPlay,
  onStartRecording,
  onStopRecording,
  onResetRecording,
  onSelectHistoryVoice,
  onPlayHistoryVoice,
  onToggleRecordingPlayback,
  onDeleteHistoryVoice,
}: VoiceSelectionModalProps) {
  const { t } = useI18n();
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // CTA gate
  const hasSampleVoice = selectedVoice && activeVoicePanel === "stock";
  const hasCustomVoice =
    anonymousVoiceId !== null && activeVoicePanel === "custom" && uploadStatus === "success";
  const isProcessing = isRecording || uploadStatus === "uploading";
  const canConfirm = !!(hasSampleVoice || hasCustomVoice) && !isProcessing;

  const visibleHistory = showAllHistory ? historyVoices : historyVoices.slice(0, 5);

  return (
    /* Overlay: bottom-sheet on mobile, centered on desktop */
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet / Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose Voice"
        className="relative w-full sm:max-w-lg bg-white dark:bg-zinc-900 border-0 sm:border sm:border-gray-200/80 dark:sm:border-zinc-800 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl shadow-black/20 flex flex-col max-h-[92dvh] sm:max-h-[88dvh] overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 fade-in duration-300 ease-out text-slate-800 dark:text-slate-100"
      >
        {/* Drag handle — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-zinc-600" />
        </div>

        {/* ── Sticky Header ─────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 pt-3 pb-4 sm:pt-5 sm:pb-4 border-b border-gray-100 dark:border-zinc-800/80 shrink-0">
          <div>
            <h2 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white tracking-tight leading-none">
              Choose Voice
            </h2>
            <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">
              Community voices &middot; Your recording
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0"
            aria-label="Close"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable Body ────────────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="px-5 py-5 space-y-6">
            {/* ── Section 1: Community Voices ─────────────────── */}
            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-3">
                Community Voices
              </h3>

              {stockVoices.length === 0 ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-14 rounded-2xl bg-gray-100 dark:bg-zinc-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-1 -mx-1 px-1 overscroll-contain">
                  {stockVoices.map((voice) => {
                    const isSelected = selectedVoice === voice.id && activeVoicePanel === "stock";
                    const isPreviewing = playingVoicePreview === voice.id;
                    const displayName = voice.nameKey ? t(voice.nameKey) : voice.name;

                    return (
                      <div
                        key={voice.id}
                        onClick={() => onVoiceSelectAndPlay(voice.id)}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition-all ${
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-950/50 ring-1 ring-inset ring-indigo-400/60 dark:ring-indigo-600/60"
                            : "hover:bg-gray-50 dark:hover:bg-zinc-800/70"
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-9 h-9 rounded-full bg-gradient-to-br ${voice.color} flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden shadow-sm`}
                        >
                          {voice.avatarUrl ? (
                            <Image
                              src={voice.avatarUrl}
                              alt={displayName}
                              width={36}
                              height={36}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            voice.avatar
                          )}
                        </div>

                        {/* Name + creator */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-semibold truncate leading-tight ${isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-gray-900 dark:text-white"}`}
                          >
                            {displayName}
                          </p>
                          {voice.creatorUsername && (
                            <p className="text-[11px] text-gray-400 dark:text-zinc-500 truncate leading-tight mt-0.5">
                              @{voice.creatorUsername}
                            </p>
                          )}
                        </div>

                        {/* Preview button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onVoiceSelectAndPlay(voice.id);
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            isPreviewing
                              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                              : "bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-600 dark:hover:text-indigo-400"
                          }`}
                          aria-label={
                            isPreviewing
                              ? t("playground.voiceSection.stopPreview")
                              : t("playground.voiceSection.playPreview")
                          }
                        >
                          {isPreviewing ? (
                            <StopIcon className="w-3.5 h-3.5" />
                          ) : (
                            <PlayIcon className="w-3.5 h-3.5 ml-0.5" />
                          )}
                        </button>

                        {/* Selected checkmark */}
                        {isSelected && (
                          <CheckIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Divider */}
            <div className="border-t border-dashed border-gray-200 dark:border-zinc-800" />

            {/* ── Section 2: Your Voice ─────────────────────── */}
            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-3 flex items-center gap-1.5">
                <MicIcon className="w-3 h-3" />
                Your Voice
              </h3>

              {/* Simplified recorder (no nav buttons / history) */}
              <VoiceRecorder
                isRecording={isRecording}
                recordingTime={recordingTime}
                recordedAudioBlob={recordedAudioBlob}
                uploadStatus={uploadStatus}
                uploadError={uploadError}
                onRetryUpload={onRetryUpload}
                anonymousVoiceId={anonymousVoiceId}
                isPlayingRecording={isRecPlaying}
                recAudioRef={recAudioRef}
                recordedDuration={recordedDuration}
                onStartRecording={onStartRecording}
                onStopRecording={onStopRecording}
                onResetRecording={onResetRecording}
                onToggleRecordingPlayback={onToggleRecordingPlayback}
              />

              {/* ── Custom Voice History Grid ──────────────────── */}
              {historyVoices.length > 0 && (
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-gray-400 dark:text-zinc-500 flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      Previously recorded · saved 24h
                    </span>
                    {historyVoices.length > 6 && (
                      <button
                        type="button"
                        onClick={() => setShowAllHistory((p) => !p)}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2 shrink-0"
                      >
                        {showAllHistory ? "Show less" : `Show all ${historyVoices.length}`}
                      </button>
                    )}
                  </div>

                  {/* Avatar grid */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {visibleHistory.map((hv) => {
                      const isActive =
                        anonymousVoiceId === hv.anonymous_voice_id && activeVoicePanel === "custom";
                      const isPlayingThis = playingHistoryVoiceId === hv.anonymous_voice_id;
                      const durationStr = hv.audio_duration
                        ? formatTime(Math.round(hv.audio_duration))
                        : null;

                      return (
                        <div
                          key={hv.anonymous_voice_id}
                          onClick={() => {
                            onPlayHistoryVoice(hv.anonymous_voice_id);
                            onSelectHistoryVoice(hv);
                          }}
                          className={`relative group flex flex-col items-center gap-2 p-3 rounded-2xl cursor-pointer transition-all select-none ${
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-400/70 dark:ring-emerald-600/70"
                              : "bg-gray-50 dark:bg-zinc-800/60 hover:bg-gray-100 dark:hover:bg-zinc-700/70 ring-1 ring-transparent hover:ring-gray-200 dark:hover:ring-zinc-600"
                          }`}
                        >
                          {/* Large avatar circle */}
                          <div className="relative">
                            <div
                              className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-md transition-transform group-hover:scale-105 ${
                                isActive
                                  ? "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-300/40 dark:shadow-emerald-900/60"
                                  : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200/40 dark:shadow-teal-900/40"
                              }`}
                            >
                              🎙️
                            </div>

                            {/* Play/stop overlay button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onPlayHistoryVoice(hv.anonymous_voice_id);
                              }}
                              className={`absolute inset-0 rounded-full flex items-center justify-center transition-all ${
                                isPlayingThis
                                  ? "bg-black/40 opacity-100"
                                  : "bg-black/0 opacity-0 group-hover:bg-black/30 group-hover:opacity-100"
                              }`}
                              aria-label={
                                isPlayingThis
                                  ? t("playground.voiceSection.stopPreview")
                                  : t("playground.voiceSection.playPreview")
                              }
                            >
                              {isPlayingThis ? (
                                <StopIcon className="w-5 h-5 text-white drop-shadow" />
                              ) : (
                                <PlayIcon className="w-5 h-5 ml-0.5 text-white drop-shadow" />
                              )}
                            </button>

                            {/* Playing pulse ring */}
                            {isPlayingThis && (
                              <span className="absolute inset-0 rounded-full ring-2 ring-indigo-400 animate-ping opacity-40 pointer-events-none" />
                            )}

                            {/* Active checkmark badge */}
                            {isActive && (
                              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                                <CheckIcon className="w-3 h-3 text-white" />
                              </span>
                            )}
                          </div>

                          {/* Voice name */}
                          <div className="text-center min-w-0 w-full">
                            <p
                              className={`text-[11px] font-bold truncate leading-tight ${
                                isActive
                                  ? "text-emerald-700 dark:text-emerald-300"
                                  : "text-gray-800 dark:text-white"
                              }`}
                            >
                              #{hv.anonymous_voice_id}
                            </p>
                            {durationStr && (
                              <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">
                                {durationStr}
                              </p>
                            )}
                          </div>

                          {/* Delete button (top-left, revealed on hover) */}
                          {onDeleteHistoryVoice && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  confirm(
                                    t("playground.voiceSection.deleteConfirm").replace(
                                      "{id}",
                                      String(hv.anonymous_voice_id)
                                    )
                                  )
                                ) {
                                  onDeleteHistoryVoice(hv.anonymous_voice_id);
                                }
                              }}
                              className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                              aria-label={t("playground.voiceSection.deleteRecording")}
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
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
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* ── Sticky Footer: Use This Voice CTA ─────────────────── */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={!canConfirm}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-200 ${
              canConfirm
                ? "bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white"
                : "bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 cursor-not-allowed"
            }`}
          >
            {isProcessing ? "Processing…" : "Use This Voice"}
          </button>
        </div>
      </div>
    </div>
  );
}
