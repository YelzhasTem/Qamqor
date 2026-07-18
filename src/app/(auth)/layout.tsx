import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/layout/logo";

const benefits = ["Проекты по интересам и городу", "Подтверждённые часы и история", "Достижения и PDF-сертификаты"];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <section className="flex min-h-screen flex-col bg-surface px-5 py-6 sm:px-10 lg:px-16">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 items-center py-12">{children}</div>
        <p className="text-center text-xs text-muted-foreground">Продолжая, вы соглашаетесь с правилами платформы Qamqor.</p>
      </section>
      <section className="hero-grid relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-28 -top-28 size-96 rounded-full bg-secondary/20 blur-3xl" />
        <Link href="/" className="relative text-sm font-semibold text-primary-foreground hover:text-primary-foreground">← Вернуться на главную</Link>
        <div className="relative max-w-xl"><span className="inline-flex rounded-full border border-primary-foreground/25 bg-secondary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-primary-foreground">Volunteer management platform</span><h1 className="mt-6 text-balance text-5xl font-black leading-[1.05] tracking-tight">Ваша помощь становится частью большой истории.</h1><p className="mt-5 max-w-lg text-lg leading-8 text-primary-foreground">Qamqor соединяет людей, которым важно помогать, с командами, которым нужна поддержка.</p><div className="mt-10 grid gap-4">{benefits.map((item) => <div key={item} className="flex items-center gap-3 text-sm font-semibold"><CheckCircle2 className="size-5 text-primary-foreground" />{item}</div>)}</div></div>
        <p className="relative text-sm text-primary-foreground">Qamqor — забота, которую можно увидеть.</p>
      </section>
    </main>
  );
}
