import { cn } from "@/lib/utils";

/** Sticky marketing header shell shared by disclaimer + navigation. */
export const siteChromeShellClassName = cn(
  "sticky top-0 z-40 isolate border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
);
