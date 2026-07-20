import { z } from "zod";
import { projectBenefitValues } from "@/lib/project-benefits";

export const registrationCities = ["Алматы", "Астана", "Шымкент"] as const;

export function normalizeKazakhstanPhone(value: string) {
  return `+${value.replace(/\D/g, "")}`;
}

const kazakhstanPhoneSchema = z.string()
  .trim()
  .min(1, "Укажите номер телефона")
  .max(32)
  .refine((value) => /^\+7[\d\s()-]*$/.test(value) && value.replace(/\D/g, "").length === 11, "Введите номер в формате +7 700 123 45 67");

export const loginSchema = z.object({
  email: z.email("Введите корректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Укажите имя").max(120),
  city: z.enum(registrationCities, { error: "Выберите город" }),
  phone: kazakhstanPhoneSchema,
  email: z.email("Введите корректный email"),
  password: z.string().min(8, "Минимум 8 символов").max(72),
  role: z.literal("volunteer"),
});

export const forgotPasswordSchema = z.object({ email: z.email("Введите корректный email") });
export const passwordSchema = z.object({
  password: z.string().min(8, "Минимум 8 символов").max(72),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, { message: "Пароли не совпадают", path: ["confirmPassword"] });

export const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Укажите имя").max(120),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  bio: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const projectSchema = z.object({
  title: z.string().trim().min(3, "Минимум 3 символа").max(160),
  description: z.string().trim().min(20, "Расскажите о проекте подробнее").max(6000),
  category: z.string().trim().min(2, "Выберите категорию").max(80),
  city: z.enum(registrationCities, { error: "Выберите город" }),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  format: z.enum(["online", "offline"]),
  start_date: z.string().min(1, "Укажите дату начала"),
  end_date: z.string().min(1, "Укажите дату окончания"),
  volunteer_hours: z.coerce.number().min(0).max(1000),
  required_volunteers: z.coerce.number().int().min(1).max(100000),
  benefits: z.array(z.enum(projectBenefitValues)).min(1, "Выберите хотя бы один пункт"),
  whatsapp_group_url: z.string().trim().url("Введите корректную ссылку").refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && url.hostname === "chat.whatsapp.com" && url.pathname.length > 1;
    } catch {
      return false;
    }
  }, "Используйте ссылку-приглашение вида https://chat.whatsapp.com/..."),
  requirements: z.string().trim().max(2000).optional().or(z.literal("")),
  status: z.enum(["draft", "published"]),
}).superRefine((data, ctx) => {
  if (new Date(data.end_date) < new Date(data.start_date)) ctx.addIssue({ code: "custom", message: "Дата окончания должна быть позже даты начала", path: ["end_date"] });
  if (data.format === "offline" && !data.address) ctx.addIssue({ code: "custom", message: "Укажите адрес", path: ["address"] });
  if (data.benefits.includes("volunteer_hours") && data.volunteer_hours <= 0) ctx.addIssue({ code: "custom", message: "Укажите количество волонтёрских часов", path: ["volunteer_hours"] });
});

export const hoursSchema = z.object({
  applicationId: z.uuid(),
  volunteerId: z.uuid(),
  projectId: z.uuid(),
  hours: z.coerce.number().min(0).max(1000),
  status: z.enum(["pending", "confirmed", "rejected"]),
});
