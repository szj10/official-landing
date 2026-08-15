"use client";

import React from "react";
import { SpeakerIcon, PlayIcon, PauseIcon, ChevronIcon } from "./icons";
import { HistoryTTSJob } from "./types";

interface HistoryJobsProps {
  historyJobs: HistoryTTSJob[];
  showHistoryJobs: boolean;
  playingHistoryJobId: number | string | null;
  isPlaying: boolean;
  onToggleShowHistoryJobs: () => void;
  onPlayHistoryJob: (jobId: string | number, path: string | null) => void;
}

export function HistoryJobs({
  historyJobs,
  showHistoryJobs,
  playingHistoryJobId,
  isPlaying,
  onToggleShowHistoryJobs,
  onPlayHistoryJob,
}: HistoryJobsProps) {
  if (historyJobs.length === 0) return null;

  return (
    <div className="mt-6 pt-5 border-t border-gray-200 dark:border-zinc-700/50">
      <button
        type="button"
        onClick={onToggleShowHistoryJobs}
        className="w-full flex items-center justify-between px-2 py-1 text-left group select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            Recent Synthesized Voices
            <span className="ml-2 text-[10px] font-medium bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 px-1.5 py-0.5 rounded-full">
              {historyJobs.length}
            </span>
          </span>
        </div>
        <ChevronIcon className="w-4 h-4 text-gray-400" open={showHistoryJobs} />
      </button>

      {showHistoryJobs && (
        <div className="mt-3 space-y-2.5 animate-fade-in-up max-h-72 overflow-y-auto pr-1 custom-scrollbar">
          {historyJobs.map((job) => {
            const isPlayingThis = playingHistoryJobId === job.playground_job_id && isPlaying;

            return (
              <div
                key={job.playground_job_id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all"
              >
                <button
                  type="button"
                  onClick={() => onPlayHistoryJob(job.playground_job_id, job.audio_path)}
                  className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center justify-center transition-colors shrink-0"
                  aria-label={isPlayingThis ? "Pause" : "Play"}
                >
                  {isPlayingThis ? (
                    <PauseIcon className="w-4 h-4" />
                  ) : (
                    <PlayIcon className="w-4 h-4 ml-0.5" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                    {job.text}
                  </p>
                  <div className="flex items-center gap-2.5 mt-0.5 text-[11px] text-gray-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-zinc-300">
                      <SpeakerIcon className="w-3 h-3 text-indigo-500" />
                      {job.voice_name}
                    </span>
                    <span>•</span>
                    <span>
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
