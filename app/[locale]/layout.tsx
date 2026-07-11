import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { shouldAllowSearchIndexing } from "@/config/env.server";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { JsonLd } from "@/components/marketing/json-ld";
import { BrandingProvider } from "@/components/shared/branding-context";
import { ChunkLoadRecovery } from "@/components/shared/chunk-load-recovery";
import { DocumentLocaleSync } from "@/components/shared/DocumentLocaleSync";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import {
  buildLocalBusinessJsonLd,
  buildBusinessContactPoints,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from "@/features/seo/lib/metadata";
import {
  resolveLogoIconPath,
} from "@/features/settings/lib/branding-resolvers";
import { getPublicSettings } from "@/features/settings/lib/public-settings-cache";
import { buildTrackingRuntimeConfig } from "@/features/settings/lib/tracking-runtime";
import {
  resolveWhatsappDefaultMessage,
  resolveWhatsappLinkNumber,
} from "@/features/settings/lib/resolve-public-contact";
import { brandingAssets } from "@/config/branding";
import { routing, type Locale } from "@/i18n/config";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-service-message";
import { resolveSeoImageUrl, seoAbsoluteUrl } from "@/lib/seo-url";
import { getActiveSocialLinks } from "@/server/repositories";
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
  const { business, seo, tracking, branding } = publicSettings;
  const socialLinks = await getActiveSocialLinks();
  const trackingRuntime = buildTrackingRuntimeConfig(tracking, {
    productionTrackingEnabled: shouldAllowSearchIndexing(),
  });

  const baseUrl = seoAbsoluteUrl("/");
  const whatsappLinkNumber = resolveWhatsappLinkNumber(business);
  const whatsappMessage = resolveWhatsappDefaultMessage(business, locale);
  const siteJsonLd = [
    buildOrganizationJsonLd(baseUrl, seo, branding, {
      sameAs: socialLinks.map((link) => link.url),
      contactPoints: buildBusinessContactPoints({
        phone: business.phoneDisplayNumber,
        email: business.businessEmail,
        whatsappUrl: whatsappLinkNumber
          ? buildWhatsAppUrl(whatsappLinkNumber, whatsappMessage)
          : null,
        whatsappChannelUrl: business.whatsappChannelUrl,
      }),
    }),
    buildWebSiteJsonLd(baseUrl, business.siteName || seo.organizationName),
    buildLocalBusinessJsonLd(baseUrl, seo, {
      telephone: business.phoneDisplayNumber,
      imageUrl: resolveSeoImageUrl(
        seo.organizationLogoPath ?? branding.logoPath ?? brandingAssets.logo,
      ),
    }),
  ];

  const brandingContextValue = {
    logoPath: branding.logoPath,
    logoDarkPath: branding.logoDarkPath,
    footerLogoPath: branding.footerLogoPath,
    logoIconPath: resolveLogoIconPath(branding),
    siteName: business.siteName,
  };

  return (
    <>
      <JsonLd data={siteJsonLd} />
      <NextIntlClientProvider locale={locale} messages={messages}>
        <BrandingProvider value={brandingContextValue}>
          <ChunkLoadRecovery />
          <DocumentLocaleSync />
          <ThemeProvider>
            <Suspense fallback={null}>
              <AnalyticsProvider tracking={trackingRuntime} />
            </Suspense>
            {children}
          </ThemeProvider>
        </BrandingProvider>
      </NextIntlClientProvider>
    </>
  );
}
