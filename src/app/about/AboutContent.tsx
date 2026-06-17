"use client";

import { useState } from "react";

function TwitterIcon({ className }: { className?: string }) {
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

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.132.001-.324-.151-.324H9.84c-.152 0-.251.192-.151.324l2.082 2.728v5.048l-3.096 1.088c-.18.063-.18.315 0 .378l8.448 2.968c.18.063.36-.09.36-.27V9.952l2.082-2.728z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.124C18.916 3.5 12 3.5 12 3.5s-6.916 0-9.376.562a3.016 3.016 0 0 0-2.122 2.124C0 8.646 0 12 0 12s0 3.354.502 5.814a3.016 3.016 0 0 0 2.122 2.124c2.46.562 9.376.562 9.376.562s6.916 0 9.376-.562a3.016 3.016 0 0 0 2.122-2.124C24 15.346 24 12 24 12s0-3.354-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
}

export default function AboutContent() {
  const [showWechatQR, setShowWechatQR] = useState(false);

  const socialLinks = [
    {
      name: "Twitter",
      icon: TwitterIcon,
      href: "https://twitter.com/huavoi",
      color: "hover:text-[#1DA1F2]",
    },
    {
      name: "Discord",
      icon: DiscordIcon,
      href: "https://discord.gg/huavoi",
      color: "hover:text-[#5865F2]",
    },
    {
      name: "Telegram",
      icon: TelegramIcon,
      href: "https://t.me/huavoi",
      color: "hover:text-[#0088cc]",
    },
    {
      name: "YouTube",
      icon: YoutubeIcon,
      href: "https://youtube.com/@huavoi",
      color: "hover:text-[#FF0000]",
    },
    {
      name: "Bilibili",
      icon: BilibiliIcon,
      href: "https://bilibili.com/huavoi",
      color: "hover:text-[#00A1D6]",
    },
  ];

  return (
    <>
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-6 shadow-sm shadow-indigo-500/5">
              <span>About Us</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
              About Huavoi
            </h1>
            <p className="text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              We are building the future of video creation with AI. Our mission is to make
              professional video production accessible to everyone.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white/10 dark:bg-zinc-950/10 backdrop-blur-sm border-t border-gray-200/40 dark:border-zinc-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
              Connect With Us
            </h2>
            <p className="text-base text-gray-600 dark:text-zinc-400 max-w-xl mx-auto">
              Join our community and stay updated on the latest news and features
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`glass-panel rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-gray-600 dark:text-zinc-400 ${link.color} hover:shadow-lg hover:-translate-y-1 transition-all duration-200`}
              >
                <link.icon className="w-8 h-8" />
                <span className="text-xs font-semibold">{link.name}</span>
              </a>
            ))}

            <button
              onClick={() => setShowWechatQR(!showWechatQR)}
              className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-gray-600 dark:text-zinc-400 hover:text-[#07C160] hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <WechatIcon className="w-8 h-8" />
              <span className="text-xs font-semibold">WeChat</span>
            </button>
          </div>

          {showWechatQR && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={() => setShowWechatQR(false)}
            >
              <div
                className="glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center max-w-sm mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <WechatIcon className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  WeChat Official Account
                </h3>
                <p className="text-xs text-gray-600 dark:text-zinc-400 mb-6">
                  Scan the QR code to follow our official WeChat account
                </p>
                <div className="w-40 h-40 bg-white rounded-xl flex items-center justify-center border-2 border-gray-200 dark:border-zinc-800">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center mb-2">
                      <span className="text-[8px] text-gray-400 dark:text-zinc-600">QR CODE</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowWechatQR(false)}
                  className="mt-6 text-xs text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors"
                >
                  Click anywhere to close
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center">
              <BookIcon className="w-12 h-12 text-indigo-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Documentation
              </h3>
              <p className="text-xs text-gray-600 dark:text-zinc-400 mb-6">
                Comprehensive guides and API documentation
              </p>
              <a
                href="https://docs.huavoi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-semibold text-sm shadow-md shadow-indigo-500/20 active:scale-95 inline-flex items-center gap-2"
              >
                <BookIcon className="w-4 h-4" />
                View Documentation
              </a>
            </div>

            <div className="glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Contact Us</h3>
              <p className="text-xs text-gray-600 dark:text-zinc-400 mb-6">
                Have questions? We're here to help.
              </p>
              <a
                href="mailto:contact@huavoi.com"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-semibold text-sm shadow-md shadow-indigo-500/20 active:scale-95 inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Send Email
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
