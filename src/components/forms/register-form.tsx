"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Building2, HandHeart, Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/shared/form-message";
import { registerSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm({ defaultRole = "volunteer" }: { defaultRole?: "volunteer" | "coordinator" }) {
  const router = useRouter();
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" }>();
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { fullName: "", city: "", email: "", password: "", role: defaultRole } });
  const role = watch("role");
  const onSubmit = async (values: RegisterValues) => {
    setMessage(undefined);
    const origin = window.location.origin;
    const { data, error } = await createClient().auth.signUp({ email: values.email, password: values.password, options: { emailRedirectTo: `${origin}/auth/callback`, data: { full_name: values.fullName, city: values.city, role: values.role } } });
    if (error) return setMessage({ text: error.message, type: "error" });
    if (data.session) { router.push("/dashboard"); router.refresh(); return; }
    setMessage({ text: "Проверьте почту и подтвердите регистрацию.", type: "success" });
  };
  return <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
    <div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setValue("role", "volunteer")} className={cn("rounded-xl border p-3 text-left transition", role === "volunteer" ? "border-green-500 bg-green-50 ring-2 ring-green-100" : "bg-white")}><HandHeart className="mb-2 size-5 text-green-600" /><span className="block text-sm font-bold">Волонтёр</span><span className="text-xs text-muted-foreground">Хочу помогать</span></button><button type="button" onClick={() => setValue("role", "coordinator")} className={cn("rounded-xl border p-3 text-left transition", role === "coordinator" ? "border-green-500 bg-green-50 ring-2 ring-green-100" : "bg-white")}><Building2 className="mb-2 size-5 text-green-600" /><span className="block text-sm font-bold">Координатор</span><span className="text-xs text-muted-foreground">Создаю проекты</span></button></div>
    <input type="hidden" {...register("role")} />
    <div className="grid gap-2"><Label htmlFor="fullName">Имя и фамилия</Label><Input id="fullName" autoComplete="name" placeholder="Алия Садыкова" {...register("fullName")} /><p className="text-xs text-red-600">{errors.fullName?.message}</p></div>
    <div className="grid gap-2"><Label htmlFor="city">Город</Label><Input id="city" autoComplete="address-level2" placeholder="Алматы" {...register("city")} /><p className="text-xs text-red-600">{errors.city?.message}</p></div>
    <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} /><p className="text-xs text-red-600">{errors.email?.message}</p></div>
    <div className="grid gap-2"><Label htmlFor="password">Пароль</Label><Input id="password" type="password" autoComplete="new-password" placeholder="Минимум 8 символов" {...register("password")} /><p className="text-xs text-red-600">{errors.password?.message}</p></div>
    <FormMessage message={message?.text} type={message?.type} />
    <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : null}Создать аккаунт</Button>
  </form>;
}
