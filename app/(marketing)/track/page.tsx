import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { ProseContent } from "@/components/marketing/prose-content";
import { TrackForm } from "@/components/marketing/track-form";
import { buildBreadcrumbJsonLd } from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { absoluteUrl } from "@/lib/utils";
import { getPageContent, seoMetaRepository } from "@/server/repositories";
import { getBusinessSettings } from "@/features/settings/lib/public-settings-cache";

export const revalidate = 3600;

type TrackPageProps = {
  searchParams: Promise<{ trackingId?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = "en";
  const content = await getPageContent("track");
  const seo = await seoMetaRepository.findByPageKey("track");

  return await resolveMetadataFromSeo({
    locale,
    path: "/track",
    seo,
    fallbacks: {
      title: {
        en: content?.titleEn ?? "Track Application | PakExcise.com"},
      description: {
        en: content?.excerptEn ?? "Track your PakExcise application status."},
      h1: {
        en: content?.titleEn ?? "Track your application"}}});
}

export default async function TrackPage({ searchParams }: TrackPageProps) {
  const locale = "en";
const { trackingId } = await searchParams;
          const [content, seo, business] = await Promise.all([
    getPageContent("track"),
    seoMetaRepository.findByPageKey("track"),
    getBusinessSettings()]);

  if (!content) {
    notFound();
  }

  const title = seo?.h1En ?? content.titleEn;
  const description = content.excerptEn ?? "";
  const body = content.contentEn ?? "";

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: title, url: absoluteUrl("/track") }]);

  const statusLabels: Record<string, string> = {
    SUBMITTED: "Submitted",
    REVIEW: "Review",
    DOCS_REQUIRED: "Docs required",
    INVOICE_SENT: "Invoice sent",
    PAYMENT_UPLOADED: "Payment uploaded",
    PAYMENT_VERIFIED: "Payment verified",
    IN_PROGRESS: "In progress",
    AT_OFFICE: "At office",
    COMPLETED: "Completed",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled"};

  const publicStatus: Record<string, string> = {
    SUBMITTED: "Your application has been submitted and is awaiting review.",
    REVIEW: "Our team is reviewing your application.",
    DOCS_REQUIRED: "Additional documents are required. Log in to upload them.",
    INVOICE_SENT: "An invoice has been sent. Log in to view payment instructions.",
    PAYMENT_UPLOADED: "Your payment proof was received and is being verified.",
    PAYMENT_VERIFIED: "Payment verified. Your application is being processed.",
    IN_PROGRESS: "Your application is in progress.",
    AT_OFFICE: "Your application is being processed with the relevant office.",
    COMPLETED: "Your application has been completed. Log in to download proof if available.",
    REJECTED: "This application was rejected. Contact support for assistance.",
    CANCELLED: "This application was cancelled."};

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <PageHero
        title={title}
        description={description || undefined}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: title }]}
      />
      <div className="container-site space-y-8 py-10 md:py-12">
        <ProseContent content={body} />
        <Suspense fallback={null}>
          <TrackForm
            placeholder={"Tracking ID"}
            submitLabel={"Track application"}
            helpText={"Enter the tracking ID you received after submitting your application. You can also log in to view all your applications."}
            loginLabel={"Login"}
            dashboardLabel={"Dashboard"}
            locale={"en"}
            initialTrackingId={trackingId ?? ""}
            whatsappPhone={business.whatsappNumber}
            whatsappDefaultMessage={business.whatsappDefaultMessage}
            labels={{
              error: "We could not find an application for that tracking ID.",
              rateLimited: "Too many lookup attempts. Please wait a moment and try again.",
              whatsapp: "WhatsApp support",
              whatsappMessage: "Hello PakExcise, I need help tracking my application.",
              resultTitle: "Application status",
              resultTrackingId: "Tracking ID",
              resultService: "Service",
              resultStatus: "Status",
              resultUpdated: "Last updated",
              resultPublicStatusDescription: "This is a limited public status view. Sensitive details are not shown.",
              resultLoginPrompt: "Log in to view invoices, upload documents, payment proof, and completion documents.",
              resultLoginCta: "Log in for full details",
              resultDashboardPrompt: "Open your dashboard to view invoices, upload documents, payment proof, and completion documents.",
              resultDashboardCta: "Go to dashboard",
              publicStatus,
              statusLabels}}
          />
        </Suspense>
      </div>
    </>
  );
}
