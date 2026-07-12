"use client";

import { copy, createT } from "@/messages";

import { useTranslations } from "@/lib/i18n/t";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import Link from "next/link";
import { usePathname } from "next/navigation";
const navItems = [
  { href: "/customer/dashboard", key: "dashboard" },
  { href: "/customer/profile", key: "profile" },
] as const;

export function CustomerPortalNav() {
  const pathname = usePathname();
  const t = createT(copy.customer.nav);

  return (
    <nav
      aria-label={t("ariaLabel")}
      className="flex flex-wrap items-center gap-2 border-b pb-4"
    >
      {navItems.map((item) => {
        const isActive = pathname.includes(item.href);

        return (
          <Button
            key={item.href}
            asChild
            size="sm"
            variant={isActive ? "default" : "outline"}
          >
            <Link href={item.href} className={cn(isActive && "pointer-events-none")}>
              {t(item.key)}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
