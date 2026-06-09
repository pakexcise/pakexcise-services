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
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { Link } from "@/i18n/navigation";
import { getActiveServices, seoMetaRepository } from "@/server/repositories";
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

  let services: Awaited<ReturnType<typeof getActiveServices>> = [];

  try {
    services = await getActiveServices(6);
  } catch {
    services = [];
  }

  return (
    <>
      <section className="border-b bg-gradient-to-b from-primary/5 to-background">
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
          <h2 className="text-2xl font-bold sm:text-3xl">{t("servicesTitle")}</h2>
          <Button asChild variant="ghost" className="hidden shrink-0 sm:inline-flex">
            <Link href="/services">
              {tCommon("viewAll")}
              <DirectionalArrow />
            </Link>
          </Button>
        </div>

        {services.length === 0 ? (
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const name = locale === "ur" ? service.nameUr : service.nameEn;
              const summary =
                locale === "ur" ? service.shortDescriptionUr : service.shortDescriptionEn;
              const regionName =
                locale === "ur" ? service.region.nameUr : service.region.nameEn;

              return (
                <Card key={service.id} className="h-full">
                  <CardHeader>
                    <CardDescription>{regionName}</CardDescription>
                    <CardTitle className="text-lg">{name}</CardTitle>
                  </CardHeader>
                  {summary ? (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{summary}</p>
                      <Button asChild variant="link" className="mt-3 px-0">
                        <Link href={`/services/${service.slug}`}>
                          {tCommon("learnMore")}
                        </Link>
                      </Button>
                    </CardContent>
                  ) : (
                    <CardContent>
                      <Button asChild variant="link" className="px-0">
                        <Link href={`/services/${service.slug}`}>
                          {tCommon("learnMore")}
                        </Link>
                      </Button>
                    </CardContent>
                  )}
                </Card>
              );
            })}
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
