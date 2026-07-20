"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckCircle2, Loader2, MailCheck, RefreshCw } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/shared/form-message";
import { registerSchema, registrationCities } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";

type RegisterValues = z.infer<typeof registerSchema>;
type RegistrationStep = "form" | "waiting" | "finishing";
type SignInCheckResult = "success" | "waiting" | "retry" | "stopped";

const INITIAL_CHECK_INTERVAL = 5_000;
const LATER_CHECK_INTERVAL = 15_000;
const FAST_CHECK_WINDOW = 60_000;
const AUTO_CHECK_TIMEOUT = 10 * 60_000;

export function RegisterForm() {
  const router = useRouter();
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" }>();
  const [step, setStep] = useState<RegistrationStep>("form");
  const [pendingEmail, setPendingEmail] = useState("");
  const [autoSignInError, setAutoSignInError] = useState<string>();
  const [resendCooldown, setResendCooldown] = useState(0);
  const credentialsRef = useRef<{ email: string; password: string } | null>(null);
  const signInInProgressRef = useRef(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { fullName: "", email: "", password: "", role: "volunteer" } });

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

    setAutoSignInError("Не удалось завершить вход автоматически. Проверьте подтверждение или войдите вручную.");
    return "stopped";
  }, [router]);

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
        setAutoSignInError("Ожидание заняло больше 10 минут. Нажмите «Проверить сейчас» или войдите вручную.");
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
  }, [completeRegistration, step]);

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
    const { data, error } = await createClient().auth.signUp({ email: values.email, password: values.password, options: { emailRedirectTo: `${origin}/auth/callback`, data: { full_name: values.fullName, city: values.city, role: values.role } } });
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
    setMessage({ text: "Новое письмо отправлено.", type: "success" });
  };

  const changeEmail = () => {
    credentialsRef.current = null;
    setPendingEmail("");
    setAutoSignInError(undefined);
    setMessage(undefined);
    reset({ fullName: "", email: "", password: "", role: "volunteer" });
    setStep("form");
  };

  if (step !== "form") {
    return <div className="grid gap-5 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {step === "finishing" ? <CheckCircle2 className="size-8" /> : <MailCheck className="size-8" />}
      </div>
      <div>
        <h2 className="text-xl font-black tracking-tight">{step === "finishing" ? "Почта подтверждена" : "Подтвердите email"}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Письмо отправлено на <strong className="font-bold text-foreground">{pendingEmail}</strong></p>
      </div>
      <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4 text-left">
        <div className="flex items-center gap-3 text-sm font-bold text-foreground">
          <Loader2 className="size-5 shrink-0 animate-spin text-primary" />
          {step === "finishing" ? "Открываем личный кабинет…" : "Ждём подтверждения…"}
        </div>
        <p className="mt-2 pl-8 text-xs leading-5 text-muted-foreground">Откройте письмо на телефоне или компьютере и нажмите кнопку подтверждения. Эта вкладка завершит вход автоматически.</p>
      </div>
      <FormMessage message={autoSignInError ?? message?.text} type={autoSignInError ? "error" : message?.type} />
      {step === "waiting" ? <div className="grid gap-2">
        <Button type="button" variant="outline" onClick={() => void completeRegistration()}><RefreshCw />Проверить сейчас</Button>
        <Button type="button" variant="ghost" disabled={resendCooldown > 0} onClick={() => void resendConfirmation()}>{resendCooldown > 0 ? `Отправить повторно через ${resendCooldown} сек.` : "Отправить письмо повторно"}</Button>
        <Button type="button" variant="link" onClick={changeEmail}>Изменить email</Button>
        {autoSignInError ? <Button asChild variant="link"><Link href="/auth/login">Войти вручную</Link></Button> : null}
      </div> : null}
      <p className="text-xs leading-5 text-muted-foreground">Не закрывайте и не обновляйте эту вкладку до завершения входа.</p>
    </div>;
  }

  return <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
    <input type="hidden" {...register("role")} />
    <div className="grid gap-2"><Label htmlFor="fullName">Имя и фамилия</Label><Input id="fullName" autoComplete="name" placeholder="Алия Садыкова" {...register("fullName")} /><p className="text-xs text-danger-foreground">{errors.fullName?.message}</p></div>
    <div className="grid gap-2"><Label htmlFor="city">Город</Label><select id="city" autoComplete="address-level2" defaultValue="" {...register("city")} className="h-11 w-full rounded-xl border border-input bg-surface px-3.5 text-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15"><option value="" disabled>Выберите город</option>{registrationCities.map((city) => <option key={city} value={city}>{city}</option>)}</select><p className="text-xs text-danger-foreground">{errors.city?.message}</p></div>
    <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} /><p className="text-xs text-danger-foreground">{errors.email?.message}</p></div>
    <div className="grid gap-2"><Label htmlFor="password">Пароль</Label><Input id="password" type="password" autoComplete="new-password" placeholder="Минимум 8 символов" {...register("password")} /><p className="text-xs text-danger-foreground">{errors.password?.message}</p></div>
    <FormMessage message={message?.text} type={message?.type} />
    <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : null}Создать аккаунт</Button>
  </form>;
}
