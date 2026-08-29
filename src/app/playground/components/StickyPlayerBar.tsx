"use client";

import React from "react";
import { useI18n } from "@/i18n";
import { SpeakerIcon } from "./icons";
import { formatTime } from "./types";

interface StickyPlayerBarProps {
  isVisible: boolean;
  title: string;
  subtitle?: string;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number | null;
  onTogglePlayback?: () => void;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  onClose?: () => void;
}

export function StickyPlayerBar({
  isVisible,
  title,
  subtitle,
  isPlaying,
  progress,
  currentTime,
  duration,
  onSeek,
  onClose,
}: StickyPlayerBarProps) {
  const { t } = useI18n();

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[110] animate-in slide-in-from-bottom-full duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 sm:pb-4 pt-1">
        <div className="glass-panel shadow-xl rounded-2xl p-3 sm:px-5 sm:py-3.5 flex flex-col gap-2 relative border border-gray-200/80 dark:border-zinc-700/80 backdrop-blur-xl bg-white/90 dark:bg-zinc-900/90">
          {/* Header Row: Title, Subtitle, Time & Close */}
          <div className="flex items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isPlaying
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400"
                }`}
              >
                <SpeakerIcon className={`w-3.5 h-3.5 ${isPlaying ? "animate-pulse" : ""}`} />
              </div>
              <div className="truncate min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate leading-tight">
                  {title}
                </h4>
                {subtitle && (
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate leading-tight mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="text-[11px] sm:text-xs font-mono font-medium text-gray-500 dark:text-zinc-400">
                {formatTime(Math.floor(currentTime))} / {formatTime(Math.floor(duration || 0))}
              </div>

              {/* Close Button */}
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label={t("playground.player.close")}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Scrubber Bar */}
          <div
            className="group h-2 sm:h-2.5 bg-gray-100 dark:bg-zinc-800 rounded-full cursor-pointer overflow-hidden flex items-center shadow-inner relative"
            onClick={onSeek}
          >
            <div
              className="absolute left-0 top-0 bottom-0 bg-indigo-500 rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  );
}
