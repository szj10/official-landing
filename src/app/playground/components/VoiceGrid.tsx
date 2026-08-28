"use client";

import React from "react";
import Image from "next/image";
import { useI18n } from "@/i18n";
import { PlaygroundVoice } from "../voices.config";
import { CheckIcon, PlayIcon, StopIcon } from "./icons";

interface VoiceGridProps {
  voices: PlaygroundVoice[];
  selectedVoice: string | null;
  playingVoicePreview: string | null;
  onVoiceSelectAndPlay: (voiceId: string) => void;
}

export function VoiceGrid({
  voices,
  selectedVoice,
  playingVoicePreview,
  onVoiceSelectAndPlay,
}: VoiceGridProps) {
  const { t } = useI18n();

  if (!voices || voices.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-500 dark:text-zinc-400">
        {t("playground.voiceSection.noVoicesAvailable") || "Loading voices..."}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {voices.map((voice: PlaygroundVoice) => {
        const isSelected = selectedVoice === voice.id;
        const isPlaying = playingVoicePreview === voice.id;
        const displayName = voice.nameKey ? t(voice.nameKey) : voice.name;

        return (
          <div
            key={voice.id}
            onClick={() => onVoiceSelectAndPlay(voice.id)}
            className={`group relative p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              isSelected
                ? "bg-purple-50 dark:bg-purple-900/20 border-purple-500 shadow-md scale-[1.01]"
                : "glass-panel border-gray-100 dark:border-zinc-800 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-sm"
            }`}
          >
            {isSelected && (
              <div className="absolute top-2 right-2 text-purple-500">
                <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            )}

            <div className="flex flex-col items-center text-center gap-2">
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${voice.color} flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-inner relative overflow-visible`}
              >
                {voice.avatarUrl ? (
                  <Image
                    src={voice.avatarUrl}
                    alt={displayName}
                    width={56}
                    height={56}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  voice.avatar
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onVoiceSelectAndPlay(voice.id);
                  }}
                  className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center text-gray-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 hover:scale-110 transition-transform z-10"
                  aria-label={
                    isPlaying
                      ? t("playground.voiceSection.stopPreview")
                      : t("playground.voiceSection.playPreview")
                  }
                >
                  {isPlaying ? (
                    <StopIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  ) : (
                    <PlayIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-0.5" />
                  )}
                </button>
              </div>

              <div className="w-full px-1">
                <h3
                  className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate"
                  title={displayName}
                >
                  {displayName}
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500 dark:text-zinc-400 truncate">
                  {voice.creatorUsername ? `@${voice.creatorUsername}` : voice.language}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
