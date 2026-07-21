"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckCircle2, FolderKanban, HandHeart, Loader2, MailCheck, RefreshCw } from "lucide-react";
import { z } from "zod";
import { useLanguage } from "@/components/marketing/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/shared/form-message";
import { normalizeKazakhstanPhone, registerSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { translateValue } from "@/lib/i18n/marketing-copy";

type RegisterValues = z.infer<typeof registerSchema>;
type RegistrationStep = "form" | "waiting" | "finishing";
type SignInCheckResult = "success" | "waiting" | "retry" | "stopped";

const INITIAL_CHECK_INTERVAL = 5_000;
const LATER_CHECK_INTERVAL = 15_000;
const FAST_CHECK_WINDOW = 60_000;
const AUTO_CHECK_TIMEOUT = 10 * 60_000;

export function RegisterForm() {
  const router = useRouter();
  const { copy } = useLanguage();
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" }>();
  const [step, setStep] = useState<RegistrationStep>("form");
  const [pendingEmail, setPendingEmail] = useState("");
  const [autoSignInError, setAutoSignInError] = useState<string>();
  const [resendCooldown, setResendCooldown] = useState(0);
  const credentialsRef = useRef<{ email: string; password: string } | null>(null);
  const signInInProgressRef = useRef(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { fullName: "", phone: "+7 ", email: "", password: "" } });

  const completeRegistration = useCallback(async (): Promise<SignInCheckResult> => {
    const credentials = credentialsRef.current;
    if (!credentials || signInInProgressRef.current) return "waiting";

    signInInProgressRef.current = true;
    const { error } = await createClient().auth.signInWithPassword(credentials);
    signInInProgressRef.current = false;

    if (!error) {
      credentialsRef.current = null;
      setAutoSignInError(undefined);
      setStep("finishing");
      router.replace("/dashboard");
      router.refresh();
      return "success";
    }

    const normalizedMessage = error.message.toLowerCase();
    if (error.code === "email_not_confirmed" || normalizedMessage.includes("email not confirmed")) {
      setAutoSignInError(undefined);
      return "waiting";
    }

    if (error.status === 429 || error.code === "over_request_rate_limit") {
      return "retry";
    }

    setAutoSignInError(copy.auth.autoLoginError);
    return "stopped";
  }, [copy.auth.autoLoginError, router]);

  useEffect(() => {
    if (step !== "waiting") return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();

    const scheduleCheck = (delay: number) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void checkConfirmation(), delay);
    };

    const checkConfirmation = async () => {
      if (cancelled) return;
      const result = await completeRegistration();
      if (cancelled || result === "success" || result === "stopped") return;

      const elapsed = Date.now() - startedAt;
      if (elapsed >= AUTO_CHECK_TIMEOUT) {
        setAutoSignInError(copy.auth.waitTimeout);
        return;
      }

      const delay = result === "retry"
        ? 30_000
        : elapsed < FAST_CHECK_WINDOW ? INITIAL_CHECK_INTERVAL : LATER_CHECK_INTERVAL;
      scheduleCheck(delay);
    };

    const checkWhenActive = () => {
      if (document.visibilityState === "visible") void checkConfirmation();
    };

    scheduleCheck(2_500);
    window.addEventListener("focus", checkWhenActive);
    document.addEventListener("visibilitychange", checkWhenActive);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      window.removeEventListener("focus", checkWhenActive);
      document.removeEventListener("visibilitychange", checkWhenActive);
    };
  }, [completeRegistration, copy.auth.waitTimeout, step]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((current) => Math.max(0, current - 1)), 1_000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => () => {
    credentialsRef.current = null;
  }, []);

  const onSubmit = async (values: RegisterValues) => {
    setMessage(undefined);
    const origin = window.location.origin;
    const { data, error } = await createClient().auth.signUp({ email: values.email, password: values.password, options: { emailRedirectTo: `${origin}/auth/callback`, data: { full_name: values.fullName, phone: normalizeKazakhstanPhone(values.phone), role: values.role } } });
    if (error) return setMessage({ text: error.message, type: "error" });
    if (data.session) { router.push("/dashboard"); router.refresh(); return; }

    credentialsRef.current = { email: values.email, password: values.password };
    setPendingEmail(values.email);
    setAutoSignInError(undefined);
    setResendCooldown(60);
    setStep("waiting");
  };

  const resendConfirmation = async () => {
    if (!pendingEmail || resendCooldown > 0) return;
    setMessage(undefined);
    const { error } = await createClient().auth.resend({
      type: "signup",
      email: pendingEmail,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setMessage({ text: error.message, type: "error" });
      return;
    }
    setResendCooldown(60);
    setMessage({ text: copy.auth.newEmailSent, type: "success" });
  };

  const changeEmail = () => {
    credentialsRef.current = null;
    setPendingEmail("");
    setAutoSignInError(undefined);
    setMessage(undefined);
    reset({ fullName: "", phone: "+7 ", email: "", password: "" });
    setStep("form");
  };

  if (step !== "form") {
    return <div className="grid gap-5 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {step === "finishing" ? <CheckCircle2 className="size-8" /> : <MailCheck className="size-8" />}
      </div>
      <div>
        <h2 className="text-xl font-black tracking-tight">{step === "finishing" ? copy.auth.emailConfirmed : copy.auth.confirmEmail}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.auth.emailSentTo} <strong className="font-bold text-foreground">{pendingEmail}</strong></p>
      </div>
      <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4 text-left">
        <div className="flex items-center gap-3 text-sm font-bold text-foreground">
          <Loader2 className="size-5 shrink-0 animate-spin text-primary" />
          {step === "finishing" ? copy.auth.openingAccount : copy.auth.waitingConfirmation}
        </div>
        <p className="mt-2 pl-8 text-xs leading-5 text-muted-foreground">{copy.auth.confirmationInstruction}</p>
      </div>
      <FormMessage message={autoSignInError ?? message?.text} type={autoSignInError ? "error" : message?.type} />
      {step === "waiting" ? <div className="grid gap-2">
        <Button type="button" variant="outline" onClick={() => void completeRegistration()}><RefreshCw />{copy.auth.checkNow}</Button>
        <Button type="button" variant="ghost" disabled={resendCooldown > 0} onClick={() => void resendConfirmation()}>{resendCooldown > 0 ? `${copy.auth.resendIn} ${resendCooldown} ${copy.auth.secondsShort}` : copy.auth.resend}</Button>
        <Button type="button" variant="link" onClick={changeEmail}>{copy.auth.changeEmail}</Button>
        {autoSignInError ? <Button asChild variant="link"><Link href="/auth/login">{copy.auth.loginManually}</Link></Button> : null}
      </div> : null}
      <p className="text-xs leading-5 text-muted-foreground">{copy.auth.keepTabOpen}</p>
    </div>;
  }

  return <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
    <fieldset className="grid gap-2">
      <legend className="text-sm font-medium leading-none">{copy.auth.roleLabel}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="cursor-pointer">
          <input type="radio" value="volunteer" {...register("role")} className="peer sr-only" />
          <span className="flex h-full gap-3 rounded-2xl border bg-surface p-4 transition hover:border-primary/40 peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><HandHeart className="size-5" /></span>
            <span><span className="block text-sm font-black text-foreground">{copy.auth.volunteerRole}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{copy.auth.volunteerRoleDescription}</span></span>
          </span>
        </label>
        <label className="cursor-pointer">
          <input type="radio" value="coordinator" {...register("role")} className="peer sr-only" />
          <span className="flex h-full gap-3 rounded-2xl border bg-surface p-4 transition hover:border-primary/40 peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><FolderKanban className="size-5" /></span>
            <span><span className="block text-sm font-black text-foreground">{copy.auth.coordinatorRole}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{copy.auth.coordinatorRoleDescription}</span></span>
          </span>
        </label>
      </div>
      <p className="text-xs text-danger-foreground">{translateValue(errors.role?.message ?? "", copy.auth.validation)}</p>
    </fieldset>
    <div className="grid gap-2"><Label htmlFor="fullName">{copy.auth.fullName}</Label><Input id="fullName" autoComplete="name" placeholder={copy.auth.fullNamePlaceholder} {...register("fullName")} /><p className="text-xs text-danger-foreground">{translateValue(errors.fullName?.message ?? "", copy.auth.validation)}</p></div>
    <div className="grid gap-2"><Label htmlFor="phone">{copy.auth.phone}</Label><Input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 700 123 45 67" {...register("phone")} /><p className="text-xs text-danger-foreground">{translateValue(errors.phone?.message ?? "", copy.auth.validation)}</p></div>
    <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} /><p className="text-xs text-danger-foreground">{translateValue(errors.email?.message ?? "", copy.auth.validation)}</p></div>
    <div className="grid gap-2"><Label htmlFor="password">{copy.auth.password}</Label><Input id="password" type="password" autoComplete="new-password" placeholder={copy.auth.passwordPlaceholder} {...register("password")} /><p className="text-xs text-danger-foreground">{translateValue(errors.password?.message ?? "", copy.auth.validation)}</p></div>
    <FormMessage message={message?.text} type={message?.type} />
    <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : null}{copy.auth.createAccount}</Button>
  </form>;
}
