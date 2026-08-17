"use client";

import React, { useState, useEffect, useRef } from "react";
import { useI18n } from "@/i18n";
import { ChevronIcon } from "./icons";
import { HistoryTTSJob } from "./types";
import { HistoryJobs } from "./HistoryJobs";

interface QueueStatusCardProps {
  /* ── Queue / Status ── */
  lastQueueMetrics: {
    position: number;
    jobsAhead: number;
    queueDepth: number;
    estimatedWaitSeconds: number;
  } | null;
  isCompleted?: boolean;
  /** True while a TTS job is in-flight (queued/processing) */
  isGenerating?: boolean;
  onDismiss?: () => void;

  /* ── History (merged from HistoryJobs) ── */
  historyJobs: HistoryTTSJob[];
  playingHistoryJobId: number | string | null;
  isPlaying: boolean;
  onPlayHistoryJob: (jobId: string | number, path: string | null) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Small sub-components
// ─────────────────────────────────────────────────────────────────────────────

function AnimatedWaveform({ color = "emerald" }: { color?: "emerald" | "indigo" }) {
  const bars = [3, 5, 8, 6, 10, 7, 4, 9, 6, 3, 7, 5];
  const colorClass =
    color === "emerald"
      ? "bg-emerald-500/70 dark:bg-emerald-400/60"
      : "bg-indigo-500/70 dark:bg-indigo-400/60";
  return (
    <div className="flex items-end gap-[3px] h-5" aria-hidden="true">
      {bars.map((h, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-full ${colorClass}`}
          style={{
            height: `${h * 2}px`,
            animationName: "qscWaveBar",
            animationDuration: "0.9s",
            animationDelay: `${i * 0.07}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDirection: "alternate",
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Queue Waiting State (modernised)
// ─────────────────────────────────────────────────────────────────────────────

function QueueWaitingCard({
  lastQueueMetrics,
  showHistory,
  historyCount,
  onToggleHistory,
}: {
  lastQueueMetrics: QueueStatusCardProps["lastQueueMetrics"];
  showHistory: boolean;
  historyCount: number;
  onToggleHistory: () => void;
}) {
  const { t } = useI18n();
  const hasMetrics = !!lastQueueMetrics;

  const pos = lastQueueMetrics?.position ?? 1;
  const depth = lastQueueMetrics?.queueDepth ?? 1;
  const wait = lastQueueMetrics?.estimatedWaitSeconds ?? 0;
  const progressPct = Math.max(4, Math.round(((depth - pos + 1) / Math.max(depth, 1)) * 100));

  const waitLabel = (() => {
    if (wait < 60) return { value: `~${wait}`, unit: "s" };
    if (wait < 3600) return { value: `~${Math.round(wait / 60)}`, unit: "m" };
    return { value: `~${Math.round(wait / 3600)}`, unit: "h" };
  })();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 dark:border-indigo-500/30 bg-gradient-to-br from-white via-indigo-50/40 to-violet-50/30 dark:from-zinc-900 dark:via-indigo-950/40 dark:to-violet-950/20 shadow-[0_8px_40px_rgba(99,102,241,0.10)] dark:shadow-[0_8px_40px_rgba(99,102,241,0.06)] backdrop-blur-md p-5 sm:p-6">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 bg-indigo-400/10 dark:bg-indigo-500/6 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 w-48 h-48 bg-violet-300/8 dark:bg-violet-500/5 rounded-full blur-2xl" />

      {/* Orbiting rings behind icon */}
      <div className="pointer-events-none absolute top-5 sm:top-6 left-5 sm:left-6">
        <span
          className="absolute inline-flex h-12 w-12 rounded-2xl bg-indigo-400/18 animate-ping"
          style={{ animationDuration: "2s" }}
        />
        <span
          className="absolute inline-flex h-12 w-12 rounded-2xl bg-violet-300/10 animate-ping"
          style={{ animationDuration: "2s", animationDelay: "0.7s" }}
        />
      </div>

      <div className="relative z-10 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          {/* Spinner icon */}
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
            <svg
              className="h-6 w-6 text-white animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              style={{ animationDuration: "1.4s" }}
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
                className="opacity-80"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
              {t("playground.queue.title")}
            </h3>
            <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80 mt-0.5 font-medium">
              {hasMetrics
                ? pos === 1
                  ? t("playground.queue.nextInLine")
                  : t("playground.queue.inProgress")
                : t("playground.status.queued")}
            </p>
          </div>

          {/* ETA chip */}
          {hasMetrics && (
            <div className="shrink-0 flex flex-col items-end">
              <span className="text-2xl font-black text-gray-900 dark:text-white leading-none tabular-nums">
                {waitLabel.value}
                <span className="text-sm font-semibold text-gray-500 dark:text-zinc-400 ml-0.5">
                  {waitLabel.unit}
                </span>
              </span>
              <span className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 mt-0.5 uppercase tracking-wider">
                {t("playground.queue.estimatedWait")}
              </span>
            </div>
          )}
        </div>

        {/* Progress rail */}
        {hasMetrics && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gray-500 dark:text-zinc-400">
                {t("playground.queue.position")}&nbsp;
                <span className="font-bold text-gray-800 dark:text-gray-200">{pos}</span>
                <span className="text-gray-400 dark:text-zinc-600"> / {depth}</span>
              </span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {progressPct}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200/60 dark:bg-zinc-800/80 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Waveform + status dot + history toggle */}
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-3">
            {hasMetrics ? (
              <AnimatedWaveform color="indigo" />
            ) : (
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full bg-indigo-400/60"
                    style={{
                      animationName: "qscDotBounce",
                      animationDuration: "1.2s",
                      animationDelay: `${i * 0.2}s`,
                      animationTimingFunction: "ease-in-out",
                      animationIterationCount: "infinite",
                      animationDirection: "alternate",
                    }}
                  />
                ))}
              </div>
            )}
            <div className="flex items-center gap-1.5 ml-1">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide">
                {hasMetrics ? "In Queue" : "Loading\u2026"}
              </span>
            </div>
          </div>

          {historyCount > 0 && (
            <button
              type="button"
              onClick={onToggleHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-700/30 text-indigo-700 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100/80 dark:hover:bg-indigo-900/30 transition-all duration-200 group"
              aria-expanded={showHistory}
            >
              <svg
                className="w-3.5 h-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              History
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-200/80 dark:bg-indigo-700/50 px-1 text-[10px] font-bold leading-none">
                {historyCount}
              </span>
              <ChevronIcon
                className="w-3.5 h-3.5 transition-transform duration-300"
                open={showHistory}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Success State (no big Play CTA – StickyPlayerBar handles auto-play)
// ─────────────────────────────────────────────────────────────────────────────

function SuccessCard({
  showHistory,
  historyCount,
  onToggleHistory,
  checkVisible,
  onDismiss,
}: {
  showHistory: boolean;
  historyCount: number;
  onToggleHistory: () => void;
  checkVisible: boolean;
  onDismiss?: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/25 dark:border-emerald-400/20 bg-gradient-to-br from-white via-emerald-50/60 to-teal-50/40 dark:from-zinc-900 dark:via-emerald-950/50 dark:to-teal-950/30 shadow-[0_8px_40px_rgba(16,185,129,0.14)] dark:shadow-[0_8px_40px_rgba(16,185,129,0.08)] backdrop-blur-md p-5 sm:p-6">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 bg-emerald-400/15 dark:bg-emerald-500/8 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 w-40 h-40 bg-teal-300/10 dark:bg-teal-500/6 rounded-full blur-2xl" />

      {/* Ripple rings */}
      <div className="pointer-events-none absolute top-5 sm:top-6 left-5 sm:left-6">
        <span
          className="absolute inline-flex h-12 w-12 rounded-2xl bg-emerald-400/20 animate-ping"
          style={{ animationDuration: "1.6s" }}
        />
        <span
          className="absolute inline-flex h-12 w-12 rounded-2xl bg-emerald-300/10 animate-ping"
          style={{ animationDuration: "1.6s", animationDelay: "0.5s" }}
        />
      </div>

      <div className="relative z-10 flex flex-col gap-4">
        {/* Header row */}
        <div className="flex items-center gap-4">
          {/* Animated checkmark */}
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M5 13l4 4L19 7"
                style={{
                  strokeDasharray: 50,
                  strokeDashoffset: checkVisible ? 0 : 50,
                  transition: "stroke-dashoffset 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
              Synthesis Complete
            </h3>
            <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80 mt-0.5 font-medium">
              Now playing in the bar below &#8595;
            </p>
          </div>

          {/* Dismiss button */}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="w-8 h-8 shrink-0 rounded-xl flex items-center justify-center bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/40 dark:border-emerald-700/30 text-emerald-600/70 dark:text-emerald-400/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-200"
              aria-label="Dismiss"
            >
              <svg
                className="w-4 h-4"
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

        {/* Waveform + history toggle */}
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-3">
            <AnimatedWaveform color="emerald" />
          </div>

          {historyCount > 0 && (
            <button
              type="button"
              onClick={onToggleHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-700/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100/80 dark:hover:bg-emerald-900/30 transition-all duration-200 group"
              aria-expanded={showHistory}
            >
              <svg
                className="w-3.5 h-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              History
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-200/80 dark:bg-emerald-700/50 px-1 text-[10px] font-bold leading-none">
                {historyCount}
              </span>
              <ChevronIcon
                className="w-3.5 h-3.5 transition-transform duration-300"
                open={showHistory}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export function QueueStatusCard({
  lastQueueMetrics,
  isCompleted = false,
  isGenerating = false,
  onDismiss,
  historyJobs,
  playingHistoryJobId,
  isPlaying,
  onPlayHistoryJob,
}: QueueStatusCardProps) {
  const [checkVisible, setCheckVisible] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const prevGeneratingRef = useRef(false);
  const prevCompletedRef = useRef(false);
  const [successDismissed, setSuccessDismissed] = useState(false);

  /* Animate checkmark when completion first triggers */
  useEffect(() => {
    if (isCompleted && !prevCompletedRef.current) {
      prevCompletedRef.current = true;
      setCheckVisible(false);
      setSuccessDismissed(false);
      const timer = setTimeout(() => {
        setCheckVisible(true);
      }, 150);
      return () => clearTimeout(timer);
    }
    if (!isCompleted) {
      prevCompletedRef.current = false;
    }
  }, [isCompleted]);

  /* Collapse history whenever a new generation starts */
  useEffect(() => {
    if (isGenerating && !prevGeneratingRef.current) {
      setShowHistory(false);
    }
    prevGeneratingRef.current = isGenerating;
  }, [isGenerating]);

  const isIdle = !isGenerating && !isCompleted;
  const showSuccessCard = isCompleted && !successDismissed;
  const showStandaloneHistory =
    (isIdle || (isCompleted && successDismissed)) && historyJobs.length > 0;

  /* Nothing to render at all */
  if (isIdle && historyJobs.length === 0) return null;

  const handleDismissSuccess = () => {
    setSuccessDismissed(true);
    if (onDismiss) onDismiss();
  };

  return (
    <div className="animate-fade-in-up space-y-0">
      {/* Active queue waiting card */}
      {isGenerating && !isCompleted && (
        <QueueWaitingCard
          lastQueueMetrics={lastQueueMetrics}
          showHistory={showHistory}
          historyCount={historyJobs.length}
          onToggleHistory={() => setShowHistory((v) => !v)}
        />
      )}

      {/* History list – embedded below waiting card */}
      {isGenerating && !isCompleted && (
        <HistoryJobs
          historyJobs={historyJobs}
          playingHistoryJobId={playingHistoryJobId}
          isPlaying={isPlaying}
          onPlayHistoryJob={onPlayHistoryJob}
          show={showHistory}
          onToggle={() => setShowHistory((v) => !v)}
          showHeader={false}
        />
      )}

      {/* Success card (auto-play by StickyPlayerBar, no Play CTA here) */}
      {showSuccessCard && (
        <SuccessCard
          showHistory={showHistory}
          historyCount={historyJobs.length}
          onToggleHistory={() => setShowHistory((v) => !v)}
          checkVisible={checkVisible}
          onDismiss={handleDismissSuccess}
        />
      )}

      {/* History list – embedded below success card */}
      {showSuccessCard && (
        <HistoryJobs
          historyJobs={historyJobs}
          playingHistoryJobId={playingHistoryJobId}
          isPlaying={isPlaying}
          onPlayHistoryJob={onPlayHistoryJob}
          show={showHistory}
          onToggle={() => setShowHistory((v) => !v)}
          showHeader={false}
        />
      )}

      {/* History list – standalone header when idle or success dismissed */}
      {showStandaloneHistory && (
        <HistoryJobs
          historyJobs={historyJobs}
          playingHistoryJobId={playingHistoryJobId}
          isPlaying={isPlaying}
          onPlayHistoryJob={onPlayHistoryJob}
          show={showHistory}
          onToggle={() => setShowHistory((v) => !v)}
          showHeader={true}
        />
      )}

      {/* Scoped keyframe animations */}
      <style>{`
        @keyframes qscWaveBar {
          from { transform: scaleY(0.35); }
          to   { transform: scaleY(1); }
        }
        @keyframes qscDotBounce {
          from { transform: translateY(0); opacity: 0.5; }
          to   { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
