"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/shared/form-message";
import { forgotPasswordSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";

type Values = z.infer<typeof forgotPasswordSchema>;
export function ForgotPasswordForm() {
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" }>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(forgotPasswordSchema) });
  return <form className="grid gap-5" onSubmit={handleSubmit(async ({ email }) => { const { error } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password` }); setMessage(error ? { text: error.message, type: "error" } : { text: "Ссылка для восстановления отправлена на email.", type: "success" }); })}><div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" {...register("email")} /><p className="text-xs text-red-600">{errors.email?.message}</p></div><FormMessage message={message?.text} type={message?.type} /><Button size="lg" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : null}Отправить ссылку</Button></form>;
}
