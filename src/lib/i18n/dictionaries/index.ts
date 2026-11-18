import type { Locale } from "@/lib/i18n/config";
import { withBrand } from "@/lib/i18n/format";
import { auth } from "@/lib/i18n/dictionaries/auth";
import { common } from "@/lib/i18n/dictionaries/common";
import { marketing } from "@/lib/i18n/dictionaries/marketing";
import { organizations } from "@/lib/i18n/dictionaries/organizations";
import { statuses } from "@/lib/i18n/dictionaries/statuses";

function build(locale: Locale) {
  return withBrand({
    common: common[locale],
    statuses: statuses[locale],
    marketing: marketing[locale],
    auth: auth[locale],
    organizations: organizations[locale],
  });
}

export type Dictionary = ReturnType<typeof build>;

export const dictionaries: Record<Locale, Dictionary> = {
  ru: build("ru"),
  kk: build("kk"),
  en: build("en"),
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
