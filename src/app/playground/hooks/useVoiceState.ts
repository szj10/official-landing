"use client";

import { useState } from "react";
import type { UploadStatus } from "./useVoiceRecording";

export function useVoiceState() {
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [activeVoicePanel, setActiveVoicePanel] = useState<"stock" | "custom">("custom");
  const [anonymousVoiceId, setAnonymousVoiceId] = useState<number | null>(null);

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadCanRetry, setUploadCanRetry] = useState(false);

  const resetVoiceState = () => {
    setSelectedVoice(null);
    setAnonymousVoiceId(null);
    setUploadStatus("idle");
    setUploadError(null);
    setUploadCanRetry(false);
  };

  return {
    selectedVoice,
    setSelectedVoice,
    activeVoicePanel,
    setActiveVoicePanel,
    anonymousVoiceId,
    setAnonymousVoiceId,
    uploadStatus,
    setUploadStatus,
    uploadError,
    setUploadError,
    uploadCanRetry,
    setUploadCanRetry,
    resetVoiceState,
  };
}
