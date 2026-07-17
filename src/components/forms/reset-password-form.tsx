"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/shared/form-message";
import { passwordSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";

type Values = z.infer<typeof passwordSchema>;
export function ResetPasswordForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(passwordSchema) });
  return <form className="grid gap-5" onSubmit={handleSubmit(async ({ password }) => { const { error } = await createClient().auth.updateUser({ password }); if (error) return setMessage(error.message); router.push("/dashboard"); router.refresh(); })}><div className="grid gap-2"><Label htmlFor="password">Новый пароль</Label><Input id="password" type="password" autoComplete="new-password" {...register("password")} /><p className="text-xs text-red-600">{errors.password?.message}</p></div><div className="grid gap-2"><Label htmlFor="confirmPassword">Повторите пароль</Label><Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} /><p className="text-xs text-red-600">{errors.confirmPassword?.message}</p></div><FormMessage message={message} /><Button size="lg" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : null}Сохранить пароль</Button></form>;
}
