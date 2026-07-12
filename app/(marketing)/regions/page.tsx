import type { Metadata } from "next";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { ProvinceCard } from "@/components/marketing/province-card";
import { buildBreadcrumbJsonLd } from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { absoluteUrl } from "@/lib/utils";
import { regionRepository, seoMetaRepository } from "@/server/repositories";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = "en";
    const seo = await seoMetaRepository.findByPageKey("regions");

  return await resolveMetadataFromSeo({
    locale,
    path: "/regions",
    seo,
    fallbacks: {
      title: {
        en: "Regions | PakExcise.com"},
      description: {
        en: "Explore excise facilitation services by region across Pakistan."},
      h1: {
        en: "Regions"}}});
}

export default async function RegionsPage() {
  const locale = "en";
const seo = await seoMetaRepository.findByPageKey("regions");
  const regions = await regionRepository.listPublic();

  const title = seo?.h1En ?? "Regions";
  const description = seo?.metaDescriptionEn ?? "Explore excise facilitation services by region across Pakistan.";

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: title, url: absoluteUrl("/regions") }]);

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
      <div className="container-site space-y-8 py-10 md:py-12">
        {regions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{"No active regions are available right now."}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {regions.map((region) => (
              <ProvinceCard
                key={region.id}
                region={region}
                locale={locale}
                viewLabel={"View services"}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
