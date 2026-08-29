"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/i18n";
import { locales, localeNames, type Locale } from "@/i18n/config";
import type { PlaygroundVoice } from "../voices.config";

interface PlaygroundHeaderControlsProps {
  stockVoices: PlaygroundVoice[];
  stockVoicesLoading: boolean;
  selectedVoice: string | null;
  activeVoicePanel: "stock" | "custom";
  anonymousVoiceId: number | null;
  playingVoicePreview: string | null;
  playingHistoryVoiceId: number | null;
  isRecPlaying: boolean;
  onSelectVoice: (id: string) => void;
  onPreviewVoice: (id: string) => void;
  onPlayHistoryVoice: (id: number) => void;
  onOpenVoiceModal: () => void;
}

export function PlaygroundHeaderControls({
  stockVoices,
  stockVoicesLoading,
  selectedVoice,
  activeVoicePanel,
  anonymousVoiceId,
  playingVoicePreview,
  playingHistoryVoiceId,
  isRecPlaying,
  onSelectVoice,
  onPreviewVoice,
  onPlayHistoryVoice,
  onOpenVoiceModal,
}: PlaygroundHeaderControlsProps) {
  const { locale, setLocale, t } = useI18n();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const voiceRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
      if (voiceRef.current && !voiceRef.current.contains(event.target as Node)) {
        setIsVoiceOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = localeNames[locale as Locale] || { name: "English", flag: "🇺🇸" };

  // Current active voice details
  const currentStockVoice = stockVoices.find((v) => v.id === selectedVoice) || stockVoices[0];
  const isCustomActive = activeVoicePanel === "custom" && anonymousVoiceId !== null;

  const currentVoiceName = isCustomActive
    ? t("playground.voicePromptLabel").replace("{id}", String(anonymousVoiceId))
    : currentStockVoice?.nameKey
      ? t(currentStockVoice.nameKey)
      : currentStockVoice?.name || "Voice";

  const isCurrentVoicePreviewing = isCustomActive
    ? playingHistoryVoiceId === anonymousVoiceId && isRecPlaying
    : currentStockVoice
      ? playingVoicePreview === currentStockVoice.id
      : false;

  const handleCurrentVoicePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCustomActive && anonymousVoiceId !== null) {
      onPlayHistoryVoice(anonymousVoiceId);
    } else if (currentStockVoice) {
      onPreviewVoice(currentStockVoice.id);
    }
  };

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      {/* Language Selector Pill */}
      <div className="relative" ref={langRef}>
        <button
          type="button"
          onClick={() => {
            setIsLangOpen(!isLangOpen);
            setIsVoiceOpen(false);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800/90 border border-gray-200/90 dark:border-zinc-700/80 text-xs font-semibold text-gray-800 dark:text-zinc-200 shadow-xs hover:bg-gray-50 dark:hover:bg-zinc-700/80 active:scale-95 transition-all"
          aria-expanded={isLangOpen}
          aria-label="Select Language"
        >
          <span className="text-sm leading-none">{currentLang.flag}</span>
          <span className="leading-none">{currentLang.name}</span>
          <svg
            className={`w-3 h-3 text-gray-400 dark:text-zinc-400 transition-transform duration-200 ${
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
          <div className="absolute left-0 mt-1.5 w-44 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
            <div className="max-h-56 overflow-y-auto space-y-0.5 scrollbar-thin">
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

      {/* Voice Selector Pill */}
      <div className="relative" ref={voiceRef}>
        <button
          type="button"
          onClick={() => {
            setIsVoiceOpen(!isVoiceOpen);
            setIsLangOpen(false);
          }}
          className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white dark:bg-zinc-800/90 border border-gray-200/90 dark:border-zinc-700/80 text-xs font-semibold text-gray-800 dark:text-zinc-200 shadow-xs hover:bg-gray-50 dark:hover:bg-zinc-700/80 active:scale-95 transition-all"
          aria-expanded={isVoiceOpen}
          aria-label="Select Voice"
        >
          {/* Avatar circle / gradient */}
          <div
            className={`w-5 h-5 rounded-full ${
              isCustomActive
                ? "bg-gradient-to-tr from-emerald-500 to-teal-600"
                : `bg-gradient-to-tr ${currentStockVoice?.color || "from-amber-400 to-orange-500"}`
            } flex items-center justify-center text-[10px] font-black text-white overflow-hidden shrink-0 shadow-xs`}
          >
            {isCustomActive ? "🎙️" : currentStockVoice?.avatar || "V"}
          </div>

          <span className="truncate max-w-[110px]">{currentVoiceName}</span>

          {/* Inline mini preview play/pause icon */}
          <button
            type="button"
            onClick={handleCurrentVoicePreview}
            className={`p-0.5 rounded-full hover:bg-gray-200/60 dark:hover:bg-zinc-700 transition-colors ${
              isCurrentVoicePreviewing
                ? "text-indigo-600 dark:text-indigo-400 animate-pulse"
                : "text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200"
            }`}
            title="Preview voice"
          >
            {isCurrentVoicePreviewing ? (
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <svg
            className={`w-3 h-3 text-gray-400 dark:text-zinc-400 transition-transform duration-200 ${
              isVoiceOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Voice Dropdown Menu */}
        {isVoiceOpen && (
          <div className="absolute left-0 sm:left-auto sm:right-0 mt-1.5 w-64 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 px-2.5 py-1">
              {t("playground.chooseVoice")}
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-thin my-1">
              {stockVoicesLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 animate-pulse"
                    />
                  ))
                : stockVoices.map((v) => {
                    const isSelected = activeVoicePanel === "stock" && selectedVoice === v.id;
                    const isPreviewing = playingVoicePreview === v.id;
                    const name = v.nameKey ? t(v.nameKey) : v.name;

                    return (
                      <div
                        key={v.id}
                        onClick={() => {
                          onSelectVoice(v.id);
                          setIsVoiceOpen(false);
                        }}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60"
                            : "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-full bg-gradient-to-tr ${v.color} flex items-center justify-center text-[10px] font-black text-white shrink-0`}
                          >
                            {v.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold leading-tight">{name}</p>
                            {v.creatorUsername && (
                              <p className="text-[10px] text-gray-400 dark:text-zinc-500 truncate">
                                @{v.creatorUsername}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreviewVoice(v.id);
                          }}
                          className="p-1 rounded-lg hover:bg-gray-200/60 dark:hover:bg-zinc-700 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0 transition-colors"
                          title="Preview voice audio"
                        >
                          {isPreviewing ? (
                            <svg
                              className="w-3.5 h-3.5 fill-current text-indigo-600 dark:text-indigo-400 animate-pulse"
                              viewBox="0 0 24 24"
                            >
                              <rect x="6" y="4" width="4" height="16" rx="1" />
                              <rect x="14" y="4" width="4" height="16" rx="1" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    );
                  })}
            </div>

            {/* Modal opener button */}
            <div className="pt-1 border-t border-gray-100 dark:border-zinc-800/80 mt-1">
              <button
                type="button"
                onClick={() => {
                  setIsVoiceOpen(false);
                  onOpenVoiceModal();
                }}
                className="w-full py-2 px-3 rounded-xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>+ All Voices & Clone</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
