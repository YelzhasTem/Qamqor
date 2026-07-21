import type { Metadata } from "next";
import { ResetPasswordPageContent } from "@/components/auth/auth-page-content";
export const metadata: Metadata = { title: "Новый пароль" };
export default function ResetPasswordPage() { return <ResetPasswordPageContent />; }
