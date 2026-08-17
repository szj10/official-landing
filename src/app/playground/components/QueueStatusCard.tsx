"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/i18n";

interface QueueStatusCardProps {
  lastQueueMetrics: {
    position: number;
    jobsAhead: number;
    queueDepth: number;
    estimatedWaitSeconds: number;
  } | null;
  isCompleted?: boolean;
  onDismiss?: () => void;
}

export function QueueStatusCard({
  lastQueueMetrics,
  isCompleted = false,
  onDismiss,
}: QueueStatusCardProps) {
  const { t } = useI18n();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isCompleted && onDismiss) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 300);
  };

  // Show success state when completed
  if (isCompleted) {
    return (
      <div
        className={`transition-all duration-300 ease-in-out transform origin-top ${
          isExiting
            ? "opacity-0 scale-95 -translate-y-4"
            : "opacity-100 scale-100 animate-fade-in-up"
        }`}
      >
        <div className="glass-panel relative overflow-hidden rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,255,128,0.1)] border border-green-500/30 p-5 sm:p-6 bg-gradient-to-br from-green-50/80 to-emerald-50/50 dark:from-green-950/40 dark:to-emerald-900/20 backdrop-blur-md">
          {/* Animated background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-400/20 dark:bg-green-500/10 rounded-full blur-3xl animate-pulse" />

          <div className="space-y-4 relative z-10">
            {/* Success Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30 text-white transform hover:scale-105 transition-transform">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      className="animate-[dash_1s_ease-in-out_forwards]"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      strokeDasharray="50"
                      strokeDashoffset="0"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300">
                    Synthesize Completed
                  </h3>
                  <p className="text-sm font-medium text-green-700/80 dark:text-green-400/80 mt-0.5">
                    Your audio has been generated successfully
                  </p>
                </div>
              </div>
              {onDismiss && (
                <button
                  onClick={handleDismiss}
                  className="p-2 -mr-2 -mt-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  aria-label="Dismiss"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

            {/* Success Animation */}
            <div className="flex items-center gap-2 mt-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
              <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                Ready to play
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
