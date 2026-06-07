"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import { AdminSearch } from "@/components/admin/admin-search";
import { AdminUserMenu, type AdminUserSummary } from "@/components/admin/admin-user-menu";
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
  const tCommon = useTranslations("common");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:px-6">
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
        <span className="text-sm font-semibold text-primary">
          {tCommon("brandName")}
        </span>
        <span className="block text-xs text-muted-foreground">{t("panel")}</span>
      </Link>

      <div className="hidden flex-1 justify-center md:flex">
        <AdminSearch />
      </div>

      <div className="ms-auto flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <AdminUserMenu user={user} />
      </div>
    </header>
  );
}
