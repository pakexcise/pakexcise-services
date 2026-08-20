"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { AuthHeaderActionsLazy } from "@/components/shared/auth-header-actions-lazy";
import { SiteLogo } from "@/components/shared/SiteLogo";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/t";
import { disclaimerBannerClassName } from "@/lib/styles/disclaimer-banner";
import { cn } from "@/lib/utils";

const ThemeToggle = dynamic(
  () =>
    import("@/components/theme/ThemeToggle").then((mod) => mod.ThemeToggle),
  {
    ssr: false,
    loading: () => (
      <span
        className="inline-flex size-10 shrink-0"
        aria-hidden="true"
      />
    ),
  },
);

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
  const tAuthHeader = useTranslations("authHeader");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const showWhatsapp = headerWhatsappEnabled && Boolean(whatsappPhone?.trim());
  const trimmedAnnouncement = announcementBarText?.trim() ?? "";
  const showAnnouncementBar = announcementBarEnabled && trimmedAnnouncement.length > 0;
  const whatsappHref =
    showWhatsapp && whatsappPhone && whatsappMessage
      ? buildWhatsAppUrl(whatsappPhone, whatsappMessage)
      : null;
  const desktopWhatsappLabel = whatsappLabel?.trim() || tCommon("whatsapp");
  const mobileWhatsappLabel = whatsappLabel?.trim() || tCommon("whatsappHelp");
  const authHeaderLabels = {
    login: tAuthHeader("login"),
    myAccount: tAuthHeader("myAccount"),
    myDashboard: tAuthHeader("myDashboard"),
    dashboard: tAuthHeader("dashboard"),
    myApplications: tAuthHeader("myApplications"),
    trackApplication: tAuthHeader("trackApplication"),
    profileSettings: tAuthHeader("profileSettings"),
    logout: tAuthHeader("logout"),
    accountMenu: tAuthHeader("accountMenu"),
  };

  return (
    <header
      className={cn(
        !embedded &&
          "sticky top-0 z-40 isolate border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
      )}
    >
      {showAnnouncementBar ? (
        <div
          className={cn(
            "px-4 py-1.5 text-center text-xs leading-snug xl:hidden",
            embedded ? "border-b border-border/60" : "border-b",
            disclaimerBannerClassName,
          )}
        >
          {trimmedAnnouncement}
        </div>
      ) : null}

      <div className="container-site flex min-h-[4.25rem] items-center justify-between gap-3 py-2.5 sm:min-h-[4.5rem]">
        <Link
          href="/"
          prefetch={false}
          className="flex min-w-0 max-w-[62%] shrink-0 items-center text-start sm:max-w-none"
        >
          <SiteLogo
            priority
            size="header"
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
              prefetch={false}
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
              className="hidden bg-[#128C7E] px-2.5 text-white hover:bg-[#0f7a6c] md:inline-flex"
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

          <ThemeToggle />

          <AuthHeaderActionsLazy
            labels={authHeaderLabels}
            variant="desktop"
            className="hidden sm:flex"
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
                prefetch={false}
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
              <AuthHeaderActionsLazy
                labels={authHeaderLabels}
                variant="mobile"
                onNavigate={() => setMobileOpen(false)}
              />
              {showWhatsapp && whatsappHref ? (
                <Button
                  asChild
                  className="justify-start bg-[#128C7E] text-white hover:bg-[#0f7a6c] md:hidden"
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
