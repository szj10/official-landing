"use client";

import React from "react";
import { ChevronIcon, LockIcon, CheckIcon } from "./icons";

interface StepHeaderProps {
  stepNumber: number;
  title: string;
  badgeColorClass: string;
  isExpanded: boolean;
  isCompleted?: boolean;
  isLocked?: boolean;
  summary?: React.ReactNode;
  onClick: () => void;
  children?: React.ReactNode;
  headerRight?: React.ReactNode;
}

export function StepHeader({
  stepNumber,
  title,
  badgeColorClass,
  isExpanded,
  isCompleted = false,
  isLocked = false,
  summary,
  onClick,
  children,
  headerRight,
}: StepHeaderProps) {
  return (
    <section
      className={`glass-panel rounded-3xl transition-all duration-300 border ${
        isExpanded
          ? "shadow-lg border-indigo-500/20 dark:border-indigo-500/30 p-5 sm:p-8"
          : isLocked
            ? "border-white/10 dark:border-zinc-800/30 opacity-70 p-4 sm:p-5"
            : "border-white/20 dark:border-zinc-800/50 hover:border-indigo-200 dark:hover:border-indigo-800/50 p-4 sm:p-5 cursor-pointer shadow-sm hover:shadow-md"
      }`}
    >
      {/* Clickable Header Row */}
      <div
        onClick={() => {
          if (!isLocked) onClick();
        }}
        className={`flex items-center justify-between gap-3 select-none ${
          !isExpanded && !isLocked ? "cursor-pointer" : ""
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Step Number / Icon Badge */}
          <span
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 transition-transform ${
              isCompleted && !isExpanded
                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                : badgeColorClass
            }`}
          >
            {isCompleted && !isExpanded ? (
              <CheckIcon className="w-4 h-4" />
            ) : isLocked ? (
              <LockIcon className="w-3.5 h-3.5" />
            ) : (
              stepNumber
            )}
          </span>

          {/* Title & summary in collapsed mode */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
              {title}
            </h2>

            {!isExpanded && summary && (
              <div className="flex items-center text-xs text-gray-500 dark:text-zinc-400 truncate">
                <span className="hidden sm:inline mr-2 text-gray-300 dark:text-zinc-600">•</span>
                <span className="truncate">{summary}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right side controls / status */}
        <div className="flex items-center gap-2 shrink-0">
          {headerRight}

          {!isLocked ? (
            <button
              type="button"
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <ChevronIcon className="w-4 h-4 sm:w-5 sm:h-5" open={isExpanded} />
            </button>
          ) : (
            <span className="text-xs text-gray-400 font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800">
              Locked
            </span>
          )}
        </div>
      </div>

      {/* Expanded Content Body */}
      {isExpanded && <div className="mt-5 sm:mt-6 animate-fade-in-up">{children}</div>}
    </section>
  );
}
