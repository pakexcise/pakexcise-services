import type { ComponentType } from "react";
import {
  BadgeCheck,
  Ban,
  Clock3,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type { Route } from "next";
import Link from "next/link";

type AgentAdminStatsProps = {
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    active: number;
    inactive: number;
  };
  currentStatus?: string;
};

function buildHref(status?: string): string {
  if (!status) {
    return "/admin/agents";
  }

  return `/admin/agents?status=${status}`;
}

type StatCardProps = {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  accent: string;
  iconTone: string;
  active?: boolean;
  href?: string;
};

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  iconTone,
  active,
  href,
}: StatCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
        </div>
        <div className={cn("rounded-lg p-2", iconTone)}>
          <Icon className="size-4" aria-hidden="true" />
        </div>
      </div>
    </>
  );

  const className = cn(
    "rounded-xl border border-s-4 bg-card p-4 shadow-sm",
    accent,
    active && "ring-2 ring-primary/20",
    href && "transition-shadow hover:shadow-md",
  );

  if (href) {
    return (
      <Link href={href as Route} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

export async function AgentAdminStats({
  stats,
  currentStatus,
}: AgentAdminStatsProps) {
    const items: StatCardProps[] = [
    {
      label: "Total agents",
      value: stats.total,
      href: buildHref(),
      icon: Users,
      accent: "border-s-primary",
      iconTone: "bg-primary/10 text-primary",
      active: !currentStatus,
    },
    {
      label: "Pending approval",
      value: stats.pending,
      href: buildHref("PENDING"),
      icon: Clock3,
      accent: "border-s-amber-500",
      iconTone: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
      active: currentStatus === "PENDING",
    },
    {
      label: "Approved",
      value: stats.approved,
      href: buildHref("APPROVED"),
      icon: BadgeCheck,
      accent: "border-s-emerald-500",
      iconTone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      active: currentStatus === "APPROVED",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      href: buildHref("REJECTED"),
      icon: Ban,
      accent: "border-s-destructive",
      iconTone: "bg-destructive/10 text-destructive",
      active: currentStatus === "REJECTED",
    },
    {
      label: "Active accounts",
      value: stats.active,
      icon: UserCheck,
      accent: "border-s-blue-500",
      iconTone: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    },
    {
      label: "Inactive accounts",
      value: stats.inactive,
      icon: UserX,
      accent: "border-s-muted-foreground/40",
      iconTone: "bg-muted text-muted-foreground",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {items.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </div>
  );
}
