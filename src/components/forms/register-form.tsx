"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckCircle2, Loader2, MailCheck, RefreshCw } from "lucide-react";
import { z } from "zod";
import { useLanguage } from "@/components/i18n/language-provider";
import { FormField, fieldA11y } from "@/components/forms/form-field";
import { FormMessage } from "@/components/shared/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authErrorText, validationText } from "@/lib/auth-errors";
import { fill } from "@/lib/i18n/format";
import { ORGANIZATION_PICKER_PATH } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/client";
import { normalizeKazakhstanPhone, registerSchema } from "@/lib/validations";

type RegisterValues = z.infer<typeof registerSchema>;
type RegistrationStep = "form" | "waiting" | "finishing";
type SignInCheckResult = "success" | "waiting" | "retry" | "stopped";

const INITIAL_CHECK_INTERVAL = 5_000;
const LATER_CHECK_INTERVAL = 15_000;
const FAST_CHECK_WINDOW = 60_000;
const AUTO_CHECK_TIMEOUT = 10 * 60_000;

export function RegisterForm() {
  const router = useRouter();
  const { t } = useLanguage();
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
      router.replace(ORGANIZATION_PICKER_PATH);
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

    setAutoSignInError(t.auth.autoLoginError);
    return "stopped";
  }, [t.auth.autoLoginError, router]);

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
        setAutoSignInError(t.auth.waitTimeout);
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
  }, [completeRegistration, t.auth.waitTimeout, step]);

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
    const { data, error } = await createClient().auth.signUp({ email: values.email, password: values.password, options: { emailRedirectTo: `${origin}/auth/callback`, data: { full_name: values.fullName, phone: normalizeKazakhstanPhone(values.phone) } } });
    if (error) return setMessage({ text: authErrorText(error, t), type: "error" });
    if (data.session) { router.push(ORGANIZATION_PICKER_PATH); router.refresh(); return; }

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
      setMessage({ text: authErrorText(error, t), type: "error" });
      return;
    }
    setResendCooldown(60);
    setMessage({ text: t.auth.newEmailSent, type: "success" });
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
    return <div className="grid gap-5 text-center" aria-live="polite">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-inset text-ink">
        {step === "finishing" ? <CheckCircle2 aria-hidden="true" className="size-7" /> : <MailCheck aria-hidden="true" className="size-7" />}
      </div>
      <div>
        <h2 className="text-xl font-extrabold tracking-tight">{step === "finishing" ? t.auth.emailConfirmed : t.auth.confirmEmail}</h2>
        <p className="mt-2 text-[15px] leading-6 text-ink-secondary">{t.auth.emailSentTo} <strong className="font-semibold break-all text-ink">{pendingEmail}</strong></p>
      </div>
      <div className="rounded-row bg-inset px-4 py-4 text-left">
        <div className="flex items-center gap-3 text-sm font-semibold text-ink">
          <Loader2 aria-hidden="true" className="size-5 shrink-0 animate-spin" />
          {step === "finishing" ? t.auth.openingAccount : t.auth.waitingConfirmation}
        </div>
        <p className="mt-2 pl-8 text-sm leading-5 text-ink-muted">{t.auth.confirmationInstruction}</p>
      </div>
      <FormMessage message={autoSignInError ?? message?.text} type={autoSignInError ? "error" : message?.type} />
      {step === "waiting" ? <div className="grid gap-2">
        <Button type="button" variant="secondary" onClick={() => void completeRegistration()}><RefreshCw />{t.auth.checkNow}</Button>
        <Button type="button" variant="ghost" disabled={resendCooldown > 0} onClick={() => void resendConfirmation()}>{resendCooldown > 0 ? fill(t.auth.resendIn, { seconds: resendCooldown }) : t.auth.resend}</Button>
        <Button type="button" variant="ghost" onClick={changeEmail}>{t.auth.changeEmail}</Button>
        {autoSignInError ? <Button asChild variant="ghost"><Link href="/auth/login">{t.auth.loginManually}</Link></Button> : null}
      </div> : null}
      <p className="text-sm leading-5 text-ink-secondary">{t.auth.keepTabOpen}</p>
    </div>;
  }

  const fullNameError = validationText(errors.fullName?.message, t);
  const phoneError = validationText(errors.phone?.message, t);
  const emailError = validationText(errors.email?.message, t);
  const passwordError = validationText(errors.password?.message, t);

  return <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
    <FormField id="fullName" label={t.auth.fullName} error={fullNameError}>
      <Input id="fullName" autoComplete="name" placeholder={t.auth.fullNamePlaceholder} {...fieldA11y("fullName", fullNameError)} {...register("fullName")} />
    </FormField>
    <FormField id="phone" label={t.auth.phone} error={phoneError}>
      <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder={t.auth.phonePlaceholder} {...fieldA11y("phone", phoneError)} {...register("phone")} />
    </FormField>
    <FormField id="email" label={t.auth.email} error={emailError}>
      <Input id="email" type="email" inputMode="email" autoComplete="email" placeholder={t.auth.emailPlaceholder} {...fieldA11y("email", emailError)} {...register("email")} />
    </FormField>
    <FormField id="password" label={t.auth.password} error={passwordError}>
      <Input id="password" type="password" autoComplete="new-password" placeholder={t.auth.passwordPlaceholder} {...fieldA11y("password", passwordError)} {...register("password")} />
    </FormField>
    <FormMessage message={message?.text} type={message?.type} />
    <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : null}{t.auth.createAccount}</Button>
  </form>;
}
