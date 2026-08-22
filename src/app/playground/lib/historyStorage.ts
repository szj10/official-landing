import type { HistoryTTSJob, HistoryVoice, TTSJobResponse } from "../components/types";

export const VOICE_IDS_KEY = "playground_voice_ids";
export const TTS_JOBS_KEY = "playground_tts_jobs";
export const PENDING_JOB_KEY = "playground_pending_job";

export function persistHistoryVoices(voices: HistoryVoice[]) {
  localStorage.setItem(VOICE_IDS_KEY, JSON.stringify(voices));
}

export function persistHistoryJobs(jobs: HistoryTTSJob[]) {
  localStorage.setItem(TTS_JOBS_KEY, JSON.stringify(jobs));
}

/** Load local voice IDs, drop expired, hydrate from backend. Returns null if nothing to set. */
export async function hydrateHistoryVoices(): Promise<HistoryVoice[] | null> {
  const storedVoices = localStorage.getItem(VOICE_IDS_KEY);
  if (!storedVoices) return null;

  const voices: HistoryVoice[] = JSON.parse(storedVoices);
  const now = Date.now();
  const validIds = voices
    .filter((v) => new Date(v.expires_at).getTime() > now)
    .map((v) => v.anonymous_voice_id);

  if (validIds.length === 0) {
    persistHistoryVoices([]);
    return [];
  }

  const res = await fetch(
    `/api/v1/playground/history/voices?${validIds.map((id) => `ids=${id}`).join("&")}`
  );
  if (!res.ok) return null;

  const data: HistoryVoice[] = await res.json();
  const sortedData = [...data].sort((a, b) => b.anonymous_voice_id - a.anonymous_voice_id);
  persistHistoryVoices(sortedData);
  return sortedData;
}

/** Load local TTS jobs, drop expired, merge completed audio_path from backend. */
export async function hydrateHistoryJobs(): Promise<HistoryTTSJob[] | null> {
  const storedJobs = localStorage.getItem(TTS_JOBS_KEY);
  if (!storedJobs) return null;

  const jobs: HistoryTTSJob[] = JSON.parse(storedJobs);
  const now = Date.now();
  const validJobs = jobs.filter((j) => new Date(j.expires_at).getTime() > now);
  const validIds = validJobs.map((j) => j.playground_job_id);

  if (validIds.length === 0) {
    persistHistoryJobs([]);
    return [];
  }

  const res = await fetch(
    `/api/v1/playground/history/tts?${validIds.map((id) => `ids=${id}`).join("&")}`
  );
  if (!res.ok) return null;

  const backendJobs: TTSJobResponse[] = await res.json();
  const mergedJobs = validJobs
    .map((localJob) => {
      const bj = backendJobs.find((b) => b.job_id === localJob.playground_job_id);
      if (bj && bj.status === "completed") {
        return { ...localJob, audio_path: bj.audio_path };
      }
      return localJob;
    })
    .filter((j) => j.audio_path !== null);

  persistHistoryJobs(mergedJobs);
  return mergedJobs;
}

export type PendingJobContext = {
  job_id: string | number;
  text?: string;
  active_panel?: "stock" | "custom";
  selected_voice?: string | null;
  anonymous_voice_id?: number | null;
};

export function readPendingJob(): PendingJobContext | null {
  const raw = localStorage.getItem(PENDING_JOB_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed as PendingJobContext;
    }
    // Legacy: plain job id string/number
    return { job_id: parsed };
  } catch {
    return null;
  }
}

export function clearPendingJob() {
  localStorage.removeItem(PENDING_JOB_KEY);
}

export function writePendingJob(data: PendingJobContext) {
  localStorage.setItem(PENDING_JOB_KEY, JSON.stringify(data));
}
