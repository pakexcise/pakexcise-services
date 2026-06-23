import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CTASection } from "@/components/marketing/cta-section";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { ProseContent } from "@/components/marketing/prose-content";
import { legalPagePath } from "@/features/legal-pages/lib/constants";
import { resolveLegalPageContent } from "@/server/repositories/legal-page-repository";
import { getBusinessSettings } from "@/features/settings/lib/public-settings-cache";
import {
  buildBreadcrumbJsonLd,
} from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { pickLocalized } from "@/lib/i18n/content";
import { absoluteUrl, formatDate } from "@/lib/utils";
import { getCurrentLocale } from "@/server/i18n/get-locale";

type LegalPageConfig = {
  slug: string;
  breadcrumbLabel: { en: string; ur: string };
  showCta?: boolean;
  applyHref?: string;
};

export function createLegalPage(config: LegalPageConfig) {
  const path = legalPagePath(config.slug);

  async function generateMetadata(): Promise<Metadata> {
    const locale = await getCurrentLocale();
    const content = await resolveLegalPageContent(config.slug);

    const title = {
      en: content?.titleEn ?? config.breadcrumbLabel.en,
      ur: content?.titleUr ?? config.breadcrumbLabel.ur,
    };

    const description = {
      en: content?.excerptEn || content?.contentEn?.slice(0, 160) || title.en,
      ur: content?.excerptUr || content?.contentUr?.slice(0, 160) || title.ur,
    };

    const metadata = resolveMetadataFromSeo({
      locale,
      path,
      seo: content?.seo ?? null,
      fallbacks: {
        title,
        description,
        h1: title,
      },
    });

    if (content && !content.isPublished) {
      return {
        ...metadata,
        robots: { index: false, follow: false },
      };
    }

    return metadata;
  }

  async function LegalPageView() {
    const locale = await getCurrentLocale();
    setRequestLocale(locale);

    const tMarketing = await getTranslations("marketing");
    const tCommon = await getTranslations("common");
    const tLegal = await getTranslations("marketing.legal");

    const [content, business] = await Promise.all([
      resolveLegalPageContent(config.slug),
      config.showCta ? getBusinessSettings() : Promise.resolve(null),
    ]);

    const fallbackTitle = pickLocalized(locale, config.breadcrumbLabel);
    const title = content
      ? pickLocalized(locale, {
          en: content.seo?.h1En ?? content.titleEn,
          ur: content.seo?.h1Ur ?? content.titleUr,
        })
      : fallbackTitle;
    const description = content
      ? pickLocalized(locale, {
          en: content.excerptEn,
          ur: content.excerptUr,
        })
      : "";
    const body = content
      ? pickLocalized(locale, {
          en: content.contentEn,
          ur: content.contentUr,
        })
      : "";
    const hasPublishedContent = Boolean(content?.isPublished && body.trim());
    const lastUpdated =
      content?.updatedAt != null ? formatDate(content.updatedAt, locale) : null;

    const breadcrumbJsonLd = buildBreadcrumbJsonLd([
      { name: "Home", url: absoluteUrl("/") },
      { name: fallbackTitle, url: absoluteUrl(path) },
    ]);

    return (
      <>
        <JsonLd data={breadcrumbJsonLd} />
        <PageHero
          title={title}
          description={description || undefined}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: fallbackTitle },
          ]}
        />
        <div className="container-site space-y-10 py-10 md:py-12">
          {lastUpdated ? (
            <p className="text-sm text-muted-foreground">
              {tLegal("lastUpdated", { date: lastUpdated })}
            </p>
          ) : null}

          {hasPublishedContent ? (
            <ProseContent content={body} />
          ) : (
            <section className="rounded-xl border border-dashed bg-muted/30 px-5 py-10 text-center">
              <h2 className="text-lg font-semibold">{tLegal("comingSoonTitle")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {tLegal("comingSoonDescription")}
              </p>
            </section>
          )}

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

  return { generateMetadata, default: LegalPageView };
}
