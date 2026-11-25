import { brand } from "@/config/brand";
import { localeTags, type Locale } from "@/lib/i18n/config";

/** The one time zone every date and time in the UI is shown and typed in. */
export const APP_TIME_ZONE = "Asia/Almaty";

const kkLongMonths = ["қаңтар", "ақпан", "наурыз", "сәуір", "мамыр", "маусым", "шілде", "тамыз", "қыркүйек", "қазан", "қараша", "желтоқсан"];
const kkShortMonths = ["қаң.", "ақп.", "нау.", "сәу.", "мам.", "мау.", "шіл.", "там.", "қыр.", "қаз.", "қар.", "жел."];
// Sunday first, matching Date#getUTCDay().
const kkShortWeekdays = ["жс", "дс", "сс", "ср", "бс", "жм", "сб"];
const kkLongWeekdays = ["жексенбі", "дүйсенбі", "сейсенбі", "сәрсенбі", "бейсенбі", "жұма", "сенбі"];

/** Wall-clock parts of an instant in Almaty, independent of the device or server zone. */
export function almatyParts(value: string | Date) {
  const date = new Date(value);
  const raw = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const parts = Object.fromEntries(raw.map((part) => [part.type, part.value]));
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const hour = Number(parts.hour) % 24;
  const minute = Number(parts.minute);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return { year, month, day, hour, minute, weekday };
}

/**
 * Formats the date part of an instant in Almaty time. Times always use the
 * 24-hour clock ("09:00") in every language. Kazakh names are built here
 * because ICU data for kk differs between browsers.
 */
export function formatLocalizedDate(
  value: string | Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions,
) {
  const date = new Date(value);
  const timeZone = APP_TIME_ZONE;
  const parts = almatyParts(date);
  const time = options.hour || options.minute
    ? `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`
    : "";
  const dateOptions: Intl.DateTimeFormatOptions = { day: options.day, month: options.month, year: options.year, weekday: options.weekday };
  const hasDate = Boolean(dateOptions.day || dateOptions.month || dateOptions.year || dateOptions.weekday);

  let datePart = "";
  if (hasDate && locale !== "kk") {
    datePart = new Intl.DateTimeFormat(localeTags[locale], { ...dateOptions, timeZone }).format(date);
  } else if (hasDate) {
    const dateParts: string[] = [];
    if (dateOptions.day) dateParts.push(String(parts.day));
    if (dateOptions.month) dateParts.push((dateOptions.month === "short" ? kkShortMonths : kkLongMonths)[parts.month - 1]);
    if (dateOptions.year) dateParts.push(`${parts.year} ж.`);
    datePart = dateParts.join(" ");
    if (dateOptions.weekday) {
      const weekday = (dateOptions.weekday === "long" ? kkLongWeekdays : kkShortWeekdays)[parts.weekday];
      datePart = datePart ? `${datePart}, ${weekday}` : weekday;
    }
  }
  return [datePart, time].filter(Boolean).join(", ");
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
