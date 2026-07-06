import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CTASection } from "@/components/marketing/cta-section";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { ProseContent } from "@/components/marketing/prose-content";
import { SocialLinks } from "@/components/marketing/social-links";
import { getBusinessSettings } from "@/features/settings/lib/public-settings-cache";
import {
  buildBreadcrumbJsonLd,
} from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { pickLocalized } from "@/lib/i18n/content";
import { absoluteUrl } from "@/lib/utils";
import {
  getActiveSocialLinks,
  getPageContent,
  seoMetaRepository,
} from "@/server/repositories";
import { getCurrentLocale } from "@/server/i18n/get-locale";

type ContentPageConfig = {
  pageKey: string;
  path: string;
  breadcrumbLabel: { en: string; ur: string };
  showSocialLinks?: boolean;
  showDisclaimer?: boolean;
  showCta?: boolean;
  applyHref?: string;
};

export function createContentPage(config: ContentPageConfig) {
  async function generateMetadata(): Promise<Metadata> {
    const locale = await getCurrentLocale();
    const [seo, content] = await Promise.all([
      seoMetaRepository.findByPageKey(config.pageKey),
      getPageContent(config.pageKey),
    ]);

    const title = {
      en: content?.titleEn ?? config.breadcrumbLabel.en,
      ur: content?.titleUr ?? config.breadcrumbLabel.ur,
    };

    return await resolveMetadataFromSeo({
      locale,
      path: config.path,
      seo,
      fallbacks: {
        title,
        description: {
          en: content?.excerptEn ?? content?.contentEn?.slice(0, 160) ?? title.en,
          ur: content?.excerptUr ?? content?.contentUr?.slice(0, 160) ?? title.ur,
        },
        h1: title,
      },
    });
  }

  async function ContentPage() {
    const locale = await getCurrentLocale();
    setRequestLocale(locale);

    const tMarketing = await getTranslations("marketing");
    const tCommon = await getTranslations("common");

    const [seo, content, socialLinks, business] = await Promise.all([
      seoMetaRepository.findByPageKey(config.pageKey),
      getPageContent(config.pageKey),
      config.showSocialLinks ? getActiveSocialLinks() : Promise.resolve([]),
      config.showCta ? getBusinessSettings() : Promise.resolve(null),
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
    const breadcrumbLabel = pickLocalized(locale, config.breadcrumbLabel);

    const breadcrumbJsonLd = buildBreadcrumbJsonLd([
      { name: "Home", url: absoluteUrl("/") },
      { name: breadcrumbLabel, url: absoluteUrl(config.path) },
    ]);

    return (
      <>
        <JsonLd data={breadcrumbJsonLd} />
        <PageHero
          title={title}
          description={description || undefined}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: breadcrumbLabel },
          ]}
        />
        <div className="container-site space-y-10 py-10 md:py-12">
          <ProseContent content={body} />
          {config.showSocialLinks ? (
            <SocialLinks
              links={socialLinks}
              locale={locale}
              variant="cards"
            />
          ) : null}
          {config.showCta && business ? (
            <CTASection
              title={tMarketing("service.ctaTitle")}
              description={tMarketing("service.ctaDescription")}
              applyLabel={tMarketing("service.applyNow")}
              applyHref={config.applyHref ?? "/services"}
              whatsappLabel={tCommon("whatsappHelp")}
              whatsappPhone={business.whatsappNumber}
              whatsappMessage={business.whatsappDefaultMessage}
            />
          ) : null}
        </div>
      </>
    );
  }

  return { generateMetadata, default: ContentPage };
}
