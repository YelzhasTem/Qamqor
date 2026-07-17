import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = { title: "Вход" };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <div className="w-full"><p className="text-sm font-bold text-green-700">С возвращением</p><h1 className="mt-2 text-3xl font-black tracking-tight">Войдите в Qamqor</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Управляйте проектами, заявками и своей историей помощи.</p><div className="mt-8"><LoginForm next={next} /></div><p className="mt-7 text-center text-sm text-muted-foreground">Нет аккаунта? <Link href="/auth/register" className="font-bold text-green-700 hover:underline">Зарегистрироваться</Link></p></div>;
}
