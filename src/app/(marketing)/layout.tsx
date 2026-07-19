import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { LanguageProvider } from "@/components/marketing/language-provider";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <LanguageProvider><SiteHeader /><main>{children}</main><SiteFooter /></LanguageProvider>;
}
