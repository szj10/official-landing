"use client";

import React, { useState, useEffect, useRef } from "react";
import { useI18n } from "@/i18n";
import { SpeakerIcon, PlayIcon, PauseIcon, ChevronIcon } from "./icons";
import { HistoryTTSJob } from "./types";

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
  /** Legacy – kept for API compat; no longer renders a big CTA button */
  onPlayNewJob?: () => void;

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
}: {
  lastQueueMetrics: QueueStatusCardProps["lastQueueMetrics"];
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

        {/* Waveform + status dot */}
        <div className="flex items-center gap-3 px-0.5">
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
}: {
  showHistory: boolean;
  historyCount: number;
  onToggleHistory: () => void;
  checkVisible: boolean;
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
        </div>

        {/* Waveform + history toggle */}
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-3">
            <AnimatedWaveform color="emerald" />
            <div className="flex items-center gap-1.5 ml-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 tracking-wide">
                Playing
              </span>
            </div>
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
// History Job List (inline, collapsible)
// ─────────────────────────────────────────────────────────────────────────────

function HistoryList({
  historyJobs,
  playingHistoryJobId,
  isPlaying,
  onPlayHistoryJob,
  show,
  onToggle,
  showHeader,
}: {
  historyJobs: HistoryTTSJob[];
  playingHistoryJobId: number | string | null;
  isPlaying: boolean;
  onPlayHistoryJob: (jobId: string | number, path: string | null) => void;
  show: boolean;
  onToggle: () => void;
  showHeader: boolean;
}) {
  if (historyJobs.length === 0) return null;

  return (
    <div className={showHeader ? "mt-3" : "mt-3"}>
      {/* Standalone header — only in idle state */}
      {showHeader && (
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50/80 dark:hover:bg-zinc-800/40 transition-all duration-300 group select-none relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border border-indigo-100/50 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-white tracking-wide">
              Recent Synthesized Voices
            </span>
            <span className="flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
              {historyJobs.length}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 dark:bg-zinc-800/50 text-gray-400 group-hover:bg-white dark:group-hover:bg-zinc-700 group-hover:text-indigo-500 group-hover:shadow-sm transition-all duration-300 relative z-10">
            <ChevronIcon className="w-5 h-5 transition-transform duration-300" open={show} />
          </div>
        </button>
      )}

      {show && (
        <div className="space-y-2.5 animate-fade-in-up max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
          {historyJobs.map((job) => {
            const isPlayingThis = playingHistoryJobId === job.playground_job_id && isPlaying;
            return (
              <div
                key={job.playground_job_id}
                className="group relative flex items-center gap-4 p-3.5 rounded-2xl bg-white/60 dark:bg-zinc-900/40 border border-gray-200/60 dark:border-zinc-800/60 backdrop-blur-xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:border-indigo-200/50 dark:hover:border-indigo-500/30 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500" />

                <button
                  type="button"
                  onClick={() => onPlayHistoryJob(job.playground_job_id, job.audio_path)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 relative overflow-hidden ${
                    isPlayingThis
                      ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                      : "bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 text-indigo-600 dark:text-indigo-400 hover:scale-105 shadow-sm"
                  }`}
                  aria-label={isPlayingThis ? "Pause" : "Play"}
                >
                  {isPlayingThis && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
                  )}
                  {isPlayingThis ? (
                    <PauseIcon className="w-5 h-5 relative z-10" />
                  ) : (
                    <PlayIcon className="w-5 h-5 ml-0.5 relative z-10" />
                  )}
                </button>

                <div className="flex-1 min-w-0 relative z-10">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1 group-hover:text-indigo-900 dark:group-hover:text-white transition-colors duration-300">
                    {job.text}
                  </p>
                  <div className="flex items-center gap-2.5 mt-1 text-xs text-gray-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1.5 font-medium px-2 py-0.5 rounded-md bg-gray-100/80 dark:bg-zinc-800/80 border border-gray-200/50 dark:border-zinc-700/50 text-gray-600 dark:text-gray-300">
                      <SpeakerIcon className="w-3 h-3 text-indigo-500" />
                      {job.voice_name}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700" />
                    <span className="text-gray-400 dark:text-zinc-500">
                      {new Date(job.created_at).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export function QueueStatusCard({
  lastQueueMetrics,
  isCompleted = false,
  isGenerating = false,
  onDismiss,
  onPlayNewJob,
  historyJobs,
  playingHistoryJobId,
  isPlaying,
  onPlayHistoryJob,
}: QueueStatusCardProps) {
  const [checkVisible, setCheckVisible] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const prevGeneratingRef = useRef(false);

  /* Animate checkmark when completion first triggers */
  useEffect(() => {
    if (isCompleted) {
      setCheckVisible(false);
      const timer = setTimeout(() => setCheckVisible(true), 150);
      return () => clearTimeout(timer);
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

  /* Nothing to render at all */
  if (isIdle && historyJobs.length === 0) return null;

  return (
    <div className="animate-fade-in-up space-y-0">
      {/* Active queue waiting card */}
      {isGenerating && !isCompleted && <QueueWaitingCard lastQueueMetrics={lastQueueMetrics} />}

      {/* Success card (auto-play by StickyPlayerBar, no Play CTA here) */}
      {isCompleted && (
        <SuccessCard
          showHistory={showHistory}
          historyCount={historyJobs.length}
          onToggleHistory={() => setShowHistory((v) => !v)}
          checkVisible={checkVisible}
        />
      )}

      {/* History list – embedded below success card */}
      {isCompleted && (
        <HistoryList
          historyJobs={historyJobs}
          playingHistoryJobId={playingHistoryJobId}
          isPlaying={isPlaying}
          onPlayHistoryJob={onPlayHistoryJob}
          show={showHistory}
          onToggle={() => setShowHistory((v) => !v)}
          showHeader={false}
        />
      )}

      {/* History list – standalone header in idle state */}
      {isIdle && (
        <HistoryList
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
