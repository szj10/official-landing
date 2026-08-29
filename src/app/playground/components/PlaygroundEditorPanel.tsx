"use client";

import React, { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { useI18n } from "@/i18n";
import { SAMPLE_TEXTS } from "./types";

const MAX_TTS_TEXT_LENGTH = parseInt(process.env.NEXT_PUBLIC_MAX_TTS_TEXT_LENGTH || "600", 10);

export const SPEECH_TAGS = [
  { label: "[chuckle]", value: "[chuckle]", desc: "Subtle giggle" },
  { label: "[emphasis]", value: "[emphasis]", desc: "Stress word" },
  { label: "[long pause]", value: "[long pause]", desc: "Dramatic break" },
  { label: "[whisper]", value: "[whisper]", desc: "Quiet tone" },
  { label: "[sigh]", value: "[sigh]", desc: "Exhale softly" },
  { label: "[laughter]", value: "[laughter]", desc: "Full laugh" },
  { label: "[gasp]", value: "[gasp]", desc: "Surprised breath" },
  { label: "[applause]", value: "[applause]", desc: "Clapping sound" },
];

interface PlaygroundEditorPanelProps {
  textInput: string;
  onTextChange: (text: string) => void;
  onSampleSelect: (text: string) => void;
  onGenerate?: () => void;
}

export interface PlaygroundEditorPanelRef {
  focusTextarea: () => void;
  insertTag: (tag: string) => void;
}

export const PlaygroundEditorPanel = forwardRef<
  PlaygroundEditorPanelRef,
  PlaygroundEditorPanelProps
>(function PlaygroundEditorPanel({ textInput, onTextChange, onSampleSelect, onGenerate }, ref) {
  const { t } = useI18n();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSampleId, setPendingSampleId] = useState<string | null>(null);

  const insertTagAtCursor = (tag: string) => {
    if (!textareaRef.current) {
      onTextChange(
        textInput + (textInput.endsWith(" ") || textInput === "" ? "" : " ") + tag + " "
      );
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart ?? textInput.length;
    const end = textarea.selectionEnd ?? textInput.length;

    // Add spaces around tag cleanly
    const before = textInput.substring(0, start);
    const after = textInput.substring(end);
    const needLeadingSpace = before.length > 0 && !before.endsWith(" ");
    const needTrailingSpace = !after.startsWith(" ");
    const insertion = (needLeadingSpace ? " " : "") + tag + (needTrailingSpace ? " " : "");

    const newText = before + insertion + after;
    onTextChange(newText);

    // Reposition cursor right after the inserted tag
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + insertion.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  useImperativeHandle(ref, () => ({
    focusTextarea: () => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const length = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(length, length);
      }
    },
    insertTag: (tag: string) => {
      insertTagAtCursor(tag);
    },
  }));

  const charCount = textInput.length;
  const maxChars = MAX_TTS_TEXT_LENGTH;
  const isOverLimit = charCount > maxChars;
  const showSamples = textInput.trim() === "";

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
    <div className="w-full space-y-3">
      {/* Label / Prompt Header */}
      <div className="flex items-center justify-between">
        <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-zinc-200">
          Enter your own text
        </label>
        {textInput.trim() !== "" && (
          <button
            type="button"
            onClick={() => onTextChange("")}
            className="text-xs font-semibold text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            {t("playground.textSection.clearText")}
          </button>
        )}
      </div>

      {/* Quick Sample Starters (when empty) */}
      {showSamples && (
        <div className="p-3 sm:p-4 rounded-2xl bg-gray-50/80 dark:bg-zinc-800/40 border border-gray-200/60 dark:border-zinc-700/50 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            {t("playground.textSection.sampleTexts")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {SAMPLE_TEXTS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSampleClick(sample.id)}
                className="text-left p-2.5 rounded-xl border border-gray-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-all text-xs text-gray-700 dark:text-zinc-300 line-clamp-2"
              >
                {t(sample.textKey)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Text Editor Area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={textInput}
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && onGenerate) {
              e.preventDefault();
              onGenerate();
            }
          }}
          placeholder={t("playground.textSection.placeholder")}
          rows={5}
          maxLength={MAX_TTS_TEXT_LENGTH}
          className="w-full p-4 rounded-2xl bg-transparent border-0 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 text-base sm:text-lg leading-relaxed resize-y min-h-[140px] focus:outline-none"
        />
      </div>

      {/* Expandable Tags Drawer */}
      {isTagsOpen && (
        <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 animate-in fade-in slide-in-from-top-2 duration-150 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
              Speech Emotion & Pacing Tags
            </span>
            <span className="text-[10px] text-purple-500 dark:text-purple-400">
              Click to insert at cursor
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SPEECH_TAGS.map((tag) => (
              <button
                key={tag.value}
                type="button"
                onClick={() => insertTagAtCursor(tag.value)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-purple-200 dark:border-purple-800/80 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white shadow-2xs hover:shadow-sm active:scale-95 transition-all"
                title={tag.desc}
              >
                <span>{tag.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Tool Row: Tags > button on Left, Character count on Right */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800/80">
        {/* Tags Button */}
        <button
          type="button"
          onClick={() => setIsTagsOpen(!isTagsOpen)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs active:scale-95 ${
            isTagsOpen
              ? "bg-purple-600 text-white border border-purple-600 shadow-sm"
              : "bg-gray-100 dark:bg-zinc-800/90 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700"
          }`}
          aria-expanded={isTagsOpen}
        >
          <span>Tags</span>
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isTagsOpen ? "rotate-90" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Character Count */}
        <div className="text-xs sm:text-sm">
          <span
            className={`font-bold ${
              isOverLimit ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"
            }`}
          >
            {charCount}
          </span>
          <span className="text-gray-400 dark:text-zinc-500 font-medium">
            /{maxChars} characters
          </span>
        </div>
      </div>

      {/* Confirmation Modal for sample replacement */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 sm:p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {t("playground.textSection.replaceTitle")}
              </h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">
                {t("playground.textSection.replaceMessage")}
              </p>
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-2">
                <button
                  type="button"
                  onClick={cancelReplace}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {t("playground.textSection.cancel")}
                </button>
                <button
                  type="button"
                  onClick={confirmReplace}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all active:scale-95"
                >
                  {t("playground.textSection.replaceConfirm")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
