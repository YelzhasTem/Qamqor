import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, resolveLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

/** Locale for server components, read from the language cookie. */
export const getLocale = cache(async (): Promise<Locale> => {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return resolveLocale(value);
});

export async function getServerDictionary() {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}
