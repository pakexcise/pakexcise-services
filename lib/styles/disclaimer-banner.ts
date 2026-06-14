import { cn } from "@/lib/utils";

/** Shared disclaimer surfaces that stay readable in light and dark mode. */
export const disclaimerBannerClassName = cn(
  "border-primary/15 bg-primary/[0.06] text-foreground/90",
  "dark:border-primary/25 dark:bg-primary/10 dark:text-foreground/95",
);

export const disclaimerBannerIconClassName = cn(
  "shrink-0 text-primary dark:text-primary",
);

export const disclaimerBoxClassName = cn(
  "rounded-xl border p-4 text-sm leading-relaxed",
  disclaimerBannerClassName,
);

export const disclaimerCompactClassName = cn(
  "rounded-lg border px-3 py-2 text-xs leading-snug",
  disclaimerBannerClassName,
);
