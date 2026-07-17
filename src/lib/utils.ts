import { type ClassValue, clsx } from "clsx";
import { format, formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | Date, pattern = "d MMMM yyyy") {
  return format(new Date(value), pattern, { locale: ru });
}

export function relativeDate(value: string | Date) {
  return formatDistanceToNow(new Date(value), { addSuffix: true, locale: ru });
}

export function initials(name?: string | null) {
  if (!name) return "Q";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function clampText(text: string, length = 140) {
  return text.length > length ? `${text.slice(0, length).trim()}…` : text;
}

export function safeRedirect(path?: string | null) {
  return path?.startsWith("/") && !path.startsWith("//") ? path : "/dashboard";
}
