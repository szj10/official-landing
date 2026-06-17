export const locales = ["en", "chs", "cht", "es", "fr", "de", "ja", "ko"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, { name: string; flag: string }> = {
  en: { name: "English", flag: "🇺🇸" },
  es: { name: "Español", flag: "🇪🇸" },
  fr: { name: "Français", flag: "🇫🇷" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  ko: { name: "한국어", flag: "🇰🇷" },
  ja: { name: "日本語", flag: "🇯🇵" },
  cht: { name: "繁體中文", flag: "🇭🇰" },
  chs: { name: "简体中文", flag: "🇨🇳" },
};

export const defaultLocale: Locale = "en";
