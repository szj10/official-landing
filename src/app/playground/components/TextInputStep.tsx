"use client";

import React, { KeyboardEvent } from "react";
import { useI18n } from "@/i18n";
import { CheckIcon, ArrowRightIcon } from "./icons";
import { SAMPLE_TEXTS } from "./types";

interface TextInputStepProps {
  textInput: string;
  selectedSampleText: string | null;
  onTextChange: (text: string) => void;
  onSampleSelect: (id: string) => void;
  onAdvanceToNext: () => void;
}

export function TextInputStep({
  textInput,
  selectedSampleText,
  onTextChange,
  onSampleSelect,
  onAdvanceToNext,
}: TextInputStepProps) {
  const { t } = useI18n();

  const words = textInput.trim().split(/\s+/).filter(Boolean).length;
  const maxWords = 200;
  const percentage = Math.min((words / maxWords) * 100, 100);
  const isOverLimit = words > maxWords;
  const strokeColor = isOverLimit
    ? "text-red-500"
    : percentage > 80
      ? "text-amber-500"
      : "text-indigo-500";

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // When user presses Enter without Shift, advance if text is valid
    if (e.key === "Enter" && !e.shiftKey) {
      if (textInput.trim().length > 0) {
        e.preventDefault();
        onAdvanceToNext();
      }
    }
  };

  const handleSampleClick = (id: string) => {
    onSampleSelect(id);
    // User picked sample card -> advance to Step 2
    onAdvanceToNext();
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Sample text cards */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">
          {t("playground.textSection.sampleTexts")}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          {SAMPLE_TEXTS.map((sample) => {
            const isSelected = selectedSampleText === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSampleClick(sample.id)}
                className={`relative p-3.5 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-md scale-[1.01]"
                    : "bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 text-indigo-500">
                    <CheckIcon className="w-4 h-4" />
                  </div>
                )}
                <p
                  className={`text-xs leading-relaxed line-clamp-3 sm:line-clamp-4 ${
                    isSelected
                      ? "text-indigo-700 dark:text-indigo-300 font-medium"
                      : "text-gray-600 dark:text-zinc-400"
                  }`}
                >
                  {t(sample.textKey)}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Text Area */}
      <div className="relative">
        <textarea
          value={textInput}
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("playground.textSection.placeholder")}
          rows={4}
          className="w-full px-4 py-3 pb-12 rounded-2xl bg-gray-50/50 dark:bg-zinc-900/50 border-2 border-gray-200 dark:border-zinc-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-400 resize-none text-sm sm:text-base shadow-inner"
        />

        {/* Word count with circular progress */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm px-2.5 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-zinc-700">
          <div className="relative w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200 dark:text-zinc-600"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${strokeColor} transition-all duration-300`}
                strokeDasharray={`${percentage}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
          <span
            className={`text-xs font-semibold ${
              isOverLimit ? "text-red-500" : "text-gray-600 dark:text-zinc-300"
            }`}
          >
            {words}/{maxWords}
          </span>
        </div>
      </div>

      {/* Advance Action Bar */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-gray-400 dark:text-zinc-500 hidden sm:block">
          Press{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 font-mono text-[11px]">
            Enter
          </kbd>{" "}
          to proceed to voice selection
        </p>
        <button
          type="button"
          onClick={onAdvanceToNext}
          disabled={!textInput.trim()}
          className="ml-auto flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
        >
          <span>Next: Choose Voice</span>
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
