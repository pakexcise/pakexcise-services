import type { Metadata } from "next";
import { FaqExplorer } from "@/components/marketing/faq-explorer";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { groupFaqsByCategory } from "@/features/marketing/lib/group-faqs-by-category";
import { mapFaqsForLocale } from "@/features/marketing/lib/map-faqs";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd} from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { absoluteUrl } from "@/lib/utils";
import { faqRepository, seoMetaRepository } from "@/server/repositories";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = "en";
    const seo = await seoMetaRepository.findByPageKey("faqs");

  return await resolveMetadataFromSeo({
    locale,
    path: "/faqs",
    seo,
    fallbacks: {
      title: {
        en: "FAQs | PakExcise.com"},
      description: {
        en: "Answers to common questions about PakExcise private excise facilitation."},
      h1: {
        en: "Frequently asked questions"}}});
}

export default async function FaqsPage() {
  const locale = "en";
const seo = await seoMetaRepository.findByPageKey("faqs");
  const faqs = await faqRepository.listAllPublic();
  const faqItems = mapFaqsForLocale(faqs, locale);
  const groupedFaqs = groupFaqsByCategory(faqs, locale);

  const title = seo?.h1En ?? "Frequently asked questions";
  const description = seo?.metaDescriptionEn ?? "Answers to common questions about PakExcise private excise facilitation.";

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: title, url: absoluteUrl("/faqs") }]);
  const faqJsonLd = buildFaqJsonLd(faqItems);
  const jsonLd = [breadcrumbJsonLd, faqJsonLd].filter(
    (item): item is NonNullable<typeof item> => item !== null,
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero
        title={title}
        description={description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: title }]}
      />
      <div className="container-site py-10 md:py-12">
        {groupedFaqs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{"No FAQs are available right now."}</p>
        ) : (
          <FaqExplorer
            groups={groupedFaqs}
            labels={{
              searchPlaceholder: "Search questions or answers",
              allCategories: "All categories",
              noResults: "No questions match your search. Try another keyword or category."}}
          />
        )}
      </div>
    </>
  );
}
