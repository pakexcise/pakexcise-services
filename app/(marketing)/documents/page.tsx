import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { CTASection } from "@/components/marketing/cta-section";
import { DocumentsHubSection } from "@/components/marketing/documents-hub-section";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { buildBreadcrumbJsonLd } from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo, resolveVisibleH1 } from "@/features/seo/lib/resolve-metadata";
import { getBusinessSettings } from "@/features/settings/lib/public-settings-cache";
import { absoluteUrl } from "@/lib/utils";
import {
  documentRequirementRepository,
  getPageContent,
  seoMetaRepository,
} from "@/server/repositories";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = "en";
  const [seo, content] = await Promise.all([
    seoMetaRepository.findByPageKey("documents"),
    getPageContent("documents"),
  ]);

  const title = {
    en: content?.titleEn ?? "Document requirements",
  };

  return await resolveMetadataFromSeo({
    locale,
    path: "/documents",
    seo,
    fallbacks: {
      title,
      description: {
        en:
          content?.excerptEn?.trim() ||
          "Browse document checklists by service and province before you apply with PakExcise private facilitation.",
      },
      h1: title,
    },
  });
}

export default async function DocumentsPage() {
  const locale = "en";
  const t = await getTranslations("marketing");
  const tCommon = await getTranslations("common");

  const [seo, content, groups, business] = await Promise.all([
    seoMetaRepository.findByPageKey("documents"),
    getPageContent("documents"),
    documentRequirementRepository.listPublicGroupedByService(),
    getBusinessSettings(),
  ]);

  const breadcrumbLabel = t("documentsHub.breadcrumb");
  const title = resolveVisibleH1(
    seo,
    content?.titleEn ?? t("documentsHub.title"),
  );
  const description =
    content?.excerptEn?.trim() || t("documentsHub.description");

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: breadcrumbLabel, url: absoluteUrl("/documents") },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <PageHero
        title={title}
        description={description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: breadcrumbLabel },
        ]}
      />
      <div className="container-site space-y-10 py-10 md:space-y-12 md:py-12">
        <DocumentsHubSection
          groups={groups}
          labels={{
            emptyMessage: t("documentsHub.empty"),
            requiredLabel: t("service.required"),
            optionalLabel: t("service.optional"),
            viewServiceLabel: t("documentsHub.viewService"),
            checklistTitle: t("service.documentsTitle"),
          }}
        />
        <CTASection
          title={t("service.ctaTitle")}
          description={t("service.ctaDescription")}
          applyLabel={t("service.applyNow")}
          applyHref="/services"
          whatsappLabel={tCommon("whatsappHelp")}
          whatsappPhone={business.whatsappNumber}
          whatsappMessage={business.whatsappDefaultMessageEn || business.whatsappDefaultMessage}
        />
      </div>
    </>
  );
}
