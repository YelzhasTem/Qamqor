import type { Metadata } from "next";
import { ForgotPasswordPageContent } from "@/components/auth/auth-page-content";
export const metadata: Metadata = { title: "Восстановление пароля" };
export default function ForgotPasswordPage() { return <ForgotPasswordPageContent />; }
