import { copy, createT } from "@/messages";
import type { Metadata } from "next";
import {
  ArrowLeft,
  FileQuestion,
  HelpCircle,
  Home,
  MapPin,
  MessageCircle,
  Search,
} from "lucide-react";
import { getTranslations } from "@/lib/i18n/t";

import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";
import { LegalDisclaimer } from "@/components/shared/LegalDisclaimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { localizeGlobalSiteContent } from "@/features/settings/lib/global-site-content";
import { getPublicSettings } from "@/features/settings/lib/public-settings-cache";
import {
  resolveWhatsappDefaultMessage,
  resolveWhatsappLinkNumber,
} from "@/features/settings/lib/resolve-public-contact";
import { siteChromeShellClassName } from "@/lib/styles/site-chrome";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-service-message";
import { cn } from "@/lib/utils";

import Link from "next/link";
export async function generateNotFoundMetadata(): Promise<Metadata> {
  const t = createT(copy.common);

  return {
    title: t("notFoundMetaTitle"),
    description: t("notFoundDescription"),
    robots: { index: false, follow: false },
  };
}

type QuickLink = {
  href: "/services" | "/faqs" | "/contact" | "/track";
  label: string;
  description: string;
  icon: typeof Home;
};

export async function NotFoundPageView() {
  const [t, tNav, publicSettings] = await Promise.all([
    getTranslations("common"),
    getTranslations("nav"),
    getPublicSettings(),
  ]);

  const { business, publicUi, branding } = publicSettings;
  const localized = localizeGlobalSiteContent(business, publicUi);
  const whatsappLinkNumber = resolveWhatsappLinkNumber(business);
  const whatsappMessage = resolveWhatsappDefaultMessage(business);
  const whatsappHref = buildWhatsAppUrl(whatsappLinkNumber, whatsappMessage);

  const headerProps = {
    embedded: true as const,
    whatsappPhone: whatsappLinkNumber,
    whatsappMessage,
    whatsappLabel: localized.headerWhatsappLabel,
    headerWhatsappEnabled: publicUi.headerWhatsappEnabled,
    announcementBarEnabled: publicUi.announcementBarEnabled,
    announcementBarText: localized.announcementText,
    logoPath: branding.logoPath,
    logoDarkPath: branding.logoDarkPath,
  };

  const quickLinks: QuickLink[] = [
    {
      href: "/services",
      label: tNav("services"),
      description: t("notFoundLinkServicesDescription"),
      icon: MapPin,
    },
    {
      href: "/faqs",
      label: tNav("faqs"),
      description: t("notFoundLinkFaqsDescription"),
      icon: HelpCircle,
    },
    {
      href: "/contact",
      label: tNav("contact"),
      description: t("notFoundLinkContactDescription"),
      icon: MessageCircle,
    },
    {
      href: "/track",
      label: tNav("track"),
      description: t("notFoundLinkTrackDescription"),
      icon: Search,
    },
  ];

  return (
    <>
      <div className={siteChromeShellClassName}>
        <LegalDisclaimer bannerText={localized.disclaimer} embedded />
        <Header {...headerProps} />
      </div>

      <main id="main-content">
        <section className="relative overflow-hidden border-b bg-linear-to-br from-primary/10 via-background to-secondary/10">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--primary)_14%,transparent),transparent_50%)]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -start-16 top-12 size-56 rounded-full bg-secondary/20 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -end-10 bottom-0 size-72 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="container-site relative py-12 md:py-16 lg:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <FileQuestion className="size-8" aria-hidden="true" />
              </div>

              <p
                className="text-[clamp(4.5rem,16vw,7rem)] font-bold leading-none tracking-tight text-primary/15"
                aria-hidden="true"
              >
                404
              </p>

              <h1 className="-mt-8 text-3xl font-bold tracking-tight sm:text-4xl">
                {t("notFoundTitle")}
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
                {t("notFoundDescription")}
              </p>
              <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
                {t("notFoundHint")}
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="min-w-[11rem]">
                  <Link href="/">
                    <Home className="size-4" aria-hidden="true" />
                    {t("backHome")}
                    <DirectionalArrow />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="min-w-[11rem]">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-analytics-event="click_whatsapp"
                    data-analytics-placement="not_found"
                  >
                    <WhatsAppIcon className="size-4 text-[#25D366]" />
                    {t("whatsappHelp")}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="container-site py-10 md:py-14">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {t("notFoundHelpTitle")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                {t("notFoundHelpDescription")}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {quickLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Card className="h-full border-border/70 transition-colors group-hover:border-primary/30 group-hover:bg-primary/5">
                      <CardContent className="flex items-start gap-4 p-5">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <Icon className="size-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 text-start">
                          <span className="block font-semibold text-foreground">
                            {item.label}
                          </span>
                          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                            {item.description}
                          </span>
                        </span>
                        <DirectionalArrow
                          className={cn(
                            "mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary",
                          )}
                        />
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <div className="rounded-2xl border border-dashed bg-muted/30 px-5 py-6 text-center">
              <p className="text-sm text-muted-foreground">{t("notFoundPrivateNotice")}</p>
              <Button asChild variant="link" className="mt-2 h-auto p-0 text-primary">
                <Link href="/">
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  {t("notFoundReturnHome")}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
