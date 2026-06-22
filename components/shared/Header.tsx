"use client";

import { Menu, X } from "lucide-react";

import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { AuthNav } from "@/components/shared/auth-nav";
import { SiteLogo } from "@/components/shared/SiteLogo";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { disclaimerBannerClassName } from "@/lib/styles/disclaimer-banner";

const navItems = [
  { href: "/services", key: "services" },
  { href: "/regions", key: "regions" },
  { href: "/blog", key: "blog" },
  { href: "/track", key: "track" },
  { href: "/faqs", key: "faqs" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

type HeaderProps = {
  whatsappPhone?: string | null;
  whatsappMessage?: string | null;
  whatsappLabel?: string | null;
  headerWhatsappEnabled?: boolean;
  announcementBarEnabled?: boolean;
  announcementBarText?: string | null;
  logoPath?: string | null;
  logoDarkPath?: string | null;
  embedded?: boolean;
};

function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const normalized = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function Header({
  whatsappPhone,
  whatsappMessage,
  whatsappLabel,
  headerWhatsappEnabled = true,
  announcementBarEnabled = true,
  announcementBarText,
  logoPath,
  logoDarkPath,
  embedded = false,
}: HeaderProps) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const showWhatsapp = headerWhatsappEnabled && Boolean(whatsappPhone?.trim());
  const whatsappHref =
    showWhatsapp && whatsappPhone && whatsappMessage
      ? buildWhatsAppUrl(whatsappPhone, whatsappMessage)
      : null;
  const desktopWhatsappLabel = whatsappLabel?.trim() || tCommon("whatsapp");
  const mobileWhatsappLabel = whatsappLabel?.trim() || tCommon("whatsappHelp");

  return (
    <header
      className={cn(
        !embedded &&
          "sticky top-0 z-40 isolate border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
      )}
    >
      {announcementBarEnabled && announcementBarText ? (
        <div
          className={cn(
            "px-4 py-1.5 text-center text-xs leading-snug xl:hidden",
            embedded ? "border-b border-border/60" : "border-b",
            disclaimerBannerClassName,
          )}
        >
          {announcementBarText}
        </div>
      ) : null}

      <div className="container-site flex min-h-16 items-center justify-between gap-3 py-2">
        <Link
          href="/"
          className="flex min-w-0 max-w-[55%] shrink-0 items-center text-start sm:max-w-none"
        >
          <SiteLogo
            priority
            imageClassName="max-h-9 sm:max-h-10"
            logoPath={logoPath}
            logoDarkPath={logoDarkPath}
          />
        </Link>

        <nav
          className="hidden items-center justify-center gap-0.5 xl:flex"
          aria-label="Primary"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-2.5 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground xl:px-3",
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground/80",
              )}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-1.5">
          {showWhatsapp && whatsappHref ? (
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="hidden bg-[#25D366] px-2.5 text-white hover:bg-[#20bd5a] md:inline-flex"
            >
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics-event="click_whatsapp"
                data-analytics-placement="header_desktop"
                aria-label={desktopWhatsappLabel}
              >
                <WhatsAppIcon className="size-4" />
                <span className="hidden lg:inline">{desktopWhatsappLabel}</span>
              </a>
            </Button>
          ) : null}

          <LanguageSwitcher />
          <ThemeToggle />

          <AuthNav
            loginLabel={t("login")}
            dashboardLabel={t("dashboard")}
            logoutLabel={t("logout")}
            compact
            className="hidden sm:inline-flex"
          />

          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
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
          className="border-t xl:hidden"
          aria-label="Mobile primary"
        >
          <div className="container-site flex flex-col gap-1 py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm font-medium text-start",
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/80",
                )}
              >
                {t(item.key)}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t pt-3">
              <AuthNav
                loginLabel={t("login")}
                dashboardLabel={t("dashboard")}
                logoutLabel={t("logout")}
                onNavigate={() => setMobileOpen(false)}
              />
              {showWhatsapp && whatsappHref ? (
                <Button
                  asChild
                  className="justify-start bg-[#25D366] text-white hover:bg-[#20bd5a] md:hidden"
                >
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-analytics-event="click_whatsapp"
                    data-analytics-placement="header_mobile"
                  >
                    <WhatsAppIcon className="size-4" />
                    {mobileWhatsappLabel}
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
