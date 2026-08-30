"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useI18n } from "@/i18n";

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function SparklesIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}

function PlayIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function FlowIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4"
      />
    </svg>
  );
}

function LightningIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
}

function ShieldIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
      />
    </svg>
  );
}

function CurrencyIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1M18 12a6 6 0 11-12 0 6 6 0 0112 0z"
      />
    </svg>
  );
}

function SlidersIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
      />
    </svg>
  );
}

function GrowIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4 text-emerald-500" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function WaveformVisualizer({
  isPlaying,
  barCount = 18,
}: {
  isPlaying: boolean;
  barCount?: number;
}) {
  return (
    <div className="flex items-center gap-1 h-8 px-2">
      {Array.from({ length: barCount }).map((_, i) => (
        <span
          key={i}
          className={`w-1 rounded-full transition-all duration-300 ${
            isPlaying
              ? "bg-gradient-to-t from-indigo-500 to-purple-400 soundwave-bar"
              : "bg-gray-300 dark:bg-zinc-700 h-2"
          }`}
          style={{
            animationDelay: `${(i % 5) * 0.18}s`,
            animationDuration: `${0.7 + (i % 4) * 0.25}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Demo Voices for Interactive Showcase ─────────────────────────────────────

const HERO_VOICES = [
  {
    id: "sarah",
    name: "Sarah Jenkins",
    role: "Warm & Natural Narrator",
    lang: "English (US)",
    accentColor: "from-purple-500 to-indigo-500",
    avatar: "S",
    previewText: "Transform your scripts into broadcast-ready videos in seconds.",
  },
  {
    id: "marcus",
    name: "Marcus Vance",
    role: "Tech Explainer & Documentary",
    lang: "English (UK)",
    accentColor: "from-blue-500 to-cyan-500",
    avatar: "M",
    previewText: "Precision voice cloning and ultra-realistic pacing control.",
  },
  {
    id: "elena",
    name: "Elena Rostova",
    role: "Global Multilingual Voice",
    lang: "Spanish / Multi",
    accentColor: "from-emerald-500 to-teal-500",
    avatar: "E",
    previewText: "Instant localization across 40+ native languages with zero accent drift.",
  },
  {
    id: "alex",
    name: "Alex Rivera",
    role: "Energetic Ad & Commercials",
    lang: "English (US)",
    accentColor: "from-amber-500 to-rose-500",
    avatar: "A",
    previewText: "Capture viewer attention instantly with high-impact emotional hooks.",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    titleKey: "Step 1: Ideate & Script",
    descKey:
      "Enter a topic or rough notes. Our AI scriptwriter crafts structured, viral retention-optimized hooks, body sections, and calls to action.",
    badge: "AI Scripting",
    visualType: "script",
  },
  {
    step: "02",
    titleKey: "Step 2: Voice & Emotion",
    descKey:
      "Select from 200+ studio voices or clone your own. Fine-tune emotion, breath pauses, emphasis, and speed with millimeter precision.",
    badge: "Neural Synthesis",
    visualType: "voice",
  },
  {
    step: "03",
    titleKey: "Step 3: Render & Publish",
    descKey:
      "Generate synced animated captions, dynamic visuals, and multi-format videos (16:9, 9:16 Shorts/TikTok) in 4K resolution.",
    badge: "Cloud Video Engine",
    visualType: "video",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Huavoi cut our video production workflow from 3 days to under 15 minutes. The voice naturalness is indistinguishable from real studio voice actors.",
    author: "David Chen",
    role: "Head of Content",
    company: "ScaleMedia Agency",
    stats: "2.4M monthly views",
    rating: 5,
  },
  {
    quote:
      "The multi-language translation and voice matching saved us over $40,000 in localization costs. We launched our channel in 6 new languages in one week.",
    author: "Sophia Martinez",
    role: "Growth Director",
    company: "NextGen SaaS",
    stats: "6x international reach",
    rating: 5,
  },
  {
    quote:
      "As a solo creator, this platform is my secret superpower. I went from publishing 1 video a week to 5 high-retention videos with zero burnout.",
    author: "Liam O'Connor",
    role: "Tech YouTuber",
    company: "ByteCraft Media",
    stats: "450k Subscribers",
    rating: 5,
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Home() {
  const { t } = useI18n();

  // Interactive Hero Studio State
  const [heroTab, setHeroTab] = useState<"voice" | "script" | "video">("voice");
  const [selectedHeroVoice, setSelectedHeroVoice] = useState(HERO_VOICES[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  // Script Generator Demo State
  const [scriptTopic, setScriptTopic] = useState("Why AI will transform video editing in 2026");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [generatedScript, setGeneratedScript] = useState(
    "Hook: What if you could produce a cinema-grade YouTube video in under 5 minutes?\n\nBody: Traditional production requires days of scripting, expensive voiceover actors, and endless editing revisions. Huavoi automates the heavy lifting while giving you 100% creative direction.\n\nCTA: Try the live playground today and create your first AI video for free."
  );

  // Simulated audio playback effect
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const togglePlayVoice = (voice = selectedHeroVoice) => {
    setSelectedHeroVoice(voice);
    if (isPlayingAudio && voice.id === selectedHeroVoice.id) {
      setIsPlayingAudio(false);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    } else {
      setIsPlayingAudio(true);
      setPlaybackProgress(0);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);

      // Play synthetic web audio tone for tactile browser feedback if supported
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }
      } catch {
        // audio context silent fallback
      }

      audioIntervalRef.current = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
            return 0;
          }
          return prev + 5;
        });
      }, 200);
    }
  };

  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, []);

  const handleSimulateScriptGen = (topic: string) => {
    setScriptTopic(topic);
    setIsGeneratingScript(true);
    setTimeout(() => {
      setIsGeneratingScript(false);
      setGeneratedScript(
        `Hook: Stop wasting 20 hours editing videos. Here is how modern creators 10x their output.\n\nBody: By combining AI script intelligence with real-time neural voice synthesis, you can turn any idea into a polished multi-language video instantly.\n\nCTA: Click below to test your own voice models in our playground.`
      );
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-dot-pattern">
      <Header />

      <main className="flex-1 pt-24 overflow-hidden">
        {/* ─── Hero Section ────────────────────────────────────────────────── */}
        <section className="relative bg-spotlight py-16 lg:py-24 overflow-hidden">
          {/* Ambient Glowing Orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-pink-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
          <div className="absolute top-1/3 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl pointer-events-none -z-10 animate-float" />
          <div className="absolute top-1/2 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-2xl pointer-events-none -z-10 animate-float" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              {/* Feature Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-6 shadow-sm shadow-indigo-500/5 hover:-translate-y-0.5 transition-transform duration-200 cursor-pointer border border-indigo-500/20">
                <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold">
                  {t("hero.badge")}
                </span>
                <span className="text-zinc-400 dark:text-zinc-500 text-[10px]">|</span>
                <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                  Next-Gen Neural Voice & Video Engine
                </span>
                <span className="text-indigo-500">→</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white tracking-tight mb-6 leading-[1.08]">
                {t("hero.title")}
                <br />
                <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {t("hero.titleHighlight")}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-gray-600 dark:text-zinc-300 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
                {t("hero.subtitle")}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Link
                  href={process.env.NEXT_PUBLIC_SIGNUP_URL || "/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full transition-all duration-200 font-bold shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 text-sm"
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span>{t("common.getStartedFree")}</span>
                </Link>
                <Link
                  href="/playground"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 glass-panel text-gray-800 dark:text-zinc-100 px-8 py-4 rounded-full hover:bg-gray-100/70 dark:hover:bg-zinc-800/60 transition-all duration-200 font-semibold text-sm border border-gray-200/60 dark:border-zinc-700/60 active:scale-95 shadow-sm"
                >
                  <PlayIcon className="w-4 h-4 text-indigo-500" />
                  <span>Try Live Playground</span>
                </Link>
              </div>

              {/* Micro Trust Stats */}
              <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-gray-500 dark:text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>200+ Hyper-realistic voices</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Sub-100ms Ultra-low latency</span>
                </div>
              </div>
            </div>

            {/* ─── Interactive Hero Product Simulator ────────────────────── */}
            <div className="mt-12 lg:mt-16 max-w-5xl mx-auto rounded-3xl glass-panel p-2.5 sm:p-3.5 shadow-2xl shadow-indigo-500/10 border border-gray-200/80 dark:border-zinc-800 relative group">
              {/* Window Chrome Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-200/60 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-900/40 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400/90 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-400/90 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400/90 inline-block" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 dark:text-zinc-400 ml-2 hidden sm:inline">
                    Huavoi AI Studio Suite
                  </span>
                </div>

                {/* Studio Mode Selector */}
                <div className="flex items-center gap-1 bg-gray-200/60 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-medium">
                  <button
                    onClick={() => setHeroTab("voice")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      heroTab === "voice"
                        ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold"
                        : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    🎙️ Voice Studio
                  </button>
                  <button
                    onClick={() => setHeroTab("script")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      heroTab === "script"
                        ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold"
                        : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    ✍️ AI Script
                  </button>
                  <button
                    onClick={() => setHeroTab("video")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      heroTab === "video"
                        ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold"
                        : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    🎬 4K Video
                  </button>
                </div>
              </div>

              {/* Window Content Area */}
              <div className="p-4 sm:p-6 bg-gradient-to-b from-white/60 to-gray-50/80 dark:from-zinc-950/70 dark:to-zinc-900/60 rounded-b-2xl min-h-[340px]">
                {/* 1. Voice Studio Tab */}
                {heroTab === "voice" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          Active Voice Synthesizer
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Ready · 48kHz HD
                        </span>
                      </div>

                      {/* Voice List Selectors */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {HERO_VOICES.map((v) => (
                          <div
                            key={v.id}
                            onClick={() => togglePlayVoice(v)}
                            className={`p-3 rounded-2xl cursor-pointer border transition-all duration-200 flex items-center justify-between ${
                              selectedHeroVoice.id === v.id
                                ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500/50 shadow-sm"
                                : "bg-white/70 dark:bg-zinc-900/50 border-gray-200/50 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-zinc-700"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${v.accentColor} text-white flex items-center justify-center font-bold text-sm shadow-sm`}
                              >
                                {v.avatar}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                                  {v.name}
                                </h4>
                                <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                                  {v.lang}
                                </p>
                              </div>
                            </div>
                            <button
                              aria-label="Play voice preview"
                              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                                selectedHeroVoice.id === v.id && isPlayingAudio
                                  ? "bg-indigo-600 text-white"
                                  : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300"
                              }`}
                            >
                              {selectedHeroVoice.id === v.id && isPlayingAudio ? (
                                <PauseIcon className="w-3 h-3" />
                              ) : (
                                <PlayIcon className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Emotion & Tone Tags */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[11px] text-gray-500 dark:text-zinc-400">
                          Emotion Mode:
                        </span>
                        {["Conversational", "Excited Hook", "Storytelling", "Professional Ad"].map(
                          (tag, i) => (
                            <span
                              key={i}
                              className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium cursor-pointer transition-colors ${
                                i === 0
                                  ? "bg-indigo-500 text-white border-indigo-500"
                                  : "bg-white/80 dark:bg-zinc-800/80 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:border-indigo-400"
                              }`}
                            >
                              {tag}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {/* Right Active Preview Card */}
                    <div className="lg:col-span-5 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200/70 dark:border-zinc-800 shadow-lg flex flex-col justify-between h-full space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
                            Live Waveform Synthesis
                          </span>
                          <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                            {isPlayingAudio
                              ? `00:0${Math.min(9, Math.floor(playbackProgress / 10))}`
                              : "00:00"}{" "}
                            / 00:10
                          </span>
                        </div>

                        {/* Waveform Bar */}
                        <div className="bg-gray-100/80 dark:bg-zinc-950 p-3 rounded-xl flex items-center justify-between border border-gray-200/40 dark:border-zinc-800 mb-4">
                          <button
                            onClick={() => togglePlayVoice()}
                            className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20 active:scale-95 transition-transform"
                          >
                            {isPlayingAudio ? (
                              <PauseIcon className="w-4 h-4" />
                            ) : (
                              <PlayIcon className="w-4 h-4 ml-0.5" />
                            )}
                          </button>
                          <WaveformVisualizer isPlaying={isPlayingAudio} barCount={16} />
                        </div>

                        <p className="text-xs text-gray-700 dark:text-zinc-300 italic bg-gray-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-gray-200/30 dark:border-zinc-800/60 leading-relaxed">
                          &quot;{selectedHeroVoice.previewText}&quot;
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                        <span className="text-[11px] text-gray-500 dark:text-zinc-400">
                          Speed: <strong className="text-gray-900 dark:text-white">1.0x</strong>
                        </span>
                        <Link
                          href="/playground"
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 inline-flex items-center gap-1"
                        >
                          Open Playground →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. AI Script Assistant Tab */}
                {heroTab === "script" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                          AI Script Generator
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-zinc-400">
                          Model: Huavoi Script-LLM 4.0
                        </span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                          Select Template or Preset:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "🚀 SaaS Product Launch",
                            "📺 YouTube Tech Review",
                            "📱 TikTok Viral Hook",
                          ].map((preset, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSimulateScriptGen(preset)}
                              className="text-xs px-3 py-1.5 rounded-xl glass-panel hover:border-purple-400 text-gray-800 dark:text-zinc-200 transition-all active:scale-95"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          value={scriptTopic}
                          onChange={(e) => setScriptTopic(e.target.value)}
                          placeholder="Type your topic..."
                          className="w-full text-xs px-4 py-3 rounded-xl glass-panel text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                          onClick={() => handleSimulateScriptGen(scriptTopic)}
                          disabled={isGeneratingScript}
                          className="absolute right-2 top-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold shadow-md active:scale-95 transition-transform"
                        >
                          {isGeneratingScript ? "Writing..." : "Generate"}
                        </button>
                      </div>
                    </div>

                    <div className="lg:col-span-6 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200/70 dark:border-zinc-800 shadow-lg space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                          Generated Output
                        </span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          Estimated duration: 42s
                        </span>
                      </div>
                      <pre className="text-xs text-gray-700 dark:text-zinc-300 font-sans whitespace-pre-wrap leading-relaxed max-h-[160px] overflow-y-auto bg-gray-50 dark:bg-zinc-950/60 p-3 rounded-xl border border-gray-200/40 dark:border-zinc-800/80">
                        {generatedScript}
                      </pre>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => setHeroTab("voice")}
                          className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
                        >
                          Send to Voice Studio →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. 4K Video Engine Tab */}
                {heroTab === "video" && (
                  <div className="relative rounded-2xl overflow-hidden border border-gray-200/50 dark:border-zinc-800/80 bg-zinc-950 aspect-[16/9] shadow-inner flex items-center justify-center">
                    <Image
                      src="/images/dashboard.png"
                      alt={t("hero.dashboardAlt")}
                      width={1024}
                      height={640}
                      className="w-full h-full object-cover select-none opacity-90"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                      <div className="flex flex-wrap items-center justify-between w-full gap-4 text-white">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] uppercase font-bold border border-emerald-500/40">
                              4K UHD 60FPS
                            </span>
                            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono text-[10px] uppercase font-bold border border-indigo-500/40">
                              Auto Dynamic Captions
                            </span>
                          </div>
                          <p className="text-xs text-zinc-300">
                            Synchronized audio waveforms with visual scene transitions.
                          </p>
                        </div>
                        <Link
                          href="/playground"
                          className="px-4 py-2 rounded-xl bg-white text-zinc-900 font-bold text-xs hover:bg-zinc-100 active:scale-95 transition-all shadow-lg"
                        >
                          Launch Studio
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Social Proof / Trusted Logos Marquee ────────────────────────── */}
        <section className="py-12 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md border-y border-gray-200/40 dark:border-zinc-800/80 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <p className="text-center text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest">
              {t("trust.title")}
            </p>
          </div>

          <div className="relative w-full overflow-hidden flex items-center">
            {/* Gradient edge fades for seamless marquee */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-[#030307] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-[#030307] to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee flex items-center gap-6">
              {[1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6].map((i, index) => (
                <div
                  key={index}
                  className="h-11 px-6 glass-panel rounded-full flex items-center justify-center border border-gray-200/60 dark:border-zinc-800/60 hover:border-indigo-500/40 transition-colors whitespace-nowrap gap-2 shrink-0 shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                  <span className="text-zinc-700 dark:text-zinc-300 font-bold text-xs">
                    {t(`trust.company${i}`)}
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                    Verified Creator
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 4-Stat Strip */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="p-4 rounded-2xl glass-panel">
              <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-1">
                10,000+
              </div>
              <div className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
                Videos Created
              </div>
            </div>
            <div className="p-4 rounded-2xl glass-panel">
              <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent mb-1">
                200+
              </div>
              <div className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
                Studio Neural Voices
              </div>
            </div>
            <div className="p-4 rounded-2xl glass-panel">
              <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent mb-1">
                40+
              </div>
              <div className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
                Languages Supported
              </div>
            </div>
            <div className="p-4 rounded-2xl glass-panel">
              <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent mb-1">
                &lt; 10 min
              </div>
              <div className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
                End-to-End Turnaround
              </div>
            </div>
          </div>
        </section>

        {/* ─── Interactive Workflow Pipeline (How It Works) ───────────────── */}
        <section className="py-24 scroll-reveal relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
                Streamlined Pipeline
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
                How Huavoi Creates Magic in 3 Steps
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
                Turn thoughts into fully-realized video productions without expensive hardware,
                microphones, or editing software.
              </p>
            </div>

            {/* Steps Interactive Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {HOW_IT_WORKS_STEPS.map((stepItem, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-6 rounded-3xl cursor-pointer transition-all duration-300 border ${
                    activeStep === idx
                      ? "bg-gradient-to-b from-indigo-500/10 to-purple-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5 scale-[1.02]"
                      : "glass-panel border-gray-200/50 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {stepItem.step}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-300">
                      {stepItem.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {stepItem.titleKey}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                    {stepItem.descKey}
                  </p>
                </div>
              ))}
            </div>

            {/* Active Step Preview Visual Box */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-gray-200/60 dark:border-zinc-800 relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Pipeline Stage {HOW_IT_WORKS_STEPS[activeStep].step}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                    {HOW_IT_WORKS_STEPS[activeStep].titleKey}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                    {HOW_IT_WORKS_STEPS[activeStep].descKey}
                  </p>
                  <div className="space-y-2 pt-2">
                    {activeStep === 0 && (
                      <>
                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-zinc-300">
                          <CheckIcon /> Automatic retention hook optimization
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-zinc-300">
                          <CheckIcon /> Multi-speaker dialogue script support
                        </div>
                      </>
                    )}
                    {activeStep === 1 && (
                      <>
                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-zinc-300">
                          <CheckIcon /> 200+ Studio quality voices in 40+ languages
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-zinc-300">
                          <CheckIcon /> Micro-pacing & emotion slider adjustments
                        </div>
                      </>
                    )}
                    {activeStep === 2 && (
                      <>
                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-zinc-300">
                          <CheckIcon /> Word-by-word synced animated captions
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-zinc-300">
                          <CheckIcon /> Export in 16:9 (YouTube) or 9:16 (Shorts/TikTok)
                        </div>
                      </>
                    )}
                  </div>
                  <Link
                    href="/playground"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 pt-2"
                  >
                    Test this step in playground →
                  </Link>
                </div>

                <div className="lg:col-span-7 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 shadow-xl">
                  {activeStep === 0 && (
                    <div className="space-y-3 font-mono text-xs">
                      <div className="text-gray-400 dark:text-zinc-500">
                        {"// AI Prompt Input:"}
                      </div>
                      <div className="p-3 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded-xl">
                        &quot;Create a 60-second product explainer script for a new AI productivity
                        app.&quot;
                      </div>
                      <div className="text-gray-400 dark:text-zinc-500">
                        {"// Optimized Script Output:"}
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 rounded-xl space-y-2">
                        <p className="text-purple-600 dark:text-purple-400 font-bold">
                          [00:00 - Hook]
                        </p>
                        <p>
                          &quot;You are losing 10 hours every week to manual video formatting. Here
                          is how to fix it.&quot;
                        </p>
                        <p className="text-purple-600 dark:text-purple-400 font-bold">
                          [00:15 - Solution]
                        </p>
                        <p>
                          &quot;With Huavoi, script generation and neural voice synthesis happen in
                          one single click.&quot;
                        </p>
                      </div>
                    </div>
                  )}

                  {activeStep === 1 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold">
                            S
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-900 dark:text-white">
                              Sarah Jenkins · Neural Studio Voice
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-zinc-400">
                              US English · Emotion: Conversational
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-mono px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg font-bold">
                          Latency: 84ms
                        </span>
                      </div>
                      <div className="bg-gray-100 dark:bg-zinc-900 p-4 rounded-xl flex items-center justify-between">
                        <WaveformVisualizer isPlaying={true} barCount={24} />
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200/40 dark:border-zinc-800">
                          <span className="text-gray-500 dark:text-zinc-400 block text-[10px]">
                            Pacing
                          </span>
                          <strong className="text-gray-900 dark:text-white">1.05x Natural</strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200/40 dark:border-zinc-800">
                          <span className="text-gray-500 dark:text-zinc-400 block text-[10px]">
                            Breath Mod
                          </span>
                          <strong className="text-gray-900 dark:text-white">Active (Studio)</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-zinc-300">
                        <span>Rendering Timeline Preview</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                          100% Ready
                        </span>
                      </div>
                      <div className="relative aspect-video rounded-xl bg-zinc-900 overflow-hidden flex items-center justify-center border border-zinc-800">
                        <div className="text-center p-4">
                          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30 mb-2 inline-block">
                            Dynamic Captions Active
                          </span>
                          <h4 className="text-white text-base font-extrabold">
                            &quot;Transform your ideas into{" "}
                            <span className="text-yellow-400 underline">professional videos</span>{" "}
                            in minutes.&quot;
                          </h4>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Solutions Section (Bento Grid) ─────────────────────────────── */}
        <section className="py-24 scroll-reveal bg-white/20 dark:bg-zinc-950/20 backdrop-blur-sm border-y border-gray-200/40 dark:border-zinc-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-3">
                Full Production Power
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                {t("solutions.title")}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
                {t("solutions.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Solution 1: Script Writer */}
              <div className="glass-panel glow-card rounded-3xl p-8 shadow-sm flex flex-col justify-between group border border-gray-200/50 dark:border-zinc-800/80">
                <div>
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100 dark:border-indigo-900 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      Story Intelligence
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {t("solutions.script.title")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6 leading-relaxed">
                    {t("solutions.script.description")}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-500">40+ Frameworks</span>
                  <Link
                    href="/news/ai-revolutionizing-video"
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    {t("common.learnMore")}
                  </Link>
                </div>
              </div>

              {/* Solution 2: Voice Synthesis */}
              <div className="glass-panel glow-card rounded-3xl p-8 shadow-sm flex flex-col justify-between group border border-gray-200/50 dark:border-zinc-800/80">
                <div>
                  <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6 border border-purple-100 dark:border-purple-900 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01.469-1.57m0 0a3 3 0 01-1.469-1.57m0 0L9 7m4.469 4.43a3 3 0 01.469 1.57m0 0a3 3 0 01-1.469 1.57m0 0l.469.43m0 0L15 17"
                      />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      Studio TTS 48kHz
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {t("solutions.voice.title")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6 leading-relaxed">
                    {t("solutions.voice.description")}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-500">200+ Voices</span>
                  <Link
                    href="/playground"
                    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    Try Playground →
                  </Link>
                </div>
              </div>

              {/* Solution 3: Video Generator */}
              <div className="glass-panel glow-card rounded-3xl p-8 shadow-sm flex flex-col justify-between group border border-gray-200/50 dark:border-zinc-800/80">
                <div>
                  <div className="w-12 h-12 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 rounded-2xl flex items-center justify-center mb-6 border border-pink-100 dark:border-pink-900 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-pink-500/10 text-pink-600 dark:text-pink-400">
                      Cloud 4K Engine
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {t("solutions.video.title")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6 leading-relaxed">
                    {t("solutions.video.description")}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-500">60 FPS UHD</span>
                  <Link
                    href="/news/case-study-engagement"
                    className="text-xs font-bold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    {t("common.learnMore")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Bento Features Grid ─────────────────────────────────────────── */}
        <section className="py-24 scroll-reveal">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-bold uppercase tracking-wider mb-3">
                Uncompromising Quality
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                {t("features.title")}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
                {t("features.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { key: "endToEnd", Icon: FlowIcon, color: "text-indigo-500" },
                { key: "speed", Icon: LightningIcon, color: "text-amber-500" },
                { key: "quality", Icon: ShieldIcon, color: "text-indigo-500" },
                { key: "affordable", Icon: CurrencyIcon, color: "text-emerald-500" },
                { key: "customizable", Icon: SlidersIcon, color: "text-purple-500" },
                { key: "scalable", Icon: GrowIcon, color: "text-pink-500" },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="glass-panel glow-card rounded-3xl p-7 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between border border-gray-200/50 dark:border-zinc-800/70 group"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-gray-100/80 dark:bg-zinc-800/80 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200">
                      <feature.Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                      {t(`features.${feature.key}.title`)}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                      {t(`features.${feature.key}.description`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Traditional vs Huavoi Comparison Matrix ─────────────────────── */}
        <section className="py-24 bg-white/20 dark:bg-zinc-950/20 backdrop-blur-sm border-y border-gray-200/40 dark:border-zinc-800/80 scroll-reveal">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                Unbeatable ROI
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
                Traditional Production vs. Huavoi AI
              </h2>
              <p className="text-base text-gray-600 dark:text-zinc-400 max-w-xl mx-auto">
                See why high-growth creators and brands are ditching legacy video pipelines.
              </p>
            </div>

            <div className="glass-panel rounded-3xl overflow-hidden border border-gray-200/70 dark:border-zinc-800 shadow-xl">
              <div className="grid grid-cols-12 bg-gray-100/70 dark:bg-zinc-900/80 p-4 sm:p-6 border-b border-gray-200/60 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider">
                <div className="col-span-4 text-gray-500 dark:text-zinc-400">Feature / Metric</div>
                <div className="col-span-4 text-red-500">Traditional Studio</div>
                <div className="col-span-4 text-emerald-500 font-extrabold flex items-center gap-1">
                  <span>Huavoi AI Platform</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[9px]">
                    10x Faster
                  </span>
                </div>
              </div>

              <div className="divide-y divide-gray-200/50 dark:divide-zinc-800/60 text-xs sm:text-sm">
                {[
                  {
                    metric: "Turnaround Time",
                    trad: "2 to 3 weeks",
                    huavoi: "Under 10 minutes",
                    highlight: true,
                  },
                  {
                    metric: "Cost per Video",
                    trad: "$1,500 - $5,000+",
                    huavoi: "Under $15 / month",
                    highlight: true,
                  },
                  {
                    metric: "Voice Dubbing & Languages",
                    trad: "Separate voice actors & contracts",
                    huavoi: "40+ native languages instantly",
                    highlight: true,
                  },
                  {
                    metric: "Script Adjustments & Retakes",
                    trad: "Days + additional studio fees",
                    huavoi: "1-click real-time re-generation",
                    highlight: true,
                  },
                  {
                    metric: "Scalability",
                    trad: "Limited by studio schedule",
                    huavoi: "Infinite cloud concurrency",
                    highlight: true,
                  },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 p-4 sm:p-6 items-center hover:bg-gray-50/50 dark:hover:bg-zinc-900/40 transition-colors"
                  >
                    <div className="col-span-4 font-semibold text-gray-900 dark:text-white">
                      {row.metric}
                    </div>
                    <div className="col-span-4 text-gray-500 dark:text-zinc-400 flex items-center gap-2">
                      <span className="text-red-400">✕</span> {row.trad}
                    </div>
                    <div className="col-span-4 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <CheckIcon className="w-4 h-4 text-emerald-500 shrink-0" /> {row.huavoi}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Testimonials / Wall of Love ─────────────────────────────────── */}
        <section className="py-24 scroll-reveal">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                Wall of Love
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
                Loved by 12,000+ Creators & Brands
              </h2>
              <p className="text-base text-gray-600 dark:text-zinc-400 max-w-xl mx-auto">
                Hear what YouTubers, marketers, and video agencies are saying about Huavoi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((item, idx) => (
                <div
                  key={idx}
                  className="glass-panel glow-card rounded-3xl p-7 shadow-sm border border-gray-200/60 dark:border-zinc-800 flex flex-col justify-between"
                >
                  <div>
                    {/* Stars */}
                    <div className="flex items-center gap-1 text-amber-400 mb-4">
                      {Array.from({ length: item.rating }).map((_, s) => (
                        <svg key={s} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-zinc-300 leading-relaxed italic mb-6">
                      &quot;{item.quote}&quot;
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                        {item.author}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                        {item.role}, {item.company}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                      {item.stats}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Premium Cosmic CTA Block ────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 scroll-reveal">
          <div className="max-w-5xl mx-auto rounded-[2.5rem] bg-gradient-to-br from-indigo-950 via-zinc-950 to-purple-950 text-center relative overflow-hidden p-10 sm:p-16 lg:p-20 shadow-2xl border border-indigo-500/30">
            {/* Visual background lights */}
            <div className="absolute top-0 left-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-white text-xs font-semibold mb-6 border border-white/15">
                <SparklesIcon className="w-3.5 h-3.5 text-yellow-300" />
                <span>Start creating in less than 60 seconds</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 leading-tight">
                {t("cta.title")}
              </h2>
              <p className="text-sm sm:text-base text-indigo-200 mb-10 leading-relaxed font-normal">
                {t("cta.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href={process.env.NEXT_PUBLIC_SIGNUP_URL || "/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-indigo-950 hover:bg-zinc-100 px-8 py-4 rounded-full transition-all duration-200 font-bold shadow-xl text-sm active:scale-95 hover:shadow-2xl"
                >
                  <SparklesIcon className="w-4 h-4 text-indigo-600" />
                  <span>{t("common.startFreeTrial")}</span>
                </Link>
                <Link
                  href="/pricing"
                  className="w-full sm:w-auto border border-white/25 text-white hover:bg-white/10 px-8 py-4 rounded-full transition-all duration-200 font-semibold text-sm active:scale-95"
                >
                  {t("common.viewPricing")}
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-indigo-300/80">
                <div className="flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-emerald-400" />
                  <span>Free tier with full voice playground</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-emerald-400" />
                  <span>Instant high-res downloads</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FAQ Section ─────────────────────────────────────────────────── */}
        <section className="py-24 scroll-reveal">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
                Help & Answers
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
                {t("faq.title")}
              </h2>
              <p className="text-base text-gray-600 dark:text-zinc-400 max-w-xl mx-auto">
                Got questions? We have answers. If you need anything else, feel free to reach out.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {["q1", "q2", "q3", "q4"].map((q, i) => (
                <details
                  key={i}
                  className="glass-panel rounded-2xl p-6 group transition-all duration-200 hover:border-indigo-500/30 border border-gray-200/60 dark:border-zinc-800"
                >
                  <summary className="cursor-pointer list-none flex justify-between items-center font-bold text-gray-900 dark:text-white text-sm sm:text-base select-none">
                    {t(`faq.${q}.question`)}
                    <span className="flex-shrink-0 ml-4 w-6 h-6 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center group-open:bg-indigo-500/10 group-open:text-indigo-500 transition-colors">
                      <svg
                        className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400 group-open:rotate-180 group-open:text-indigo-500 transition-transform duration-200"
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
                  <p className="mt-4 text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed border-t border-gray-100 dark:border-zinc-800/80 pt-4">
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
