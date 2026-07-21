import { cookies } from "next/headers";
import { AuthShell } from "@/components/auth/auth-shell";
import { LanguageProvider } from "@/components/marketing/language-provider";
import type { Locale } from "@/lib/i18n/marketing-copy";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const savedLocale = (await cookies()).get("qamqor-language")?.value;
  const initialLocale: Locale = savedLocale === "kk" || savedLocale === "en" ? savedLocale : "ru";
  return <LanguageProvider initialLocale={initialLocale}><AuthShell>{children}</AuthShell></LanguageProvider>;
}
