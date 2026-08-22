"use client";

import { useI18n } from "@/i18n";
import { SpeakerIcon, PlayIcon, PauseIcon, ChevronIcon } from "./icons";
import { HistoryTTSJob, formatRelativeTime } from "./types";

interface HistoryJobsProps {
  historyJobs: HistoryTTSJob[];
  playingHistoryJobId: number | string | null;
  isPlaying: boolean;
  onPlayHistoryJob: (jobId: string | number, path: string | null) => void;
  onDeleteHistoryJob?: (jobId: string | number) => void;
  show: boolean;
  onToggle: () => void;
  showHeader: boolean;
  /** When true, the first item gets a glow highlight (newest after generation) */
  highlightFirst?: boolean;
}

export function HistoryJobs({
  historyJobs,
  playingHistoryJobId,
  isPlaying,
  onPlayHistoryJob,
  onDeleteHistoryJob,
  show,
  onToggle,
  showHeader,
  highlightFirst = false,
}: HistoryJobsProps) {
  const { t } = useI18n();

  if (historyJobs.length === 0) return null;

  // Scenario 1: always show top 2 items as preview; rest behind expand
  const PREVIEW_COUNT = 2;
  const previewJobs = historyJobs.slice(0, PREVIEW_COUNT);
  const extraJobs = historyJobs.slice(PREVIEW_COUNT);
  const hasExtra = extraJobs.length > 0;

  const renderJob = (job: HistoryTTSJob, idx: number) => {
    const isPlayingThis = playingHistoryJobId === job.playground_job_id && isPlaying;
    const isNewest = idx === 0 && highlightFirst;

    return (
      <div
        key={job.playground_job_id}
        className={`group relative flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 ${
          isNewest
            ? "glass-panel shadow-md ring-2 ring-emerald-400/40 dark:ring-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20"
            : "glass-panel shadow-sm hover:shadow-md hover:border-indigo-200/50 dark:hover:border-indigo-500/30"
        }`}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500" />

        <button
          type="button"
          onClick={() => onPlayHistoryJob(job.playground_job_id, job.audio_path)}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 relative overflow-hidden ${
            isPlayingThis
              ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]"
              : isNewest
                ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white hover:scale-105 shadow-sm"
                : "bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 text-indigo-600 dark:text-indigo-400 hover:scale-105 shadow-sm"
          }`}
          aria-label={
            isPlayingThis
              ? t("playground.historySection.pause")
              : t("playground.historySection.play")
          }
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
          {isNewest && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              New
            </span>
          )}
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1 group-hover:text-indigo-900 dark:group-hover:text-white transition-colors duration-300">
            {job.text}
          </p>
          <div className="flex items-center gap-2.5 mt-1 text-xs text-gray-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium px-2 py-0.5 rounded-md bg-gray-100/80 dark:bg-zinc-800/80 border border-gray-200/50 dark:border-zinc-700/50 text-gray-600 dark:text-gray-300">
              <SpeakerIcon className="w-3 h-3 text-indigo-500" />
              {job.voice_name}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700" />
            <span className="text-gray-400 dark:text-zinc-400">
              {formatRelativeTime(job.created_at, t)}
            </span>
          </div>
        </div>

        {onDeleteHistoryJob && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (
                confirm(t("playground.historySection.deleteConfirm").replace("{text}", job.text))
              ) {
                onDeleteHistoryJob(job.playground_job_id);
              }
            }}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors relative z-10 shrink-0"
            aria-label={t("playground.historySection.deleteAria")}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={showHeader ? "mt-4" : "mt-3"}>
      {/* Standalone header — only in idle state */}
      {showHeader && (
        <div className="w-full flex items-center justify-between p-4 rounded-2xl glass-panel shadow-sm mb-3 select-none relative overflow-hidden">
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 border border-indigo-100/60 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-100 dark:to-white tracking-tight">
                {t("playground.historySection.recentTitle")}
              </span>
              <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">
                {(historyJobs.length === 1
                  ? t("playground.historySection.voiceAvailable")
                  : t("playground.historySection.voicesAvailable")
                ).replace("{count}", String(historyJobs.length))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Always-visible top 2 items preview */}
      <div className="space-y-2.5">{previewJobs.map((job, idx) => renderJob(job, idx))}</div>

      {/* Expanded extra items (beyond top 2) */}
      {show && hasExtra && (
        <div className="space-y-2.5 mt-2.5 animate-fade-in-up">
          {extraJobs.map((job, idx) => renderJob(job, idx + PREVIEW_COUNT))}
        </div>
      )}

      {/* Expand / Collapse button — only if there are more than 2 */}
      {hasExtra && (
        <button
          type="button"
          onClick={onToggle}
          className="mt-2.5 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-gray-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-gray-50/60 dark:bg-zinc-800/40 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-gray-200/60 dark:border-zinc-700/60 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-200"
          aria-expanded={show}
        >
          <ChevronIcon className="w-4 h-4 transition-transform duration-300" open={show} />
          {show
            ? t("playground.historySection.showLess") || "Show Less"
            : `${t("playground.historySection.showAll") || "Show All"} (${historyJobs.length})`}
        </button>
      )}
    </div>
  );
}
