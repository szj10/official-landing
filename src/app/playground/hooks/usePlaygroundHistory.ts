"use client";

import { useEffect, useState } from "react";
import type { HistoryTTSJob, HistoryVoice } from "../components/types";
import {
  hydrateHistoryJobs,
  hydrateHistoryVoices,
  persistHistoryJobs,
  persistHistoryVoices,
} from "../lib/historyStorage";

/**
 * Hydrates voice + TTS history from localStorage / backend.
 * Pending-job resume stays in PlaygroundContent (needs generate/poll wiring).
 */
export function usePlaygroundHistory() {
  const [historyVoices, setHistoryVoices] = useState<HistoryVoice[]>([]);
  const [historyJobs, setHistoryJobs] = useState<HistoryTTSJob[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [voices, jobs] = await Promise.all([hydrateHistoryVoices(), hydrateHistoryJobs()]);
        if (cancelled) return;
        if (voices) setHistoryVoices(voices);
        if (jobs) setHistoryJobs(jobs);
      } catch (err) {
        console.error("Failed to load playground history:", err);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const removeHistoryVoice = (voiceId: number) => {
    setHistoryVoices((prev) => {
      const next = prev.filter((v) => v.anonymous_voice_id !== voiceId);
      persistHistoryVoices(next);
      return next;
    });
  };

  const removeHistoryJob = (jobId: string | number) => {
    setHistoryJobs((prev) => {
      const next = prev.filter((j) => j.playground_job_id !== jobId);
      persistHistoryJobs(next);
      return next;
    });
  };

  const prependHistoryVoice = (voice: HistoryVoice) => {
    setHistoryVoices((prev) => {
      const next = [voice, ...prev]
        .sort((a, b) => b.anonymous_voice_id - a.anonymous_voice_id)
        .slice(0, 50);
      persistHistoryVoices(next);
      return next;
    });
  };

  const prependHistoryJob = (job: HistoryTTSJob) => {
    setHistoryJobs((prev) => {
      if (prev.find((p) => p.playground_job_id === job.playground_job_id)) return prev;
      const next = [job, ...prev].slice(0, 50);
      persistHistoryJobs(next);
      return next;
    });
  };

  return {
    historyVoices,
    historyJobs,
    setHistoryVoices,
    setHistoryJobs,
    removeHistoryVoice,
    removeHistoryJob,
    prependHistoryVoice,
    prependHistoryJob,
  };
}
