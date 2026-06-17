"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 text-zinc-400 relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md shadow-indigo-500/20">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-lg font-bold text-white">Huavoi</span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              AI-powered video creation platform. Transform ideas into professional videos with
              scriptwriting, voice synthesis, and video generation—all in one place.
            </p>
            <div className="flex space-x-4">
              {/* Social Icons placeholder with custom hover */}
              {["twitter", "github", "discord"].map((social) => (
                <Link
                  key={social}
                  href="/"
                  className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-700 hover:bg-zinc-900/50 transition-all active:scale-90"
                >
                  <span className="text-xs uppercase tracking-wider font-semibold">
                    {social[0]}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Products</h3>
            <ul className="space-y-3 text-xs">
              {["Script Writer", "Voice Synthesis", "Video Generator", "Enterprise"].map((item) => (
                <li key={item}>
                  <Link href="/" className="hover:text-indigo-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Resources</h3>
            <ul className="space-y-3 text-xs">
              {["Documentation", "Blog", "Case Studies"].map((item) => (
                <li key={item}>
                  <Link href="/" className="hover:text-indigo-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Company</h3>
            <ul className="space-y-3 text-xs">
              {["About", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <Link href="/" className="hover:text-indigo-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-white font-semibold text-sm mb-4">Stay Updated</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Subscribe to our newsletter for the latest AI video news and features.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 flex-1 min-w-0"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg px-4 py-2 text-xs font-semibold transition-colors active:scale-95 shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-zinc-900 mt-12 pt-8 text-xs text-center text-zinc-500">
          <p>&copy; {new Date().getFullYear()} Huavoi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
