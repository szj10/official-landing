"use client";

import { useEffect, useCallback } from "react";

interface WechatQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function WechatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8.691 2.619c-3.939 0-7.139 2.513-7.139 5.607 0 2.063 1.378 3.849 3.453 4.827l-.783 2.352 2.743-1.381c.541.107 1.102.166 1.681.166.323 0 .641-.022.951-.063-.19-.575-.291-1.182-.291-1.813 0-3.126 2.914-5.663 6.509-5.663.411 0 .815.034 1.207.098-.607-2.537-3.524-4.13-7.331-4.13zm-2.17 4.39c-.656 0-1.188-.532-1.188-1.188s.532-1.188 1.188-1.188 1.188.532 1.188 1.188-.532 1.188-1.188 1.188zm4.341 0c-.656 0-1.188-.532-1.188-1.188s.532-1.188 1.188-1.188 1.188.532 1.188 1.188-.532 1.188-1.188 1.188zm6.166 3.899c-3.211 0-5.816 2.143-5.816 4.785 0 1.728 1.163 3.222 2.865 4.024l-.644 1.934 2.254-1.135c.444.088.904.137 1.379.137 3.211 0 5.816-2.143 5.816-4.785s-2.605-4.91-5.854-4.91zm-1.781 3.899c-.538 0-.975-.437-.975-.975s.437-.975.975-.975 975.437.975.975-.437.975-.975.975z" />
    </svg>
  );
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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
            <WechatIcon className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            WeChat Official Account
          </h3>

          <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6">
            Scan to follow us on WeChat
          </p>

          <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center border-2 border-gray-200 dark:border-zinc-700 shadow-inner p-3">
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
            </kbd>{" "}
            or click outside to close
          </p>
        </div>
      </div>
    </div>
  );
}
