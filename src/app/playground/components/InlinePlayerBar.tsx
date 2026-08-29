"use client";

import React from "react";
import { useI18n } from "@/i18n";
import { SpeakerIcon } from "./icons";
import { formatTime } from "./types";

interface InlinePlayerBarProps {
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

export function InlinePlayerBar({
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
}: InlinePlayerBarProps) {
  const { t } = useI18n();

  if (!isVisible) return null;

  return (
    <div className="animate-in slide-in-from-bottom-3 fade-in duration-300 mt-1">
      <div className="rounded-2xl border border-gray-200/80 dark:border-zinc-700/60 bg-gray-50/80 dark:bg-zinc-800/60 p-3 sm:px-4 sm:py-3.5 flex flex-col gap-2 backdrop-blur-sm">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Play/Pause button */}
            <button
              type="button"
              onClick={onTogglePlayback}
              disabled={!onTogglePlayback}
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 disabled:opacity-40 ${
                isPlaying
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 hover:bg-indigo-700"
                  : "bg-white dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 border border-gray-200/80 dark:border-zinc-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
              aria-label={isPlaying ? t("playground.player.pause") : t("playground.player.play")}
            >
              {isPlaying ? (
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

            {/* Speaker icon + title */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isPlaying
                    ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"
                    : "bg-gray-200/60 dark:bg-zinc-700/60 text-gray-500 dark:text-zinc-400"
                }`}
              >
                <SpeakerIcon className={`w-3 h-3 ${isPlaying ? "animate-pulse" : ""}`} />
              </div>
              <div className="truncate min-w-0">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate leading-tight">
                  {title}
                </h4>
                {subtitle && (
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate leading-tight mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Time + close */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-[11px] font-mono font-medium text-gray-500 dark:text-zinc-400 tabular-nums">
              {formatTime(Math.floor(currentTime))} / {formatTime(Math.floor(duration || 0))}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded-lg hover:bg-gray-200/60 dark:hover:bg-zinc-700 transition-colors"
                aria-label={t("playground.player.close")}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

        {/* Scrubber */}
        <div
          className="group h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full cursor-pointer overflow-hidden flex items-center shadow-inner relative"
          onClick={onSeek}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="absolute left-0 top-0 bottom-0 bg-indigo-500 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
}
