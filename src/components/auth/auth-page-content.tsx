"use client";

import Link from "next/link";
import { CheckCircle2, MonitorCheck } from "lucide-react";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { LoginForm } from "@/components/forms/login-form";
import { RegisterForm } from "@/components/forms/register-form";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { useLanguage } from "@/components/marketing/language-provider";
import { Button } from "@/components/ui/button";

export function LoginPageContent({ next }: { next?: string }) {
  const { copy } = useLanguage();
  return <div className="w-full"><p className="text-sm font-bold text-primary">{copy.auth.loginEyebrow}</p><h1 className="mt-2 text-3xl font-black tracking-tight">{copy.auth.loginTitle}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.auth.loginDescription}</p><div className="mt-8"><LoginForm next={next} /></div><p className="mt-7 text-center text-sm text-muted-foreground">{copy.auth.noAccount} <Link href="/auth/register" className="font-bold text-primary hover:underline">{copy.auth.registerLink}</Link></p></div>;
}

export function RegisterPageContent() {
  const { copy } = useLanguage();
  return <div className="w-full"><p className="text-sm font-bold text-primary">{copy.auth.registerEyebrow}</p><h1 className="mt-2 text-3xl font-black tracking-tight">{copy.auth.registerTitle}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.auth.registerDescription}</p><div className="mt-7"><RegisterForm /></div><p className="mt-6 text-center text-sm text-muted-foreground">{copy.auth.hasAccount} <Link href="/auth/login" className="font-bold text-primary hover:underline">{copy.auth.login}</Link></p></div>;
}

export function ForgotPasswordPageContent() {
  const { copy } = useLanguage();
  return <div className="w-full"><p className="text-sm font-bold text-primary">{copy.auth.recoveryEyebrow}</p><h1 className="mt-2 text-3xl font-black tracking-tight">{copy.auth.recoveryTitle}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.auth.recoveryDescription}</p><div className="mt-8"><ForgotPasswordForm /></div><p className="mt-7 text-center text-sm"><Link href="/auth/login" className="font-bold text-primary hover:underline">{copy.auth.backToLogin}</Link></p></div>;
}

export function ResetPasswordPageContent() {
  const { copy } = useLanguage();
  return <div className="w-full"><p className="text-sm font-bold text-primary">{copy.auth.security}</p><h1 className="mt-2 text-3xl font-black tracking-tight">{copy.auth.newPasswordTitle}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.auth.newPasswordDescription}</p><div className="mt-8"><ResetPasswordForm /></div></div>;
}

export function ConfirmedPageContent() {
  const { copy } = useLanguage();
  return <div className="w-full text-center"><div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-success/10 text-success"><CheckCircle2 className="size-8" /></div><p className="mt-6 text-sm font-bold text-success">{copy.auth.confirmedEyebrow}</p><h1 className="mt-2 text-3xl font-black tracking-tight">{copy.auth.confirmedTitle}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.auth.confirmedDescription}</p><div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4 text-left"><MonitorCheck className="mt-0.5 size-5 shrink-0 text-primary" /><p className="text-sm leading-6 text-foreground">{copy.auth.confirmedNotice}</p></div><Button asChild variant="outline" className="mt-7 w-full"><Link href="/">{copy.auth.homeQamqor}</Link></Button></div>;
}
