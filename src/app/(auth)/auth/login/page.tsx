import type { Metadata } from "next";
import { LoginPageContent } from "@/components/auth/auth-page-content";

export const metadata: Metadata = { title: "Вход" };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <LoginPageContent next={next} />;
}
