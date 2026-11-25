// Dates and times for every screen.
//
// One rule: the database stores real instants (timestamptz); everything a user
// sees or types is Almaty wall-clock time (IANA zone Asia/Almaty), whatever the
// device or server time zone. All formatting goes through formatLocalizedDate.
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { APP_TIME_ZONE, almatyParts, formatLocalizedDate } from "@/lib/i18n/format";

export { APP_TIME_ZONE, almatyParts };

type DateValue = string | Date;

export type DateStyle =
  /** 29 ноября */
  | "dayMonth"
  /** 29 нояб. */
  | "dayMonthShort"
  /** 29 ноября 2026 г. */
  | "full"
  /** 29 нояб. 2026 г. */
  | "fullShort";

const dateStyles: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  dayMonth: { day: "numeric", month: "long" },
  dayMonthShort: { day: "numeric", month: "short" },
  full: { day: "numeric", month: "long", year: "numeric" },
  fullShort: { day: "numeric", month: "short", year: "numeric" },
};

/** Date only, e.g. "29 ноября". */
export function formatDate(value: DateValue, locale: Locale, style: DateStyle = "full") {
  return formatLocalizedDate(value, locale, dateStyles[style]);
}

/** Date and time, e.g. "29 ноября, 10:00". */
export function formatDateTime(value: DateValue, locale: Locale, style: DateStyle = "dayMonth") {
  return formatLocalizedDate(value, locale, { ...dateStyles[style], hour: "2-digit", minute: "2-digit" });
}

/** 24-hour time, e.g. "09:00". */
export function formatTime(value: DateValue) {
  const { hour, minute } = almatyParts(value);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** Short weekday, e.g. "сб", "сб", "Sat". */
export function formatWeekdayShort(value: DateValue, locale: Locale) {
  return formatLocalizedDate(value, locale, { weekday: "short" });
}

/** "YYYY-MM-DD" of the Almaty calendar day of an instant. */
export function almatyDayKey(value: DateValue) {
  const { year, month, day } = almatyParts(value);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Whole Almaty calendar days from `now` to `value` (0 today, 1 tomorrow, -1 yesterday). */
export function almatyDayDiff(value: DateValue, now: DateValue = new Date()) {
  const toUtcDay = (input: DateValue) => {
    const { year, month, day } = almatyParts(input);
    return Date.UTC(year, month - 1, day);
  };
  return Math.round((toUtcDay(value) - toUtcDay(now)) / 86_400_000);
}

/** "Сегодня" / "Завтра" when the instant falls on that Almaty day, otherwise null. */
export function relativeDayLabel(value: DateValue, locale: Locale, now: DateValue = new Date()) {
  const diff = almatyDayDiff(value, now);
  const words = getDictionary(locale).common.time;
  if (diff === 0) return words.today;
  if (diff === 1) return words.tomorrow;
  return null;
}

/** "11:00–14:00", or a range with dates when the event spans several days. */
export function formatTimeRange(start: DateValue, end: DateValue, locale: Locale) {
  if (almatyDayKey(start) === almatyDayKey(end)) return `${formatTime(start)}–${formatTime(end)}`;
  return `${formatDateTime(start, locale, "dayMonthShort")} – ${formatDateTime(end, locale, "dayMonthShort")}`;
}

/** "Сегодня, 10:00", "Завтра, 10:00" or "29 ноября, 10:00". */
export function formatEventStart(value: DateValue, locale: Locale, now: DateValue = new Date()) {
  const relative = relativeDayLabel(value, locale, now);
  return relative ? `${relative}, ${formatTime(value)}` : formatDateTime(value, locale);
}

/** "29 ноября, вс · 11:00–14:00" for the project page. */
export function formatEventWhen(start: DateValue, end: DateValue, locale: Locale) {
  if (almatyDayKey(start) !== almatyDayKey(end)) return formatTimeRange(start, end, locale);
  return `${formatDate(start, locale, "dayMonth")}, ${formatWeekdayShort(start, locale)} · ${formatTimeRange(start, end, locale)}`;
}

/** "сб, 29 ноября · 11:00" for feed cards. */
export function formatCardMoment(value: DateValue, locale: Locale) {
  return `${formatWeekdayShort(value, locale)}, ${formatDate(value, locale, "dayMonth")} · ${formatTime(value)}`;
}

// Input ----------------------------------------------------------------------

/** Almaty offset from UTC in milliseconds at a given instant. */
function almatyOffsetMs(utcMs: number) {
  const { year, month, day, hour, minute } = almatyParts(new Date(utcMs));
  const wholeMinute = utcMs - (((utcMs % 60_000) + 60_000) % 60_000);
  return Date.UTC(year, month - 1, day, hour, minute) - wholeMinute;
}

const INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

/**
 * Converts the value of a datetime-local input, read as Almaty wall-clock
 * time, into an ISO instant: "2026-11-29T09:00" -> "2026-11-29T04:00:00.000Z".
 * Returns null for anything that is not a datetime-local value.
 */
export function almatyInputToIso(value: string) {
  const match = INPUT_PATTERN.exec(value.trim());
  if (!match) return null;
  const [, year, month, day, hour, minute, second] = match.map(Number) as number[];
  const wallClock = Date.UTC(year, month - 1, day, hour, minute, second || 0);
  // Two passes settle the offset even across a zone rule change.
  let instant = wallClock - almatyOffsetMs(wallClock);
  instant = wallClock - almatyOffsetMs(instant);
  return new Date(instant).toISOString();
}

/** The datetime-local value ("2026-11-29T09:00") showing an instant in Almaty time. */
export function isoToAlmatyInput(value: DateValue | null | undefined) {
  if (!value) return "";
  const { year, month, day, hour, minute } = almatyParts(value);
  const pad = (number: number) => String(number).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
}
