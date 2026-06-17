"use client";

import Link from "next/link";
import { useState } from "react";

// ─── Social Icons ─────────────────────────────────────────────────────────────

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.552 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

// ─── Social links ─────────────────────────────────────────────────────────────

const socialLinks = [
  {
    name: "X (Twitter)",
    href: "https://x.com/huavoi",
    Icon: XIcon,
    hoverClass: "hover:text-white hover:bg-black dark:hover:bg-zinc-800",
  },
  {
    name: "Discord",
    href: "https://discord.gg/huavoi",
    Icon: DiscordIcon,
    hoverClass: "hover:text-white hover:bg-[#5865F2]",
  },
  {
    name: "GitHub",
    href: "https://github.com/huavoi",
    Icon: GitHubIcon,
    hoverClass: "hover:text-white hover:bg-zinc-700 dark:hover:bg-zinc-600",
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@huavoi",
    Icon: YouTubeIcon,
    hoverClass: "hover:text-white hover:bg-[#FF0000]",
  },
  {
    name: "Telegram",
    href: "https://t.me/huavoi",
    Icon: TelegramIcon,
    hoverClass: "hover:text-white hover:bg-[#0088cc]",
  },
];

const footerLinks = {
  Resources: [
    { label: "Documentation", href: "/" },
    { label: "News & Blog", href: "/news" },
    { label: "Case Studies", href: "/news" },
    { label: "API Reference", href: "/" },
    { label: "Status", href: "/" },
  ],
  Company: [
    { label: "About Us", href: "/" },
    { label: "Careers", href: "/" },
    { label: "Contact", href: "/" },
    { label: "Privacy Policy", href: "/" },
    { label: "Terms of Service", href: "/" },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 1000);
  };

  return (
    <footer className="relative overflow-hidden bg-zinc-950 border-t border-zinc-900/80 text-zinc-400">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute top-0 left-1/4 w-[500px] h-[300px] bg-indigo-600/6 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-purple-600/6 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Top section ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 py-16 border-b border-zinc-900/80">
          {/* Brand col */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 w-fit group">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow duration-300">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-lg font-bold text-white">Huavoi</span>
            </Link>

            <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
              AI-powered video creation platform. Transform ideas into professional videos with
              scriptwriting, voice synthesis, and video generation—all in one place.
            </p>

            {/* System status */}
            <div className="flex items-center gap-2 w-fit px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[11px] font-medium text-emerald-400">
                All systems operational
              </span>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ name, href, Icon, hoverClass }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className={`w-8 h-8 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-500 transition-all duration-200 active:scale-90 ${hoverClass}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav link columns - 2 columns on mobile */}
          <div className="grid grid-cols-2 gap-8 lg:contents">
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section}>
                <h3 className="text-white font-semibold text-sm mb-5 tracking-wide">{section}</h3>
                <ul className="space-y-3">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-xs text-zinc-500 hover:text-indigo-400 transition-colors duration-150"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-semibold text-sm mb-2 tracking-wide">Stay Updated</h3>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              Get the latest AI video news and feature releases in your inbox.
            </p>

            {status === "success" ? (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <svg
                  className="w-4 h-4 text-emerald-400 shrink-0"
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
                <span className="text-xs text-emerald-400 font-medium">
                  You&apos;re subscribed!
                </span>
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
                  placeholder="your@email.com"
                  className={`bg-zinc-900 border rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none transition-colors ${
                    status === "error"
                      ? "border-red-500/60 focus:border-red-500"
                      : "border-zinc-800 focus:border-indigo-500"
                  }`}
                />
                {status === "error" && (
                  <p className="text-[10px] text-red-400 px-1">Please enter a valid email.</p>
                )}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 text-white rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 active:scale-95 shadow-md shadow-indigo-500/20"
                >
                  {status === "loading" ? "Subscribing…" : "Subscribe"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 text-[11px] text-zinc-600">
          <p>© {new Date().getFullYear()} Huavoi, Inc. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <Link
                key={item}
                href="/"
                className="hover:text-zinc-400 transition-colors duration-150"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
