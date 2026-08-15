export type WizardStep = "text" | "voice" | "synthesize";

export type TTSJobStatus = "queued" | "processing" | "completed" | "failed" | "rate_limited";

export interface TTSJobResponse {
  job_id: string | number;
  status: TTSJobStatus;
  stream_url: string | null;
  audio_path: string | null;
  audio_duration: number | null;
  error_message: string | null;
  is_cached: boolean;
  expires_at: string;
  created_at: string;
  completed_at: string | null;
  ratio?: number;
  queue_position?: number | null;
  jobs_ahead?: number | null;
  queue_depth?: number | null;
  estimated_wait_seconds?: number | null;
}

export interface HistoryVoice {
  anonymous_voice_id: number;
  audio_duration: number | null;
  expires_at: string;
}

export interface HistoryTTSJob {
  playground_job_id: number | string;
  text: string;
  voice_name: string;
  audio_path: string | null;
  created_at: string;
  expires_at: string;
}

export interface SampleTextItem {
  id: string;
  textKey: string;
}

export const SAMPLE_TEXTS: SampleTextItem[] = [
  {
    id: "playful",
    textKey: "sampleTexts.playful.text",
  },
  {
    id: "mockNews",
    textKey: "sampleTexts.mockNews.text",
  },
  {
    id: "curious",
    textKey: "sampleTexts.curious.text",
  },
];

export function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatRetryAfter(seconds: number) {
  if (seconds >= 3600) return `${Math.ceil(seconds / 3600)}h`;
  if (seconds >= 60) return `${Math.ceil(seconds / 60)}m`;
  return `${seconds}s`;
}
