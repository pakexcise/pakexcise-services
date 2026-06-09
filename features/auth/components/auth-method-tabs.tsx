"use client";

import { Mail, Phone } from "lucide-react";

import { cn } from "@/lib/utils";

export type AuthMethod = "email" | "phone";

type AuthMethodTabsProps = {
  value: AuthMethod;
  onChange: (value: AuthMethod) => void;
  emailLabel: string;
  phoneLabel: string;
};

export function AuthMethodTabs({
  value,
  onChange,
  emailLabel,
  phoneLabel,
}: AuthMethodTabsProps) {
  return (
    <div
      className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-1"
      role="tablist"
      aria-label="Sign-in method"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === "email"}
        onClick={() => onChange("email")}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          value === "email"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Mail className="size-4" aria-hidden="true" />
        {emailLabel}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "phone"}
        onClick={() => onChange("phone")}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          value === "phone"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Phone className="size-4" aria-hidden="true" />
        {phoneLabel}
      </button>
    </div>
  );
}
