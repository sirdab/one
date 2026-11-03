export type CalendarDate = string;

export type ClockTime = string;

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME = /^(\d{2}):(\d{2})$/;

export function toUtc(date: string | null | undefined): Date | null {
  if (date == null) return null;
  const match = DATE.exec(date.slice(0, 10));
  if (match == null) return null;
  const [, year, month, day] = match;
  const at = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return at.getUTCDate() === Number(day) ? at : null;
}

function pad(n: number, width = 2): string {
  return String(n).padStart(width, "0");
}

export function fromUtc(at: Date): CalendarDate {
  return `${pad(at.getUTCFullYear(), 4)}-${pad(at.getUTCMonth() + 1)}-${pad(at.getUTCDate())}`;
}

export function isCalendarDate(value: string | null | undefined): boolean {
  return value != null && DATE.test(value) && toUtc(value) != null;
}

export function parseTime(value: string | null | undefined): {
  hour: number;
  minute: number;
} | null {
  if (value == null) return null;
  const match = TIME.exec(value);
  if (match == null) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour < 24 && minute < 60 ? { hour, minute } : null;
}

export function formatTime(hour: number, minute: number): ClockTime {
  return `${pad(hour)}:${pad(minute)}`;
}

export function splitDateTime(value: string | null | undefined): {
  date: CalendarDate | null;
  time: ClockTime | null;
} {
  if (value == null || value === "") return { date: null, time: null };
  const [date = "", time = ""] = value.split("T");
  return {
    date: isCalendarDate(date) ? date : null,
    time: parseTime(time.slice(0, 5)) != null ? time.slice(0, 5) : null,
  };
}

export function addDays(date: CalendarDate, days: number): CalendarDate {
  const at = toUtc(date);
  if (at == null) return date;
  at.setUTCDate(at.getUTCDate() + days);
  return fromUtc(at);
}

export function addMonths(date: CalendarDate, months: number): CalendarDate {
  const at = toUtc(date);
  if (at == null) return date;
  const target = new Date(
    Date.UTC(at.getUTCFullYear(), at.getUTCMonth() + months, 1),
  );
  const last = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(at.getUTCDate(), last));
  return fromUtc(target);
}

export function startOfMonth(date: CalendarDate): CalendarDate {
  return `${date.slice(0, 7)}-01`;
}

export function weekday(date: CalendarDate): number {
  return toUtc(date)?.getUTCDay() ?? 0;
}

export function startOfWeek(
  date: CalendarDate,
  weekStartsOn: number,
): CalendarDate {
  return addDays(date, -((weekday(date) - weekStartsOn + 7) % 7));
}

export function monthGrid(
  month: CalendarDate,
  weekStartsOn: number,
): CalendarDate[][] {
  const first = startOfWeek(startOfMonth(month), weekStartsOn);
  return Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => addDays(first, week * 7 + day)),
  );
}

export function clampDate(
  date: CalendarDate,
  min: CalendarDate | undefined,
  max: CalendarDate | undefined,
): CalendarDate {
  if (min != null && date < min) return min;
  if (max != null && date > max) return max;
  return date;
}

export function todayIn(
  timeZone?: string,
  now: Date = new Date(),
): CalendarDate {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const find = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${find("year")}-${find("month")}-${find("day")}`;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

export function dateFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  const hit = formatters.get(key);
  if (hit) return hit;
  const made = new Intl.DateTimeFormat(`${locale}-u-ca-gregory`, {
    timeZone: "UTC",
    ...options,
  });
  formatters.set(key, made);
  return made;
}

export function formatDay(date: CalendarDate, locale: string): string {
  const at = toUtc(date);
  return at == null
    ? date
    : dateFormatter(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(at);
}

export function formatClock(time: ClockTime, locale: string): string {
  const parsed = parseTime(time);
  if (parsed == null) return time;
  return dateFormatter(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(Date.UTC(2000, 0, 1, parsed.hour, parsed.minute)));
}

export function formatDayRange(
  from: CalendarDate,
  to: CalendarDate,
  locale: string,
): string {
  const start = toUtc(from);
  const end = toUtc(to);
  if (start == null || end == null) return `${from} – ${to}`;
  return dateFormatter(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).formatRange(start, end);
}
