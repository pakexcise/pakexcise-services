import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { ProseContent } from "@/components/marketing/prose-content";
import { TrackForm } from "@/components/marketing/track-form";
import { buildBreadcrumbJsonLd } from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { pickLocalized } from "@/lib/i18n/content";
import { absoluteUrl } from "@/lib/utils";
import { getPageContent, seoMetaRepository } from "@/server/repositories";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export const revalidate = 3600;

type TrackPageProps = {
  searchParams: Promise<{ trackingId?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const content = await getPageContent("track");
  const seo = await seoMetaRepository.findByPageKey("track");

  return resolveMetadataFromSeo({
    locale,
    path: "/track",
    seo,
    fallbacks: {
      title: {
        en: content?.titleEn ?? "Track Application | PakExcise.com",
        ur: content?.titleUr ?? "درخواست ٹریک کریں | PakExcise.com",
      },
      description: {
        en: content?.excerptEn ?? "Track your PakExcise application status.",
        ur: content?.excerptUr ?? "اپنی PakExcise درخواست کی حیثیت ٹریک کریں۔",
      },
      h1: {
        en: content?.titleEn ?? "Track your application",
        ur: content?.titleUr ?? "اپنی درخواست ٹریک کریں",
      },
    },
  });
}

export default async function TrackPage({ searchParams }: TrackPageProps) {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const { trackingId } = await searchParams;
  const t = await getTranslations("marketing");
  const tNav = await getTranslations("nav");
  const tStatus = await getTranslations("admin.statuses");
  const tPublicStatus = await getTranslations("marketing.track.publicStatus");

  const [content, seo] = await Promise.all([
    getPageContent("track"),
    seoMetaRepository.findByPageKey("track"),
  ]);

  if (!content) {
    notFound();
  }

  const title = pickLocalized(locale, {
    en: seo?.h1En ?? content.titleEn,
    ur: seo?.h1Ur ?? content.titleUr,
  });
  const description = pickLocalized(locale, {
    en: content.excerptEn ?? "",
    ur: content.excerptUr ?? "",
  });
  const body = pickLocalized(locale, {
    en: content.contentEn,
    ur: content.contentUr,
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: title, url: absoluteUrl("/track") },
  ]);

  const statusLabels: Record<string, string> = {
    SUBMITTED: tStatus("SUBMITTED"),
    REVIEW: tStatus("REVIEW"),
    DOCS_REQUIRED: tStatus("DOCS_REQUIRED"),
    INVOICE_SENT: tStatus("INVOICE_SENT"),
    PAYMENT_UPLOADED: tStatus("PAYMENT_UPLOADED"),
    PAYMENT_VERIFIED: tStatus("PAYMENT_VERIFIED"),
    IN_PROGRESS: tStatus("IN_PROGRESS"),
    AT_OFFICE: tStatus("AT_OFFICE"),
    COMPLETED: tStatus("COMPLETED"),
    REJECTED: tStatus("REJECTED"),
    CANCELLED: tStatus("CANCELLED"),
  };

  const publicStatus: Record<string, string> = {
    SUBMITTED: tPublicStatus("SUBMITTED"),
    REVIEW: tPublicStatus("REVIEW"),
    DOCS_REQUIRED: tPublicStatus("DOCS_REQUIRED"),
    INVOICE_SENT: tPublicStatus("INVOICE_SENT"),
    PAYMENT_UPLOADED: tPublicStatus("PAYMENT_UPLOADED"),
    PAYMENT_VERIFIED: tPublicStatus("PAYMENT_VERIFIED"),
    IN_PROGRESS: tPublicStatus("IN_PROGRESS"),
    AT_OFFICE: tPublicStatus("AT_OFFICE"),
    COMPLETED: tPublicStatus("COMPLETED"),
    REJECTED: tPublicStatus("REJECTED"),
    CANCELLED: tPublicStatus("CANCELLED"),
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <PageHero
        title={title}
        description={description || undefined}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: title },
        ]}
      />
      <div className="container-site space-y-8 py-10 md:py-12">
        <ProseContent content={body} />
        <Suspense fallback={null}>
          <TrackForm
            placeholder={t("track.inputLabel")}
            submitLabel={t("track.submitLabel")}
            helpText={t("track.helpText")}
            loginLabel={tNav("login")}
            dashboardLabel={tNav("dashboard")}
            locale={locale === "ur" ? "ur" : "en"}
            initialTrackingId={trackingId ?? ""}
            labels={{
              error: t("track.error"),
              rateLimited: t("track.rateLimited"),
              whatsapp: t("track.whatsapp"),
              whatsappMessage: t("track.whatsappMessage"),
              resultTitle: t("track.result.title"),
              resultTrackingId: t("track.result.trackingId"),
              resultService: t("track.result.service"),
              resultStatus: t("track.result.status"),
              resultUpdated: t("track.result.updated"),
              resultPublicStatusDescription: t("track.result.publicStatusDescription"),
              resultLoginPrompt: t("track.result.loginPrompt"),
              resultLoginCta: t("track.result.loginCta"),
              resultDashboardPrompt: t("track.result.dashboardPrompt"),
              resultDashboardCta: t("track.result.dashboardCta"),
              publicStatus,
              statusLabels,
            }}
          />
        </Suspense>
      </div>
    </>
  );
}
