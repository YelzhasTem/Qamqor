"use client";

import { useState } from "react";
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
import { createClient } from "@/lib/supabase/client";
import { passwordSchema } from "@/lib/validations";

type Values = z.infer<typeof passwordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [message, setMessage] = useState<string>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(passwordSchema), defaultValues: { password: "", confirmPassword: "" } });

  const onSubmit = async ({ password }: Values) => {
    setMessage(undefined);
    const { error } = await createClient().auth.updateUser({ password });
    if (error) return setMessage(authErrorText(error, t));
    router.push("/dashboard");
    router.refresh();
  };

  const passwordError = validationText(errors.password?.message, t);
  const confirmError = validationText(errors.confirmPassword?.message, t);

  return (
    <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField id="password" label={t.auth.newPassword} error={passwordError}>
        <Input id="password" type="password" autoComplete="new-password" placeholder={t.auth.passwordPlaceholder} {...fieldA11y("password", passwordError)} {...register("password")} />
      </FormField>
      <FormField id="confirmPassword" label={t.auth.repeatPassword} error={confirmError}>
        <Input id="confirmPassword" type="password" autoComplete="new-password" {...fieldA11y("confirmPassword", confirmError)} {...register("confirmPassword")} />
      </FormField>
      <FormMessage message={message} />
      <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : null}{t.auth.savePassword}</Button>
    </form>
  );
}
