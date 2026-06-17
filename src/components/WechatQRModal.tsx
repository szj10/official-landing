"use client";

import { useEffect, useCallback } from "react";

interface WechatQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WechatQRModal({ isOpen, onClose }: WechatQRModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative glass-panel rounded-3xl p-8 max-w-sm mx-4 shadow-2xl border border-white/10 dark:border-white/5 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-48 h-48 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center border-2 border-gray-200 dark:border-zinc-700 shadow-inner p-3">
            <div className="w-full h-full bg-gray-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-2 bg-gray-200 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-gray-400 dark:text-zinc-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 4h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                </div>
                <span className="text-[10px] text-gray-400 dark:text-zinc-600 font-medium">
                  QR CODE
                </span>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-500 dark:text-zinc-500">
            Press{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono">
              Esc
            </kbd>
          </p>
        </div>
      </div>
    </div>
  );
}
