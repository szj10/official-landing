"use client";

import React from "react";
import { AlertIcon } from "./icons";
import { formatRetryAfter } from "./types";
import { useI18n } from "@/i18n";

interface AlertBannerProps {
  emptyTextWarning: boolean;
  onDismissEmptyTextWarning: () => void;
  generationStatus: string | null;
  rateLimitRetryAfter: number | null;
  errorMessage: string | null;
  isGenerating: boolean;
}

export function AlertBanner({
  emptyTextWarning,
  onDismissEmptyTextWarning,
  generationStatus,
  rateLimitRetryAfter,
  errorMessage,
  isGenerating,
}: AlertBannerProps) {
  const { t } = useI18n();

  const statusLabel = () => {
    switch (generationStatus) {
      case "queued":
        return t("playground.status.queued");
      case "processing":
        return t("playground.status.processing");
      case "completed":
        return t("playground.status.completed");
      case "failed":
        return t("playground.status.failed");
      case "rate_limited":
        return t("playground.status.rateLimited");
      default:
        return "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Empty Text Warning */}
      {emptyTextWarning && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 animate-fade-in-up">
          <AlertIcon className="w-5 h-5 shrink-0" />
          <p className="text-xs sm:text-sm font-medium flex-1">
            {t("playground.emptyTextWarning")}
          </p>
          <button
            type="button"
            onClick={onDismissEmptyTextWarning}
            className="text-amber-500 hover:text-amber-700 p-1"
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
      )}

      {/* Rate Limited Alert */}
      {generationStatus === "rate_limited" && rateLimitRetryAfter !== null && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 animate-fade-in-up">
          <AlertIcon className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">{t("playground.rateLimitTitle")}</p>
            <p className="text-xs mt-0.5">
              {t("playground.rateLimitMessage")} {formatRetryAfter(rateLimitRetryAfter)}
            </p>
          </div>
        </div>
      )}

      {/* Generation Error Alert */}
      {generationStatus === "failed" && errorMessage && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 animate-fade-in-up">
          <AlertIcon className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">{t("playground.errorTitle")}</p>
            <p className="text-xs mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Processing indicator (when in processing state) */}
      {isGenerating && generationStatus === "processing" && (
        <div className="px-6 py-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 flex flex-col items-center justify-center gap-3 animate-fade-in-up">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0ms]" />
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:150ms]" />
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:300ms]" />
          </div>
          <span className="text-xs sm:text-sm text-indigo-700 dark:text-indigo-300 font-bold tracking-wide">
            {statusLabel()}
          </span>
        </div>
      )}
    </div>
  );
}
