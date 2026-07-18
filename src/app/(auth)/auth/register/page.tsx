import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata: Metadata = { title: "Регистрация" };
export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  return <div className="w-full"><p className="text-sm font-bold text-primary">Новый аккаунт</p><h1 className="mt-2 text-3xl font-black tracking-tight">Присоединяйтесь к Qamqor</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Выберите роль — её нельзя изменить самостоятельно после регистрации.</p><div className="mt-7"><RegisterForm defaultRole={role === "coordinator" ? "coordinator" : "volunteer"} /></div><p className="mt-6 text-center text-sm text-muted-foreground">Уже есть аккаунт? <Link href="/auth/login" className="font-bold text-primary hover:underline">Войти</Link></p></div>;
}
