"use client";

import React from "react";
import { useI18n } from "@/i18n";

interface QueueStatusCardProps {
  lastQueueMetrics: {
    position: number;
    jobsAhead: number;
    queueDepth: number;
    estimatedWaitSeconds: number;
  } | null;
}

export function QueueStatusCard({ lastQueueMetrics }: QueueStatusCardProps) {
  const { t } = useI18n();

  if (!lastQueueMetrics) {
    return (
      <div className="animate-fade-in-up">
        <div className="glass-panel rounded-3xl shadow-lg border border-blue-500/20 dark:border-blue-500/30 p-5 sm:p-6 bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                <svg className="h-5 w-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
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
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("playground.queue.title")}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("playground.status.queued")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Loading queue information...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="glass-panel rounded-3xl shadow-lg border border-blue-500/20 dark:border-blue-500/30 p-5 sm:p-6 bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <svg
                className="h-5 w-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("playground.queue.title")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {lastQueueMetrics.position === 1
                  ? t("playground.queue.nextInLine")
                  : t("playground.queue.inProgress")}
              </p>
            </div>
          </div>

          {/* Queue Metrics */}
          <div className="grid grid-cols-2 gap-4">
            {/* Position */}
            <div className="space-y-1">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {t("playground.queue.position")}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {lastQueueMetrics.position}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  / {lastQueueMetrics.queueDepth}
                </span>
              </div>
            </div>

            {/* Estimated Wait Time */}
            <div className="space-y-1">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {t("playground.queue.estimatedWait")}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(() => {
                    const seconds = lastQueueMetrics.estimatedWaitSeconds;
                    if (seconds < 60) return `~${seconds}`;
                    if (seconds < 3600) return `~${Math.round(seconds / 60)}`;
                    return `~${Math.round(seconds / 3600)}`;
                  })()}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {(() => {
                    const seconds = lastQueueMetrics.estimatedWaitSeconds;
                    if (seconds < 60) return "s";
                    if (seconds < 3600) return "m";
                    return "h";
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
