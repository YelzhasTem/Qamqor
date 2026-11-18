import type { Metadata } from "next";
import { LoginPageContent } from "@/components/auth/auth-page-content";
import { getServerDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerDictionary();
  return { title: t.auth.login };
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return <LoginPageContent next={next} callbackError={error === "callback"} />;
}
