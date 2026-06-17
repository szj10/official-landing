"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";

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
            <Image
              src="/images/wechat-qr.svg"
              alt="WeChat QR Code"
              width={180}
              height={180}
              className="w-full h-full"
            />
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
