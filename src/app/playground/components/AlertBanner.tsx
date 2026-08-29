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
  /** When set, failed banner is a recoverable connection/poll issue with Retry. */
  onRetryConnection?: (() => void) | null;
}

export function AlertBanner({
  emptyTextWarning,
  onDismissEmptyTextWarning,
  generationStatus,
  rateLimitRetryAfter,
  errorMessage,
  onRetryConnection = null,
}: AlertBannerProps) {
  const { t } = useI18n();

  const isConnectionError = generationStatus === "failed" && !!errorMessage && !!onRetryConnection;

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
            className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 p-1"
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

      {/* Generation / connection error */}
      {generationStatus === "failed" && errorMessage && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 animate-fade-in-up">
          <AlertIcon className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">
              {isConnectionError
                ? t("playground.connectionErrorTitle")
                : t("playground.errorTitle")}
            </p>
            <p className="text-xs mt-0.5">{errorMessage}</p>
            {isConnectionError && onRetryConnection && (
              <button
                type="button"
                onClick={onRetryConnection}
                className="mt-2.5 text-xs font-semibold underline underline-offset-2 hover:no-underline"
              >
                {t("playground.connectionErrorRetry")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
