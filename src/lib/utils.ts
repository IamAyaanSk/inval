import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DateTime } from "luxon";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateToInputValue(date: Date = new Date()): string {
  return DateTime.fromJSDate(date).toISODate() ?? date.toISOString();
}

export function getDefaultDateRangeStrings(): { from: string; to: string } {
  const now = DateTime.now();
  const firstDay = now.startOf("month");
  const lastDay = now.endOf("month");

  return {
    from: firstDay.toISODate(),
    to: lastDay.toISODate(),
  };
}

export function dateStringToIsoStartOfDay(dateStr: string): string {
  const dt = DateTime.fromISO(dateStr);
  if (!dt.isValid) {
    return DateTime.now().startOf("day").toUTC().toString();
  }
  return dt.startOf("day").toUTC().toString();
}

export function dateStringToIsoEndOfDay(dateStr: string): string {
  const dt = DateTime.fromISO(dateStr);
  if (!dt.isValid) {
    return DateTime.now().endOf("day").toUTC().toString();
  }
  return dt.endOf("day").toUTC().toString();
}

export function formatCurrency(value: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatDate(dateInput: string): string {
  if (!dateInput) return "";
  const dt = DateTime.fromISO(dateInput);

  if (!dt.isValid) return "";
  return dt.toFormat("LLL d, yyyy");
}
