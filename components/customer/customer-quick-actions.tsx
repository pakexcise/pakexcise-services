import { ClipboardList, Headphones, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { Route } from "next";
import Link from "next/link";

type QuickAction = {
  key: string;
  href: string;
  title: string;
  description: string;
  cta: string;
  icon: "services" | "track" | "support";
  accent: string;
};

type CustomerQuickActionsProps = {
  actions: QuickAction[];
};

const iconMap = {
  services: ClipboardList,
  track: Search,
  support: Headphones,
} as const;

export function CustomerQuickActions({ actions }: CustomerQuickActionsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {actions.map((action) => {
        const Icon = iconMap[action.icon];

        return (
          <article
            key={action.key}
            className={cn(
              "group flex h-full flex-col rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md",
              action.accent,
            )}
          >
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-background/80 p-2.5 shadow-sm ring-1 ring-border/60">
                <Icon className="size-5 text-primary" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{action.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              className="mt-5 w-full group-hover:border-primary/40"
            >
              <Link href={action.href as Route}>{action.cta}</Link>
            </Button>
          </article>
        );
      })}
    </div>
  );
}
