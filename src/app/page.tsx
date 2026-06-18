"use client";

import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useI18n } from "@/i18n";

// ─── SVG Icons for Features ──────────────────────────────────────────────────

function FlowIcon() {
  return (
    <svg
      className="w-5 h-5 text-indigo-500 dark:text-indigo-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4"
      />
    </svg>
  );
}

function LightningIcon() {
  return (
    <svg
      className="w-5 h-5 text-amber-500 dark:text-amber-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      className="w-5 h-5 text-indigo-500 dark:text-indigo-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
      />
    </svg>
  );
}

function CurrencyIcon() {
  return (
    <svg
      className="w-5 h-5 text-emerald-500 dark:text-emerald-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1M18 12a6 6 0 11-12 0 6 6 0 0112 0z"
      />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg
      className="w-5 h-5 text-indigo-500 dark:text-indigo-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
      />
    </svg>
  );
}

function GrowIcon() {
  return (
    <svg
      className="w-5 h-5 text-indigo-500 dark:text-indigo-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col bg-dot-pattern">
      <Header />

      <main className="flex-1 pt-24">
        {/* ─── Hero Section ────────────────────────────────────────────────── */}
        <section className="relative bg-spotlight py-16 lg:py-28 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Feature Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full glass-panel text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-6 shadow-sm shadow-indigo-500/5 hover:-translate-y-0.5 transition-transform duration-200">
                <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
                <span>{t("hero.badge")}</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 leading-[1.1]">
                {t("hero.title")}
                <br />
                <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {t("hero.titleHighlight")}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-gray-600 dark:text-zinc-400 max-w-3xl mx-auto mb-8 leading-relaxed">
                {t("hero.subtitle")}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/"
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3.5 rounded-full transition-all duration-200 font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 text-sm"
                >
                  {t("common.getStartedFree")}
                </Link>
                <Link
                  href="/"
                  className="w-full sm:w-auto glass-panel text-gray-700 dark:text-zinc-300 px-8 py-3.5 rounded-full hover:bg-gray-100/50 dark:hover:bg-zinc-800/40 transition-all duration-200 font-semibold text-sm active:scale-95"
                >
                  {t("common.watchDemo")}
                </Link>
              </div>

              {/* Product Mockup Showcase */}
              <div className="mt-16 lg:mt-24 relative max-w-5xl mx-auto rounded-3xl glass-panel p-2 shadow-2xl shadow-indigo-500/5 dark:shadow-indigo-500/10">
                <div className="rounded-2xl overflow-hidden border border-gray-200/50 dark:border-zinc-800/80 bg-zinc-950 aspect-[16/10] relative shadow-inner">
                  <Image
                    src="/images/dashboard.png"
                    alt={t("hero.dashboardAlt")}
                    width={1024}
                    height={640}
                    className="w-full h-full object-cover select-none"
                    priority
                  />
                </div>
                {/* Visual glows behind container */}
                <div className="absolute -top-12 -left-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
                <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* ─── Client Logos Section ────────────────────────────────────────── */}
        <section className="py-16 bg-white/20 dark:bg-zinc-950/20 backdrop-blur-sm border-y border-gray-200/40 dark:border-zinc-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-widest">
                {t("trust.title")}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center opacity-65 grayscale hover:grayscale-0 transition-all duration-300">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-10 glass-panel rounded-full flex items-center justify-center border border-gray-200/40 dark:border-zinc-800/30"
                >
                  <span className="text-zinc-500 dark:text-zinc-400 font-bold text-xs">
                    {t(`trust.company${i}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Solutions Section ───────────────────────────────────────────── */}
        <section className="py-24 scroll-reveal">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                {t("solutions.title")}
              </h2>
              <p className="text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
                {t("solutions.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Solution 1: Script Writer */}
              <div className="glass-panel glow-card rounded-3xl p-8 shadow-sm flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100 dark:border-indigo-950">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {t("solutions.script.title")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6 leading-relaxed">
                    {t("solutions.script.description")}
                  </p>
                </div>
                <Link
                  href="/"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                >
                  {t("common.learnMore")}
                </Link>
              </div>

              {/* Solution 2: Voice Synthesis */}
              <div className="glass-panel glow-card rounded-3xl p-8 shadow-sm flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6 border border-purple-100 dark:border-purple-950">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01.469-1.57m0 0a3 3 0 01-1.469-1.57m0 0L9 7m4.469 4.43a3 3 0 01.469 1.57m0 0a3 3 0 01-1.469 1.57m0 0l.469.43m0 0L15 17"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {t("solutions.voice.title")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6 leading-relaxed">
                    {t("solutions.voice.description")}
                  </p>
                </div>
                <Link
                  href="/"
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                >
                  {t("common.learnMore")}
                </Link>
              </div>

              {/* Solution 3: Video Generator */}
              <div className="glass-panel glow-card rounded-3xl p-8 shadow-sm flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 rounded-2xl flex items-center justify-center mb-6 border border-pink-100 dark:border-pink-950">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {t("solutions.video.title")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6 leading-relaxed">
                    {t("solutions.video.description")}
                  </p>
                </div>
                <Link
                  href="/"
                  className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                >
                  {t("common.learnMore")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Bento Features Section ──────────────────────────────────────── */}
        <section className="py-24 bg-white/10 dark:bg-zinc-950/10 backdrop-blur-sm scroll-reveal">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                {t("features.title")}
              </h2>
              <p className="text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
                {t("features.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { key: "endToEnd", Icon: FlowIcon },
                { key: "speed", Icon: LightningIcon },
                { key: "quality", Icon: ShieldIcon },
                { key: "affordable", Icon: CurrencyIcon },
                { key: "customizable", Icon: SlidersIcon },
                { key: "scalable", Icon: GrowIcon },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="glass-panel rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                      <feature.Icon />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                      {t(`features.${feature.key}.title`)}
                    </h3>
                    <p className="text-xs text-gray-650 dark:text-zinc-400 leading-relaxed">
                      {t(`features.${feature.key}.description`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Premium CTA Block ───────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 scroll-reveal">
          <div className="max-w-5xl mx-auto rounded-[2.5rem] bg-gradient-to-br from-indigo-900 via-zinc-950 to-indigo-950 text-center relative overflow-hidden p-12 lg:p-20 shadow-2xl border border-indigo-500/20">
            {/* Visual background lights */}
            <div className="absolute top-0 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
                {t("cta.title")}
              </h2>
              <p className="text-base text-indigo-200 mb-10 leading-relaxed">{t("cta.subtitle")}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/"
                  className="w-full sm:w-auto bg-white text-indigo-950 hover:bg-zinc-150 px-8 py-3.5 rounded-full transition-all duration-200 font-semibold shadow-lg text-sm active:scale-95"
                >
                  {t("common.startFreeTrial")}
                </Link>
                <Link
                  href="/pricing"
                  className="w-full sm:w-auto border border-white/20 text-white hover:bg-white/10 px-8 py-3.5 rounded-full transition-all duration-200 font-semibold text-sm active:scale-95"
                >
                  {t("common.viewPricing")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FAQ Section ─────────────────────────────────────────────────── */}
        <section className="py-24 scroll-reveal">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                {t("faq.title")}
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {["q1", "q2", "q3", "q4"].map((q, i) => (
                <details
                  key={i}
                  className="glass-panel rounded-2xl p-6 group transition-all duration-200 hover:border-indigo-500/25"
                >
                  <summary className="cursor-pointer list-none flex justify-between items-center font-semibold text-gray-900 dark:text-white text-sm">
                    {t(`faq.${q}.question`)}
                    <span className="flex-shrink-0 ml-4 w-5 h-5 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center group-open:bg-indigo-500/10 group-open:text-indigo-500 transition-colors">
                      <svg
                        className="w-3.5 h-3.5 text-gray-550 dark:text-zinc-450 group-open:rotate-180 group-open:text-indigo-500 transition-transform duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-4 text-xs text-gray-600 dark:text-zinc-400 leading-relaxed border-t border-gray-100 dark:border-zinc-850 pt-4">
                    {t(`faq.${q}.answer`)}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
