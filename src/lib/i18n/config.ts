import { brand } from "@/config/brand";

export const locales = ["ru", "kk", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = brand.defaultLocale;
export const LOCALE_COOKIE = "qamqor-language";

export const localeLabels: Record<Locale, string> = {
  ru: "РУС",
  kk: "ҚАЗ",
  en: "ENG",
};

export const localeNames: Record<Locale, string> = {
  ru: "Русский",
  kk: "Қазақша",
  en: "English",
};

export const localeTags: Record<Locale, string> = {
  ru: "ru-RU",
  kk: "kk-KZ",
  en: "en-US",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : defaultLocale;
}
