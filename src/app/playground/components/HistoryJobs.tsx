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
}: HistoryJobsProps) {
  const { t } = useI18n();

  if (historyJobs.length === 0) return null;

  return (
    <div className={showHeader ? "mt-4" : "mt-3"}>
      {/* Standalone header — only in idle state */}
      {showHeader && (
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-between p-4 rounded-2xl glass-panel shadow-sm hover:shadow-md transition-all duration-300 group select-none relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
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
              <span className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-100 dark:to-white tracking-tight group-hover:text-indigo-600 transition-colors">
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
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100/80 dark:bg-zinc-800/80 text-gray-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:shadow-sm transition-all duration-300 relative z-10">
            <ChevronIcon className="w-5 h-5 transition-transform duration-300" open={show} />
          </div>
        </button>
      )}

      {show && (
        <div className="space-y-2.5 animate-fade-in-up max-h-[320px] overflow-y-auto pr-1 custom-scrollbar mt-3">
          {historyJobs.map((job) => {
            const isPlayingThis = playingHistoryJobId === job.playground_job_id && isPlaying;
            return (
              <div
                key={job.playground_job_id}
                className="group relative flex items-center gap-4 p-3.5 rounded-2xl glass-panel shadow-sm hover:shadow-md hover:border-indigo-200/50 dark:hover:border-indigo-500/30 transition-all duration-300"
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
                        confirm(
                          t("playground.historySection.deleteConfirm").replace("{text}", job.text)
                        )
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
          })}
        </div>
      )}
    </div>
  );
}
