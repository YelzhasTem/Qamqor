import type { Metadata } from "next";
import { RegisterPageContent } from "@/components/auth/auth-page-content";
import { getServerDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerDictionary();
  return { title: t.auth.registerLink };
}

export default function RegisterPage() {
  return <RegisterPageContent />;
}
