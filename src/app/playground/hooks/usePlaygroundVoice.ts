"use client";

import { useEffect, useRef, useState } from "react";
import type { HistoryVoice } from "../components/types";
import { type Locale } from "@/i18n/config";

export type UploadStatus = "idle" | "uploading" | "success" | "error";

export type RestoreVoiceState = {
  activePanel?: "stock" | "custom";
  selectedVoice?: string | null;
  anonymousVoiceId?: number | null;
};

type UsePlaygroundVoiceOptions = {
  locale: Locale;
  t: (key: string) => string;
  onPrependHistoryVoice: (voice: HistoryVoice) => void;
  onRecordingStart?: () => void;
  onRecordingReady?: (blob: Blob) => void;
};

/**
 * Unified voice selection, panel state, mic recording, and prompt audio upload.
 */
export function usePlaygroundVoice({
  locale,
  t,
  onPrependHistoryVoice,
  onRecordingStart,
  onRecordingReady,
}: UsePlaygroundVoiceOptions) {
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [activeVoicePanel, setActiveVoicePanel] = useState<"stock" | "custom">("stock");
  const [anonymousVoiceId, setAnonymousVoiceId] = useState<number | null>(null);

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadCanRetry, setUploadCanRetry] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimeRef = useRef<number>(0);
  const lastUploadDurationRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, []);

  const selectStockVoice = (voiceId: string | null) => {
    setSelectedVoice(voiceId);
    setActiveVoicePanel("stock");
  };

  const selectHistoryVoice = (voice: HistoryVoice) => {
    setActiveVoicePanel("custom");
    setAnonymousVoiceId(voice.anonymous_voice_id);
    setSelectedVoice(null);
    setRecordedAudioBlob(null);
    setUploadStatus("success");
    setUploadError(null);
    setUploadCanRetry(false);
  };

  const clearVoice = () => {
    setSelectedVoice(null);
    setAnonymousVoiceId(null);
    setUploadStatus("idle");
    setUploadError(null);
    setUploadCanRetry(false);
    setRecordedAudioBlob(null);
    setRecordingTime(0);
    recordingTimeRef.current = 0;
    lastUploadDurationRef.current = 0;
  };

  const resetRecording = (defaultStockVoiceId?: string | null) => {
    setRecordedAudioBlob(null);
    setRecordingTime(0);
    recordingTimeRef.current = 0;
    lastUploadDurationRef.current = 0;
    setUploadStatus("idle");
    setAnonymousVoiceId(null);
    setUploadError(null);
    setUploadCanRetry(false);
    if (defaultStockVoiceId !== undefined) {
      setSelectedVoice(defaultStockVoiceId);
      if (defaultStockVoiceId) {
        setActiveVoicePanel("stock");
      }
    }
  };

  const handleHistoryVoiceDeleted = (voiceId: number) => {
    if (anonymousVoiceId === voiceId) {
      setAnonymousVoiceId(null);
      setUploadStatus("idle");
    }
  };

  const restorePendingVoiceState = (pending: RestoreVoiceState) => {
    if (pending.activePanel) {
      setActiveVoicePanel(pending.activePanel);
    }
    if (pending.activePanel === "stock" && pending.selectedVoice) {
      setSelectedVoice(pending.selectedVoice);
    } else if (pending.activePanel === "custom" && pending.anonymousVoiceId) {
      setAnonymousVoiceId(pending.anonymousVoiceId);
      setUploadStatus("success");
    }
  };

  const uploadRecordingToBackend = async (blob: Blob, durationSeconds: number) => {
    lastUploadDurationRef.current = durationSeconds;
    setUploadStatus("uploading");
    setUploadError(null);
    setUploadCanRetry(false);
    setAnonymousVoiceId(null);

    try {
      const formData = new FormData();
      formData.append("file", blob, "recording.webm");
      formData.append("language", locale);
      formData.append("duration", durationSeconds.toString());

      const res = await fetch("/api/v1/playground/upload-voice-prompt", {
        method: "POST",
        body: formData,
      });

      if (res.status === 429) {
        const body = await res.json().catch(() => ({}));
        const retryAfter: number = body?.detail?.retry_after ?? 3600;
        setUploadStatus("error");
        setUploadCanRetry(false);
        setUploadError(
          t("playground.voiceSection.uploadRateLimit").replace(
            "{time}",
            formatRetryAfter(retryAfter)
          )
        );
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const detail =
          typeof body?.detail === "string" ? body.detail : t("playground.voiceSection.uploadError");
        setUploadStatus("error");
        setUploadCanRetry(true);
        setUploadError(detail);
        return;
      }

      const data = await res.json();
      setAnonymousVoiceId(data.anonymous_voice_id);
      setUploadStatus("success");
      setUploadCanRetry(false);

      const newVoice: HistoryVoice = {
        anonymous_voice_id: data.anonymous_voice_id,
        audio_duration: data.audio_duration,
        expires_at: data.expires_at,
        created_at: new Date().toISOString(),
      };
      onPrependHistoryVoice(newVoice);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus("error");
      setUploadCanRetry(true);
      setUploadError(t("playground.voiceSection.uploadError"));
    }
  };

  const startRecording = async () => {
    try {
      if (onRecordingStart) onRecordingStart();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setRecordedAudioBlob(audioBlob);
        setSelectedVoice(null);
        setActiveVoicePanel("custom");

        stream.getTracks().forEach((track) => track.stop());

        if (onRecordingReady) {
          onRecordingReady(audioBlob);
        }

        await uploadRecordingToBackend(audioBlob, recordingTimeRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimeRef.current = 0;

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          recordingTimeRef.current = newTime;
          if (newTime >= 10 && mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) {
              clearInterval(recordingIntervalRef.current);
              recordingIntervalRef.current = null;
            }
          }
          return newTime;
        });
      }, 1000);
    } catch (error) {
      console.error("Recording error:", error);
      alert(t("playground.microphoneError"));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const retryUpload = () => {
    if (!recordedAudioBlob || !uploadCanRetry) return;
    const duration = lastUploadDurationRef.current || recordingTimeRef.current;
    void uploadRecordingToBackend(recordedAudioBlob, duration);
  };

  const hasValidStockVoice = activeVoicePanel === "stock" && !!selectedVoice;
  const hasValidCustomVoice =
    activeVoicePanel === "custom" && uploadStatus === "success" && anonymousVoiceId !== null;
  const canGenerate = hasValidStockVoice || hasValidCustomVoice;

  return {
    selectedVoice,
    setSelectedVoice,
    activeVoicePanel,
    setActiveVoicePanel,
    anonymousVoiceId,
    uploadStatus,
    uploadError,
    uploadCanRetry,
    isRecording,
    recordedAudioBlob,
    recordingTime,
    canGenerate,
    selectStockVoice,
    selectHistoryVoice,
    clearVoice,
    resetRecording,
    handleHistoryVoiceDeleted,
    restorePendingVoiceState,
    startRecording,
    stopRecording,
    retryUpload,
  };
}
