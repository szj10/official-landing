"use client";

import React, { useState, forwardRef } from "react";
import { useI18n } from "@/i18n";
import { SAMPLE_TEXTS } from "./types";
import { SparklesIcon } from "./icons";

interface PlaygroundEditorPanelProps {
  textInput: string;
  onTextChange: (text: string) => void;
  onSampleSelect: (text: string) => void;
  onFocus?: () => void;
}

export const PlaygroundEditorPanel = forwardRef<HTMLTextAreaElement, PlaygroundEditorPanelProps>(
  function PlaygroundEditorPanel({ textInput, onTextChange, onSampleSelect, onFocus }, ref) {
    const { t } = useI18n();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingSampleId, setPendingSampleId] = useState<string | null>(null);

    // Derive showSamples directly from textInput - no need for state or effect
    const showSamples = textInput.trim() === "";

    const words = textInput.trim().split(/\s+/).filter(Boolean).length;
    const maxWords = 200;
    const percentage = Math.min((words / maxWords) * 100, 100);
    const isOverLimit = words > maxWords;
    const strokeColor = isOverLimit
      ? "text-red-500"
      : percentage > 80
        ? "text-amber-500"
        : "text-indigo-500";

    const handleSampleClick = (id: string) => {
      const sample = SAMPLE_TEXTS.find((s) => s.id === id);
      if (!sample) return;

      if (textInput.trim() !== "") {
        setPendingSampleId(id);
        setShowConfirmModal(true);
      } else {
        onSampleSelect(id);
      }
    };

    const confirmReplace = () => {
      if (pendingSampleId) {
        onSampleSelect(pendingSampleId);
      }
      setShowConfirmModal(false);
      setPendingSampleId(null);
    };

    const cancelReplace = () => {
      setShowConfirmModal(false);
      setPendingSampleId(null);
    };

    return (
      <div className="w-full space-y-3 sm:space-y-4">
        {/* Samples Section - Auto-shown when textarea is empty */}
        {showSamples && (
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 sm:px-5 py-3 sm:py-3.5 bg-gray-50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                <span className="text-sm font-semibold text-gray-700 dark:text-zinc-200">
                  {t("playground.textSection.sampleTexts")}
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {SAMPLE_TEXTS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSampleClick(sample.id)}
                    className="text-left p-3 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all group"
                  >
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 line-clamp-2 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                      {t(sample.textKey)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Editor Canvas */}
        <div className="relative shadow-sm">
          <textarea
            ref={ref}
            value={textInput}
            onChange={(e) => onTextChange(e.target.value)}
            onFocus={onFocus}
            placeholder={t("playground.textSection.placeholder")}
            rows={8}
            className="w-full px-4 sm:px-5 py-4 pb-14 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-gray-200 dark:border-zinc-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-gray-900 dark:text-white placeholder-gray-400 text-base sm:text-lg resize-y min-h-[200px]"
          />

          {/* Word count with circular progress */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-gray-100 dark:border-zinc-700 shadow-sm pointer-events-none">
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
              className={`text-xs sm:text-sm font-semibold ${
                isOverLimit ? "text-red-500" : "text-gray-600 dark:text-zinc-300"
              }`}
            >
              {words}/{maxWords}
            </span>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 sm:p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Replace existing text?
                </h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">
                  Applying this sample will replace the text you currently have in the editor. Are
                  you sure?
                </p>
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-2">
                  <button
                    type="button"
                    onClick={cancelReplace}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmReplace}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all active:scale-95"
                  >
                    Replace Text
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);
