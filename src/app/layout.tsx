import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/components/i18n/language-provider";
import { brand, brandCssVariables } from "@/config/brand";
import { brandFont } from "@/config/font";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";

const descriptions = {
  ru: "Проекты волонтёрских организаций Алматы в одной ленте.",
  kk: "Алматыдағы еріктілер ұйымдарының жобалары бір лентада.",
  en: "Projects from Almaty’s volunteer organizations in one feed.",
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
    title: { default: brand.name, template: `%s | ${brand.name}` },
    description: descriptions[locale],
    applicationName: brand.name,
    appleWebApp: { capable: true, title: brand.shortName, statusBarStyle: "default" },
    formatDetection: { telephone: false },
    openGraph: {
      title: brand.name,
      description: descriptions[locale],
      type: "website",
      siteName: brand.name,
      locale: locale === "kk" ? "kk_KZ" : locale === "en" ? "en_US" : "ru_KZ",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: brand.themeColor,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={brandFont.variable} style={brandCssVariables} suppressHydrationWarning>
      <body>
        <LanguageProvider initialLocale={locale}>
          {children}
        </LanguageProvider>
        <Toaster
          position="top-center"
          closeButton
          toastOptions={{
            classNames: {
              toast: "rounded-2xl! border-hairline! bg-surface! text-ink! font-sans!",
              success: "border-positive-foreground/30!",
              warning: "border-waiting-foreground/30!",
              error: "border-negative-foreground/30!",
              info: "border-informative-foreground/30!",
              description: "text-ink-secondary!",
            },
          }}
        />
      </body>
    </html>
  );
}
