"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { useI18n, localeNames, type Locale } from "@/i18n";

// ─── Icons ───────────────────────────────────────────────────────────────────

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

// ─── Nav links config ─────────────────────────────────────────────────────────

const NAV_LINKS = [
  { key: "header.home", href: "/" },
  { key: "header.playground", href: "/playground" },
  { key: "header.news", href: "/news" },
  { key: "header.pricing", href: "/pricing" },
  { key: "header.about", href: "/about" },
] as const;

// ─── Theme options ────────────────────────────────────────────────────────────

const THEME_OPTIONS = [
  { value: "light", label: "header.light", Icon: SunIcon },
  { value: "dark", label: "header.dark", Icon: MoonIcon },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();
  const currentLang = localeNames[locale];

  // Refs for focus management & inert
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mainContentRef = useRef<HTMLElement | null>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    mainContentRef.current = document.querySelector("main");
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  // Close drawer on Escape
  const closeDrawer = useCallback(() => {
    setMobileMenuOpen(false);
    setMobileLangOpen(false);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDrawer();
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen, closeDrawer]);

  // Inert main content when drawer is open & move focus into drawer
  useEffect(() => {
    const main = mainContentRef.current;
    if (mobileMenuOpen) {
      if (main) (main as HTMLElement & { inert: boolean }).inert = true;
      // Prevent body scroll
      document.body.style.overflow = "hidden";
      // Move focus into drawer after animation frame
      requestAnimationFrame(() => firstFocusableRef.current?.focus());
    } else {
      if (main) (main as HTMLElement & { inert: boolean }).inert = false;
      document.body.style.overflow = "";
    }
    return () => {
      if (main) (main as HTMLElement & { inert: boolean }).inert = false;
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close dropdowns on outside click (desktop)
  useEffect(() => {
    const handleClickOutside = () => {
      setLanguageDropdownOpen(false);
    };
    if (languageDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [languageDropdownOpen]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      {/* ── Header bar ─────────────────────────────────────────────────────── */}
      <header className="fixed top-4 left-0 right-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="glass-panel rounded-full px-4 sm:px-6 shadow-lg shadow-indigo-500/5 dark:shadow-indigo-500/10">
            <div className="flex items-center justify-between h-14">
              {/* Logo */}
              <div className="flex items-center">
                <Link
                  href="/"
                  className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md shadow-indigo-500/20">
                    <span className="text-white font-bold text-sm">H</span>
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Huavoi
                  </span>
                </Link>
              </div>

              {/* Desktop nav */}
              <div className="hidden md:flex items-center space-x-6">
                {NAV_LINKS.map(({ key, href }) => (
                  <Link
                    key={key}
                    href={href}
                    className="text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {t(key)}
                  </Link>
                ))}
              </div>

              {/* Desktop controls */}
              <div className="hidden md:flex items-center space-x-3">
                {/* Language */}
                <div className="relative">
                  <button
                    id="desktop-lang-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLanguageDropdownOpen(!languageDropdownOpen);
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/40 transition-all duration-200 text-gray-600 dark:text-gray-300 active:scale-95 text-xs font-medium"
                  >
                    <span
                      className={`leading-none ${locale === "chs" || locale === "cht" ? "text-sm" : "text-base"}`}
                    >
                      {currentLang.flag}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transition-transform duration-250 ${
                        languageDropdownOpen
                          ? "rotate-180 text-indigo-600 dark:text-indigo-400"
                          : ""
                      }`}
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
                  </button>
                  <div
                    className={`absolute right-0 mt-2.5 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-2 z-50 border border-gray-200 dark:border-gray-700 transition-all duration-200 origin-top-right ${
                      languageDropdownOpen
                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto visible"
                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none invisible"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="grid grid-cols-2 gap-1">
                      {Object.entries(localeNames).map(([code, lang]) => (
                        <button
                          key={code}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocale(code as Locale);
                            setLanguageDropdownOpen(false);
                          }}
                          className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg transition-all duration-150 text-left ${
                            locale === code
                              ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-gray-850/50"
                          }`}
                        >
                          <span
                            className={`leading-none ${code === "chs" || code === "cht" ? "text-sm" : "text-base"}`}
                          >
                            {lang.flag}
                          </span>
                          <span className="text-xs truncate">{lang.name}</span>
                          {locale === code && (
                            <CheckIcon className="w-3 h-3 text-indigo-600 dark:text-indigo-400 ml-auto shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Theme */}
                <button
                  id="desktop-theme-btn"
                  onClick={toggleTheme}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/40 transition-all text-gray-600 dark:text-gray-300 active:scale-95"
                  aria-label="Toggle theme"
                >
                  {mounted &&
                    (theme === "dark" ? (
                      <SunIcon className="w-4 h-4" />
                    ) : (
                      <MoonIcon className="w-4 h-4" />
                    ))}
                </button>

                <Link
                  href="/"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1.5 rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/25 active:scale-95 font-medium text-xs"
                >
                  {t("common.getStarted")}
                </Link>
              </div>

              {/* Mobile hamburger */}
              <button
                ref={menuButtonRef}
                id="mobile-menu-btn"
                className="md:hidden relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-drawer"
                aria-label={mobileMenuOpen ? t("header.closeMenu") : t("header.openMenu")}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">
                  {mobileMenuOpen ? t("header.closeMenu") : t("header.openMenu")}
                </span>
                <div className="w-6 h-5 flex flex-col justify-between">
                  <span
                    className={`block h-0.5 rounded-full bg-current transition-all duration-300 origin-center ${mobileMenuOpen ? "rotate-45 translate-y-[9px]" : ""}`}
                  />
                  <span
                    className={`block h-0.5 rounded-full bg-current transition-all duration-300 ${mobileMenuOpen ? "opacity-0 scale-x-0" : ""}`}
                  />
                  <span
                    className={`block h-0.5 rounded-full bg-current transition-all duration-300 origin-center ${mobileMenuOpen ? "-rotate-45 -translate-y-[9px]" : ""}`}
                  />
                </div>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* ── Mobile drawer backdrop ──────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={closeDrawer}
        className={`md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* ── Mobile drawer panel ─────────────────────────────────────────────── */}
      <div
        ref={drawerRef}
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={t("header.navigationMenu")}
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-[min(320px,85vw)] flex flex-col bg-white dark:bg-gray-950 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <Link href="/" className="flex items-center space-x-2" onClick={closeDrawer}>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Huavoi</span>
          </Link>
          <button
            ref={firstFocusableRef}
            onClick={closeDrawer}
            aria-label={t("header.closeMenu")}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
          {/* Nav links */}
          <nav aria-label="Mobile navigation" className="space-y-1 mb-8">
            {NAV_LINKS.map(({ key, href }, i) => (
              <Link
                key={key}
                href={href}
                onClick={closeDrawer}
                style={{ transitionDelay: mobileMenuOpen ? `${i * 40 + 60}ms` : "0ms" }}
                className={`group flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white transition-all duration-200 ${mobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
              >
                <span>{t(key)}</span>
                <svg
                  className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-0.5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mb-6" />

          {/* Settings section */}
          <div className="space-y-5">
            {/* Language picker */}
            <div className="space-y-1.5">
              <p className="px-1 text-xs text-gray-500 dark:text-gray-400">
                {t("header.language")}
              </p>
              <button
                type="button"
                onClick={() => setMobileLangOpen(!mobileLangOpen)}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors duration-200 active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`leading-none ${locale === "chs" || locale === "cht" ? "text-base" : "text-lg"}`}
                  >
                    {currentLang.flag}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {Object.keys(localeNames).length} {t("header.languages")}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                      mobileLangOpen ? "rotate-180 text-blue-600" : ""
                    }`}
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
                </div>
              </button>

              <div
                className={`grid transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  mobileLangOpen
                    ? "grid-rows-[1fr] opacity-100 mt-1.5"
                    : "grid-rows-[0fr] opacity-0 pointer-events-none"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 p-1.5 border border-gray-200 dark:border-gray-700">
                    {Object.entries(localeNames).map(([code, lang]) => (
                      <button
                        key={code}
                        onClick={() => {
                          setLocale(code as Locale);
                          setMobileLangOpen(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                          locale === code
                            ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 font-semibold"
                            : "text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60"
                        }`}
                      >
                        <span
                          className={`leading-none ${code === "chs" || code === "cht" ? "text-sm" : "text-base"}`}
                        >
                          {lang.flag}
                        </span>
                        <span className="truncate text-xs">{lang.name}</span>
                        {locale === code && (
                          <CheckIcon className="w-3.5 h-3.5 text-blue-600 ml-auto shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Theme picker */}
            {mounted && (
              <div className="space-y-1.5">
                <p className="px-1 text-xs text-gray-500 dark:text-gray-400">{t("header.theme")}</p>
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors duration-200 active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2.5">
                    {theme === "dark" ? (
                      <SunIcon className="w-4.5 h-4.5 text-blue-600" />
                    ) : (
                      <MoonIcon className="w-4.5 h-4.5 text-blue-600" />
                    )}
                    <span className="text-xs">
                      {theme === "dark" ? t("header.light") : t("header.dark")}
                    </span>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CTA footer */}
        <div className="shrink-0 px-5 py-5 border-t border-gray-100 dark:border-gray-800">
          <Link
            href="/"
            onClick={closeDrawer}
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-5 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0"
          >
            {t("common.getStarted")}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
}
