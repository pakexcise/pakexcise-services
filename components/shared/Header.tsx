"use client";

import { LogIn, Menu, MessageCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

const navItems = [
  { href: "/services", key: "services" },
  { href: "/track", key: "track" },
  { href: "/faqs", key: "faqs" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

type HeaderProps = {
  whatsappPhone?: string | null;
  whatsappMessage?: string | null;
};

function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const normalized = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function Header({ whatsappPhone, whatsappMessage }: HeaderProps) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tDisclaimer = useTranslations("disclaimer");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const phone = whatsappPhone ?? siteConfig.contact.whatsapp;
  const message = whatsappMessage ?? siteConfig.contact.whatsappMessage;
  const whatsappHref = buildWhatsAppUrl(phone, message);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="border-b border-secondary/20 bg-muted/40 px-4 py-1.5 text-center text-xs text-muted-foreground lg:hidden">
        {tDisclaimer("short")}
      </div>

      <div className="container-site grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <Link
          href="/"
          className="flex min-w-0 flex-col justify-self-start text-start"
        >
          <span className="truncate text-lg font-bold text-primary">
            {tCommon("brandName")}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {tCommon("tagline")}
          </span>
        </Link>

        <nav
          className="hidden items-center justify-center gap-0.5 lg:flex"
          aria-label="Primary"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground/80",
              )}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-1 sm:gap-2 lg:justify-self-end">
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="hidden bg-[#25D366] text-white hover:bg-[#20bd5a] sm:inline-flex"
          >
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics-event="click_whatsapp"
            >
              <MessageCircle className="size-4" />
              <span className="hidden md:inline">{tCommon("whatsapp")}</span>
            </a>
          </Button>

          <LanguageSwitcher />
          <ThemeToggle />

          <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/login">
              <LogIn className="size-4" />
              {t("login")}
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={mobileOpen ? tCommon("close") : tCommon("menu")}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen ? (
        <nav
          id="mobile-nav"
          className="border-t lg:hidden"
          aria-label="Mobile primary"
        >
          <div className="container-site flex flex-col gap-1 py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-start",
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/80",
                )}
              >
                {t(item.key)}
              </Link>
            ))}
            <Button asChild variant="outline" className="mt-2 justify-start">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <LogIn className="size-4" />
                {t("login")}
              </Link>
            </Button>
            <Button
              asChild
              className="justify-start bg-[#25D366] text-white hover:bg-[#20bd5a]"
            >
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics-event="click_whatsapp"
              >
                <MessageCircle className="size-4" />
                {tCommon("whatsappHelp")}
              </a>
            </Button>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
