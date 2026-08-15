"use client";

import React from "react";
import { useI18n } from "@/i18n";
import { SpeakerIcon } from "./icons";

interface BottomActionBarProps {
  speed: "slow" | "normal" | "fast";
  isGenerating: boolean;
  uploadStatus: "idle" | "uploading" | "success" | "error";
  canGenerate: boolean;
  onSetSpeed: (speed: "slow" | "normal" | "fast") => void;
  onGenerate: () => void;
}

export function BottomActionBar({
  speed,
  isGenerating,
  uploadStatus,
  canGenerate,
  onSetSpeed,
  onGenerate,
}: BottomActionBarProps) {
  const { t } = useI18n();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3.5 sm:p-5 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border-t border-gray-200/60 dark:border-zinc-800/60 shadow-[0_-10px_40px_rgba(0,0,0,0.06)]">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* Speed Selector */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
            {t("playground.speedSection.title")}
          </span>
          <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-full p-1 border border-gray-200/50 dark:border-zinc-700/50">
            {(["slow", "normal", "fast"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSetSpeed(s)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-colors ${
                  speed === s
                    ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
                }`}
              >
                {t(`playground.speedSection.${s}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Action Button */}
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || uploadStatus === "uploading" || !canGenerate}
          className="flex-1 sm:flex-none bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-2xl transition-all font-bold text-xs sm:text-base shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-95 flex items-center justify-center gap-2"
        >
          {uploadStatus === "uploading" ? (
            <svg className="animate-spin w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <SpeakerIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
          <span>
            {uploadStatus === "uploading"
              ? t("playground.voiceSection.uploading")
              : isGenerating
                ? "Synthesizing..."
                : t("playground.preview.generate")}
          </span>
        </button>
      </div>
    </div>
  );
}
