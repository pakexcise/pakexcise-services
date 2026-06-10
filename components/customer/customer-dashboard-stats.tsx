import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Loader2,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";

type StatItem = {
  key: string;
  label: string;
  value: number;
};

type CustomerDashboardStatsProps = {
  items: StatItem[];
};

const iconMap = {
  total: ClipboardList,
  actionRequired: AlertCircle,
  inProgress: Loader2,
  completed: CheckCircle2,
  closed: XCircle,
} as const;

const accentMap = {
  total: "border-s-primary",
  actionRequired: "border-s-secondary",
  inProgress: "border-s-blue-500",
  completed: "border-s-emerald-500",
  closed: "border-s-muted-foreground/40",
} as const;

const iconToneMap = {
  total: "bg-primary/10 text-primary",
  actionRequired: "bg-secondary/15 text-secondary-foreground",
  inProgress: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  closed: "bg-muted text-muted-foreground",
} as const;

export function CustomerDashboardStats({ items }: CustomerDashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => {
        const Icon = iconMap[item.key as keyof typeof iconMap] ?? ClipboardList;
        const accent =
          accentMap[item.key as keyof typeof accentMap] ?? accentMap.total;
        const iconTone =
          iconToneMap[item.key as keyof typeof iconToneMap] ?? iconToneMap.total;

        return (
          <div
            key={item.key}
            className={cn(
              "rounded-xl border border-s-4 bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
              accent,
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight">
                  {item.value.toLocaleString()}
                </p>
              </div>
              <div className={cn("rounded-lg p-2", iconTone)}>
                <Icon className="size-5" aria-hidden="true" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
