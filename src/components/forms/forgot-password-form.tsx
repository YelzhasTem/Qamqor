"use client";

import { useState } from "react";
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
import { createClient } from "@/lib/supabase/client";
import { forgotPasswordSchema } from "@/lib/validations";

type Values = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const { t } = useLanguage();
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" }>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: "" } });

  const onSubmit = async ({ email }: Values) => {
    setMessage(undefined);
    const { error } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password` });
    setMessage(error ? { text: authErrorText(error, t), type: "error" } : { text: t.auth.recoverySent, type: "success" });
  };

  const emailError = validationText(errors.email?.message, t);

  return (
    <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField id="email" label={t.auth.email} error={emailError}>
        <Input id="email" type="email" autoComplete="email" inputMode="email" placeholder={t.auth.emailPlaceholder} {...fieldA11y("email", emailError)} {...register("email")} />
      </FormField>
      <FormMessage message={message?.text} type={message?.type} />
      <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : null}{t.auth.sendLink}</Button>
    </form>
  );
}
