import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2, FileText, Search } from "lucide-react";

import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ServiceCategorySection } from "@/components/marketing/service-category-section";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { Link } from "@/i18n/navigation";
import { seoMetaRepository } from "@/server/repositories";
import { serviceCategoryRepository } from "@/server/repositories/service-category-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const t = await getTranslations({ locale, namespace: "home" });
  const seo = await seoMetaRepository.findByPageKey("home");

  return resolveMetadataFromSeo({
    locale,
    path: "/",
    seo,
    fallbacks: {
      title: {
        en: t("metaTitle"),
        ur: t("metaTitle"),
      },
      description: {
        en: t("metaDescription"),
        ur: t("metaDescription"),
      },
      h1: {
        en: t("heroTitle"),
        ur: t("heroTitle"),
      },
    },
  });
}

export default async function HomePage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("nav");
  const tMarketing = await getTranslations("marketing");

  const categoryGroups = await serviceCategoryRepository.listPublicGrouped();
  const hasServices = categoryGroups.length > 0;

  return (
    <>
      <section className="border-b bg-gradient-to-b from-primary/5 to-background dark:from-primary/10 dark:to-background">
        <div className="container-site grid gap-8 py-10 sm:py-12 md:py-16 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="space-y-5 sm:space-y-6">
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {t("heroTitle")}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base md:text-lg">
              {t("heroSubtitle")}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/services">
                  {t("heroCtaPrimary")}
                  <DirectionalArrow />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/track">{t("heroCtaSecondary")}</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 lg:grid-cols-1">
            <Card>
              <CardHeader className="pb-2">
                <Search className="mb-2 size-5 text-primary" aria-hidden="true" />
                <CardTitle className="text-base">
                  {t("howItWorksStep1Title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t("howItWorksStep1Description")}</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <FileText className="mb-2 size-5 text-primary" aria-hidden="true" />
                <CardTitle className="text-base">
                  {t("howItWorksStep2Title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t("howItWorksStep2Description")}</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CheckCircle2 className="mb-2 size-5 text-primary" aria-hidden="true" />
                <CardTitle className="text-base">
                  {t("howItWorksStep3Title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t("howItWorksStep3Description")}</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container-site py-12 md:py-16">
        <div className="mb-8 flex flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold sm:text-3xl">{t("servicesTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("servicesSubtitle")}</p>
          </div>
          <Button asChild variant="ghost" className="hidden shrink-0 sm:inline-flex">
            <Link href="/services">
              {tCommon("viewAll")}
              <DirectionalArrow />
            </Link>
          </Button>
        </div>

        {!hasServices ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("servicesTitle")}</CardTitle>
              <CardDescription>{t("servicesEmpty")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/contact">{t("servicesEmptyAction")}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-10 md:space-y-12">
            {categoryGroups.map((group) => (
              <ServiceCategorySection
                key={group.id}
                group={group}
                locale={locale}
                learnMoreLabel={tCommon("learnMore")}
                multipleRegionsLabel={tMarketing("services.multipleRegions")}
                allProvincesLabel={tMarketing("services.allProvinces")}
                heading="h3"
                compact
              />
            ))}
            <div className="flex justify-center sm:hidden">
              <Button asChild variant="outline">
                <Link href="/services">
                  {tCommon("viewAll")}
                  <DirectionalArrow />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </section>

      <section className="border-y bg-muted/30">
        <div className="container-site py-12 md:py-16">
          <h2 className="mb-6 text-2xl font-bold sm:text-3xl">{t("trustTitle")}</h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {[t("trustItem1"), t("trustItem2"), t("trustItem3")].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 rounded-lg border bg-background p-4 text-sm"
              >
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-site py-12 md:py-16">
        <div className="rounded-2xl border bg-primary/5 p-8 text-center md:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">{t("ctaTitle")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            {t("ctaDescription")}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/contact">{t("ctaButton")}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/services">{tNav("services")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
