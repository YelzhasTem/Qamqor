import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
export const metadata: Metadata = { title: "Восстановление пароля" };
export default function ForgotPasswordPage() { return <div className="w-full"><p className="text-sm font-bold text-green-700">Восстановление доступа</p><h1 className="mt-2 text-3xl font-black tracking-tight">Забыли пароль?</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Отправим на вашу почту безопасную ссылку для создания нового пароля.</p><div className="mt-8"><ForgotPasswordForm /></div><p className="mt-7 text-center text-sm"><Link href="/auth/login" className="font-bold text-green-700 hover:underline">Вернуться ко входу</Link></p></div>; }
