import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";
export const metadata: Metadata = { title: "Новый пароль" };
export default function ResetPasswordPage() { return <div className="w-full"><p className="text-sm font-bold text-primary">Безопасность</p><h1 className="mt-2 text-3xl font-black tracking-tight">Создайте новый пароль</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Используйте не менее 8 символов.</p><div className="mt-8"><ResetPasswordForm /></div></div>; }
