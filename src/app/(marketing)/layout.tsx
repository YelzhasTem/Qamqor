import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { LanguageProvider } from "@/components/marketing/language-provider";
import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n/marketing-copy";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const savedLocale = (await cookies()).get("qamqor-language")?.value;
  const initialLocale: Locale = savedLocale === "kk" || savedLocale === "en" ? savedLocale : "ru";
  return <LanguageProvider initialLocale={initialLocale}><SiteHeader /><main>{children}</main><SiteFooter /></LanguageProvider>;
}
