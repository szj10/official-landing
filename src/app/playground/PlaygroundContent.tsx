"use client";

import { useState, useRef } from "react";
import { useI18n } from "@/i18n";

const SAMPLE_TEXTS = [
  {
    id: "welcome",
    title: "Welcome Message",
    text: "Welcome to Huavoi, where AI transforms your ideas into professional videos in minutes. Experience the future of content creation.",
  },
  {
    id: "product",
    title: "Product Introduction",
    text: "Introducing our revolutionary AI-powered platform. Create stunning videos with natural voiceovers, perfect for marketing, training, and social media content.",
  },
  {
    id: "tutorial",
    title: "Tutorial Step",
    text: "Step one: Enter your script or let our AI write it for you. Step two: Choose from over 200 natural voices. Step three: Generate your professional video instantly.",
  },
];

const SAMPLE_VOICES = [
  {
    id: "voice1",
    name: "Emma",
    gender: "Female",
    accent: "American",
    preview: "Professional and warm",
  },
  {
    id: "voice2",
    name: "James",
    gender: "Male",
    accent: "British",
    preview: "Authoritative and clear",
  },
  {
    id: "voice3",
    name: "Sophia",
    gender: "Female",
    accent: "Australian",
    preview: "Friendly and engaging",
  },
  {
    id: "voice4",
    name: "Michael",
    gender: "Male",
    accent: "American",
    preview: "Conversational and natural",
  },
];

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L0 6a4 4 0 014 4v6a4 4 0 01-4 4zm0 0h8m4-4v4m0 0v4m0-4h4m-4 0l4-4"
      />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function SpeakerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
      />
    </svg>
  );
}

export default function PlaygroundContent() {
  const { t } = useI18n();
  const [textInput, setTextInput] = useState("");
  const [selectedSampleText, setSelectedSampleText] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [customVoiceFile, setCustomVoiceFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSampleTextSelect = (id: string) => {
    const sample = SAMPLE_TEXTS.find((s) => s.id === id);
    if (sample) {
      setTextInput(sample.text);
      setSelectedSampleText(id);
    }
  };

  const handleCustomVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomVoiceFile(file);
      setSelectedVoice(null);
    }
  };

  const handleGenerate = async () => {
    if (!textInput.trim() || (!selectedVoice && !customVoiceFile)) {
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append("text", textInput);
      if (selectedVoice) {
        formData.append("voiceId", selectedVoice);
      }
      if (customVoiceFile) {
        formData.append("voiceSample", customVoiceFile);
      }

      const response = await fetch("/api/tts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("TTS generation failed");
      }

      const data = await response.json();
      setAudioUrl(data.audioUrl);
    } catch (error) {
      console.error("Error generating TTS:", error);
      alert("Failed to generate audio. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const currentText =
    textInput ||
    (selectedSampleText ? SAMPLE_TEXTS.find((s) => s.id === selectedSampleText)?.text : "");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full glass-panel text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-6 shadow-sm shadow-indigo-500/5">
          <SpeakerIcon className="w-3.5 h-3.5" />
          <span>{t("playground.badge")}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
          {t("playground.title")}
        </h1>
        <p className="text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
          {t("playground.subtitle")}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass-panel rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            {t("playground.textSection.title")}
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-3">
              {t("playground.textSection.sampleTexts")}
            </label>
            <div className="space-y-2">
              {SAMPLE_TEXTS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSampleTextSelect(sample.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                    selectedSampleText === sample.id
                      ? "bg-indigo-500/10 border-2 border-indigo-500 text-indigo-700 dark:text-indigo-300"
                      : "bg-gray-50 dark:bg-zinc-900 border-2 border-transparent hover:border-gray-200 dark:hover:border-zinc-700 text-gray-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="font-medium text-sm mb-1">{sample.title}</div>
                  <div className="text-xs opacity-70 line-clamp-2">{sample.text}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-3">
              {t("playground.textSection.customText")}
            </label>
            <textarea
              value={textInput}
              onChange={(e) => {
                setTextInput(e.target.value);
                setSelectedSampleText(null);
              }}
              placeholder={t("playground.textSection.placeholder")}
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border-2 border-gray-200 dark:border-zinc-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 resize-none text-sm"
            />
            <div className="mt-2 text-xs text-gray-500 dark:text-zinc-400">
              {textInput.length} {t("playground.textSection.characters")}
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <SpeakerIcon className="w-5 h-5 text-purple-500" />
            {t("playground.voiceSection.title")}
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-3">
              {t("playground.voiceSection.sampleVoices")}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {SAMPLE_VOICES.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => {
                    setSelectedVoice(voice.id);
                    setCustomVoiceFile(null);
                  }}
                  className={`text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                    selectedVoice === voice.id
                      ? "bg-purple-500/10 border-2 border-purple-500"
                      : "bg-gray-50 dark:bg-zinc-900 border-2 border-transparent hover:border-gray-200 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-gray-900 dark:text-white">
                      {voice.name}
                    </span>
                    {selectedVoice === voice.id && (
                      <CheckIcon className="w-4 h-4 text-purple-500" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400">
                    {voice.gender} • {voice.accent}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                    {voice.preview}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-3">
              {t("playground.voiceSection.uploadCustom")}
            </label>
            <div className="relative">
              <input
                type="file"
                accept="audio/*"
                onChange={handleCustomVoiceUpload}
                className="hidden"
                id="voice-upload"
              />
              <label
                htmlFor="voice-upload"
                className="flex flex-col items-center justify-center w-full px-6 py-8 rounded-xl bg-gray-50 dark:bg-zinc-900 border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition-colors"
              >
                {customVoiceFile ? (
                  <div className="text-center">
                    <CheckIcon className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {customVoiceFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                      {t("playground.voiceSection.fileUploaded")}
                    </p>
                  </div>
                ) : (
                  <>
                    <UploadIcon className="w-8 h-8 text-gray-400 dark:text-zinc-500 mb-2" />
                    <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                      {t("playground.voiceSection.clickUpload")}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                      {t("playground.voiceSection.supportedFormats")}
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 glass-panel rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg
              className="w-5 h-5 text-pink-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            {t("playground.preview.title")}
          </h2>
          <button
            onClick={handleGenerate}
            disabled={!currentText || (!selectedVoice && !customVoiceFile) || isGenerating}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-8 py-3 rounded-full transition-all duration-200 font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 disabled:shadow-none hover:-translate-y-0.5 disabled:hover:translate-y-0 active:translate-y-0 text-sm disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {t("playground.preview.generating")}
              </span>
            ) : (
              t("playground.preview.generate")
            )}
          </button>
        </div>

        {audioUrl ? (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlayback}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
              >
                {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
              </button>
              <div className="flex-1">
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
                <div className="h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-0 animate-pulse"
                    style={{ width: isPlaying ? "100%" : "0%" }}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-zinc-400 mt-2">
                  {isPlaying ? t("playground.preview.playing") : t("playground.preview.ready")}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-300 dark:text-zinc-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              {t("playground.preview.noAudio")}
            </p>
          </div>
        )}
      </div>

      <div className="mt-12 glass-panel rounded-3xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {t("playground.tips.title")}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              ),
              title: t("playground.tips.tip1.title"),
              description: t("playground.tips.tip1.description"),
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              ),
              title: t("playground.tips.tip2.title"),
              description: t("playground.tips.tip2.description"),
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A11.962 11.962 0 003 9.7c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.132-2.053-.382-3.016z"
                  />
                </svg>
              ),
              title: t("playground.tips.tip3.title"),
              description: t("playground.tips.tip3.description"),
            },
          ].map((tip, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                {tip.icon}
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                  {tip.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-zinc-400">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
