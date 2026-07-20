"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ImagePlus, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormMessage } from "@/components/shared/form-message";
import { saveProjectAction } from "@/lib/actions/projects";
import { projectSchema } from "@/lib/validations";
import type { Project } from "@/types/app";

type Values = z.input<typeof projectSchema>;
const categories = ["Экология", "Образование", "Социальная помощь", "Животные", "Здоровье", "Культура", "Спорт", "Чрезвычайные ситуации", "Другое"];
const toLocalDate = (value?: string) => value ? new Date(new Date(value).getTime() - new Date(value).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";

export function ProjectForm({ project }: { project: Project }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(project?.cover_url ?? "");
  const [message, setMessage] = useState<string>();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title ?? "", description: project?.description ?? "", category: project?.category ?? "", city: project?.city ?? "", address: project?.address ?? "", format: project?.format ?? "offline", start_date: toLocalDate(project?.start_date), end_date: toLocalDate(project?.end_date), volunteer_hours: project?.volunteer_hours ?? 4, required_volunteers: project?.required_volunteers ?? 10, requirements: project?.requirements ?? "", status: project?.status === "published" ? "published" : "draft",
    },
  });
  const format = watch("format");
  const onSubmit = async (values: Values) => {
    setMessage(undefined);
    const data = new FormData();
    Object.entries(values).forEach(([key, value]) => data.set(key, String(value ?? "")));
    data.set("existing_cover_url", project?.cover_url ?? "");
    const file = fileRef.current?.files?.[0];
    if (file) data.set("cover", file);
    const result = await saveProjectAction(project.id, data);
    if (!result.success) return setMessage(result.error);
    toast.success("Проект обновлён");
    router.push("/coordinator/projects");
    router.refresh();
  };
  const selectClass = "h-11 w-full rounded-xl border border-input bg-surface px-3.5 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15";
  return <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6"><CardSection title="Основная информация"><Field label="Название" error={errors.title?.message}><Input {...register("title")} placeholder="Например, Зелёный двор" /></Field><Field label="Описание" error={errors.description?.message}><Textarea {...register("description")} className="min-h-40" placeholder="Цель проекта, программа и ожидаемый результат" /></Field><div className="grid gap-5 sm:grid-cols-2"><Field label="Категория" error={errors.category?.message}><select {...register("category")} className={selectClass}><option value="">Выберите категорию</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Город" error={errors.city?.message}><Input {...register("city")} placeholder="Алматы" /></Field></div></CardSection><CardSection title="Обложка проекта"><button type="button" onClick={() => fileRef.current?.click()} className="relative flex aspect-[16/6] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-primary/5 text-primary transition hover:border-primary">{preview ? <Image src={preview} alt="Обложка проекта" fill className="object-cover" /> : <span className="flex flex-col items-center gap-2 text-sm font-bold"><ImagePlus className="size-7" />Загрузить изображение</span>}</button><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) setPreview(URL.createObjectURL(file)); }} /><p className="text-xs text-muted-foreground">JPG, PNG или WebP · до 5 МБ</p></CardSection><CardSection title="Место и время"><div className="grid gap-5 sm:grid-cols-2"><Field label="Формат" error={errors.format?.message}><select {...register("format")} className={selectClass}><option value="offline">Офлайн</option><option value="online">Онлайн</option></select></Field><Field label="Адрес" error={errors.address?.message}><Input {...register("address")} disabled={format === "online"} placeholder={format === "online" ? "Не требуется" : "Улица, дом, место встречи"} /></Field><Field label="Дата начала" error={errors.start_date?.message}><Input type="datetime-local" {...register("start_date")} /></Field><Field label="Дата окончания" error={errors.end_date?.message}><Input type="datetime-local" {...register("end_date")} /></Field></div></CardSection><CardSection title="Участие"><div className="grid gap-5 sm:grid-cols-2"><Field label="Количество мест" error={errors.required_volunteers?.message}><Input type="number" min={1} {...register("required_volunteers")} /></Field><Field label="Плановые часы" error={errors.volunteer_hours?.message}><Input type="number" min={0} step="0.5" {...register("volunteer_hours")} /></Field></div><Field label="Требования" error={errors.requirements?.message}><Textarea {...register("requirements")} placeholder="Возраст, навыки, необходимая одежда или инвентарь" /></Field><Field label="Публикация" error={errors.status?.message}><select {...register("status")} className={selectClass}><option value="draft">Сохранить как черновик</option><option value="published">Опубликовать сразу</option></select></Field></CardSection><FormMessage message={message} /><div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => router.back()}>Отмена</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}Сохранить</Button></div></form>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <div className="grid gap-2"><Label>{label}</Label>{children}{error ? <p className="text-xs text-danger-foreground">{error}</p> : null}</div>; }
function CardSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="grid gap-5 rounded-2xl border bg-surface p-5 sm:p-6"><h2 className="text-lg font-black">{title}</h2>{children}</section>; }
