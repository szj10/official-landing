export const locales = ["en", "zh-CN", "zh-TW", "ja", "ko", "de", "fr", "es"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, { name: string; flag: string }> = {
  en: { name: "English", flag: "🇺🇸" },
  "zh-CN": { name: "简体中文", flag: "简" },
  "zh-TW": { name: "繁體中文", flag: "繁" },
  es: { name: "Español", flag: "🇪🇸" },
  fr: { name: "Français", flag: "🇫🇷" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  ko: { name: "한국어", flag: "🇰🇷" },
  ja: { name: "日本語", flag: "🇯🇵" },
};

export const defaultLocale: Locale = "en";

/** One-time localStorage migration from pre-BCP-47 codes (UI only). */
const STORED_LOCALE_MIGRATION: Record<string, Locale> = {
  chs: "zh-CN",
  cht: "zh-TW",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function normalizeLocale(locale: string | null | undefined): Locale | null {
  if (!locale) {
    return null;
  }

  const migrated = STORED_LOCALE_MIGRATION[locale];
  if (migrated) {
    return migrated;
  }

  const normalized = locale.replace("_", "-");
  if (isLocale(normalized)) {
    return normalized;
  }

  const lower = normalized.toLowerCase();

  for (const canonical of locales) {
    if (canonical.toLowerCase() === lower) {
      return canonical;
    }
  }

  if (lower.startsWith("zh")) {
    if (lower.includes("hant") || lower === "zh-tw") {
      return "zh-TW";
    }
    return "zh-CN";
  }

  const language = lower.split("-")[0];
  for (const canonical of locales) {
    if (canonical.split("-")[0].toLowerCase() === language) {
      return canonical;
    }
  }

  return null;
}

export function resolveStoredLocale(raw: string | null): Locale | null {
  return normalizeLocale(raw);
}

export function resolveTtsLanguage(
  voiceLanguage: string | null | undefined,
  uiLocale: Locale
): Locale {
  return normalizeLocale(voiceLanguage) ?? uiLocale;
}

export function getDateLocale(locale: Locale): string {
  return locale;
}

export function isChineseLocale(locale: Locale): boolean {
  return locale === "zh-CN" || locale === "zh-TW";
}
