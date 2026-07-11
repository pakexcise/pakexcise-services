"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import { AdminSearch } from "@/components/admin/admin-search";
import { AdminUserMenu, type AdminUserSummary } from "@/components/admin/admin-user-menu";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";

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

      <div className="min-w-0 flex-1 justify-center md:flex">
        <div className="hidden w-full max-w-xl md:block">
          <AdminSearch />
        </div>
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
