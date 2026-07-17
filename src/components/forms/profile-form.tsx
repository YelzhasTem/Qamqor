"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormMessage } from "@/components/shared/form-message";
import { updateProfileAction } from "@/lib/actions/profile";
import { profileSchema } from "@/lib/validations";
import type { Profile } from "@/types/app";

type Values = z.infer<typeof profileSchema>;
export function ProfileForm({ profile }: { profile: Profile }) {
  const [message, setMessage] = useState<string>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(profileSchema), defaultValues: { full_name: profile.full_name, city: profile.city ?? "", phone: profile.phone ?? "", bio: profile.bio ?? "" } });
  return <form className="grid gap-5" onSubmit={handleSubmit(async (values) => { setMessage(undefined); const result = await updateProfileAction(values); if (result.success) toast.success("Профиль сохранён"); else setMessage(result.error); })}><div className="grid gap-5 sm:grid-cols-2"><Field label="Имя и фамилия" error={errors.full_name?.message}><Input {...register("full_name")} /></Field><Field label="Город" error={errors.city?.message}><Input {...register("city")} placeholder="Алматы" /></Field><Field label="Телефон" error={errors.phone?.message}><Input {...register("phone")} placeholder="+7 700 000 00 00" /></Field><div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800"><p className="font-bold">Приватность</p><p className="mt-1 text-xs leading-5">Телефон виден только вам и не показывается в публичном профиле.</p></div></div><Field label="О себе" error={errors.bio?.message}><Textarea {...register("bio")} placeholder="Расскажите о своих интересах и опыте волонтёрства" /></Field><FormMessage message={message} /><Button type="submit" disabled={isSubmitting} className="w-fit">{isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}Сохранить изменения</Button></form>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <div className="grid gap-2"><Label>{label}</Label>{children}<p className="text-xs text-red-600">{error}</p></div>; }
