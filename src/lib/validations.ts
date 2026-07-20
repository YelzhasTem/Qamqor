import { z } from "zod";

export const registrationCities = ["Алматы", "Астана", "Шымкент"] as const;

export const loginSchema = z.object({
  email: z.email("Введите корректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Укажите имя").max(120),
  city: z.enum(registrationCities, { error: "Выберите город" }),
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
  city: z.string().trim().min(2, "Укажите город").max(100),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  format: z.enum(["online", "offline"]),
  start_date: z.string().min(1, "Укажите дату начала"),
  end_date: z.string().min(1, "Укажите дату окончания"),
  volunteer_hours: z.coerce.number().min(0).max(1000),
  required_volunteers: z.coerce.number().int().min(1).max(100000),
  requirements: z.string().trim().max(2000).optional().or(z.literal("")),
  status: z.enum(["draft", "published"]),
}).superRefine((data, ctx) => {
  if (new Date(data.end_date) < new Date(data.start_date)) ctx.addIssue({ code: "custom", message: "Дата окончания должна быть позже даты начала", path: ["end_date"] });
  if (data.format === "offline" && !data.address) ctx.addIssue({ code: "custom", message: "Укажите адрес", path: ["address"] });
});

export const hoursSchema = z.object({
  applicationId: z.uuid(),
  volunteerId: z.uuid(),
  projectId: z.uuid(),
  hours: z.coerce.number().min(0).max(1000),
  status: z.enum(["pending", "confirmed", "rejected"]),
});
