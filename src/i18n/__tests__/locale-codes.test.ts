import { describe, expect, it } from "vitest";
import { defaultLocale, normalizeLocale, resolveStoredLocale, resolveTtsLanguage } from "../config";

describe("normalizeLocale", () => {
  it("returns canonical BCP-47 codes", () => {
    expect(normalizeLocale("zh-CN")).toBe("zh-CN");
    expect(normalizeLocale("zh-TW")).toBe("zh-TW");
    expect(normalizeLocale("en")).toBe("en");
  });

  it("normalizes regional Chinese variants", () => {
    expect(normalizeLocale("zh-Hans")).toBe("zh-CN");
    expect(normalizeLocale("zh-Hant")).toBe("zh-TW");
    expect(normalizeLocale("zh")).toBe("zh-CN");
  });

  it("migrates legacy chs/cht localStorage values", () => {
    expect(normalizeLocale("chs")).toBe("zh-CN");
    expect(normalizeLocale("cht")).toBe("zh-TW");
  });

  it("returns null for empty or unsupported input", () => {
    expect(normalizeLocale(null)).toBeNull();
    expect(normalizeLocale("")).toBeNull();
    expect(normalizeLocale("unsupported")).toBeNull();
  });
});

describe("resolveStoredLocale", () => {
  it("resolves stored locale or returns null", () => {
    expect(resolveStoredLocale("chs")).toBe("zh-CN");
    expect(resolveStoredLocale("invalid")).toBeNull();
  });
});

describe("resolveTtsLanguage", () => {
  it("prefers voice language when valid", () => {
    expect(resolveTtsLanguage("ja", "en")).toBe("ja");
    expect(resolveTtsLanguage("zh-CN", "en")).toBe("zh-CN");
  });

  it("falls back to UI locale when voice language is missing or invalid", () => {
    expect(resolveTtsLanguage(null, "zh-TW")).toBe("zh-TW");
    expect(resolveTtsLanguage("unsupported", "fr")).toBe("fr");
  });

  it("uses default locale only through explicit UI locale", () => {
    expect(resolveTtsLanguage(null, defaultLocale)).toBe("en");
  });
});
