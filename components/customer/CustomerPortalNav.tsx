"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/customer/dashboard", key: "dashboard" },
  { href: "/customer/profile", key: "profile" },
] as const;

export function CustomerPortalNav() {
  const pathname = usePathname();
  const t = useTranslations("customer.nav");

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
