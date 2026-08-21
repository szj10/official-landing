"use client";

import React from "react";
import { useI18n } from "@/i18n";
import { PlayIcon, PauseIcon } from "./icons";
import { formatTime } from "./types";

interface StickyPlayerBarProps {
  isVisible: boolean;
  title: string;
  subtitle?: string;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number | null;
  onTogglePlayback: () => void;
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
  onTogglePlayback,
  onSeek,
  onClose,
}: StickyPlayerBarProps) {
  const { t } = useI18n();

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[110] animate-in slide-in-from-bottom-full duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 pt-2">
        <div className="glass-panel shadow-2xl rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative">
          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
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

          {/* Play/Pause Button */}
          <button
            onClick={onTogglePlayback}
            className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
            aria-label={isPlaying ? t("playground.player.pause") : t("playground.player.play")}
          >
            {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6 ml-1" />}
          </button>

          {/* Info and Scrubber */}
          <div className="flex-1 w-full min-w-0">
            <div className="flex justify-between items-end mb-2">
              <div className="truncate pr-4">
                <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
                  {title}
                </h4>
                {subtitle && (
                  <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">{subtitle}</p>
                )}
              </div>
              <div className="text-xs font-mono font-medium text-gray-500 dark:text-zinc-400 shrink-0">
                {formatTime(Math.floor(currentTime))} / {formatTime(Math.floor(duration || 0))}
              </div>
            </div>

            <div
              className="group h-3 sm:h-4 bg-gray-100 dark:bg-zinc-800 rounded-full cursor-pointer overflow-hidden flex items-center shadow-inner relative"
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
    </div>
  );
}
