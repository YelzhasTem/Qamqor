"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useLanguage } from "@/components/marketing/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/shared/form-message";
import { forgotPasswordSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { translateValue } from "@/lib/i18n/marketing-copy";

type Values = z.infer<typeof forgotPasswordSchema>;
export function ForgotPasswordForm() {
  const { copy } = useLanguage();
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" }>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(forgotPasswordSchema) });
  return <form className="grid gap-5" onSubmit={handleSubmit(async ({ email }) => { const { error } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password` }); setMessage(error ? { text: error.message, type: "error" } : { text: copy.auth.recoverySent, type: "success" }); })}><div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" {...register("email")} /><p className="text-xs text-danger-foreground">{translateValue(errors.email?.message ?? "", copy.auth.validation)}</p></div><FormMessage message={message?.text} type={message?.type} /><Button size="lg" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : null}{copy.auth.sendLink}</Button></form>;
}
