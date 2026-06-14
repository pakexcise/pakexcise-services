"use client";

import { LogOut, User } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Link } from "@/i18n/navigation";

export type AdminUserSummary = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

type AdminUserMenuProps = {
  user: AdminUserSummary;
};

export function AdminUserMenu({ user }: AdminUserMenuProps) {
  const t = useTranslations("admin");

  const roleLabel =
    user.role === "SUPER_ADMIN"
      ? t("roles.superAdmin")
      : user.role === "ADMIN"
        ? t("roles.admin")
        : user.role;

  async function handleSignOut() {
    await authClient.signOut();
    window.location.href = "/";
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="max-w-[12rem] gap-2">
          <User className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{user.name ?? user.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <span className="truncate font-medium">{user.name ?? user.email}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
            <span className="text-xs text-muted-foreground">{roleLabel}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/">{t("userMenu.publicSite")}</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="size-4" aria-hidden="true" />
          {t("userMenu.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
