"use client";

import Link from "next/link";
import { useState } from "react";
import WechatQRModal from "./WechatQRModal";
import NewsletterSignup from "./NewsletterSignup";
import { useI18n } from "@/i18n";

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

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.124C18.916 3.5 12 3.5 12 3.5s-6.916 0-9.376.562a3.016 3.016 0 0 0-2.122 2.124C0 8.646 0 12 0 12s0 3.354.502 5.814a3.016 3.016 0 0 0 2.122 2.124c2.46.562 9.376.562 9.376.562s6.916 0 9.376-.562a3.016 3.016 0 0 0 2.122-2.124C24 15.346 24 12 24 12s0-3.354-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306-.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function BilibiliIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.813 4.65h-5.325l1.875-1.875c.3-.3.3-.75 0-1.05-.3-.3-.75-.3-1.05 0l-3.3 3.3c-.3.3-.3.75 0 1.05l3.3 3.3c.15.15.3.225.525.225.225 0 .375-.075.525-.225.3-.3.3-.75 0-1.05L12.488 6.15h5.325c2.4 0 4.35 1.95 4.35 4.35v6.3c0 2.4-1.95 4.35-4.35 4.35H6.188c-2.4 0-4.35-1.95-4.35-4.35v-6.3c0-2.4 1.95-4.35 4.35-4.35h2.4c.45 0 .75-.3.75-.75s-.3-.75-.75-.75h-2.4C3.038 4.65.688 8 .688 12.45v6.3c0 4.45 3.35 7.8 7.5 7.8h11.625c4.15 0 7.5-3.35 7.5-7.8v-6.3c0-4.45-3.35-7.8-7.5-7.8zM7.538 15.6c-.6 0-1.125-.525-1.125-1.125s.525-1.125 1.125-1.125 1.125.525 1.125 1.125-.525 1.125-1.125 1.125zm4.5 0c-.6 0-1.125-.525-1.125-1.125s.525-1.125 1.125-1.125 1.125.525 1.125 1.125-.525 1.125-1.125 1.125zm4.5 0c-.6 0-1.125-.525-1.125-1.125s.525-1.125 1.125-1.125 1.125.525 1.125 1.125-.525 1.125-1.125 1.125z" />
    </svg>
  );
}

function WechatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8.691 2.619c-3.939 0-7.139 2.513-7.139 5.607 0 2.063 1.378 3.849 3.453 4.827l-.783 2.352 2.743-1.381c.541.107 1.102.166 1.681.166.323 0 .641-.022.951-.063-.19-.575-.291-1.182-.291-1.813 0-3.126 2.914-5.663 6.509-5.663.411 0 .815.034 1.207.098-.607-2.537-3.524-4.13-7.331-4.13zm-2.17 4.39c-.656 0-1.188-.532-1.188-1.188s.532-1.188 1.188-1.188 1.188.532 1.188 1.188-.532 1.188-1.188 1.188zm4.341 0c-.656 0-1.188-.532-1.188-1.188s.532-1.188 1.188-1.188 1.188.532 1.188 1.188-.532 1.188-1.188 1.188zm6.166 3.899c-3.211 0-5.816 2.143-5.816 4.785 0 1.728 1.163 3.222 2.865 4.024l-.644 1.934 2.254-1.135c.444.088.904.137 1.379.137 3.211 0 5.816-2.143 5.816-4.785s-2.605-4.91-5.854-4.91zm-1.781 3.899c-.538 0-.975-.437-.975-.975s.437-.975.975-.975 975.437.975.975-.437.975-.975.975z" />
    </svg>
  );
}

// ─── Social links ─────────────────────────────────────────────────────────────

const socialLinks = [
  {
    name: "Twitter",
    href: "https://twitter.com/huavoi",
    Icon: XIcon,
    hoverClass: "hover:text-[#1DA1F2]",
  },
  {
    name: "Discord",
    href: "https://discord.gg/huavoi",
    Icon: DiscordIcon,
    hoverClass: "hover:text-[#5865F2]",
  },
  {
    name: "Telegram",
    href: "https://t.me/huavoi",
    Icon: TelegramIcon,
    hoverClass: "hover:text-[#0088cc]",
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@huavoi",
    Icon: YouTubeIcon,
    hoverClass: "hover:text-[#FF0000]",
  },
  {
    name: "Bilibili",
    href: "https://bilibili.com/huavoi",
    Icon: BilibiliIcon,
    hoverClass: "hover:text-[#00A1D6]",
  },
  {
    name: "WeChat",
    href: "#",
    Icon: WechatIcon,
    hoverClass: "hover:text-[#07C160]",
  },
];

function useFooterLinks(t: (key: string) => string) {
  return {
    [t("footer.resources")]: [
      { label: t("footer.documentation"), href: "/" },
      { label: t("footer.newsBlog"), href: "/news" },
      { label: t("footer.caseStudies"), href: "/news" },
      { label: t("footer.apiReference"), href: "/" },
      { label: t("footer.status"), href: "/" },
    ],
    [t("footer.company")]: [
      { label: t("footer.aboutUs"), href: "/" },
      { label: t("footer.careers"), href: "/" },
      { label: t("footer.contact"), href: "/" },
      { label: t("footer.privacyPolicy"), href: "/privacy" },
      { label: t("footer.termsOfService"), href: "/terms" },
    ],
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Footer() {
  const { t } = useI18n();
  const footerLinks = useFooterLinks(t);
  const [showWechatQR, setShowWechatQR] = useState(false);

  return (
    <footer className="relative overflow-hidden bg-zinc-150/80 dark:bg-zinc-820/80 border-t border-zinc-200 dark:border-zinc-900/80 text-zinc-600 dark:text-zinc-400">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute top-0 left-1/4 w-[500px] h-[300px] bg-indigo-600/6 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-purple-600/6 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Glass panel wrapper */}
        <div className="glass-panel rounded-3xl px-4 sm:px-6 shadow-lg shadow-zinc-200/50 dark:shadow-zinc-900/10">
          {/* ── Top section ─────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 py-12 border-b border-zinc-200 dark:border-zinc-900/80">
            {/* Brand col */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2.5 w-fit group">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow duration-300">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="text-lg font-bold text-zinc-900 dark:text-white">Huavoi</span>
              </Link>

              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
                {t("footer.description")}
              </p>

              {/* Social icons */}
              <div className="flex items-center gap-2">
                {socialLinks.map(({ name, href, Icon, hoverClass }) => {
                  if (name === "WeChat") {
                    return (
                      <button
                        key={name}
                        onClick={() => setShowWechatQR(true)}
                        aria-label={name}
                        className={`w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 transition-all duration-200 active:scale-90 ${hoverClass}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    );
                  }
                  return (
                    <a
                      key={name}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={name}
                      className={`w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 transition-all duration-200 active:scale-90 ${hoverClass}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Nav link columns - 2 columns on mobile */}
            <div className="grid grid-cols-2 gap-8 lg:contents lg:col-span-2">
              {Object.entries(footerLinks).map(([section, links]) => (
                <div key={section}>
                  <h3 className="text-zinc-900 dark:text-white font-semibold text-sm mb-5 tracking-wide">
                    {section}
                  </h3>
                  <ul className="space-y-3">
                    {links.map(({ label, href }) => (
                      <li key={label}>
                        <Link
                          href={href}
                          className="text-xs text-zinc-600 dark:text-zinc-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-150"
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
            <NewsletterSignup />
          </div>

          {/* ── Bottom bar ──────────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 text-[11px] text-zinc-500 dark:text-zinc-600">
            <p>
              © {new Date().getFullYear()} Huavoi, Inc. {t("footer.copyright")}
            </p>
            <div className="flex items-center gap-5">
              {[
                { label: t("footer.privacy"), href: "/privacy" },
                { label: t("footer.terms"), href: "/terms" },
                { label: t("footer.cookies"), href: "/" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="hover:text-zinc-900 dark:hover:text-zinc-400 transition-colors duration-150"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>{" "}
        {/* Close glass-panel wrapper */}
      </div>

      <WechatQRModal isOpen={showWechatQR} onClose={() => setShowWechatQR(false)} />
    </footer>
  );
}
