import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  AboutConnectSection,
  AboutDisclaimerBox,
  AboutFinalCtaSection,
  AboutHowItWorksSection,
  AboutServicesSection,
  AboutWhoWeAreSection,
  AboutWhyChooseSection,
} from "@/components/marketing/about-page-sections";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { ABOUT_PAGE_SEO } from "@/features/about-page/lib/defaults";
import { buildServiceCardLabels } from "@/features/marketing/lib/build-service-card-labels";
import { getBusinessSettings } from "@/features/settings/lib/public-settings-cache";
import { buildBreadcrumbJsonLd } from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { getTranslations } from "@/lib/i18n/t";
import { absoluteUrl } from "@/lib/utils";
import {
  getActiveSocialLinks,
  getPageContent,
  seoMetaRepository,
  serviceCategoryRepository,
} from "@/server/repositories";

export const revalidate = 3600;

function splitParagraphs(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export async function generateMetadata(): Promise<Metadata> {
  const [seo, content] = await Promise.all([
    seoMetaRepository.findByPageKey("about"),
    getPageContent("about"),
  ]);

  return await resolveMetadataFromSeo({
    locale: "en",
    path: "/about",
    seo,
    fallbacks: {
      title: {
        en: seo?.metaTitleEn ?? content?.titleEn ?? ABOUT_PAGE_SEO.metaTitleEn,
      },
      description: {
        en:
          seo?.metaDescriptionEn ??
          content?.excerptEn ??
          ABOUT_PAGE_SEO.metaDescriptionEn,
      },
      h1: {
        en: seo?.h1En ?? content?.titleEn ?? ABOUT_PAGE_SEO.h1En,
      },
    },
  });
}

export default async function AboutPage() {
  const t = await getTranslations("marketing.about");
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");
  const tMarketing = await getTranslations("marketing");

  const [seo, content, socialLinks, categoryGroups, business] =
    await Promise.all([
      seoMetaRepository.findByPageKey("about"),
      getPageContent("about"),
      getActiveSocialLinks(),
      serviceCategoryRepository.listPublicGrouped(),
      getBusinessSettings(),
    ]);

  if (!content) {
    notFound();
  }

  const title = seo?.h1En ?? content.titleEn ?? ABOUT_PAGE_SEO.h1En;
  const description = content.excerptEn ?? ABOUT_PAGE_SEO.excerptEn;
  const whoWeAreParagraphs = splitParagraphs(content.contentEn ?? "");
  const breadcrumbLabel = "About";
  const serviceCardLabels = buildServiceCardLabels(tCommon, tMarketing);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: breadcrumbLabel, url: absoluteUrl("/about") },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      <PageHero
        title={title}
        description={description}
        breadcrumbs={[
          { label: tNav("home"), href: "/" },
          { label: breadcrumbLabel },
        ]}
      />

      <div className="container-site space-y-12 py-10 md:space-y-14 md:py-12">
        <AboutDisclaimerBox
          title={t("disclaimer.title")}
          body={t("disclaimer.body")}
        />

        <AboutWhoWeAreSection
          title={t("whoWeAre.title")}
          paragraphs={whoWeAreParagraphs}
        />

        <AboutServicesSection
          title={t("services.title")}
          description={t("services.description")}
          emptyMessage={t("services.empty")}
          browseLabel={t("services.browseAll")}
          categoryGroups={categoryGroups}
          locale="en"
          labels={serviceCardLabels}
        />

        <AboutHowItWorksSection
          title={t("howItWorks.title")}
          description={t("howItWorks.description")}
          steps={[
            {
              title: t("howItWorks.step1Title"),
              description: t("howItWorks.step1Description"),
            },
            {
              title: t("howItWorks.step2Title"),
              description: t("howItWorks.step2Description"),
            },
            {
              title: t("howItWorks.step3Title"),
              description: t("howItWorks.step3Description"),
            },
            {
              title: t("howItWorks.step4Title"),
              description: t("howItWorks.step4Description"),
            },
          ]}
        />

        <AboutWhyChooseSection
          title={t("whyChoose.title")}
          description={t("whyChoose.description")}
          items={[
            {
              title: t("whyChoose.item1Title"),
              description: t("whyChoose.item1Description"),
            },
            {
              title: t("whyChoose.item2Title"),
              description: t("whyChoose.item2Description"),
            },
            {
              title: t("whyChoose.item3Title"),
              description: t("whyChoose.item3Description"),
            },
            {
              title: t("whyChoose.item4Title"),
              description: t("whyChoose.item4Description"),
            },
          ]}
        />

        <AboutConnectSection
          title={t("connect.title")}
          description={t("connect.description")}
          emptyMessage={t("connect.empty")}
          links={socialLinks}
          locale="en"
        />

        <AboutFinalCtaSection
          title={t("cta.title")}
          description={t("cta.description")}
          browseServicesLabel={t("cta.browseServices")}
          submitRequestLabel={t("cta.submitRequest")}
          whatsappLabel={t("cta.whatsapp")}
          whatsappPhone={business.whatsappNumber}
          whatsappMessage={business.whatsappDefaultMessage}
        />
      </div>
    </>
  );
}
