import { brand } from "@/config/brand";
import { localeTags, type Locale } from "@/lib/i18n/config";

export function formatLocalizedDate(
  value: string | Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions,
) {
  const date = new Date(value);
  const timeZone = "Asia/Almaty";
  if (locale !== "kk") return new Intl.DateTimeFormat(localeTags[locale], { ...options, timeZone }).format(date);

  const longMonths = ["қаңтар", "ақпан", "наурыз", "сәуір", "мамыр", "маусым", "шілде", "тамыз", "қыркүйек", "қазан", "қараша", "желтоқсан"];
  const shortMonths = ["қаң.", "ақп.", "нау.", "сәу.", "мам.", "мау.", "шіл.", "там.", "қыр.", "қаз.", "қар.", "жел."];
  const rawParts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const parts = Object.fromEntries(rawParts.map((part) => [part.type, part.value]));
  const dateParts: string[] = [];
  if (options.day) dateParts.push(parts.day);
  if (options.month) dateParts.push((options.month === "short" ? shortMonths : longMonths)[Number(parts.month) - 1]);
  if (options.year) dateParts.push(`${parts.year} ж.`);
  const time = options.hour || options.minute
    ? `${parts.hour}:${parts.minute}`
    : "";
  return [dateParts.join(" "), time].filter(Boolean).join(", ");
}

export function translateValue(value: string, translations: Readonly<Record<string, string>>) {
  return translations[value] ?? value;
}

/** Replaces {name} placeholders. `{brand}` is filled in when dictionaries load. */
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

type Branded<T> = T extends string ? string : { [K in keyof T]: Branded<T[K]> };

/** Deeply substitutes `{brand}` with the configured product name. */
export function withBrand<T>(value: T): Branded<T> {
  if (typeof value === "string") return value.replaceAll("{brand}", brand.name) as Branded<T>;
  if (Array.isArray(value)) return value.map((item) => withBrand(item)) as unknown as Branded<T>;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, withBrand(item)])) as Branded<T>;
  }
  return value as Branded<T>;
}
