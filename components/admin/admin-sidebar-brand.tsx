"use client";

import { useTranslations } from "next-intl";

import { SiteLogo } from "@/components/shared/SiteLogo";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type AdminSidebarBrandProps = {
  isSuperAdmin: boolean;
};

export function AdminSidebarBrand({ isSuperAdmin }: AdminSidebarBrandProps) {
  const t = useTranslations("admin");

  return (
    <div
      className={cn(
        "shrink-0 border-b px-4 py-4",
        isSuperAdmin
          ? "border-primary/15 bg-gradient-to-br from-primary/10 via-sidebar to-sidebar"
          : "bg-sidebar",
      )}
    >
      <Link href="/admin/dashboard" className="block">
        <SiteLogo imageClassName="max-h-8" />
      </Link>

      <div
        className={cn(
          "mt-3 rounded-lg border px-3 py-2.5",
          isSuperAdmin
            ? "border-primary/20 bg-primary/5"
            : "border-border/70 bg-muted/30",
        )}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "size-2 shrink-0 rounded-full",
              isSuperAdmin ? "bg-primary" : "bg-muted-foreground/60",
            )}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">
              {isSuperAdmin ? t("panelSuperAdmin") : t("panelOperations")}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {isSuperAdmin ? t("roles.superAdmin") : t("roles.admin")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
