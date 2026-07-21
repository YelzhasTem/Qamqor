"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  BusFront,
  Clock3,
  FileBadge2,
  HandHeart,
  ImagePlus,
  Loader2,
  MessageCircle,
  Save,
  Shirt,
  Utensils,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { FormMessage } from "@/components/shared/form-message";
import { ProjectCover } from "@/components/projects/project-cover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProjectAction, saveProjectAction } from "@/lib/actions/projects";
import {
  isProjectBenefit,
  projectBenefitLabels,
  type ProjectBenefit,
} from "@/lib/project-benefits";
import { cn } from "@/lib/utils";
import { projectCities, projectSchema } from "@/lib/validations";
import type { Project } from "@/types/app";

type Values = z.input<typeof projectSchema>;

const categories = [
  "Экология",
  "Образование",
  "Социальная помощь",
  "Животные",
  "Здоровье",
  "Культура",
  "Спорт",
  "Чрезвычайные ситуации",
  "Другое",
];

const benefitOptions = [
  { value: "thank_you_letter", icon: HandHeart },
  { value: "volunteer_hours", icon: Clock3 },
  { value: "meals", icon: Utensils },
  { value: "transport", icon: BusFront },
  { value: "merch", icon: Shirt },
  { value: "recommendation_letter", icon: FileBadge2 },
] satisfies { value: ProjectBenefit; icon: typeof Clock3 }[];

const toLocalDate = (value?: string) => value
  ? new Date(new Date(value).getTime() - new Date(value).getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  : "";

function toProjectCity(value?: string | null) {
  const normalized = value?.trim().toLocaleLowerCase("ru-RU");
  if (normalized === "almaty" || normalized === "алматы") return "Алматы" as const;
  if (normalized === "astana" || normalized === "астана") return "Астана" as const;
  if (normalized === "shymkent" || normalized === "шымкент") return "Шымкент" as const;
  return undefined;
}

export function ProjectForm({ project, whatsappGroupUrl = "" }: { project?: Project; whatsappGroupUrl?: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(project?.cover_url ?? null);
  const [message, setMessage] = useState<string>();
  const existingBenefits = project?.benefits.filter(isProjectBenefit) ?? ["volunteer_hours"];
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title ?? "",
      description: project?.description ?? "",
      category: project?.category ?? "",
      city: toProjectCity(project?.city),
      address: project?.address ?? "",
      format: project?.format ?? "offline",
      start_date: toLocalDate(project?.start_date),
      end_date: toLocalDate(project?.end_date),
      volunteer_hours: project?.volunteer_hours ?? 4,
      required_volunteers: project?.required_volunteers ?? 10,
      benefits: existingBenefits,
      whatsapp_group_url: whatsappGroupUrl,
      requirements: project?.requirements ?? "",
      status: project?.status === "published" ? "published" : "draft",
    },
  });

  const format = watch("format");
  const selectedBenefits = watch("benefits") ?? [];
  const hasVolunteerHours = selectedBenefits.includes("volunteer_hours");

  const onSubmit = async (values: Values) => {
    setMessage(undefined);
    const data = new FormData();
    const normalizedValues = {
      ...values,
      volunteer_hours: values.benefits.includes("volunteer_hours") ? values.volunteer_hours : 0,
    };

    Object.entries(normalizedValues).forEach(([key, value]) => {
      if (key === "benefits") data.set(key, JSON.stringify(value));
      else data.set(key, String(value ?? ""));
    });
    data.set("existing_cover_url", project?.cover_url ?? "");
    const file = fileRef.current?.files?.[0];
    if (file) data.set("cover", file);

    const result = project
      ? await saveProjectAction(project.id, data)
      : await createProjectAction(data);

    if (!result.success) return setMessage(result.error);
    toast.success(project ? "Проект обновлён" : "Проект создан");
    router.push("/coordinator/projects");
    router.refresh();
  };

  const selectClass = "h-11 w-full rounded-xl border border-input bg-surface px-3.5 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
      <CardSection title="Основная информация">
        <Field label="Название" error={errors.title?.message}>
          <Input {...register("title")} placeholder="Например, Зелёный двор" />
        </Field>
        <Field label="Описание" error={errors.description?.message}>
          <Textarea {...register("description")} className="min-h-40" placeholder="Цель проекта, программа и ожидаемый результат" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Категория" error={errors.category?.message}>
            <select {...register("category")} className={selectClass}>
              <option value="">Выберите категорию</option>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Город" error={errors.city?.message}>
            <select {...register("city")} className={selectClass}>
              <option value="">Выберите город</option>
              {projectCities.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
          </Field>
        </div>
      </CardSection>

      <CardSection title="Обложка проекта">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="group relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-2xl border bg-primary/5 text-primary transition hover:border-primary"
        >
          <ProjectCover src={preview} title="Предпросмотр обложки проекта" className="absolute inset-0" />
          <span className="absolute inset-x-4 bottom-4 flex items-center justify-center gap-2 rounded-xl bg-surface/90 px-4 py-3 text-sm font-bold shadow-lg backdrop-blur transition group-hover:bg-surface">
            <ImagePlus className="size-5" />{preview ? "Заменить фотографию" : "Добавить свою фотографию"}
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) setPreview(URL.createObjectURL(file));
          }}
        />
        <p className="text-xs leading-5 text-muted-foreground">
          Предпросмотр соответствует формату карточки «Актуальных проектов», а фотография показывается целиком. Рекомендуем пропорцию 16:9. JPG, PNG или WebP · до 5 МБ.
        </p>
      </CardSection>

      <CardSection title="Место и время">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Формат" error={errors.format?.message}>
            <select {...register("format")} className={selectClass}>
              <option value="offline">Офлайн</option>
              <option value="online">Онлайн</option>
            </select>
          </Field>
          <Field label="Место проведения" error={errors.address?.message}>
            <Input {...register("address")} disabled={format === "online"} placeholder={format === "online" ? "Не требуется" : "Улица, дом, место встречи"} />
          </Field>
          <Field label="Дата и время начала" error={errors.start_date?.message}>
            <Input type="datetime-local" {...register("start_date")} />
          </Field>
          <Field label="Дата и время окончания" error={errors.end_date?.message}>
            <Input type="datetime-local" {...register("end_date")} />
          </Field>
        </div>
      </CardSection>

      <CardSection title="Что предоставляет проект">
        <p className="text-sm leading-6 text-muted-foreground">Выберите один или несколько вариантов. Пользователь увидит их в карточке и на странице проекта.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {benefitOptions.map(({ value, icon: Icon }) => {
            const selected = selectedBenefits.includes(value);
            return (
              <label key={value} className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition", selected ? "border-primary bg-primary/5 text-foreground" : "bg-surface text-muted-foreground hover:border-primary/30")}>
                <input type="checkbox" value={value} {...register("benefits")} className="size-4 accent-primary" />
                <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}><Icon className="size-4.5" /></span>
                <span className="text-sm font-bold leading-5">{projectBenefitLabels[value]}</span>
              </label>
            );
          })}
        </div>
        {errors.benefits?.message ? <p className="text-xs text-danger-foreground">{errors.benefits.message}</p> : null}
        {hasVolunteerHours ? (
          <Field label="Количество волонтёрских часов" error={errors.volunteer_hours?.message}>
            <Input type="number" min={0.5} step="0.5" {...register("volunteer_hours")} />
          </Field>
        ) : null}
      </CardSection>

      <CardSection title="Группа участников">
        <div className="flex items-start gap-3 rounded-2xl bg-success/10 p-4 text-sm leading-6 text-success-foreground">
          <MessageCircle className="mt-0.5 size-5 shrink-0" />
          <p>После подачи заявки волонтёр увидит эту ссылку и сможет вступить в группу проекта.</p>
        </div>
        <Field label="Ссылка на группу WhatsApp" error={errors.whatsapp_group_url?.message}>
          <Input type="url" {...register("whatsapp_group_url")} placeholder="https://chat.whatsapp.com/..." autoComplete="off" />
        </Field>
        <p className="text-xs leading-5 text-muted-foreground">Ссылка обязательна и не показывается незарегистрированным посетителям.</p>
      </CardSection>

      <CardSection title="Участие и публикация">
        <Field label="Количество мест" error={errors.required_volunteers?.message}>
          <Input type="number" min={1} {...register("required_volunteers")} />
        </Field>
        <Field label="Требования" error={errors.requirements?.message}>
          <Textarea {...register("requirements")} placeholder="Возраст, навыки, необходимая одежда или инвентарь" />
        </Field>
        <Field label="Публикация" error={errors.status?.message}>
          <select {...register("status")} className={selectClass}>
            <option value="draft">Сохранить как черновик</option>
            <option value="published">Опубликовать сразу</option>
          </select>
        </Field>
      </CardSection>

      <FormMessage message={message} />
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>Отмена</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
          {project ? "Сохранить" : "Создать проект"}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}{error ? <p className="text-xs text-danger-foreground">{error}</p> : null}</div>;
}

function CardSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="grid gap-5 rounded-2xl border bg-surface p-5 sm:p-6"><h2 className="text-lg font-black">{title}</h2>{children}</section>;
}
