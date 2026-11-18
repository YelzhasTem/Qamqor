"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useLanguage } from "@/components/i18n/language-provider";
import { FormField, fieldA11y } from "@/components/forms/form-field";
import { FormMessage } from "@/components/shared/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authErrorText, validationText } from "@/lib/auth-errors";
import { postSignInPath } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validations";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [message, setMessage] = useState<string | undefined>(initialError);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = async (values: LoginValues) => {
    setMessage(undefined);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword(values);
    if (error || !data.user) return setMessage(authErrorText(error, t));
    const { data: profile } = await supabase.from("profiles").select("onboarded_at").eq("id", data.user.id).maybeSingle();
    router.push(postSignInPath(profile?.onboarded_at, next));
    router.refresh();
  };

  const emailError = validationText(errors.email?.message, t);
  const passwordError = validationText(errors.password?.message, t);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
      <FormField id="email" label={t.auth.email} error={emailError}>
        <Input id="email" type="email" autoComplete="email" inputMode="email" placeholder={t.auth.emailPlaceholder} {...fieldA11y("email", emailError)} {...register("email")} />
      </FormField>
      <FormField
        id="password"
        label={t.auth.password}
        error={passwordError}
        aside={<Link href="/auth/forgot-password" className="inline-flex min-h-11 items-center text-sm font-semibold text-ink-secondary underline decoration-control underline-offset-4 hover:text-ink">{t.auth.forgotPassword}</Link>}
      >
        <Input id="password" type="password" autoComplete="current-password" {...fieldA11y("password", passwordError)} {...register("password")} />
      </FormField>
      <FormMessage message={message} />
      <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : null}{t.auth.login}</Button>
    </form>
  );
}
