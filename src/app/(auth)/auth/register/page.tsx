import type { Metadata } from "next";
import { RegisterPageContent } from "@/components/auth/auth-page-content";

export const metadata: Metadata = { title: "Регистрация" };
export default function RegisterPage() {
  return <RegisterPageContent />;
}
