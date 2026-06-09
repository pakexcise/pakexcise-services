import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { WhatsAppFAB } from "@/components/shared/WhatsAppFAB";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import {
  buildLocalBusinessJsonLd,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from "@/features/seo/lib/metadata";
import { getPublicSettings } from "@/features/settings/lib/public-settings-cache";
import { buildTrackingRuntimeConfig } from "@/features/settings/lib/tracking-runtime";
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
  const messages = await getMessages();

  const publicSettings = await getPublicSettings();
  const { business, seo, tracking } = publicSettings;
  const trackingRuntime = buildTrackingRuntimeConfig(tracking);

  const baseUrl = absoluteUrl("/");
  const siteJsonLd = [
    buildOrganizationJsonLd(baseUrl, seo),
    buildWebSiteJsonLd(baseUrl, seo.organizationName),
    buildLocalBusinessJsonLd(baseUrl, seo),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
      />
      <ThemeProvider>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Suspense fallback={null}>
            <AnalyticsProvider tracking={trackingRuntime}>
              {children}
            </AnalyticsProvider>
          </Suspense>
          <WhatsAppFAB
            phoneNumber={business.whatsappNumber}
            message={business.whatsappDefaultMessage}
          />
        </NextIntlClientProvider>
      </ThemeProvider>
    </>
  );
}
