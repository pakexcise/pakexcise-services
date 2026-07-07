"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import { AdminSearch } from "@/components/admin/admin-search";
import { AdminUserMenu, type AdminUserSummary } from "@/components/admin/admin-user-menu";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { SiteLogo } from "@/components/shared/SiteLogo";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type AdminTopbarProps = {
  user: AdminUserSummary;
  onMenuClick: () => void;
};

export function AdminTopbar({ user, onMenuClick }: AdminTopbarProps) {
  const t = useTranslations("admin");

  return (
    <header className="z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-3 sm:gap-3 sm:px-4 lg:px-6">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label={t("openMenu")}
      >
        <Menu className="size-4" aria-hidden="true" />
      </Button>

      <Link href="/admin/dashboard" className="hidden min-w-0 lg:block">
        <SiteLogo size="portal" />
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {user.role === "SUPER_ADMIN" ? t("panelSuperAdmin") : t("panelOperations")}
        </span>
      </Link>

      <div className="hidden min-w-0 flex-1 justify-center md:flex">
        <AdminSearch />
      </div>

      <div className="ms-auto flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
        <NotificationBell applicationBasePath="/admin/applications" />
        <LanguageSwitcher />
        <ThemeToggle />
        <AdminUserMenu user={user} />
      </div>
    </header>
  );
}
