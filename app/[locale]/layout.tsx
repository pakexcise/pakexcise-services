import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { JsonLd } from "@/components/marketing/json-ld";
import { ChunkLoadRecovery } from "@/components/shared/chunk-load-recovery";
import { DocumentLocaleSync } from "@/components/shared/DocumentLocaleSync";
import { WhatsAppFAB } from "@/components/shared/WhatsAppFAB";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import {
  buildLocalBusinessJsonLd,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from "@/features/seo/lib/metadata";
import { getPublicSettings } from "@/features/settings/lib/public-settings-cache";
import { buildTrackingRuntimeConfig } from "@/features/settings/lib/tracking-runtime";
import { localizeGlobalSiteContent } from "@/features/settings/lib/global-site-content";
import {
  resolveWhatsappDefaultMessage,
  resolveWhatsappLinkNumber,
} from "@/features/settings/lib/resolve-public-contact";
import { routing, type Locale } from "@/i18n/config";
import { absoluteUrl } from "@/lib/utils";
import { getCurrentLocale, isValidLocale } from "@/server/i18n/get-locale";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const dynamic = "force-dynamic";

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale: routeLocale } = await params;

  if (!isValidLocale(routeLocale)) {
    notFound();
  }

  const locale: Locale = await getCurrentLocale();

  setRequestLocale(locale);
  const [messages, tCommon] = await Promise.all([
    getMessages(),
    getTranslations("common"),
  ]);

  const publicSettings = await getPublicSettings();
  const { business, seo, tracking, features, publicUi } = publicSettings;
  const trackingRuntime = buildTrackingRuntimeConfig(tracking);
  const localized = localizeGlobalSiteContent(business, locale, publicUi);

  const baseUrl = absoluteUrl("/");
  const siteJsonLd = [
    buildOrganizationJsonLd(baseUrl, seo),
    buildWebSiteJsonLd(baseUrl, seo.organizationName),
    buildLocalBusinessJsonLd(baseUrl, seo),
  ];

  return (
    <>
      <JsonLd data={siteJsonLd} />
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ChunkLoadRecovery />
        <DocumentLocaleSync />
        <ThemeProvider>
          <Suspense fallback={null}>
            <AnalyticsProvider tracking={trackingRuntime}>
              {children}
            </AnalyticsProvider>
          </Suspense>
          <WhatsAppFAB
            phoneNumber={
              features.floatingWhatsappEnabled
                ? resolveWhatsappLinkNumber(business)
                : null
            }
            message={
              features.floatingWhatsappEnabled
                ? localized.floatingWhatsappMessage
                : null
            }
            position={publicUi.floatingWhatsappPosition}
            ariaLabel={tCommon("whatsappHelp")}
          />
        </ThemeProvider>
      </NextIntlClientProvider>
    </>
  );
}
