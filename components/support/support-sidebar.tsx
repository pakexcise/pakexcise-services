"use client";

import { copy, createT } from "@/messages";

import {
  FileStack,
  Headphones,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "@/lib/i18n/t";

import type { SupportNavItem } from "@/config/support";
import { cn } from "@/lib/utils";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

const iconMap: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "file-stack": FileStack,
  headphones: Headphones,
};

type SupportSidebarProps = {
  items: SupportNavItem[];
  onNavigate?: () => void;
  className?: string;
};

export function SupportSidebar({
  items,
  onNavigate,
  className,
}: SupportSidebarProps) {
  const pathname = usePathname();
  const t = createT(copy.support.nav);

  return (
    <nav
      className={cn("flex flex-col gap-1 p-3", className)}
      aria-label={t("ariaLabel")}
    >
      <p className="px-3 pb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {t("section")}
      </p>
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = iconMap[item.icon] ?? LayoutDashboard;

        return (
          <Link
            key={item.href}
            href={item.href as Route}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
