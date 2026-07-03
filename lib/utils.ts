import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { getPublicAppUrl } from "@/config/env.shared";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string): string {
  const baseUrl = getPublicAppUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath === "/" ? "" : normalizedPath}`;
}

export function publicPath(path = ""): string {
  if (!path || path === "/") {
    return "/";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

function toDateValue(date: Date | string): Date {
  return typeof date === "string" ? new Date(date) : date;
}

export function formatDate(
  date: Date | string,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const value = toDateValue(date);
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    ...options,
  }).format(value);
}

/** e.g. Friday, 12 June 2026 • 03:17 AM */
export function formatDateTime(date: Date | string, locale: string): string {
  const value = toDateValue(date);
  const datePart = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
  const timePart = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(value);

  return `${datePart} • ${timePart}`;
}
