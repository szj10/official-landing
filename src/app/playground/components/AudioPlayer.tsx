"use client";

import React, { RefObject } from "react";
import { useI18n } from "@/i18n";
import { PlayIcon, PauseIcon, DownloadIcon } from "./icons";
import { formatTime } from "./types";

interface AudioPlayerProps {
  audioUrl: string;
  isPlaying: boolean;
  audioProgress: number;
  audioCurrentTime: number;
  audioDuration: number | null;
  isCachedResult: boolean;
  audioRef: RefObject<HTMLAudioElement | null>;
  onTogglePlayback: () => void;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDownload: () => void;
  onClose: () => void;
}

export function AudioPlayer({
  audioUrl,
  isPlaying,
  audioProgress,
  audioCurrentTime,
  audioDuration,
  isCachedResult,
  audioRef,
  onTogglePlayback,
  onSeek,
  onDownload,
  onClose,
}: AudioPlayerProps) {
  const { t } = useI18n();

  return (
    <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-5 sm:p-7 shadow-xl text-white overflow-hidden animate-fade-in-up">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 mix-blend-overlay pointer-events-none" />

      {/* Top bar with Download and Close */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          type="button"
          onClick={onDownload}
          title="Download Audio"
          className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors text-white/80 hover:text-white"
          aria-label="Download"
        >
          <DownloadIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onClose}
          title="Dismiss"
          className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors text-white/80 hover:text-white"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 pt-2 sm:pt-0">
        <button
          type="button"
          onClick={onTogglePlayback}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform shrink-0"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <PauseIcon className="w-7 h-7 sm:w-8 sm:h-8" />
          ) : (
            <PlayIcon className="w-7 h-7 sm:w-8 sm:h-8 ml-1" />
          )}
        </button>

        <div className="flex-1 w-full">
          <audio ref={audioRef} src={audioUrl} className="hidden" />
          <div className="flex justify-between items-end mb-2">
            <span className="font-bold text-base sm:text-lg">
              {isPlaying ? t("playground.preview.playing") : t("playground.preview.ready")}
            </span>
            {isCachedResult && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                {t("playground.preview.cached")}
              </span>
            )}
          </div>

          <div
            className="h-3 bg-black/20 rounded-full cursor-pointer overflow-hidden backdrop-blur-sm shadow-inner"
            onClick={onSeek}
          >
            <div
              className="h-full bg-white rounded-full transition-all duration-100"
              style={{ width: `${audioProgress}%` }}
            />
          </div>

          <div className="flex justify-between mt-2 text-xs sm:text-sm font-medium text-white/80 font-mono">
            <span>{formatTime(Math.floor(audioCurrentTime))}</span>
            <span>{audioDuration ? formatTime(Math.floor(audioDuration)) : "0:00"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
