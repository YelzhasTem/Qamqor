"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/shared/form-message";
import { loginSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { safeRedirect } from "@/lib/utils";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const onSubmit = async (values: LoginValues) => {
    setMessage(undefined);
    const { error } = await createClient().auth.signInWithPassword(values);
    if (error) return setMessage(error.message === "Invalid login credentials" ? "Неверный email или пароль" : error.message);
    router.push(safeRedirect(next));
    router.refresh();
  };
  return <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
    <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} /><p className="text-xs text-danger-foreground">{errors.email?.message}</p></div>
    <div className="grid gap-2"><div className="flex items-center justify-between"><Label htmlFor="password">Пароль</Label><Link href="/auth/forgot-password" className="text-xs font-semibold text-primary hover:underline">Забыли пароль?</Link></div><Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" {...register("password")} /><p className="text-xs text-danger-foreground">{errors.password?.message}</p></div>
    <FormMessage message={message} />
    <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : null}Войти</Button>
  </form>;
}
