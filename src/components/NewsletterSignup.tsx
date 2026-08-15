"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";

interface NewsletterSignupProps {
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  compact?: boolean;
  layout?: "stacked" | "inline";
}

export default function NewsletterSignup({ compact = false }: NewsletterSignupProps) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !email.includes("@")) {
      setStatus("error");
      setErrorMessage(t("footer.emailError"));
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("https://api.convertkit.com/v4/forms/9581434/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_address: email,
          api_key: "kit_4a8396b3ff214ca454c22aad5ca067a9",
        }),
      });

      if (response.ok) {
        setStatus("success");
        setEmail("");
        // Reset success message after 5 seconds
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("ConvertKit subscription error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        setStatus("error");
        setErrorMessage(errorData.message || t("footer.emailError"));
      }
    } catch (error) {
      console.error("ConvertKit request failed:", error);
      setStatus("error");
      setErrorMessage(t("footer.emailError"));
    }
  };

  if (compact) {
    // Compact version for newsletter sections
    return (
      <div className="glass-panel rounded-3xl p-12 lg:p-16 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
          {t("news.newsletter.title")}
        </h2>
        <p className="text-base text-gray-600 dark:text-zinc-400 mb-8 max-w-xl mx-auto">
          {t("news.newsletter.description")}
        </p>

        {status === "success" ? (
          <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mx-auto w-fit">
            <svg
              className="w-5 h-5 text-emerald-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm text-emerald-400 font-medium">{t("footer.subscribed")}</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setStatus("idle");
              }}
              placeholder={t("news.newsletter.placeholder")}
              disabled={status === "loading"}
              className="flex-1 px-4 py-3 rounded-xl glass-panel text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 text-white px-6 py-3 rounded-xl transition-all duration-200 font-semibold text-sm shadow-md shadow-indigo-500/20 active:scale-95 whitespace-nowrap"
            >
              {status === "loading" ? t("footer.subscribing") : t("news.newsletter.cta")}
            </button>
          </form>
        )}
        {status === "error" && <p className="text-sm text-red-400 mt-3">{errorMessage}</p>}
      </div>
    );
  }

  // Full version for footer
  return (
    <div className="lg:col-span-2">
      <h3 className="text-white font-semibold text-sm mb-2 tracking-wide">
        {t("footer.stayUpdated")}
      </h3>
      <p className="text-xs text-zinc-500 mb-4 leading-relaxed">{t("footer.stayUpdatedDesc")}</p>

      {status === "success" ? (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <svg
            className="w-4 h-4 text-emerald-400 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs text-emerald-400 font-medium">{t("footer.subscribed")}</span>
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setStatus("idle");
            }}
            placeholder={t("footer.emailPlaceholder")}
            disabled={status === "loading"}
            className={`bg-zinc-900 border rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none transition-colors disabled:opacity-60 ${
              status === "error"
                ? "border-red-500/60 focus:border-red-500"
                : "border-zinc-800 focus:border-indigo-500"
            }`}
          />
          {status === "error" && <p className="text-[10px] text-red-400 px-1">{errorMessage}</p>}
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 text-white rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 active:scale-95 shadow-md shadow-indigo-500/20"
          >
            {status === "loading" ? t("footer.subscribing") : t("footer.subscribe")}
          </button>
        </form>
      )}
    </div>
  );
}
