export const locales = ["en", "zh", "es", "fr", "de", "ja", "ko", "zh-TW"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, { name: string; flag: string }> = {
  en: { name: "English", flag: "🇺🇸" },
  zh: { name: "中文", flag: "🇨🇳" },
  es: { name: "Español", flag: "🇪🇸" },
  fr: { name: "Français", flag: "🇫🇷" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  ja: { name: "日本語", flag: "🇯🇵" },
  ko: { name: "한국어", flag: "🇰🇷" },
  "zh-TW": { name: "繁體中文", flag: "🇹🇼" },
};

export const defaultLocale: Locale = "en";
