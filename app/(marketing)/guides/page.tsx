import type { Metadata } from "next";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle} from "@/components/ui/card";
import { buildBreadcrumbJsonLd } from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { absoluteUrl } from "@/lib/utils";
import { requireGuidesEnabled } from "@/features/settings/lib/feature-gates";
import { guideRepository, seoMetaRepository } from "@/server/repositories";

import Link from "next/link";
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = "en";
    const seo = await seoMetaRepository.findByPageKey("guides");

  return await resolveMetadataFromSeo({
    locale,
    path: "/guides",
    seo,
    fallbacks: {
      title: {
        en: "Guides | PakExcise.com"},
      description: {
        en: "Step-by-step guides for Pakistan excise facilitation processes."},
      h1: {
        en: "Guides"}}});
}

export default async function GuidesPage() {
  await requireGuidesEnabled();
  const locale = "en";
const seo = await seoMetaRepository.findByPageKey("guides");
  const guides = await guideRepository.listPublished();

  const title = seo?.h1En ?? "Guides";
  const description = seo?.metaDescriptionEn ?? "Step-by-step guides for Pakistan excise facilitation processes.";

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: title, url: absoluteUrl("/guides") }]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <PageHero
        title={title}
        description={description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: title }]}
      />
      <div className="container-site py-10 md:py-12">
        {guides.length === 0 ? (
          <p className="text-sm text-muted-foreground">{"No guides are published yet."}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {guides.map((guide) => {
              const guideTitle = guide.titleEn ?? "";
              const excerpt = guide.excerptEn ?? "";

              return (
                <Card key={guide.id} className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{guideTitle}</CardTitle>
                    {excerpt ? <CardDescription>{excerpt}</CardDescription> : null}
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="link" className="px-0">
                      <Link href={`/guides/${guide.slug}`}>
                        {"Learn more"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
