"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useLanguage } from "@/components/marketing/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/shared/form-message";
import { passwordSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { translateValue } from "@/lib/i18n/marketing-copy";

type Values = z.infer<typeof passwordSchema>;
export function ResetPasswordForm() {
  const router = useRouter();
  const { copy } = useLanguage();
  const [message, setMessage] = useState<string>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(passwordSchema) });
  return <form className="grid gap-5" onSubmit={handleSubmit(async ({ password }) => { const { error } = await createClient().auth.updateUser({ password }); if (error) return setMessage(error.message); router.push("/dashboard"); router.refresh(); })}><div className="grid gap-2"><Label htmlFor="password">{copy.auth.newPassword}</Label><Input id="password" type="password" autoComplete="new-password" {...register("password")} /><p className="text-xs text-danger-foreground">{translateValue(errors.password?.message ?? "", copy.auth.validation)}</p></div><div className="grid gap-2"><Label htmlFor="confirmPassword">{copy.auth.repeatPassword}</Label><Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} /><p className="text-xs text-danger-foreground">{translateValue(errors.confirmPassword?.message ?? "", copy.auth.validation)}</p></div><FormMessage message={message} /><Button size="lg" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : null}{copy.auth.savePassword}</Button></form>;
}
