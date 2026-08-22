"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import type { HistoryVoice } from "../components/types";
import { formatRetryAfter } from "../components/types";
import { replaceMediaUrl, revokeIfBlobUrl } from "../lib/audio";

export type UploadStatus = "idle" | "uploading" | "success" | "error";

type UseVoiceRecordingOptions = {
  locale: string;
  t: (key: string) => string;
  prependHistoryVoice: (voice: HistoryVoice) => void;
  silenceAllAudio: () => void;
  setRecordedAudioUrl: (value: string | null | ((prev: string | null) => string | null)) => void;
  pendingRecAutoplayRef: MutableRefObject<boolean>;
  setSelectedVoice: (voiceId: string | null) => void;
  setActiveVoicePanel: (panel: "stock" | "custom") => void;
};

/**
 * Mic capture, blob lifecycle, and voice-prompt upload / retry.
 */
export function useVoiceRecording({
  locale,
  t,
  prependHistoryVoice,
  silenceAllAudio,
  setRecordedAudioUrl,
  pendingRecAutoplayRef,
  setSelectedVoice,
  setActiveVoicePanel,
}: UseVoiceRecordingOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [anonymousVoiceId, setAnonymousVoiceId] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  /** Non-429 upload failures can retry with the same Blob; rate limits cannot. */
  const [uploadCanRetry, setUploadCanRetry] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimeRef = useRef<number>(0); // Always in sync with state
  /** Duration sent with the last upload attempt (for retry without re-record). */
  const lastUploadDurationRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, []);

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
      prependHistoryVoice(newVoice);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus("error");
      setUploadCanRetry(true);
      setUploadError(t("playground.voiceSection.uploadError"));
    }
  };

  const startRecording = async () => {
    try {
      silenceAllAudio();

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

        const blobUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl((prev) => replaceMediaUrl(prev, blobUrl, { revokeAnyPrev: true }));
        pendingRecAutoplayRef.current = true;

        setSelectedVoice(null);
        setActiveVoicePanel("custom");

        stream.getTracks().forEach((track) => track.stop());

        // Send recording with accurate duration from ref
        await uploadRecordingToBackend(audioBlob, recordingTimeRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimeRef.current = 0;

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          recordingTimeRef.current = newTime; // Keep ref in sync
          // Auto-stop at 10 seconds
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

  const resetRecordingState = () => {
    setRecordedAudioBlob(null);
    setRecordedAudioUrl((prev) => {
      revokeIfBlobUrl(prev);
      return null;
    });
    setRecordingTime(0);
    recordingTimeRef.current = 0;
    lastUploadDurationRef.current = 0;
    setUploadStatus("idle");
    setAnonymousVoiceId(null);
    setUploadError(null);
    setUploadCanRetry(false);
  };

  return {
    isRecording,
    recordedAudioBlob,
    recordingTime,
    uploadStatus,
    setUploadStatus,
    anonymousVoiceId,
    setAnonymousVoiceId,
    uploadError,
    setUploadError,
    uploadCanRetry,
    setUploadCanRetry,
    setRecordedAudioBlob,
    recordingTimeRef,
    startRecording,
    stopRecording,
    retryUpload,
    resetRecordingState,
  };
}
