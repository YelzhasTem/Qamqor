"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { LoginForm } from "@/components/forms/login-form";
import { RegisterForm } from "@/components/forms/register-form";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";

function AuthHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-[26px] leading-tight font-extrabold tracking-tight">{title}</h1>
      {description ? <p className="mt-2 text-[15px] leading-6 text-ink-secondary">{description}</p> : null}
    </div>
  );
}

function SecondaryLinks({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 flex flex-col items-center gap-1 border-t border-hairline pt-5 text-center text-[15px] text-ink-secondary">{children}</div>;
}

const linkClass = "inline-flex min-h-11 items-center font-semibold text-ink underline decoration-control underline-offset-4 hover:decoration-ink";

export function LoginPageContent({ next, callbackError }: { next?: string; callbackError?: boolean }) {
  const { t } = useLanguage();
  return (
    <>
      <AuthHeading title={t.auth.loginTitle} description={t.auth.loginDescription} />
      <LoginForm next={next} initialError={callbackError ? t.auth.errors.callback : undefined} />
      <SecondaryLinks>
        <span>{t.auth.noAccount} <Link href={next ? `/auth/register?next=${encodeURIComponent(next)}` : "/auth/register"} className={linkClass}>{t.auth.registerLink}</Link></span>
      </SecondaryLinks>
    </>
  );
}

export function RegisterPageContent() {
  const { t } = useLanguage();
  return (
    <>
      <AuthHeading title={t.auth.registerTitle} description={t.auth.registerDescription} />
      <RegisterForm />
      <SecondaryLinks>
        <span>{t.auth.hasAccount} <Link href="/auth/login" className={linkClass}>{t.auth.login}</Link></span>
      </SecondaryLinks>
    </>
  );
}

export function ForgotPasswordPageContent() {
  const { t } = useLanguage();
  return (
    <>
      <AuthHeading title={t.auth.recoveryTitle} description={t.auth.recoveryDescription} />
      <ForgotPasswordForm />
      <SecondaryLinks><Link href="/auth/login" className={linkClass}>{t.auth.backToLogin}</Link></SecondaryLinks>
    </>
  );
}

export function ResetPasswordPageContent() {
  const { t } = useLanguage();
  return (
    <>
      <AuthHeading title={t.auth.newPasswordTitle} description={t.auth.newPasswordDescription} />
      <ResetPasswordForm />
    </>
  );
}

export function ConfirmedPageContent() {
  const { t } = useLanguage();
  return (
    <div className="text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-positive text-positive-foreground"><CheckCircle2 aria-hidden="true" className="size-7" /></div>
      <h1 className="mt-5 text-[26px] leading-tight font-extrabold tracking-tight">{t.auth.confirmedTitle}</h1>
      <p className="mt-2 text-[15px] leading-6 text-ink-secondary">{t.auth.confirmedDescription}</p>
      <p className="mt-4 rounded-row bg-inset px-4 py-3 text-left text-sm leading-5 text-ink-muted">{t.auth.confirmedNotice}</p>
      <Button asChild variant="secondary" className="mt-6 w-full"><Link href="/">{t.auth.backHome}</Link></Button>
    </div>
  );
}
