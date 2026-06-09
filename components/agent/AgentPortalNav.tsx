"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/agent/dashboard", key: "dashboard" },
  { href: "/agent/applications", key: "applications" },
  { href: "/agent/applications/new", key: "newApplication", requiresApproval: true },
  { href: "/agent/commissions", key: "commissions" },
  { href: "/agent/profile", key: "profile" },
] as const;

type AgentPortalNavProps = {
  isApproved: boolean;
};

export function AgentPortalNav({ isApproved }: AgentPortalNavProps) {
  const pathname = usePathname();
  const t = useTranslations("agent.nav");

  return (
    <nav
      aria-label={t("ariaLabel")}
      className="flex flex-wrap items-center gap-2 border-b pb-4"
    >
      {navItems.map((item) => {
        if (item.requiresApproval && !isApproved) {
          return null;
        }

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
