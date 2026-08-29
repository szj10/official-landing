"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/i18n";
import type { TTSJobStatus } from "./types";

interface QueueStatusCardProps {
  lastQueueMetrics: {
    position: number;
    jobsAhead: number;
    queueDepth: number;
    estimatedWaitSeconds: number;
  } | null;
  generationStatus: TTSJobStatus | null;
  isGenerating: boolean;
  isCompleted?: boolean;
  onDismissCompleted?: () => void;
}

function AnimatedWaveform({ color = "indigo" }: { color?: "emerald" | "indigo" }) {
  const bars = [3, 6, 9, 5, 10, 7, 4, 8, 5, 3];
  const colorClass =
    color === "emerald" ? "bg-emerald-500 dark:bg-emerald-400" : "bg-indigo-500 dark:bg-indigo-400";

  return (
    <div className="flex items-end gap-0.5 h-4" aria-hidden="true">
      {bars.map((h, i) => (
        <div
          key={i}
          className={`w-[2.5px] rounded-full ${colorClass}`}
          style={{
            height: `${h * 1.5}px`,
            animationName: "qscWaveBar",
            animationDuration: "0.85s",
            animationDelay: `${i * 0.08}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDirection: "alternate",
          }}
        />
      ))}
    </div>
  );
}

export function QueueStatusCard({
  lastQueueMetrics,
  generationStatus,
  isGenerating,
  isCompleted = false,
  onDismissCompleted,
}: QueueStatusCardProps) {
  const { t } = useI18n();

  // If not generating and not showing completion card, do not render anything
  if (!isGenerating && !isCompleted) return null;

  // 1. Completed State
  if (isCompleted) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 sm:p-4 text-emerald-900 dark:text-emerald-200 shadow-xs animate-fade-in-up">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path
                  d="M5 13l4 4L19 7"
                  style={{
                    strokeDasharray: 30,
                    animationName: "qscCheckDraw",
                    animationDuration: "0.45s",
                    animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                    animationFillMode: "forwards",
                  }}
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-tight">
                {t("playground.queue.completedTitle")}
              </p>
              <p className="text-[11px] sm:text-xs text-emerald-700 dark:text-emerald-400 font-medium truncate mt-0.5">
                {t("playground.queue.nowPlayingBelow")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <AnimatedWaveform color="emerald" />
            {onDismissCompleted && (
              <button
                type="button"
                onClick={onDismissCompleted}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-700/70 dark:text-emerald-400/70 hover:bg-emerald-200/50 dark:hover:bg-emerald-900/50 transition-colors"
                aria-label={t("playground.queue.dismiss")}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <style>{`
          @keyframes qscCheckDraw {
            from { stroke-dashoffset: 30; }
            to   { stroke-dashoffset: 0; }
          }
          @keyframes qscWaveBar {
            from { transform: scaleY(0.35); }
            to   { transform: scaleY(1); }
          }
        `}</style>
      </div>
    );
  }

  // 2. Processing State (actively rendering audio on worker)
  if (generationStatus === "processing") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 bg-indigo-50/70 dark:bg-indigo-950/30 p-3.5 sm:p-4 text-indigo-950 dark:text-indigo-100 shadow-xs animate-fade-in-up">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-tight">
                {t("playground.status.processing")}
              </p>
              <p className="text-[11px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                {t("playground.preview.synthesizing")}
              </p>
            </div>
          </div>

          <AnimatedWaveform color="indigo" />
        </div>

        {/* Indeterminate pulsing progress bar */}
        <div className="h-1.5 w-full rounded-full bg-indigo-100 dark:bg-indigo-900/50 overflow-hidden mt-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
            style={{
              width: "60%",
              animationName: "qscIndeterminate",
              animationDuration: "1.5s",
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
            }}
          />
        </div>

        <style>{`
          @keyframes qscWaveBar {
            from { transform: scaleY(0.35); }
            to   { transform: scaleY(1); }
          }
          @keyframes qscIndeterminate {
            0%   { transform: translateX(-100%); width: 30%; }
            50%  { width: 60%; }
            100% { transform: translateX(250%); width: 30%; }
          }
        `}</style>
      </div>
    );
  }

  // 3. Queued State (with live metrics if available)
  const hasMetrics = !!lastQueueMetrics;
  const pos = lastQueueMetrics?.position ?? 1;
  const depth = lastQueueMetrics?.queueDepth ?? 1;
  const wait = lastQueueMetrics?.estimatedWaitSeconds ?? 0;
  const progressPct = Math.max(8, Math.round(((depth - pos + 1) / Math.max(depth, 1)) * 100));

  const waitLabel = (() => {
    if (wait < 60) return `~${wait}s`;
    if (wait < 3600) return `~${Math.round(wait / 60)}m`;
    return `~${Math.round(wait / 3600)}h`;
  })();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 bg-indigo-50/70 dark:bg-indigo-950/30 p-3.5 sm:p-4 text-indigo-950 dark:text-indigo-100 shadow-xs animate-fade-in-up space-y-2.5">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xs">
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              style={{ animationDuration: "1.5s" }}
            >
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
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-tight">
                {t("playground.queue.title")}
              </p>
              {hasMetrics && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-200/70 dark:bg-indigo-800/60 text-indigo-700 dark:text-indigo-300">
                  {pos === 1
                    ? t("playground.queue.nextInLine")
                    : `${t("playground.queue.position")} ${pos}/${depth}`}
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate mt-0.5">
              {hasMetrics
                ? pos === 1
                  ? t("playground.queue.nextInLine")
                  : t("playground.queue.inProgress")
                : t("playground.status.queued")}
            </p>
          </div>
        </div>

        {/* ETA & Waveform */}
        <div className="flex items-center gap-3 shrink-0">
          {hasMetrics && wait > 0 && (
            <div className="text-right">
              <span className="text-xs sm:text-sm font-bold text-indigo-900 dark:text-indigo-100 tabular-nums">
                {waitLabel}
              </span>
              <span className="block text-[9px] uppercase font-semibold text-indigo-600/70 dark:text-indigo-400/70 tracking-wider">
                {t("playground.queue.estimatedWait")}
              </span>
            </div>
          )}
          <AnimatedWaveform color="indigo" />
        </div>
      </div>

      {/* Progress Rail */}
      {hasMetrics && (
        <div className="space-y-1 pt-0.5">
          <div className="h-1.5 w-full rounded-full bg-indigo-200/60 dark:bg-indigo-900/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes qscWaveBar {
          from { transform: scaleY(0.35); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
