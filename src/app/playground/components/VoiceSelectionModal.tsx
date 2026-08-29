"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useI18n } from "@/i18n";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { PlaygroundVoice } from "../voices.config";
import { VoiceRecorder } from "./VoiceRecorder";
import { HistoryVoice, formatTime, formatRelativeTime } from "./types";
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
  const { locale, setLocale, t } = useI18n();
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [isCommunityCollapsed, setIsCommunityCollapsed] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const yourVoiceRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

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

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsCommunityCollapsed(false);
      setIsLangOpen(false);
    }
  }, [isOpen]);

  // Click outside to close language dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const currentLang = localeNames[locale as Locale] || { name: "English", flag: "🇺🇸" };

  // CTA gate
  const hasSampleVoice = selectedVoice && activeVoicePanel === "stock";
  const hasCustomVoice =
    anonymousVoiceId !== null && activeVoicePanel === "custom" && uploadStatus === "success";
  const isProcessing = isRecording || uploadStatus === "uploading";
  const canConfirm = !!(hasSampleVoice || hasCustomVoice) && !isProcessing;

  const visibleHistory = showAllHistory ? historyVoices : historyVoices.slice(0, 5);

  // Wrap onStartRecording to collapse community section and scroll to record area
  const handleStartRecording = () => {
    setIsCommunityCollapsed(true);
    setTimeout(() => {
      yourVoiceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 180);
    onStartRecording();
  };

  // When user expands community voices, reset recording section to "Tap to record"
  const handleExpandCommunity = () => {
    setIsCommunityCollapsed(false);
    onResetRecording();
  };

  const handleToggleCommunity = () => {
    if (isCommunityCollapsed) {
      handleExpandCommunity();
    } else {
      setIsCommunityCollapsed(true);
    }
  };

  return (
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
        {/* Drag handle - mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-zinc-600" />
        </div>

        {/* Sticky Header */}
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

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="px-5 py-5 space-y-6">
            {/* Section 1: Community Voices (collapsible with language selector) */}
            <section>
              {/* Header with toggle and Language Selector */}
              <div className="flex items-center justify-between mb-3 gap-2">
                <button
                  type="button"
                  onClick={handleToggleCommunity}
                  className="flex items-center gap-1.5 group cursor-pointer"
                  aria-expanded={!isCommunityCollapsed}
                >
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 group-hover:text-gray-600 dark:group-hover:text-zinc-300 transition-colors flex items-center gap-1.5">
                    Community Voices
                    {stockVoices.length > 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-500 dark:text-indigo-400">
                        {stockVoices.length}
                      </span>
                    )}
                  </h3>
                  <svg
                    className={`w-3.5 h-3.5 text-gray-400 dark:text-zinc-500 transition-transform duration-200 ${isCommunityCollapsed ? "-rotate-90" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Language Selector */}
                <div className="relative" ref={langRef}>
                  <button
                    type="button"
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 dark:bg-zinc-800/90 border border-gray-200/90 dark:border-zinc-700/80 text-[11px] font-semibold text-gray-700 dark:text-zinc-300 shadow-xs hover:bg-gray-100 dark:hover:bg-zinc-700/80 active:scale-95 transition-all shrink-0"
                    aria-expanded={isLangOpen}
                    aria-label="Select Language"
                  >
                    <span className="text-xs leading-none">{currentLang.flag}</span>
                    <span className="leading-none">{currentLang.name}</span>
                    <svg
                      className={`w-2.5 h-2.5 text-gray-400 dark:text-zinc-400 transition-transform duration-200 ${
                        isLangOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Language Dropdown Menu */}
                  {isLangOpen && (
                    <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                      <div className="max-h-52 overflow-y-auto space-y-0.5 scrollbar-thin">
                        {locales.map((loc) => {
                          const info = localeNames[loc];
                          const isSelected = locale === loc;
                          return (
                            <button
                              key={loc}
                              type="button"
                              onClick={() => {
                                setLocale(loc);
                                setIsLangOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                isSelected
                                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                                  : "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{info.flag}</span>
                                <span>{info.name}</span>
                              </div>
                              {isSelected && (
                                <svg
                                  className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Community Grid */}
              {!isCommunityCollapsed && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  {stockVoices.length === 0 ? (
                    <div className="grid grid-cols-3 gap-2.5">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gray-100 dark:bg-zinc-800 animate-pulse"
                        >
                          <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-zinc-700" />
                          <div className="w-12 h-2.5 rounded bg-gray-200 dark:bg-zinc-700" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2.5">
                      {stockVoices.map((voice) => {
                        const isSelected =
                          selectedVoice === voice.id && activeVoicePanel === "stock";
                        const isPreviewing = playingVoicePreview === voice.id;
                        const displayName = voice.nameKey ? t(voice.nameKey) : voice.name;

                        return (
                          <div
                            key={voice.id}
                            onClick={() => onVoiceSelectAndPlay(voice.id)}
                            className={`relative group flex flex-col items-center gap-2 p-3 rounded-2xl cursor-pointer transition-all select-none ${
                              isSelected
                                ? "bg-indigo-50 dark:bg-indigo-950/40 ring-2 ring-indigo-400/70 dark:ring-indigo-600/70"
                                : "bg-gray-50 dark:bg-zinc-800/60 hover:bg-gray-100 dark:hover:bg-zinc-700/70 ring-1 ring-transparent hover:ring-gray-200 dark:hover:ring-zinc-600"
                            }`}
                          >
                            {/* Large avatar circle */}
                            <div className="relative">
                              <div
                                className={`w-14 h-14 rounded-full bg-gradient-to-br ${voice.color} flex items-center justify-center text-white font-black text-xl shadow-md transition-transform group-hover:scale-105 overflow-hidden`}
                              >
                                {voice.avatarUrl ? (
                                  <Image
                                    src={voice.avatarUrl}
                                    alt={displayName}
                                    width={56}
                                    height={56}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  voice.avatar
                                )}
                              </div>

                              {/* Play/stop overlay */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onVoiceSelectAndPlay(voice.id);
                                }}
                                className={`absolute inset-0 rounded-full flex items-center justify-center transition-all ${
                                  isPreviewing
                                    ? "bg-black/40 opacity-100"
                                    : "bg-black/0 opacity-0 group-hover:bg-black/30 group-hover:opacity-100"
                                }`}
                                aria-label={
                                  isPreviewing
                                    ? t("playground.voiceSection.stopPreview")
                                    : t("playground.voiceSection.playPreview")
                                }
                              >
                                {isPreviewing ? (
                                  <StopIcon className="w-5 h-5 text-white drop-shadow" />
                                ) : (
                                  <PlayIcon className="w-5 h-5 ml-0.5 text-white drop-shadow" />
                                )}
                              </button>

                              {/* Playing pulse ring */}
                              {isPreviewing && (
                                <span className="absolute inset-0 rounded-full ring-2 ring-indigo-400 animate-ping opacity-40 pointer-events-none" />
                              )}

                              {/* Active checkmark badge */}
                              {isSelected && (
                                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shadow-sm">
                                  <CheckIcon className="w-3 h-3 text-white" />
                                </span>
                              )}
                            </div>

                            {/* Name + creator */}
                            <div className="text-center min-w-0 w-full">
                              <p
                                className={`text-[11px] font-bold truncate leading-tight ${isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-gray-800 dark:text-white"}`}
                              >
                                {displayName}
                              </p>
                              {voice.creatorUsername && (
                                <p className="text-[10px] text-gray-400 dark:text-zinc-500 truncate mt-0.5">
                                  @{voice.creatorUsername}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Collapsed summary strip */}
              {isCommunityCollapsed && (
                <button
                  type="button"
                  onClick={handleExpandCommunity}
                  className="w-full flex items-center gap-2 py-2 px-3 rounded-xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-xs text-gray-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors animate-in fade-in duration-150"
                >
                  <svg
                    className="w-3.5 h-3.5 shrink-0 -rotate-90"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="font-semibold">
                    Show community voices ({stockVoices.length})
                  </span>
                  {selectedVoice &&
                    activeVoicePanel === "stock" &&
                    (() => {
                      const sv = stockVoices.find((v) => v.id === selectedVoice);
                      return sv ? (
                        <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold shrink-0">
                          <CheckIcon className="w-2.5 h-2.5" />
                          {sv.nameKey ? t(sv.nameKey) : sv.name}
                        </span>
                      ) : null;
                    })()}
                </button>
              )}
            </section>

            {/* Divider */}
            <div className="border-t border-dashed border-gray-200 dark:border-zinc-800" />

            {/* Section 2: Your Voice */}
            <section ref={yourVoiceRef}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-3 flex items-center gap-1.5">
                <MicIcon className="w-3 h-3" />
                Your Voice
              </h3>

              {/* VoiceRecorder: wraps onStartRecording to collapse community section */}
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
                onStartRecording={handleStartRecording}
                onStopRecording={onStopRecording}
                onResetRecording={onResetRecording}
                onToggleRecordingPlayback={onToggleRecordingPlayback}
              />

              {/* ── Reverted Custom Voice History List ──────────────────── */}
              {historyVoices.length > 0 && (
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-semibold text-gray-400 dark:text-zinc-500 flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      Previously recorded &middot; saved 24h
                    </span>
                    {historyVoices.length > 5 && (
                      <button
                        type="button"
                        onClick={() => setShowAllHistory((p) => !p)}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2 shrink-0"
                      >
                        {showAllHistory ? "Show less" : `Show all ${historyVoices.length}`}
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {visibleHistory.map((hv) => {
                      const isActive =
                        anonymousVoiceId === hv.anonymous_voice_id && activeVoicePanel === "custom";
                      const isPlayingThis = playingHistoryVoiceId === hv.anonymous_voice_id;
                      const durationStr = hv.audio_duration
                        ? formatTime(Math.round(hv.audio_duration))
                        : "—";
                      const relTime = hv.created_at ? formatRelativeTime(hv.created_at, t) : "";

                      return (
                        <div
                          key={hv.anonymous_voice_id}
                          onClick={() => {
                            onPlayHistoryVoice(hv.anonymous_voice_id);
                            onSelectHistoryVoice(hv);
                          }}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition-all ${
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-950/30 ring-1 ring-inset ring-emerald-400/60 dark:ring-emerald-600/60"
                              : "hover:bg-gray-50 dark:hover:bg-zinc-800/70"
                          }`}
                        >
                          {/* Play/stop button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayHistoryVoice(hv.anonymous_voice_id);
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                              isPlayingThis
                                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                                : "bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-600 dark:hover:text-indigo-400"
                            }`}
                            aria-label={
                              isPlayingThis
                                ? t("playground.voiceSection.stopPreview")
                                : t("playground.voiceSection.playPreview")
                            }
                          >
                            {isPlayingThis ? (
                              <StopIcon className="w-3.5 h-3.5" />
                            ) : (
                              <PlayIcon className="w-3.5 h-3.5 ml-0.5" />
                            )}
                          </button>

                          {/* Label */}
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-semibold leading-tight truncate ${
                                isActive
                                  ? "text-emerald-700 dark:text-emerald-300"
                                  : "text-gray-900 dark:text-white"
                              }`}
                            >
                              {t("playground.voicePromptLabel").replace(
                                "{id}",
                                String(hv.anonymous_voice_id)
                              )}
                            </p>
                            <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">
                              {durationStr}
                              {relTime ? ` · ${relTime}` : ""}
                            </p>
                          </div>

                          {/* Selected badge */}
                          {isActive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shrink-0">
                              <CheckIcon className="w-3 h-3" />
                              {t("playground.voiceSection.selected")}
                            </span>
                          )}

                          {/* Delete button */}
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
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                              aria-label={t("playground.voiceSection.deleteRecording")}
                            >
                              <svg
                                className="w-3.5 h-3.5"
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

        {/* Sticky Footer: Use This Voice CTA */}
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
            {isProcessing ? "Processing\u2026" : "Use This Voice"}
          </button>
        </div>
      </div>
    </div>
  );
}
